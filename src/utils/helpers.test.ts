import { describe, expect, it } from 'vitest';

import { handleSearchInput } from './helpers';

describe('imdb parsing', () => {
  it('parse url', () => {
    expect(handleSearchInput('https://www.imdb.com/title/tt1937386/')).toBe('tt1937386');
  });
  it('parse long id', () => {
    expect(handleSearchInput('10044952')).toBe('tt10044952');
    expect(handleSearchInput('tt10044952')).toBe('tt10044952');
    expect(handleSearchInput('https://www.imdb.com/title/tt10044952/')).toBe('tt10044952');
    expect(handleSearchInput('https://www.imdb.com/title/tt09620292')).toBe('tt9620292');
  });
  it('normalize zeroes', () => {
    expect(handleSearchInput('tt00420293')).toBe('tt0420293');
    expect(handleSearchInput('tt000420293')).toBe('tt0420293');
    expect(handleSearchInput('tt0000420293')).toBe('tt0420293');
    expect(handleSearchInput('000420293')).toBe('tt0420293');
  });
});
