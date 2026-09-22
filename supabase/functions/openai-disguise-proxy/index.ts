/**
 * Spark — OpenAI disguise image proxy (keeps API key off the client)
 * Deploy: supabase functions deploy openai-disguise-proxy
 * Set secret: supabase secrets set OPENAI_API_KEY=sk-...
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return false;
  }
  bucket.count += 1;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI not configured' }), {
      status: 503,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  if (!checkRateLimit(userData.user.id)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: corsHeaders,
    });
  }

  const body = await req.json();
  const prompt = String(body.prompt ?? '').slice(0, 1000);
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400, headers: corsHeaders });
  }

  const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      n: 1,
      response_format: 'url',
    }),
  });

  const payload = await openaiResponse.text();
  return new Response(payload, {
    status: openaiResponse.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
