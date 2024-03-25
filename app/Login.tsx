import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch('/auth/login', {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 lg:px-8 sm:px-6">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block font-medium text-gray-900 text-sm leading-6"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  required={true}
                  id="username"
                  name="username"
                  type="username"
                  autoComplete="username"
                  className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-2 focus:ring-indigo-600 focus:ring-inset"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block font-medium text-gray-900 text-sm leading-6"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  required={true}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-2 focus:ring-indigo-600 focus:ring-inset"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 font-semibold text-sm text-white leading-6 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
