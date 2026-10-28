import { useMemo, useState } from 'react';
import MapView from '../MapView.jsx';
import BusinessDetail from '../BusinessDetail.jsx';
import { useBusinesses } from '../useBusinesses';
import { photoToDataUrl } from '../photo';
import { STICKERS, stickerFor, stickerUrl } from '../stickers';

const empty = { name: '', address: '', hours: '', category: '', sticker: STICKERS[0].id, ownersPhoto: '' };

export default function MapPage({ user }) {
  const { items, add, error: loadError } = useBusinesses(user);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return items.filter((b) => `${b.name} ${b.address} ${b.category}`.toLowerCase().includes(t));
  }, [items, q]);
  const selected = items.find((b) => b.id === selectedId);

  const field = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  async function pickPhoto(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setPhotoBusy(true);
    try {
      const ownersPhoto = await photoToDataUrl(file);
      setForm((f) => ({ ...f, ownersPhoto }));
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    if (!draft) return setError('Click the map to place the business.');
    try {
      const { ownersPhoto, ...rest } = form;
      await add({ ...rest, ...(ownersPhoto && { ownersPhoto }), lng: draft.lng, lat: draft.lat });
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
      <MapView businesses={filtered} selectedId={selectedId} onSelect={adding ? () => {} : setSelectedId} draft={draft} onPick={adding ? setDraft : undefined} />

      <aside className="panel">
        {selected ? (
          <BusinessDetail business={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <>
            <input className="search" type="search" placeholder="Search suburb, business or category" value={q} onChange={(e) => setQ(e.target.value)} />

            {user && !adding && <button className="primary" onClick={() => setAdding(true)}>Add a business</button>}
            {!user && <p className="hint">Sign in to add businesses.</p>}

            {adding && (
              <form onSubmit={save} className="form">
                <p className={`place-hint${draft ? ' done' : ''}`}>{draft ? 'Location set. Click the map to move it.' : 'Click the map to place the business.'}</p>
                <p className="hint">Submissions are final and can't be edited or deleted here.</p>
                <input required placeholder="Name" {...field('name')} />
                <input placeholder="Address" {...field('address')} />
                <input placeholder="Opening hours" {...field('hours')} />
                <input placeholder="Category" {...field('category')} />
                <fieldset className="sticker-pick">
                  <legend>Pick a pin</legend>
                  {STICKERS.map((s) => (
                    <label key={s.id} title={s.label}>
                      <input type="radio" name="sticker" value={s.id} checked={form.sticker === s.id} onChange={field('sticker').onChange} />
                      <img src={stickerUrl(s.id)} alt={s.label} />
                    </label>
                  ))}
                </fieldset>
                <div className="photo-pick">
                  <span className="legend">Photo of the business <small>(optional)</small></span>
                  {photoBusy ? <div className="photo-empty">Preparing photo…</div>
                    : form.ownersPhoto && <img src={form.ownersPhoto} alt="Preview of the business photo" />}
                  <div className="row">
                    <label className="button">
                      {form.ownersPhoto ? 'Replace photo' : 'Upload photo'}
                      <input type="file" accept="image/*" onChange={pickPhoto} hidden />
                    </label>
                    {form.ownersPhoto && !photoBusy && (
                      <button type="button" onClick={() => setForm({ ...form, ownersPhoto: '' })}>Remove</button>
                    )}
                  </div>
                </div>
                {error && <p className="error">{error}</p>}
                <div className="row">
                  <button className="primary" type="submit" disabled={photoBusy}>Save business</button>
                  <button type="button" onClick={() => { setAdding(false); setDraft(null); setForm(empty); setError(''); }}>Cancel</button>
                </div>
              </form>
            )}

            {loadError && <p className="error">Could not load businesses: {loadError}</p>}

            <ul className="list">
              {filtered.map((b) => (
                <li key={b.id}>
                  <button onClick={() => setSelectedId(b.id)}>
                    <img src={stickerUrl(stickerFor(b))} alt="" />
                    <span>
                      <strong>{b.name}</strong>
                      {b.address && <small>{b.address}</small>}
                      {b.hours && <small>{b.hours}</small>}
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="empty">No businesses match your search.</li>}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
