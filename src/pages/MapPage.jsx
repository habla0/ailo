import { useMemo, useState } from 'react';
import MapView from '../MapView.jsx';
import { useBusinesses } from '../useBusinesses';

const empty = { name: '', address: '', hours: '', category: '' };

export default function MapPage({ user }) {
  const { items, add, remove, error: loadError } = useBusinesses(user);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return items.filter((b) => `${b.name} ${b.address} ${b.category}`.toLowerCase().includes(t));
  }, [items, q]);

  const field = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  async function save(e) {
    e.preventDefault();
    if (!draft) return setError('Click the map to place the business.');
    try {
      await add({ ...form, lng: draft.lng, lat: draft.lat });
      setForm(empty);
      setDraft(null);
      setAdding(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <input type="search" placeholder="Search name, suburb or category" value={q} onChange={(e) => setQ(e.target.value)} />

        {user && !adding && <button className="primary" onClick={() => setAdding(true)}>Add a business</button>}
        {!user && <p className="hint">Sign in to add businesses.</p>}

        {adding && (
          <form onSubmit={save} className="form">
            <p className="hint">{draft ? 'Location set. Click the map to move it.' : 'Click the map to place the business.'}</p>
            <input required placeholder="Name" {...field('name')} />
            <input placeholder="Address" {...field('address')} />
            <input placeholder="Opening hours" {...field('hours')} />
            <input placeholder="Category" {...field('category')} />
            {error && <p className="error">{error}</p>}
            <div className="row">
              <button className="primary" type="submit">Save business</button>
              <button type="button" onClick={() => { setAdding(false); setDraft(null); setError(''); }}>Cancel</button>
            </div>
          </form>
        )}

        {loadError && <p className="error">Could not load businesses: {loadError}</p>}

        <ul>
          {filtered.map((b) => (
            <li key={b.id} className={b.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(b.id)}>
              <strong>{b.name}</strong>
              {b.category && <span className="tag">{b.category}</span>}
              <small>{b.address}</small>
              <small>{b.hours}</small>
              {user && b.ownerId === user.uid && (
                <button className="link" onClick={(e) => { e.stopPropagation(); remove(b.id); }}>Delete</button>
              )}
            </li>
          ))}
          {filtered.length === 0 && <li className="empty">No businesses match your search.</li>}
        </ul>
      </aside>
      <MapView businesses={filtered} selectedId={selectedId} onSelect={setSelectedId} draft={draft} onPick={adding ? setDraft : undefined} />
    </div>
  );
}
