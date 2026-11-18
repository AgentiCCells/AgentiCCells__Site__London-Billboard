// sun.js: sunrise, sunset and the sun's height for any place and date, in UTC.
// The NOAA solar calculator's equations (NOAA Global Monitoring Laboratory, "General Solar
// Position Calculations" and its spreadsheet, after Jean Meeus, "Astronomical Algorithms").
// Accurate to about a minute between latitudes 72 N and 72 S, which is all this site needs.
// ES module, no dependencies; works in the browser and in Node (tests/sun.test.mjs).
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18. Code Apache-2.0.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const DAY_MS = 86400000;

// Julian day of a time in milliseconds since 1970 (UTC).
const julian = ms => ms / DAY_MS + 2440587.5;

// The sun's declination (degrees) and the equation of time (minutes) at an instant.
export function solar(ms) {
  const T = (julian(ms) - 2451545) / 36525;
  const L0 = ((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360 + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T))
    + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T)
    + Math.sin(3 * M * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) * DEG;
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const eqt = 4 * DEG * (y * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD)
    + 4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD)
    - 0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD));
  return { decl, eqt };
}

// The day a time falls on at a longitude (solar day), as midnight UTC of that date in ms.
function dayStart(date, lon) {
  const ms = date instanceof Date ? date.getTime() : Date.parse(`${date}T12:00:00Z`);
  const local = ms + (lon / 15) * 3600000;
  return Math.floor(local / DAY_MS) * DAY_MS;
}

// Hour angle (degrees) of sunrise for a declination, or NaN when the sun does not rise or set.
// 90.833 degrees: the sun's upper edge on the horizon, with standard refraction.
function riseAngle(lat, decl) {
  const c = Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decl * RAD)) - Math.tan(lat * RAD) * Math.tan(decl * RAD);
  return c > 1 ? -1 : c < -1 ? 361 : Math.acos(c) * DEG; // -1: polar night, 361: midnight sun
}

// sunTimes(date, lat, lon) -> { sunrise, sunset, noon (Dates, UTC), polar: null | 'day' | 'night' }
// date: a Date (its solar day at that longitude) or 'YYYY-MM-DD'. lat north positive, lon east positive.
export function sunTimes(date, lat, lon) {
  const d0 = dayStart(date, lon);
  // First pass at noon, then refine each event at its own time (as NOAA's calculator does).
  const event = (sign) => {
    let t = d0 + 720 * 60000;
    let polar = null;
    for (let i = 0; i < 3; i++) {
      const { decl, eqt } = solar(t);
      const ha = riseAngle(lat, decl);
      if (ha < 0) { polar = 'night'; break; }
      if (ha > 360) { polar = 'day'; break; }
      const min = 720 - 4 * lon - eqt + sign * 4 * ha;
      t = d0 + min * 60000;
    }
    return { t, polar };
  };
  const { eqt } = solar(d0 + 720 * 60000);
  const noon = new Date(d0 + (720 - 4 * lon - eqt) * 60000);
  const r = event(-1), s = event(1);
  const polar = r.polar || s.polar;
  return { sunrise: polar ? null : new Date(r.t), sunset: polar ? null : new Date(s.t), noon, polar };
}

// The sun's height above the horizon (degrees, without refraction) and its hour angle at an instant.
export function sunPosition(at, lat, lon) {
  const ms = at instanceof Date ? at.getTime() : Number(at);
  const { decl, eqt } = solar(ms);
  const minutes = ((ms % DAY_MS) + DAY_MS) % DAY_MS / 60000;
  const tst = minutes + eqt + 4 * lon;
  let ha = tst / 4 - 180;
  if (ha < -180) ha += 360;
  const cz = Math.sin(lat * RAD) * Math.sin(decl * RAD) + Math.cos(lat * RAD) * Math.cos(decl * RAD) * Math.cos(ha * RAD);
  const altitude = 90 - Math.acos(Math.max(-1, Math.min(1, cz))) * DEG;
  return { altitude, hourAngle: ha, decl };
}

// Minutes of daylight left at an instant (0 after sunset or before sunrise, Infinity in a polar day).
export function daylightLeft(at, lat, lon) {
  const now = at instanceof Date ? at : new Date(at);
  const { sunrise, sunset, polar } = sunTimes(now, lat, lon);
  if (polar === 'day') return Infinity;
  if (polar === 'night' || now < sunrise || now > sunset) return 0;
  return Math.round((sunset - now) / 60000);
}

// isDark(at, lat, lon): true between sunset and sunrise.
export function isDark(at, lat, lon) {
  return sunPosition(at, lat, lon).altitude < -0.833;
}
