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
];

const negativeAlbumMatch = [
  // https://open.spotify.com/album/1vDJyYjUUvXYJaZmKsukJJ
  'NOW Thats What I Call Music',
  'Karaoke',
  'power hits',
  'dance hits',
  'love songs',
  'trending',
  // https://open.spotify.com/album/6qZ5OAEVumaniVTF2Sumga
  'scorpio',
  'viral',
  /(diamond|sleep|sad|trap|fitness|work) rap/i,
  // https://open.spotify.com/album/2t9hQjnXuEmYhzQHNNOJ0o
  'Del relajo',
  'sad boi',
  'depressing songs',
  /for the (boys|girls)/i,
  /picks.*hits/i,
  // https://open.spotify.com/album/6dqjFF9lu7QH7fQxMVFNYr
  'Girls Night Out',
  'Grind & Rap',
  // https://open.spotify.com/album/6gB36zWBmVc1etQrBe3GKg
  'throwbacks',
  'Melodic',
  // https://open.spotify.com/album/3sDskF61ndMqZfgi4eMAPv
  /.* playlist .*/i,
  'Rap R&B Trap',
  // https://open.spotify.com/album/17ZfBZIsdXXTRE4TxNP3kv
  'valentines day',
  // https://open.spotify.com/album/47Mgjqn7leuLfQsKdTW84K
  'Poletni Hiti',
  // https://open.spotify.com/album/1bglwmqZxQg4FGhJH0KJ9o
  'Let it goooooo',
  'pop edition',
  'one hit wonder',
  '1 hit wonder',
  'medley',
  'rap life',
  'hits bop',
  'Instrumental Hits',
  'Synthesizer Hits',
  // https://open.spotify.com/album/5ZZo5YG8N5Vqx6va0eHeps
  'Halloween Parachadito',
  'Pop Trending',
  'Pop flow',
  /(house|wedding|dinner|lunch|bridal) party/i,
  // western music https://open.spotify.com/album/2AUaQkwZyx52vDbynEfWLD
  '洋楽',
  'Workout',
  'running songs',
  'Dancefloor Country',
  'work out',
  /(classic|hip-hop|disco) summer/,
  'road trip',
  /Années (\d{2,4})/i,
  'roadtrip',
  'feel good',
  'Daily Lift',
  // https://open.spotify.com/album/31sNRfpCMWTCUvegsOo6Au
  'Masterpieces',
  // https://open.spotify.com/album/6hF7auyVipEW3PLKVBm695
  'country feelings',
  'country pop',
  /(hits|stars) of the (\d{2,4})/i,
  '2010s',
  '2020s',
  // https://open.spotify.com/album/4FLczl7Bu9dTKGvvlfJeqM
  'post covid',
  /chill (night|vibes)/i,
  'soulful vibes',
  'Pop Music',
  /clean (Music|pop)/i,
  // https://open.spotify.com/album/06upvuUpFi324oAg68wuIb
  /songs to sing in/i,
  'Greatest Evergreens',
  'rap kings',
  'pop trending',
  // decade at start
  /^(\d{2,4})s/i,
  /study (songs|hits|music)/i,
  // https://open.spotify.com/album/1XKzl5sT6abIyY4dX9LQld
  'Canciones para',
  // https://open.spotify.com/album/0cMk2DAaVsPUnLM7qrOtZU
  'De Chicas',
  /All I Do Is Win \d{4}/i,
  // August 2022 Hits
  /^([A-Z][a-z]+) (\d{4}) Hits$/i,
  /^(\d{4}).* (Rap|pop) Hits/i,
  // Do not add greatest hits
  /(rap|pop|chill|clean|party|country|rock|indie|monster|pride) (mix|hits|classics|anthems)/i,
  /(top|best) (rap|pop|chill|hits|trap|indie|rock|party|country)/i,
  /(rap|pop|chill|hits|trap|indie|rock|party|country) (\d{2,4})/i,
  /(\d{4}) Shisha/i,
  // years
  /Années (\d{4})/i,
  /del (\d{4})$/i,
  /part (\d{4})$/i,
  'Éxitos',
];

/**
 * Given an input song and a list of songs, return the best match
 *
 * ISRC is the highest priority
 * Title and aritst are equally important
 * Album and release date are optional
 */
export function fuzzymatchSong(inputSong: InputSong, songList: ResultSong[]) {
  const trackSet = fuzzySet(songList.map(x => x.title));
  const titleScores = trackSet.get(inputSong.title, undefined, 0.1);
  const artistSet = fuzzySet(songList.map(x => x.artists));
  const artistScores = artistSet.get(inputSong.artists, undefined, 0.1);
  const albumSet = inputSong.album ? fuzzySet(songList.map(x => x.album ?? '')) : null;
  const albumScores = inputSong.album ? albumSet?.get(inputSong.album ?? '') : null;

  return songList
    .map(song => {
      const titleScore = titleScores?.find(score => score[1] === song.title)?.[0] ?? -1;
      const artistScore = artistScores?.find(score => score[1] === song.artists)?.[0] ?? -1;
      const albumScore = albumScores?.find(score => score[1] === (song.album ?? ''))?.[0] ?? 0;

      const negativeMatchScore = negativeMatch.reduce((acc, neg) => {
        if (song.title.includes(neg.toLowerCase()) || song.artists.includes(neg.toLowerCase())) {
          return acc - 2;
        }

        return acc;
      }, 0);

      const negativeAlbumMatchScore = negativeAlbumMatch.reduce((acc, neg) => {
        if (typeof neg === 'string' && song.album?.includes(neg.toLowerCase())) {
          return acc - 2;
        }

        if (neg instanceof RegExp && song.album && neg.test(song.album)) {
          return acc - 2;
        }

        return acc;
      }, 0);

      const isrcScore = inputSong.isrc && song.isrc === inputSong.isrc ? 10 : 0;
      let score =
        isrcScore +
        titleScore +
        artistScore +
        albumScore +
        negativeMatchScore +
        negativeMatchScore +
        negativeAlbumMatchScore;

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
