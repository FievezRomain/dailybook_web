const STORAGE_HOSTNAME_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function resolveStorageHostnames(value: string | undefined): readonly string[] {
  const hostname = value?.trim().toLowerCase();
  if (!hostname || !STORAGE_HOSTNAME_PATTERN.test(hostname)) {
    throw new Error('Invalid storage hostname configuration.');
  }

  const hostnames = new Set([hostname]);
  const regionalAwsHostname = hostname.match(/^(.+)\.s3\.([a-z0-9-]+)\.amazonaws\.com$/);
  if (regionalAwsHostname) {
    hostnames.add(`${regionalAwsHostname[1]}.s3.amazonaws.com`);
  }

  return [...hostnames];
}

export function createStorageRemotePatterns(value: string | undefined) {
  return resolveStorageHostnames(value).map((hostname) => ({
    protocol: 'https' as const,
    hostname,
    port: '',
    pathname: '/**',
  }));
}
