/**
 * Spark — authorize a purchase (MFA step-up + idempotency)
 * Deploy: supabase functions deploy purchase-approve
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APPROVAL_TTL_MS = 15 * 60 * 1000;

const PRODUCT_IDS = new Set([
  'spark_plus_weekly',
  'spark_plus_monthly',
  'spark_plus_annual',
  'boost_1',
  'boost_3',
  'spark_notes_1',
  'spark_notes_5',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Unauthorized', code: 'unauthorized' }, 401);
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: 'Unauthorized', code: 'unauthorized' }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId ?? '');
  const idempotencyKey = String(body.idempotencyKey ?? '').slice(0, 200);
  const totpCode = typeof body.totpCode === 'string' ? body.totpCode.trim() : undefined;

  if (!PRODUCT_IDS.has(productId)) {
    return json({ error: 'Unknown product', code: 'product_unavailable' }, 400);
  }
  if (!idempotencyKey) {
    return json({ error: 'Missing idempotency key', code: 'approval_failed' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: existing } = await admin
    .from('purchase_approvals')
    .select('id, status, expires_at')
    .eq('user_id', userData.user.id)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing?.id && existing.status === 'approved' && new Date(existing.expires_at) > new Date()) {
    return json({ approvalId: existing.id });
  }

  const { data: factorsData } = await userClient.auth.mfa.listFactors();
  const verifiedTotp = factorsData?.totp?.find((f) => f.status === 'verified');

  if (verifiedTotp) {
    if (!totpCode || totpCode.length !== 6) {
      return json(
        { error: 'Authenticator code required', code: 'verification_required' },
        403,
      );
    }
    const challenge = await userClient.auth.mfa.challenge({ factorId: verifiedTotp.id });
    if (challenge.error || !challenge.data) {
      return json({ error: 'MFA challenge failed', code: 'verification_failed' }, 403);
    }
    const verify = await userClient.auth.mfa.verify({
      factorId: verifiedTotp.id,
      challengeId: challenge.data.id,
      code: totpCode,
    });
    if (verify.error) {
      return json(
        { error: verify.error.message, code: 'verification_failed' },
        403,
      );
    }
  }

  const expiresAt = new Date(Date.now() + APPROVAL_TTL_MS).toISOString();
  const { data: inserted, error: insertError } = await admin
    .from('purchase_approvals')
    .insert({
      user_id: userData.user.id,
      product_id: productId,
      idempotency_key: idempotencyKey,
      status: 'approved',
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    return json({ error: insertError?.message ?? 'Could not create approval', code: 'approval_failed' }, 500);
  }

  return json({ approvalId: inserted.id });
});

function json(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
