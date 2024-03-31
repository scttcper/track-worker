import { describe, expect, it } from 'vitest';

import { normalizeTrack } from './normalizers';

describe('normalizeTrackArtists', () => {
  it('should remove remix from track title and add artist to artists array', () => {
    const track = {
      title: 'Snow In The Distance (Teen Daze Remix)',
      artists: 'Alex Lustig',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toBe('snow in the distance');
    expect(normalizedTrack.artists).toBe('alex lustig teen daze');
  });

  it('should remove exclusive from track title', () => {
    const track = {
      title: 'Ho Hey EXCLUSIVE',
      artists: 'Lumineers',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toEqual('ho hey');
    expect(normalizedTrack.artists).toEqual(track.artists.toLowerCase());
  });

  it('should remove exclusive from middle of track title', () => {
    const track = {
      title: 'As It Was EXCLUSIVE (Harry Styles Cover)',
      artists: 'Lumineers',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toEqual('as it was harry styles cover');
    expect(normalizedTrack.artists).toEqual(track.artists.toLowerCase());
  });

  it('should remove exclusive with hypen', () => {
    const track = {
      title: 'Change of Time Exclusive',
      artists: 'Josh Ritter',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toEqual('change of time');
    expect(normalizedTrack.artists).toEqual(track.artists.toLowerCase());
  });

  it('should remove decade and exclusive', () => {
    const track = {
      title: 'Change of Time Exclusive (98)',
      artists: 'Josh Ritter',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toEqual('change of time');

    track.title = 'Here I Go Again (87)';
    const normalizedTrack2 = normalizeTrack(track);
    expect(normalizedTrack2.title).toEqual('here i go again');
  });

  it('should remove remastered and year', () => {
    const track = {
      title: 'Flying - Remastered 2009',
      artists: 'The Beatles',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toBe('flying');
  });

  it('should remove remastered', () => {
    const track = {
      title: 'Flying - Remastered',
      artists: 'The Beatles',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toBe('flying');
  });

  it('should remove featuring with square brackets', () => {
    const track = {
      title: 'Flying [feat. The Beatles]',
      artists: 'sample',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toBe('flying');
    expect(normalizedTrack.artists).toBe('sample the beatles');
  });

  it('should remove featuring with parenthesis', () => {
    const track = {
      title: 'Flying (feat. The Beatles)',
      artists: 'sample artist',
    };

    const normalizedTrack = normalizeTrack(track);

    expect(normalizedTrack.title).toBe('flying');
  });
});
