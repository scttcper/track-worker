import { InputSong } from './fuzzymatch';

const featExp = /(.*)\(feat\.?(.*)\)$/i;
const remixExp = /(.*)\((.*) remix\)$/i;
const exclusiveExp = /(.*)-?\(?exclusive\)?(.*)/i;

const cleanString = (str: string) =>
  str
    .trim()
    .toLowerCase()
    .replaceAll('+', ' ')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll(',', '')
    .replaceAll(':', '')
    .replaceAll('.', '')
    .replaceAll("'", '')
    .replaceAll(' - ', ' ')
    .replaceAll('  ', ' ');

/**
 * Take artists found in the title and add them to the artists array
 */
export function normalizeTrackArtists<T extends InputSong>(input: T): T {
  const track = {
    ...input,
    title: cleanString(input.title),
    artists: cleanString(input.artists),
  };

  // Remix
  let match = remixExp.exec(track.title);
  if (match) {
    track.title = match[1].trim();
    const newArtist = match[2].trim();
    if (!track.artists.toLowerCase().includes(newArtist.toLowerCase())) {
      track.artists = `${track.artists} ${match[2]}`.trim();
    }
  }

  // Featuring
  match = featExp.exec(track.title);
  if (match) {
    track.title = match[1].trim();
    const newArtist = match[2].trim();
    if (!track.artists.toLowerCase().includes(newArtist.toLowerCase())) {
      track.artists = `${track.artists} ${match[2]}`.trim();
    }
  }

  // Exclusive
  match = exclusiveExp.exec(track.title);
  if (match) {
    track.title = match[1].trim() + (match[2] || '').trimEnd();
  }

  return track;
}
