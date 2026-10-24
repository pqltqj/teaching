import {calendarCourses, calendarSeed} from './calendar-seed.js';

const fields = ['biology30', 'chemistry20', 'biology20', 'note'];
export const calendarDate = value => typeof value === 'string' && /^2026-(10|11|12)-\d{2}$/.test(value) && value >= '2026-10-26' && value <= '2026-12-31' && !Number.isNaN(Date.parse(value + 'T12:00:00Z')) && new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value;
const empty = {biology30: '', chemistry20: '', biology20: '', note: ''};
const seedDay = date => ({...empty, ...calendarSeed[date], revision: 0});

export async function calendarState(storage, teacher) {
  const days = Object.fromEntries(Object.keys(calendarSeed).map(date => [date, seedDay(date)]));
  for (const [key, value] of await storage.list({prefix: 'calendar:'})) {
    const date = key.slice('calendar:'.length);
    if (calendarDate(date)) days[date] = value;
  }
  return {teacher, courses: calendarCourses, start: '2026-10-26', end: '2026-12-31', days};
}

export async function updateCalendar(storage, body) {
  if (!body || !calendarDate(body.date) || !Number.isSafeInteger(body.revision) || body.revision < 0 || fields.some(key => typeof body[key] !== 'string' || body[key].length > 1500)) {
    return {status: 400, body: {error: 'Choose a date from October 26 to December 31, 2026, and keep each entry under 1,500 characters.'}};
  }
  return storage.transaction(async txn => {
    const key = 'calendar:' + body.date;
    const current = await txn.get(key) || seedDay(body.date);
    if (body.revision !== current.revision) return {status: 409, body: {error: 'This day changed on another device. Copy your edits, close this window, and reopen the day to review the latest version.'}};
    const day = Object.fromEntries(fields.map(key => [key, body[key].trim()]));
    day.revision = current.revision + 1;
    await txn.put(key, day);
    return {status: 200, body: {date: body.date, day}};
  });
}
