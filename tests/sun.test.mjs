// Tests for src/assets/js/sun.js against known sunrise and sunset times.
// Reference values: London 2026-12-21 sunset about 15:53 GMT, sunrise about 08:04 GMT;
// Faro 2026-11-18 sunset about 17:20 UTC (NOAA solar calculator); tolerance a few minutes.
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18. Code Apache-2.0.
import test from 'node:test';
import assert from 'node:assert/strict';
import { sunTimes, sunPosition, daylightLeft, isDark } from '../src/assets/js/sun.js';

const near = (d, iso, min = 3) => {
  const diff = Math.abs(d.getTime() - Date.parse(iso)) / 60000;
  assert.ok(diff <= min, `${d.toISOString()} is ${diff.toFixed(1)} min from ${iso}`);
};

test('London, winter solstice 2026', () => {
  const t = sunTimes('2026-12-21', 51.5074, -0.1278);
  near(t.sunset, '2026-12-21T15:53:00Z');
  near(t.sunrise, '2026-12-21T08:04:00Z');
});

test('Faro, 18 November 2026', () => {
  const t = sunTimes('2026-11-18', 37.0194, -7.9322);
  near(t.sunset, '2026-11-18T17:20:00Z');
  near(t.sunrise, '2026-11-18T07:13:00Z');
});

test('a Date gives the same day as its date string', () => {
  const a = sunTimes(new Date('2026-11-18T10:00:00Z'), 37.0194, -7.9322);
  const b = sunTimes('2026-11-18', 37.0194, -7.9322);
  assert.equal(a.sunset.getTime(), b.sunset.getTime());
});

test('polar day and night', () => {
  assert.equal(sunTimes('2026-06-21', 78, 15).polar, 'day');
  assert.equal(sunTimes('2026-12-21', 78, 15).polar, 'night');
});

test('sun height, daylight left, dark', () => {
  const noon = sunPosition(new Date('2026-11-18T12:40:00Z'), 37.0194, -7.9322);
  assert.ok(noon.altitude > 30 && noon.altitude < 36, `altitude ${noon.altitude}`);
  assert.equal(daylightLeft(new Date('2026-11-18T15:00:00Z'), 37.0194, -7.9322), 140);
  assert.equal(daylightLeft(new Date('2026-11-18T18:00:00Z'), 37.0194, -7.9322), 0);
  assert.equal(isDark(new Date('2026-11-18T18:30:00Z'), 37.0194, -7.9322), true);
  assert.equal(isDark(new Date('2026-11-18T12:00:00Z'), 37.0194, -7.9322), false);
});
