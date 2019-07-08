import url from 'url';
import { RE_LOCAL_HOST_OR_DEV } from '@scipe/librarian';

export default function resetSubdomain(
  href,
  resetedHostname = 'sci.pe',
  { force = false } = {}, // this is needed for SSR where for sifter and reader we always want to force a reset but `window` is undefined during SSR phase but then defined during client phase
  _location = null
) {
  if (typeof href !== 'string') return href;

  let { protocol, auth, port, hostname, pathname, hash, search } = url.parse(
    href
  );

  const location =
    typeof window !== 'undefined' && window.location && window.location.hostname
      ? window.location
      : _location;

  if (
    (force && typeof window === 'undefined') ||
    (location && !hostname && !RE_LOCAL_HOST_OR_DEV.test(location.hostname))
  ) {
    hostname = resetedHostname;
  }

  return url.format({
    slashes: !!hostname,
    protocol,
    auth,
    hostname,
    port,
    pathname,
    hash,
    search
  });
}
