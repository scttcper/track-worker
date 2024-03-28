import { describe, expect, it } from 'vitest';

import { normalizeTrackArtists } from './normalizers';

describe('normalizeTrackArtists', () => {
  it('should remove remix from track title and add artist to artists array', () => {
    const track = {
      title: 'Snow In The Distance (Teen Daze Remix)',
      artists: 'Alex Lustig',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('Snow In The Distance');
    expect(normalizedTrack.artists).toBe('Alex Lustig Teen Daze');
  });

  it('should remove exclusive from track title', () => {
    const track = {
      title: 'Ho Hey EXCLUSIVE',
      artists: 'Lumineers',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('Ho Hey');
    expect(normalizedTrack.artists).toEqual(track.artists);
  });

  it('should remove exclusive from middle of track title', () => {
    const track = {
      title: 'As It Was EXCLUSIVE (Harry Styles Cover)',
      artists: 'Lumineers',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('As It Was (Harry Styles Cover)');
    expect(normalizedTrack.artists).toEqual(track.artists);
  });

  it('should remove exclusive with hypen', () => {
    const track = {
      title: 'Change of Time Exclusive',
      artists: 'Josh Ritter',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('Change of Time');
    expect(normalizedTrack.artists).toEqual(track.artists);
  });
});
