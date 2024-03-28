import fuzzySet from 'fuzzyset';

export interface InputSong {
  isrc?: string;
  title: string;
  artists: string;
  album?: string;
  releaseDate?: string;
}

export interface ResultSong extends InputSong {
  id: string | number;
}

const negativeMatch = [
  'Acapella',
  'Tribute',
  'Karaoke',
  'Instrumental',
  '8-bit',
  'made famous',
  'cover',
  'Originally Performed',
  'in the style',
  'piano',
  'live',
];

const cleanString = (str: string) =>
  str
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
 * Given an input song and a list of songs, return the best match
 *
 * ISRC is the highest priority
 * Title and aritst are equally important
 * Album and release date are optional
 */
export function fuzzymatchSong(inputSong: InputSong, songList: ResultSong[]) {
  const trackSet = fuzzySet(songList.map(x => cleanString(x.title)));
  const titleScores = trackSet.get(cleanString(inputSong.title), undefined, 0.1);
  const artistSet = fuzzySet(songList.map(x => cleanString(x.artists)));
  const artistScores = artistSet.get(cleanString(inputSong.artists), undefined, 0.1);
  const albumSet = inputSong.album ? fuzzySet(songList.map(x => x.album ?? '')) : null;
  const albumScores = inputSong.album ? albumSet?.get(inputSong.album ?? '') : null;

  return songList
    .map(song => {
      const titleScore =
        titleScores?.find(score => score[1] === cleanString(song.title))?.[0] ?? -1;
      const artistScore =
        artistScores?.find(score => score[1] === cleanString(song.artists))?.[0] ?? -1;
      const albumScore = albumScores?.find(score => score[1] === (song.album ?? ''))?.[0] ?? 0;

      const negativeMatchScore = negativeMatch.reduce((acc, neg) => {
        if (
          song.title.toLowerCase().includes(neg.toLowerCase()) ||
          song.artists.toLowerCase().includes(neg.toLowerCase())
        ) {
          return acc - 1;
        }

        return acc;
      }, 0);

      const isrcScore = inputSong.isrc && song.isrc === inputSong.isrc ? 10 : 0;
      let score =
        isrcScore + titleScore + artistScore + albumScore + negativeMatchScore + negativeMatchScore;

      // Avoid songs that only match the artist and not the title
      if (titleScore < 0.5 || artistScore < 0.35) {
        score = -1;
      }

      console.log({
        score,
        title: song.title,
        titleScore,
        artist: song.artists,
        artistScore,
        album: song.album,
        albumScore,
      });

      return {
        ...song,
        score,
        titleScore,
        artistScore,
      };
    })
    .sort((a, b) => b.score - a.score);
}
