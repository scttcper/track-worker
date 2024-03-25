import MiniSearch, { SearchResult } from 'minisearch';
import fuzzySet from 'fuzzyset';

interface InputSong {
  isrc?: string;
  title: string;
  artists: string;
  album?: string;
  releaseDate?: string;
}

interface ResultSong extends InputSong {
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
  const miniSearch = new MiniSearch<ResultSong>({
    fields: ['isrc', 'title', 'artist', 'album', 'releaseDate'],
    storeFields: ['isrc', 'title', 'artist', 'album', 'releaseDate'],
    searchOptions: {
      processTerm: term => cleanString(term), // search query processing
    },
  });
  miniSearch.addAll(songList);

  const trackSet = fuzzySet(songList.map(x => x.title));
  const titleScores = trackSet.get(inputSong.title)!;
  const artistSet = fuzzySet(songList.map(x => x.artists));
  const artistScores = artistSet.get(inputSong.artists)!;

  const albumScores = inputSong.album
    ? miniSearch.search(cleanString(inputSong.album), {
        fields: ['album'],
        fuzzy: 0.4,
      })
    : [];

  const negativeScores = negativeMatch
    .reduce<SearchResult[]>((acc, negativeTerm) => {
      if (
        inputSong.title.toLowerCase().includes(negativeTerm.toLowerCase()) ||
        inputSong.artists.toLowerCase().includes(negativeTerm.toLowerCase()) ||
        inputSong.album?.toLowerCase().includes(negativeTerm.toLowerCase())
      ) {
        return acc;
      }

      const negativeArtistScores = miniSearch.search(negativeTerm.toLowerCase(), {
        fields: ['artist', 'title', 'album'],
        fuzzy: 0.1,
      });
      return [...acc, ...negativeArtistScores];
    }, [])
    .sort((a, b) => b.score - a.score);

  return songList
    .map(song => {
      const artistScore = artistScores.find(score => score[1] === song.artists)?.[0] ?? 0;
      const titleScore = titleScores.find(score => score[1] === song.title)?.[0] ?? 0;

      console.log({
        title: song.title,
        titleScore: titleScore,
        artist: song.artists,
        artistScore: artistScore,
      });

      const albumScore = Math.max(
        cleanString(song.album ?? '123') === cleanString(inputSong.album ?? 'abc') ? 15 : 0,
        (albumScores.find(track => track.id === song.id)?.score ?? 0) * 2,
      );

      const negativeScore =
        (negativeScores.find(track => track.id === song.id)?.score ?? 0) * 2 * -1;

      // console.log({ negativeScore });
      const isrcScore = inputSong.isrc && song.isrc === inputSong.isrc ? 50 : 0;
      return {
        ...song,
        score: artistScore + titleScore + albumScore + isrcScore + negativeScore,
        titleScore,
        artistScore,
      };
    })
    .sort((a, b) => b.score - a.score);
}
