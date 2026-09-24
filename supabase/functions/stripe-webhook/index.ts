/**
 * Spark — Stripe webhook → purchase_ledger + Spark+ entitlement
 * Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
 * Secret: STRIPE_WEBHOOK_SECRET
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUBSCRIPTION_PRODUCTS = new Set([
  'spark_plus_weekly',
  'spark_plus_monthly',
  'spark_plus_annual',
]);

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripeKey || !webhookSecret) {
    return new Response('Stripe not configured', { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const rawBody = await req.text();
  const verified = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!verified) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    type: string;
    data: { object: Record<string, unknown> };
  };

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = event.data.object;
  const metadata = (session.metadata ?? {}) as Record<string, string>;
  const userId = metadata.supabase_user_id;
  const productId = metadata.product_id;
  const approvalId = metadata.approval_id;
  const externalId = String(session.id ?? '');

  if (!userId || !productId) {
    return new Response('Missing metadata', { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const grant = buildGrant(productId);

  const { error: ledgerError } = await admin.from('purchase_ledger').insert({
    user_id: userId,
    product_id: productId,
    provider: 'stripe',
    status: 'completed',
    grant,
    external_id: externalId,
    approval_id: approvalId || null,
    idempotency_key: externalId,
  });

  if (ledgerError && ledgerError.code !== '23505') {
    return new Response(ledgerError.message, { status: 500 });
  }

  if (approvalId) {
    await admin
      .from('purchase_approvals')
      .update({ status: 'consumed', consumed_at: new Date().toISOString() })
      .eq('id', approvalId);
  }

  if (SUBSCRIPTION_PRODUCTS.has(productId) && grant.sparkPlus) {
    await admin.rpc('grant_spark_plus_entitlement', { target_user_id: userId });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function buildGrant(productId: string): Record<string, unknown> {
  if (productId === 'spark_plus_weekly') {
    return { sparkPlus: { plan: 'weekly', expiresAt: addDaysIso(7) } };
  }
  if (productId === 'spark_plus_monthly') {
    return { sparkPlus: { plan: 'monthly', expiresAt: addDaysIso(30) } };
  }
  if (productId === 'spark_plus_annual') {
    return { sparkPlus: { plan: 'annual', expiresAt: addDaysIso(365) } };
  }
  if (productId === 'boost_1') {
    return { activateBoost: true };
  }
  if (productId === 'boost_3') {
    return { bonusBoosts: 2, activateBoost: true };
  }
  if (productId === 'spark_notes_1') {
    return { bonusSparkNotes: 1 };
  }
  if (productId === 'spark_notes_5') {
    return { bonusSparkNotes: 5 };
  }
  return {};
}

function addDaysIso(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  const parts = header.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) {
      acc[k] = v;
    }
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}
