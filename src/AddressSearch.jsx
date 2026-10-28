import { useEffect, useRef, useState } from 'react';
import { searchAddress } from './geocode';

// Address input with Photon suggestions. Typing edits the address text; picking a suggestion
// also hands its coordinates to onPick so the business can be pinned.
export default function AddressSearch({ value, onChange, onPick, near }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('');
  const typed = useRef(false); // only search after the user types, not when a pick fills the box

  useEffect(() => {
    const q = value.trim();
    if (!typed.current || q.length < 3) {
      setResults([]);
      setStatus('');
      return undefined;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setStatus('Searching…');
      searchAddress(q, near.current, ctrl.signal)
        .then((r) => {
          setResults(r);
          setActive(-1);
          setOpen(true);
          setStatus(r.length ? '' : 'No matches. Try adding the suburb, or click the map.');
        })
        .catch((e) => e.name !== 'AbortError' && setStatus(e.message));
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value, near]);

  function pick(r) {
    typed.current = false;
    setOpen(false);
    setResults([]);
    onPick(r);
  }

  function onKeyDown(e) {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="address-search">
      <input
        placeholder="Address (start typing to search)"
        value={value}
        onChange={(e) => {
          typed.current = true;
          onChange(e.target.value);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="address-results"
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `address-${active}` : undefined}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul id="address-results" role="listbox">
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`address-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(r)}
            >
              {r.name && <strong>{r.name}</strong>}
              <span>{r.address}</span>
            </li>
          ))}
        </ul>
      )}
      {status && <small className="address-status">{status}</small>}
    </div>
  );
}
