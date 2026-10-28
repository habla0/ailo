import { DAYS, DEFAULT_TIMES } from './hours';

// Per-day opening hours: tick the days the business is open, then pick opening and closing times.
export default function HoursPicker({ value, onChange }) {
  const set = (key, day) => onChange({ ...value, [key]: day });
  const firstOpen = DAYS.find((d) => value[d.key]);
  const openCount = DAYS.filter((d) => value[d.key]).length;

  function copyToAll() {
    const times = value[firstOpen.key];
    onChange(Object.fromEntries(DAYS.map((d) => [d.key, value[d.key] && { ...times }])));
  }

  return (
    <fieldset className="hours-pick">
      <legend>Opening hours <small>(tick the days you're open)</small></legend>
      {DAYS.map((d) => {
        const day = value[d.key];
        return (
          <div key={d.key} className={`hours-row${day ? '' : ' closed'}`}>
            <label className="hours-day">
              <input type="checkbox" checked={Boolean(day)} onChange={(e) => set(d.key, e.target.checked ? { ...DEFAULT_TIMES } : null)} />
              {d.label}
            </label>
            {day ? (
              <span className="hours-times">
                <input type="time" aria-label={`${d.label} opening time`} value={day.open} required onChange={(e) => set(d.key, { ...day, open: e.target.value })} />
                <span aria-hidden="true">to</span>
                <input type="time" aria-label={`${d.label} closing time`} value={day.close} required onChange={(e) => set(d.key, { ...day, close: e.target.value })} />
              </span>
            ) : (
              <span className="hours-closed">Closed</span>
            )}
          </div>
        );
      })}
      {openCount > 1 && (
        <button type="button" className="link" onClick={copyToAll}>
          Use {firstOpen.label}'s hours for all open days
        </button>
      )}
    </fieldset>
  );
}
