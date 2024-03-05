import MiniSearch, { SearchResult } from 'minisearch';

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

  const aritstScores = miniSearch.search(cleanString(inputSong.artists), {
    fields: ['artist', 'title'],
    fuzzy: 0.2,
  });
  const titleScores = miniSearch.search(cleanString(inputSong.title), {
    fields: ['title'],
    fuzzy: 0.2,
  });
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
      const artistScore = Math.max(
        cleanString(song.artists) === cleanString(inputSong.artists) ? 10 : 0,
        cleanString(song.artists).includes(cleanString(inputSong.artists)) ? 5 : 0,
        (aritstScores.find(track => track.id === song.id)?.score ?? 0) * 2,
      );
      const negativeArtistScore = artistScore < 3 ? -95 : 0;
      // console.log({
      //   artistScore,
      //   artist: cleanString(song.artist),
      //   inputArtist: cleanString(song.artist),
      //   negativeArtistScore,
      // });

      const titleScore = Math.max(
        cleanString(song.title) === cleanString(inputSong.title) ? 25 : 0,
        cleanString(song.title).includes(cleanString(inputSong.title)) ? 10 : 0,
        (titleScores.find(track => track.id === song.id)?.score ?? 0) * 3,
      );

      // console.log({
      //   titleScore,
      //   title: cleanString(song.title),
      //   inputTitle: cleanString(inputSong.title),
      // });
      const minTitleScore = song.title.length < 5 || inputSong.title.length < 5 ? 1 : 5;
      const negativeTitleScore = titleScore < minTitleScore ? -75 : 0;

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
        score:
          artistScore +
          negativeArtistScore +
          titleScore +
          negativeTitleScore +
          albumScore +
          isrcScore +
          negativeScore,
        titleScore,
        artistScore,
      };
    })
    .sort((a, b) => b.score - a.score);
}
