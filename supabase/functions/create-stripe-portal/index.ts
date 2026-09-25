/**
 * Spark — Stripe Customer Portal (manage subscription on web)
 * Deploy: supabase functions deploy create-stripe-portal
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  const returnUrl =
    typeof body.returnUrl === 'string' && body.returnUrl.startsWith('http')
      ? body.returnUrl
      : undefined;

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return json({ error: 'No Stripe billing profile for this account', code: 'no_customer' }, 404);
  }

  const params = new URLSearchParams({
    customer: profile.stripe_customer_id,
    ...(returnUrl ? { return_url: returnUrl } : {}),
  });

  const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!portalRes.ok) {
    const detail = await portalRes.text();
    return json({ error: detail || 'Portal session failed' }, 502);
  }

  const session = await portalRes.json();
  return json({ url: session.url });
});

function json(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
