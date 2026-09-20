/**
 * Issue a short-lived purchase approval after step-up (TOTP when enrolled).
 * Deploy: supabase functions deploy purchase-approve
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { isServerProductId } from '../_shared/paymentProducts.ts';

const APPROVAL_TTL_MS = 5 * 60 * 1000;

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

  let body: { productId?: string; idempotencyKey?: string; totpCode?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const productId = body.productId?.trim();
  const idempotencyKey = body.idempotencyKey?.trim();
  if (!productId || !isServerProductId(productId) || !idempotencyKey || idempotencyKey.length < 8) {
    return new Response(JSON.stringify({ error: 'Invalid product or idempotency key' }), {
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
  const { data: factorsData } = await userClient.auth.mfa.listFactors();
  const totpFactors = factorsData?.totp?.filter((f) => f.status === 'verified') ?? [];

  if (totpFactors.length > 0) {
    const code = body.totpCode?.trim();
    if (!code) {
      return new Response(JSON.stringify({ error: 'verification_required', code: 'verification_required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const factor = totpFactors[0];
    const challenge = await userClient.auth.mfa.challenge({ factorId: factor.id });
    if (challenge.error || !challenge.data) {
      return new Response(JSON.stringify({ error: 'Challenge failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const verify = await userClient.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.data.id,
      code,
    });
    if (verify.error) {
      return new Response(JSON.stringify({ error: 'Invalid verification code', code: 'verification_failed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const expiresAt = new Date(Date.now() + APPROVAL_TTL_MS).toISOString();

  const { data: existing } = await admin
    .from('purchase_approvals')
    .select('id, expires_at, consumed_at')
    .eq('user_id', userId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing && !existing.consumed_at && new Date(existing.expires_at).getTime() > Date.now()) {
    return new Response(JSON.stringify({ approvalId: existing.id, expiresAt: existing.expires_at }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: inserted, error: insertError } = await admin
    .from('purchase_approvals')
    .insert({
      user_id: userId,
      product_id: productId,
      idempotency_key: idempotencyKey,
      expires_at: expiresAt,
    })
    .select('id, expires_at')
    .single();

  if (insertError || !inserted) {
    return new Response(JSON.stringify({ error: insertError?.message ?? 'Could not create approval' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ approvalId: inserted.id, expiresAt: inserted.expires_at }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
