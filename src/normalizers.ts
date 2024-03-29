import { InputSong } from './fuzzymatch';

const featExp = /(.*)\(feat\.?(.*)\)$/i;
const remixExp = /(.*)\((.*) remix\)?$/i;
const exclusiveExp = /(.*)-?\(?exclusive\)?(.*)/i;
const decadeExp = /(.*)\s\(('?)(\d{2})\)$/i;

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
export function normalizeTrack<T extends InputSong>(input: T): T {
  const track = {
    ...input,
    title: input.title,
    artists: input.artists,
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

  // Decade
  match = decadeExp.exec(track.title);
  if (match) {
    track.title = match[1].trim();
  }

  return {
    ...track,
    title: cleanString(track.title),
    artists: cleanString(track.artists),
    album: track.album ? cleanString(track.album) : track.album,
  };
}
