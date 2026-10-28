import { useMemo, useRef, useState } from 'react';
import MapView from '../MapView.jsx';
import BusinessDetail from '../BusinessDetail.jsx';
import AddressSearch from '../AddressSearch.jsx';
import HoursPicker from '../HoursPicker.jsx';
import { closedWeek, summarizeHours } from '../hours';
import { reverseGeocode } from '../geocode';
import { useBusinesses } from '../useBusinesses';
import { photoToDataUrl } from '../photo';
import { STICKERS, stickerFor, stickerUrl } from '../stickers';

const empty = () => ({ name: '', address: '', openingHours: closedWeek(), category: '', sticker: STICKERS[0].id, businessPhoto: '', ownersIntro: '', ownersPhoto: '' });

export default function MapPage({ user }) {
  const { items, add, error: loadError } = useBusinesses(user);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(''); // which photo field is being prepared
  const [suggested, setSuggested] = useState(''); // address found for a map click, when one was already typed
  const near = useRef(null); // current map centre, to rank address results nearby
  const formRef = useRef(form);
  formRef.current = form;
  const lookup = useRef(0);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return items.filter((b) => `${b.name} ${b.address} ${b.category}`.toLowerCase().includes(t));
  }, [items, q]);
  const selected = items.find((b) => b.id === selectedId);

  const field = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  function pickAddress(r) {
    lookup.current += 1;
    setForm((f) => ({ ...f, address: r.address, name: f.name || r.name }));
    setDraft({ lng: r.lng, lat: r.lat, zoom: r.zoom });
    setSuggested('');
  }

  // Clicking the map places the pin, then looks up the address there.
  async function placeOnMap(pt) {
    setDraft(pt);
    setSuggested('');
    const id = ++lookup.current;
    try {
      const hit = await reverseGeocode(pt);
      if (id !== lookup.current || !hit?.address) return;
      if (!formRef.current.address.trim()) setForm((f) => ({ ...f, address: hit.address }));
      else if (hit.address !== formRef.current.address) setSuggested(hit.address);
    } catch {
      // The pin is placed either way; the address can still be typed.
    }
  }

  function closeForm() {
    lookup.current += 1;
    setForm(empty());
    setDraft(null);
    setSuggested('');
    setAdding(false);
    setError('');
  }

  const pickPhoto = (key) => async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setPhotoBusy(key);
    try {
      const data = await photoToDataUrl(file);
      setForm((f) => ({ ...f, [key]: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoBusy('');
    }
  };

  const photoField = (key, label) => (
    <div className="photo-pick">
      <span className="legend">{label} <small>(optional)</small></span>
      {photoBusy === key ? <div className="photo-empty">Preparing photo…</div>
        : form[key] && <img src={form[key]} alt={`Preview: ${label.toLowerCase()}`} />}
      <div className="row">
        <label className="button">
          {form[key] ? 'Replace photo' : 'Upload photo'}
          <input type="file" accept="image/*" onChange={pickPhoto(key)} hidden />
        </label>
        {form[key] && photoBusy !== key && (
          <button type="button" onClick={() => setForm({ ...form, [key]: '' })}>Remove</button>
        )}
      </div>
    </div>
  );

  async function save(e) {
    e.preventDefault();
    if (!draft) return setError('Pick an address from the suggestions or click the map to place the business.');
    try {
      const { businessPhoto, ownersPhoto, ownersIntro, openingHours, ...rest } = form;
      const intro = ownersIntro.trim();
      const hours = summarizeHours(openingHours);
      await add({
        ...rest,
        ...(hours && { hours, openingHours }),
        ...(businessPhoto && { businessPhoto }),
        ...(intro && { ownersIntro: intro }),
        ...(ownersPhoto && { ownersPhoto }),
        lng: draft.lng,
        lat: draft.lat,
      });
      closeForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="layout">
      <MapView businesses={filtered} selectedId={selectedId} onSelect={adding ? () => {} : setSelectedId} draft={draft} onPick={adding ? placeOnMap : undefined} onCenter={(c) => { near.current = c; }} />

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
                <p className={`place-hint${draft ? ' done' : ''}`}>{draft ? 'Location set. Click the map to fine-tune it.' : 'Search an address or click the map to place the business.'}</p>
                <p className="hint">Submissions are final and can't be edited or deleted here.</p>
                <input required placeholder="Name" {...field('name')} />
                <AddressSearch value={form.address} onChange={(address) => setForm((f) => ({ ...f, address }))} onPick={pickAddress} near={near} />
                {suggested && (
                  <p className="address-suggest">
                    Pin is at <strong>{suggested}</strong>.{' '}
                    <button type="button" className="link" onClick={() => { setForm((f) => ({ ...f, address: suggested })); setSuggested(''); }}>Use this address</button>
                  </p>
                )}
                <input placeholder="Category" {...field('category')} />
                <HoursPicker value={form.openingHours} onChange={(openingHours) => setForm((f) => ({ ...f, openingHours }))} />
                <fieldset className="sticker-pick">
                  <legend>Pick a pin</legend>
                  {STICKERS.map((s) => (
                    <label key={s.id} title={s.label}>
                      <input type="radio" name="sticker" value={s.id} checked={form.sticker === s.id} onChange={field('sticker').onChange} />
                      <img src={stickerUrl(s.id)} alt={s.label} />
                    </label>
                  ))}
                </fieldset>
                {photoField('businessPhoto', 'Photo of the business')}
                <label className="intro-field">
                  <span className="legend">Meet the Owners intro <small>(optional)</small></span>
                  <textarea rows={4} maxLength={2000} placeholder="Who runs it and how it started. Each new line becomes its own paragraph." {...field('ownersIntro')} />
                </label>
                {photoField('ownersPhoto', 'Photo of the owners')}
                {error && <p className="error">{error}</p>}
                <div className="row">
                  <button className="primary" type="submit" disabled={photoBusy}>Save business</button>
                  <button type="button" onClick={closeForm}>Cancel</button>
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
