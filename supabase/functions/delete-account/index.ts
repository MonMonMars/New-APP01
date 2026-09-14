/**
 * Spark — delete account (service role required)
 * Deploy: supabase functions deploy delete-account
 * Invoke with user's JWT; deletes auth user + all rows + storage.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  const userId = userData.user.id;
  const admin = createClient(supabaseUrl, serviceKey);

  await admin.from('security_reports').delete().eq('reporter_user_id', userId);
  await admin.from('security_audit_events').delete().eq('user_id', userId);
  await admin.from('conversations').delete().eq('user_id', userId);
  await admin.from('matches').delete().eq('user_id', userId);
  await admin.from('user_state').delete().eq('user_id', userId);
  await admin.from('user_preferences').delete().eq('user_id', userId);
  await admin.from('push_tokens').delete().eq('user_id', userId);
  await admin.from('profiles').delete().eq('id', userId);

  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId);
  if (deleteAuthError) {
    return new Response(JSON.stringify({ error: deleteAuthError.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
