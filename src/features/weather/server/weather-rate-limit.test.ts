import { describe, expect, it } from 'vitest';
import { checkWeatherRateLimit } from './weather-rate-limit';

describe('weather rate limit', () => {
  it('borne les rafraîchissements répétés d’un même compte', () => {
    for (let index = 0; index < 20; index += 1) expect(() => checkWeatherRateLimit('rate-limited-user', 1_000)).not.toThrow();
    expect(() => checkWeatherRateLimit('rate-limited-user', 1_000)).toThrow(expect.objectContaining({ code: 'WEATHER_RATE_LIMITED', status: 429 }));
  });
});
