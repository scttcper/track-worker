import { ofetch } from 'ofetch';

import type { Context } from '../server.js';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyToken extends TokenResponse {
  expiresAt: string;
}

const SPOTIFYL_TOKEN_KEY = `SPOTIFY-TOKEN`;

async function loadToken(env: Context['env']): Promise<SpotifyToken> {
  const kvToken = await env.TOKEN.get<any>(SPOTIFYL_TOKEN_KEY, { type: 'json' });

  if (kvToken && !shouldRefreshToken(kvToken)) {
    return kvToken;
  }

  const token = await getClientCredentialsToken(env);
  await env.TOKEN.put(SPOTIFYL_TOKEN_KEY, JSON.stringify(token));

  return token;
}

async function getClientCredentialsToken(env: Context['env']): Promise<SpotifyToken> {
  console.log(env);
  const auth = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  const result = await ofetch<TokenResponse>('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    timeout: 5_000,
    retry: 0,
    parseResponse: JSON.parse,
  });

  return { ...result, expiresAt: new Date(Date.now() + result.expires_in * 1000).toISOString() };
}

function shouldRefreshToken(token: SpotifyToken): boolean {
  const now = new Date();
  const expiresAt = new Date(token.expiresAt);
  return now > expiresAt;
}

/**
 *
 */
export async function getToken(env: Context['env']): Promise<SpotifyToken> {
  const token = await loadToken(env);
  return token;
}
