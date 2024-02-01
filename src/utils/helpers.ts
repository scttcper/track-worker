export function validImdbId(imdbId: string | string[] | undefined): imdbId is string {
  return typeof imdbId === 'string' && /tt[0-9]{7,8}/i.test(imdbId);
}

export function parseImdbUrl(url: string) {
  const result = /imdb\.com\/title\/tt(?<id>[0-9]{7,8})\/?.*/i.exec(url);
  if (!result?.groups?.id) {
    throw new Error('invalid id');
  }

  return 'tt' + result.groups.id;
}

export function handleSearchInput(input: string) {
  function getId() {
    try {
      const imdbId = parseImdbUrl(input);
      return imdbId;
    } catch {}

    if (validImdbId(input)) {
      return input;
    }

    return 'tt' + input;
  }

  const id = getId();
  // remove extra zeroes
  // tt00420293 ->
  // tt0420293
  if (id.length >= 10 && id.startsWith('tt0')) {
    const num = Number(id.replace('tt', '')).toString();
    return `tt${num.padStart(7, '0')}`;
  }

  return id;
}
