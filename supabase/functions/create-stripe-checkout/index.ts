/**
 * Spark — Stripe Checkout session for web purchases
 * Deploy: supabase functions deploy create-stripe-checkout
 * Secrets: STRIPE_SECRET_KEY, STRIPE_PRICE_<product_id> (e.g. STRIPE_PRICE_spark_plus_monthly)
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBSCRIPTION_PRODUCTS = new Set([
  'spark_plus_weekly',
  'spark_plus_monthly',
  'spark_plus_annual',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return json({ error: 'Stripe not configured' }, 503);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId ?? '');
  const approvalId = String(body.approvalId ?? '');
  const successUrl = String(body.successUrl ?? '');
  const cancelUrl = String(body.cancelUrl ?? '');

  const priceEnvKey = `STRIPE_PRICE_${productId.replace(/\./g, '_')}`;
  const priceId = Deno.env.get(priceEnvKey);
  if (!priceId) {
    return json({ error: `Missing Stripe price (${priceEnvKey})` }, 503);
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: approval } = await admin
    .from('purchase_approvals')
    .select('id, user_id, product_id, status, expires_at')
    .eq('id', approvalId)
    .maybeSingle();

  if (
    !approval ||
    approval.user_id !== userData.user.id ||
    approval.product_id !== productId ||
    approval.status !== 'approved' ||
    new Date(approval.expires_at) <= new Date()
  ) {
    return json({ error: 'Invalid or expired purchase approval', code: 'approval_failed' }, 403);
  }

  let customerId: string | null = null;
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userData.user.id)
    .maybeSingle();

  customerId = profile?.stripe_customer_id ?? null;

  if (!customerId) {
    const customerRes = await stripeFetch(stripeKey, 'customers', {
      email: userData.user.email ?? undefined,
      metadata: { supabase_user_id: userData.user.id },
    });
    if (!customerRes.ok) {
      return json({ error: 'Could not create Stripe customer' }, 502);
    }
    const customer = await customerRes.json();
    customerId = customer.id;
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq('id', userData.user.id);
  }

  const mode = SUBSCRIPTION_PRODUCTS.has(productId) ? 'subscription' : 'payment';
  const sessionRes = await stripeFetch(stripeKey, 'checkout/sessions', {
    mode,
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      supabase_user_id: userData.user.id,
      product_id: productId,
      approval_id: approvalId,
    },
  });

  if (!sessionRes.ok) {
    const detail = await sessionRes.text();
    return json({ error: detail || 'Checkout failed' }, 502);
  }

  const session = await sessionRes.json();
  return json({ url: session.url, sessionId: session.id });
});

async function stripeFetch(
  stripeKey: string,
  path: string,
  params: Record<string, unknown>,
): Promise<Response> {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(flattenParams(params))) {
    body.append(key, value);
  }
  return fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
}

function flattenParams(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenParams(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(out, flattenParams(item as Record<string, unknown>, `${fullKey}[${index}]`));
        } else {
          out[`${fullKey}[${index}]`] = String(item);
        }
      });
    } else {
      out[fullKey] = String(value);
    }
  }
  return out;
}

function json(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
