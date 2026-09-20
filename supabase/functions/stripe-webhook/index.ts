/**
 * Stripe webhook — verify signature, fulfill purchase_ledger + user_state.
 * Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
 * Secrets: STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY (optional for retrieve)
 */
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { grantForServerProduct, isServerProductId } from '../_shared/paymentProducts.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if (!webhookSecret || !stripeSecret) {
    return new Response('Webhook not configured', { status: 503 });
  }

  const payload = await req.text();
  const sigHeader = req.headers.get('Stripe-Signature') ?? '';
  const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sigHeader, webhookSecret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }
  const admin = createClient(supabaseUrl, serviceKey);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id as string;
    const userId = (session.metadata as Record<string, string>)?.user_id;
    const productId = (session.metadata as Record<string, string>)?.product_id;

    if (!userId || !productId || !isServerProductId(productId)) {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const grant = grantForServerProduct(productId);

    await admin
      .from('purchase_ledger')
      .update({
        status: 'completed',
        grant,
        updated_at: new Date().toISOString(),
      })
      .eq('external_id', sessionId);

    if (grant.sparkPlus) {
      const sparkPlus = grant.sparkPlus as { plan: string; expiresAt: string };
      await admin.from('user_state').upsert({
        user_id: userId,
        is_spark_plus: true,
        updated_at: new Date().toISOString(),
      });
      void sparkPlus;
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;
    await admin
      .from('purchase_ledger')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('external_id', sessionId);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
