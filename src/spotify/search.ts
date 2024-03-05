import { ofetch } from 'ofetch';

import type { Context } from '../server.js';

import { SearchResults, SpotifyTrack } from './search.type.js';
import { getToken } from './token.js';

/**
 * Search for music on Spotify
 */
export async function searchMusic(query: string, ctx: Context): Promise<SpotifyTrack[]> {
  // Get token
  const tokenSpan = ctx.get('transaction').startChild({
    description: `getTidalToken`,
    op: 'getTidalToken',
  });
  const token = await getToken(ctx.env);
  tokenSpan.setStatus('ok');
  tokenSpan.finish();

  // Make request
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token.access_token}`,
  };
  const params = {
    q: query,
    type: 'track',
    limit: '20',
  };
  const searchParams = new URLSearchParams(params);

  const url = `https://api.spotify.com/v1/search`;
  const child = ctx.get('transaction').startChild({
    description: `GET ${url}`,
    op: 'http.client',
    data: { params },
  });
  const response = await ofetch<SearchResults>(`${url}?${searchParams.toString()}`, {
    method: 'GET',
    headers,
    retry: 0,
    parseResponse: JSON.parse,
  });
  child.setStatus('ok');
  child.finish();

  // console.log(JSON.stringify(response.tracks.items, null, 2));

  return response.tracks.items;
}
