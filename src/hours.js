// Opening hours are stored per day as { open: 'HH:MM', close: 'HH:MM' }, or null when closed.
export const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export const DEFAULT_TIMES = { open: '09:00', close: '17:00' };

export const closedWeek = () => Object.fromEntries(DAYS.map((d) => [d.key, null]));

// '07:00' -> '7am', '20:30' -> '8:30pm'
export function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 || 12;
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''}${suffix}`;
}

export const formatDay = (d) => (d ? `${formatTime(d.open)}–${formatTime(d.close)}` : 'Closed');

// { mon..fri: 7–4, sat: 8–2, sun: null } -> 'Mon–Fri 7am–4pm, Sat 8am–2pm'. Empty string when closed all week.
export function summarizeHours(week) {
  const groups = [];
  DAYS.forEach((d, i) => {
    const text = week[d.key] ? formatDay(week[d.key]) : null;
    const last = groups[groups.length - 1];
    if (last && last.text === text && last.end === i - 1) last.end = i;
    else groups.push({ text, start: i, end: i });
  });
  return groups
    .filter((g) => g.text)
    .map((g) => `${DAYS[g.start].label}${g.end > g.start ? `–${DAYS[g.end].label}` : ''} ${g.text}`)
    .join(', ');
}

// JS getDay() is 0 = Sunday; DAYS starts on Monday.
export const todayKey = () => DAYS[(new Date().getDay() + 6) % 7].key;
