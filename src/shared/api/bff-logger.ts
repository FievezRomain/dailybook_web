import 'server-only';

type LogLevel = 'info' | 'warn' | 'error';
type LogValue = string | number | boolean | null | undefined;

const writers = {
  info: (message: unknown) => console.info(message),
  warn: (message: unknown) => console.warn(message),
  error: (message: unknown) => console.error(message),
} satisfies Record<LogLevel, (message?: unknown) => void>;

/** Emit one compact JSON line. Callers only provide explicitly safe metadata. */
export function writeBffLog(
  level: LogLevel,
  event: string,
  fields: Record<string, LogValue>,
): void {
  writers[level](JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: 'vasco-web-bff',
    event,
    ...Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)),
  }));
}

export function normalizeUpstreamRoute(path: string): string {
  const pathname = path.split('?', 1)[0] ?? path;
  return `/${pathname.replace(/^\/+/, '')}`
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/(documents|files)\/(?!upload-url(?:\/|$)|upload-complete(?:\/|$)|download-urls(?:\/|$))[^/]+/gi, '/$1/:file');
}
