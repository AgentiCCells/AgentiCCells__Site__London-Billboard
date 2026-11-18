// The screen's pure parts: the example state (no network, never "live"), the journey legs with start
// times, the sun custom-property values, and the sizing rule. Code Apache-2.0.
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildState, journey, sunInfo, fitWindow, normaliseParams, THEMES, EXAMPLE_NOW } from '../src/assets/js/screen.js';
import * as D from '../src/assets/js/data.js';

test('the example state reads nothing and is marked example', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('no network in the example state'); };
  try {
    const s = await buildState({ from: 'porto', to: 'tavira' }, { example: true });
    assert.equal(s.example, true);
    assert.equal(s.realNow.toISOString(), new Date(EXAMPLE_NOW).toISOString());
    assert.equal(s.place.temp_c.value, 21);
    assert.equal(s.place.uv.value, 3);
    assert.equal(s.here.temp_c.value, 13);
    assert.equal(s.aircraft.value, 4);
    assert.match(s.decision.line, /^Example values, not a reading\./);
    assert.deepEqual(s.cards, {});
  } finally { globalThis.fetch = realFetch; }
});

test('journey legs carry start times that add up to the arrival', () => {
  const p = normaliseParams({ from: 'london', station: 'victoria', to: 'faro' });
  const now = new Date('2026-11-18T06:00:00Z');
  const j = journey(p, D.PLACES.faro, now);
  assert.ok(j.legs.every(l => typeof l.what === 'string' && l.min > 0 && l.start instanceof Date));
  assert.equal(j.leave.getTime(), j.legs[0].start.getTime());
  for (let i = 1; i < j.legs.length; i++) assert.equal(j.legs[i].start - j.legs[i - 1].start, j.legs[i - 1].min * 60000);
  const last = j.legs[j.legs.length - 1];
  assert.equal(last.start.getTime() + last.min * 60000, j.there.getTime());
  assert.ok(j.leave >= now);
});

test('sun fractions are clamped to 0..1 and night follows the sun', async () => {
  const day = await buildState({}, { example: true, now: new Date('2026-11-18T12:00:00Z') });
  const sd = sunInfo(day, day.realNow);
  assert.ok(sd.fracAlg > 0 && sd.fracAlg < 1);
  assert.equal(sd.night, false);
  const night = await buildState({}, { example: true, now: new Date('2026-11-18T22:00:00Z') });
  const sn = sunInfo(night, night.realNow);
  assert.equal(sn.fracAlg, 1);
  assert.equal(sn.night, true);
});

test('fitWindow: fits below the top, keeps the controls in view under the floor', () => {
  globalThis.innerHeight = 900;
  assert.equal(fitWindow({ top: 178, controls: 56, decision: 108, floor: 480 }), 900 - 178 - 56 - 108 - 16);
  globalThis.innerHeight = 768;
  assert.equal(fitWindow({ top: 178, controls: 56, decision: 108, floor: 480 }), 480);
  globalThis.innerHeight = 600;
  assert.equal(fitWindow({ top: 178, controls: 56, decision: 108, floor: 480 }), 600 - 178 - 56 - 16);
  globalThis.innerHeight = 844;
  assert.equal(fitWindow({ top: 285, controls: 56, decision: 108, floor: 480 }, { belowTop: false }), 844 - 56 - 16);
  delete globalThis.innerHeight;
});

test('the five design names are accepted', () => {
  for (const t of ['poster', 'board', 'postcard', 'readout', 'dusk']) assert.ok(THEMES.includes(t));
});
