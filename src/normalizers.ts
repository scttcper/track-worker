const remixExp = /(.*)\((.*) remix\)$/i;
const exclusiveExp = /(.*)-?\(?exclusive\)?(.*)/i;

interface NormalizeResult {
  isRemix?: boolean;
  isExclusive?: boolean;
}

/**
 * Take artists found in the title and add them to the artists array
 */
export function normalizeTrackArtists(track: { title: string; artists: string[] }): {
  title: string;
  artists: string[];
  results: NormalizeResult;
} {
  const results: NormalizeResult = {};
  let match = remixExp.exec(track.title);
  if (match) {
    track.title = match[1].trim();
    track.artists.push(match[2].trim());
    results.isRemix = true;
  }

  match = exclusiveExp.exec(track.title);
  if (match) {
    track.title = match[1].trim() + (match[2] || '').trimEnd();
    results.isExclusive = true;
  }

  return { ...track, results };
}
