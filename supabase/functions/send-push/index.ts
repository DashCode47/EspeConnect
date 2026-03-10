// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function getServiceAccount() {
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (!raw) throw new Error('FCM_SERVICE_ACCOUNT secret is not set');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`FCM_SERVICE_ACCOUNT is not valid JSON: ${e.message}. Raw length: ${raw.length}`);
  }
}

async function getFCMAccessToken(account: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: account.client_email,
    sub: account.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signingInput = `${encode(header)}.${encode(payload)}`;

  // The private key in the JSON has literal \n — restore them as actual newlines
  const privateKeyPem = account.private_key.replace(/\\n/g, '\n');
  const pemBody = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput),
  );

  const jwt = `${signingInput}.${btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get FCM access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const { userId, title, body } = await req.json();
    if (!userId || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: tokenRows, error: dbError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (dbError) {
      return new Response(JSON.stringify({ error: `DB error: ${dbError.message}` }), { status: 500 });
    }
    if (!tokenRows || tokenRows.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no tokens for user' }), { status: 200 });
    }

    const account = getServiceAccount();
    const accessToken = await getFCMAccessToken(account);
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${account.project_id}/messages:send`;

    const results = await Promise.allSettled(
      tokenRows.map((r: { token: string }) =>
        fetch(fcmUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: r.token,
              notification: { title, body },
              android: { priority: 'HIGH' },
              apns: { payload: { aps: { sound: 'default' } } },
            },
          }),
        }).then((res) => res.json()),
      ),
    );

    return new Response(JSON.stringify({ sent: tokenRows.length, results }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
