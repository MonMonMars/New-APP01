/**
 * Stripe Checkout — cards, Apple Pay, Google Pay, Link (hosted PCI-safe page).
 * Deploy: supabase functions deploy create-stripe-checkout
 * Secrets: STRIPE_SECRET_KEY
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { isServerProductId, SERVER_PRODUCT_CATALOG } from '../_shared/paymentProducts.ts';

async function stripeCreateCheckoutSession(params: Record<string, string>): Promise<{ url?: string; id?: string; error?: string }> {
  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) {
    return { error: 'Stripe not configured' };
  }
  const body = new URLSearchParams(params);
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const json = await response.json();
  if (!response.ok) {
    return { error: json.error?.message ?? 'Stripe error' };
  }
  return { url: json.url, id: json.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { productId?: string; approvalId?: string; successUrl?: string; cancelUrl?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const productId = body.productId?.trim();
  const approvalId = body.approvalId?.trim();
  const successUrl = body.successUrl?.trim();
  const cancelUrl = body.cancelUrl?.trim();

  if (!productId || !isServerProductId(productId) || !approvalId || !successUrl || !cancelUrl) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userId = userData.user.id;
  const admin = createClient(supabaseUrl, serviceKey);

  const { data: approval, error: approvalError } = await admin
    .from('purchase_approvals')
    .select('*')
    .eq('id', approvalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (approvalError || !approval || approval.consumed_at) {
    return new Response(JSON.stringify({ error: 'Invalid approval' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (approval.product_id !== productId) {
    return new Response(JSON.stringify({ error: 'Product mismatch' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (new Date(approval.expires_at).getTime() < Date.now()) {
    return new Response(JSON.stringify({ error: 'Approval expired' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const product = SERVER_PRODUCT_CATALOG[productId];
  const mode = product.kind === 'subscription' ? 'subscription' : 'payment';

  const params: Record<string, string> = {
    mode,
    success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cancelUrl}${cancelUrl.includes('?') ? '&' : '?'}checkout=cancelled`,
    'metadata[user_id]': userId,
    'metadata[product_id]': productId,
    'metadata[approval_id]': approvalId,
    'metadata[idempotency_key]': approval.idempotency_key,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': product.currency,
    'line_items[0][price_data][unit_amount]': String(product.amountCents),
    'line_items[0][price_data][product_data][name]': `Spark ${productId.replace(/_/g, ' ')}`,
  };

  if (mode === 'subscription') {
    params['line_items[0][price_data][recurring][interval]'] =
      product.plan === 'weekly' ? 'week' : product.plan === 'monthly' ? 'month' : 'year';
  }

  const stripe = await stripeCreateCheckoutSession(params);
  if (!stripe.url || !stripe.id) {
    return new Response(JSON.stringify({ error: stripe.error ?? 'Checkout failed' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await admin.from('purchase_ledger').insert({
    user_id: userId,
    product_id: productId,
    provider: 'stripe',
    external_id: stripe.id,
    status: 'pending',
    amount_cents: product.amountCents,
    currency: product.currency,
    idempotency_key: approval.idempotency_key,
  });

  await admin
    .from('purchase_approvals')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', approvalId);

  return new Response(JSON.stringify({ url: stripe.url, sessionId: stripe.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
