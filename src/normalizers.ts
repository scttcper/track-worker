import { InputSong } from './fuzzymatch';

// match Flying [feat. The Beatles]
// match Flying (feat. The Beatles)
// match Flying (ft. The Beatles)
const featExp = /(.*)\s(\(|\[)(feat|ft|featuring)\.? (.*)(\)|\])/i;
// match Flying - feat. The Beatles
// match Flying - featuring The Beatles
// match Flying - ft. The Beatles
const featExp2 = /(.*)\s-?\s(feat|ft|featuring)\.? (.*)/i;
const withExp = /(.*)\(with (.*)\)$/i;
const remixExp = /(.*)\((.*) remix\)?$/i;
const exclusiveExp = /(.*)-?\(?exclusive\)?(.*)/i;
export const decadeExp = /(.*)\s\(('?)(\d{2})\)$/i;
// Match remastered Year, optional (Remastered) and optional (Remastered Year)
const remasteredExp = /(.*)\s-?\s?\(?remastered( (\d{4}))?\)?$/i;

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
    .replace(/\s-$/, '')
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
    const newArtist = match[4].trim();
    if (!track.artists.toLowerCase().includes(newArtist.toLowerCase())) {
      track.artists = `${track.artists} ${newArtist}`.trim();
    }
  }

  // Featuring 2
  match = featExp2.exec(track.title);
  if (match) {
    track.title = match[1].trim();
    const newArtist = match[3].trim();
    if (!track.artists.toLowerCase().includes(newArtist.toLowerCase())) {
      track.artists = `${track.artists} ${newArtist}`.trim();
    }
  }

  // With (basically the same as featuring)
  match = withExp.exec(track.title);
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

  // Remastered
  match = remasteredExp.exec(track.title);
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
