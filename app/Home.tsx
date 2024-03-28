import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { hc, InferResponseType } from 'hono/client';

import type { search } from '../src/server';

type client = ReturnType<typeof hc<typeof search>>;
type $get = client['api']['search']['$get'];
type SearchResponse = InferResponseType<$get>;

export function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParms = new URLSearchParams(location.search);
  const title = queryParms.get('title') ? queryParms.get('title')! : '';
  const artists = queryParms.get('artists') ? queryParms.get('artists')! : '';
  const noQuery = !title || !artists;
  const { data, refetch } = useQuery<SearchResponse>({
    queryKey: [
      '/search',
      {
        title: queryParms.get('title')!,
        artists: queryParms.get('artists')!,
        minScore: 0.5,
      },
    ],
    enabled: !noQuery,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    console.log(formData.get('title'), formData.get('artists'));
    const newParams = new URLSearchParams();
    newParams.set('title', formData.get('title') as string);
    newParams.set('artists', formData.get('artists') as string);

    // params are the same
    if (newParams.toString() === location.search.slice(1)) {
      refetch();
      return;
    }

    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-12">
          <form onSubmit={handleSubmit}>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block font-medium text-gray-900 text-sm leading-6"
                >
                  Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="title"
                    autoComplete="off"
                    defaultValue={title}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-2 focus:ring-cyan-600 focus:ring-inset"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block font-medium text-gray-900 text-sm leading-6"
                >
                  Artists
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="artists"
                    autoComplete="off"
                    defaultValue={artists}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-2 focus:ring-cyan-600 focus:ring-inset"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="rounded-md bg-cyan-600 px-2.5 py-1.5 font-semibold text-sm text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-600 focus-visible:outline-offset-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data?.results?.map(result => (
            <div key={result.id} className="flex">
              <div className="mr-2 flex-shrink-0">
                <img
                  className="h-32 w-32 border border-gray-300 bg-white text-gray-300"
                  src={result.album.images[0].url}
                  alt={result.name}
                />
              </div>
              <div>
                <div className="font-extrabold text-xl tabular-nums">
                  Score: {result.score.toLocaleString()} - Popularity:{' '}
                  {result.popularity.toLocaleString()}
                </div>
                <div>
                  <a
                    className="font-semibold text-cyan-800 hover:underline"
                    href={result.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result.name}
                  </a>
                </div>
                <div>
                  {result.artists.map(artist => (
                    <a
                      key={artist.id}
                      className="mb-3 text-cyan-800 hover:underline"
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {artist.name}{' '}
                    </a>
                  ))}
                </div>
                <div className="text-sm">
                  <a
                    key={result.album.name}
                    className="text-cyan-800 hover:underline"
                    href={result.album.external_urls.spotify}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result.album.name}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
