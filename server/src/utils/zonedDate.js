import { env } from '../config/env.js';

/**
 * Business dates are interpreted in APP_TIMEZONE.
 *
 * The server process (and Vercel) runs in UTC, so `setHours(0, 0, 0, 0)` and
 * `$dateToString` without a timezone would split a local day at 00:00 UTC.
 * These helpers convert a wall-clock date in the business timezone to the UTC
 * instant MongoDB stores.
 */
export const appTimeZone = env.APP_TIMEZONE;

const padParts = (date, zone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }
  return map;
};

/** Milliseconds to add to a UTC instant to read that timezone's wall clock. */
export const getTimeZoneOffsetMs = (date, zone = appTimeZone) => {
  const whole = new Date(Math.floor(date.getTime() / 1000) * 1000);
  const map = padParts(whole, zone);
  // Some engines report midnight as 24:00.
  const hour = Number(map.hour) % 24;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second)
  );
  return asUtc - whole.getTime();
};

const wallClockToUtc = (year, monthIndex, day, hour, minute, second, ms, zone) => {
  // Offset is measured from a whole second. Passing the milliseconds through
  // Intl can round 23:59:59.999 up to the next minute and shift the day.
  const wallSeconds = Date.UTC(year, monthIndex, day, hour, minute, second);
  const offset = getTimeZoneOffsetMs(new Date(wallSeconds), zone);
  const result = new Date(wallSeconds + ms - offset);
  const offsetAtResult = getTimeZoneOffsetMs(result, zone);
  return offsetAtResult === offset ? result : new Date(wallSeconds + ms - offsetAtResult);
};

export const startOfZonedDay = (date, zone = appTimeZone) => {
  const shifted = new Date(date.getTime() + getTimeZoneOffsetMs(date, zone));
  return wallClockToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    0,
    0,
    0,
    0,
    zone
  );
};

export const startOfZonedMonth = (date, zone = appTimeZone) => {
  const shifted = new Date(date.getTime() + getTimeZoneOffsetMs(date, zone));
  return wallClockToUtc(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1, 0, 0, 0, 0, zone);
};

/** `YYYY-MM-DD` as the start (or end) of that calendar day in the business timezone. */
export const parseZonedDate = (ymd, { end = false, zone = appTimeZone } = {}) => {
  const [year, month, day] = ymd.split('-').map(Number);
  if (end) {
    return wallClockToUtc(year, month - 1, day, 23, 59, 59, 999, zone);
  }
  return wallClockToUtc(year, month - 1, day, 0, 0, 0, 0, zone);
};
