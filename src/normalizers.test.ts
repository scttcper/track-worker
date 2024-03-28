import { describe, expect, it } from 'vitest';

import { normalizeTrackArtists } from './normalizers';

describe('normalizeTrackArtists', () => {
  it('should remove remix from track title and add artist to artists array', () => {
    const track = {
      title: 'Snow In The Distance (Teen Daze Remix)',
      artists: 'Alex Lustig',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toBe('snow in the distance');
    expect(normalizedTrack.artists).toBe('alex lustig teen daze');
  });

  it('should remove exclusive from track title', () => {
    const track = {
      title: 'Ho Hey EXCLUSIVE',
      artists: 'Lumineers',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('ho hey');
    expect(normalizedTrack.artists).toEqual(track.artists.toLowerCase());
  });

  it('should remove exclusive from middle of track title', () => {
    const track = {
      title: 'As It Was EXCLUSIVE (Harry Styles Cover)',
      artists: 'Lumineers',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('as it was harry styles cover');
    expect(normalizedTrack.artists).toEqual(track.artists.toLowerCase());
  });

  it('should remove exclusive with hypen', () => {
    const track = {
      title: 'Change of Time Exclusive',
      artists: 'Josh Ritter',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('change of time');
    expect(normalizedTrack.artists).toEqual(track.artists.toLowerCase());
  });

  it('should remove decade and exclusive', () => {
    const track = {
      title: 'Change of Time Exclusive (98)',
      artists: 'Josh Ritter',
    };

    const normalizedTrack = normalizeTrackArtists(track);

    expect(normalizedTrack.title).toEqual('change of time');
  });
});
