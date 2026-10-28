// Address search and reverse lookup via Photon (https://photon.komoot.io), a free, keyless
// geocoder built on OpenStreetMap data. Fair use: requests are debounced and cancelled as people type.
const BASE = 'https://photon.komoot.io';
// Skip transit stops, which otherwise crowd out real addresses.
const EXCLUDE = ['!highway:bus_stop', '!public_transport', '!railway'];
// Results of these kinds are areas or roads, not a business's own name.
const NOT_A_BUSINESS = ['place', 'highway', 'boundary', 'landuse', 'building'];

function toResult(f) {
  const p = f.properties;
  const [lng, lat] = f.geometry.coordinates;
  const line1 = p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street || p.name || '';
  const suburb = p.district || p.locality || p.city;
  const parts = [line1, suburb, p.city !== suburb && p.city, [p.state, p.postcode].filter(Boolean).join(' '), p.country];
  const address = parts.filter((s, i) => s && parts.indexOf(s) === i).join(', ');
  const isBusiness = p.type === 'house' && p.name && !NOT_A_BUSINESS.includes(p.osm_key);
  return {
    id: `${p.osm_type}${p.osm_id}`,
    lng,
    lat,
    address,
    name: isBusiness ? p.name : '',
    zoom: p.type === 'house' ? 17 : p.type === 'street' ? 16 : 13,
  };
}

async function get(path, params, signal) {
  const url = new URL(path, BASE);
  Object.entries(params).forEach(([k, v]) => [].concat(v).forEach((x) => url.searchParams.append(k, x)));
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Address search is unavailable right now. Click the map instead.');
  return (await res.json()).features.map(toResult);
}

// near: { lng, lat } to rank results close to the current map view first (results stay worldwide).
export function searchAddress(q, near, signal) {
  return get('/api/', { q, limit: 6, lang: 'en', osm_tag: EXCLUDE, ...(near && { lat: near.lat, lon: near.lng }) }, signal);
}

export async function reverseGeocode({ lng, lat }) {
  const [hit] = await get('/reverse', { lat, lon: lng, lang: 'en' });
  return hit;
}
