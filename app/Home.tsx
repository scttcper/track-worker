import { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { SpotifyTrack } from '../src/spotify/search.type';

export function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParms = new URLSearchParams(location.search);
  const title = queryParms.get('title') ? queryParms.get('title')! : '';
  const artists = queryParms.get('artists') ? queryParms.get('artists')! : '';
  const noQuery = !title || !artists;
  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: [
      '/search',
      {
        title: queryParms.get('title')!,
        artists: queryParms.get('artists')!,
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-12">
          <form onSubmit={handleSubmit}>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Title
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="title"
                    autoComplete="off"
                    defaultValue={title}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Artists
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="artists"
                    autoComplete="off"
                    defaultValue={artists}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="rounded-md bg-cyan-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        <div className="space-y-12">
          {data?.results?.map((result: SpotifyTrack) => {
            return (
              <div>
                <div>{result.name}</div>
                <div>{result.album.name}</div>
                <div>{result.artists.map(artist => artist.name).join(', ')}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
