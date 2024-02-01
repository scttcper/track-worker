const encoder = new TextEncoder();

const BASIC_USER = 'username';
const BASIC_PASS = 'password';

/**
 * Protect against timing attacks by safely comparing values using `timingSafeEqual`.
 * Refer to https://developers.cloudflare.com/workers/runtime-apis/web-crypto/#timingsafeequal for more details
 */
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  if (aBytes.byteLength !== bBytes.byteLength) {
    // Strings must be the same length in order to compare
    // with crypto.subtle.timingSafeEqual
    return false;
  }

  // @ts-expect-error
  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

function isAuthenticated(credentials: string): boolean {
  // The username & password are split by the first colon.
  //=> example: "username:password"
  const index = credentials.indexOf(':');
  const user = credentials.substring(0, index);
  const pass = credentials.substring(index + 1);

  return !timingSafeEqual(BASIC_USER, user) || !timingSafeEqual(BASIC_PASS, pass);
}
