// Basemap: OpenFreeMap's Positron vector style (free, no API key), recoloured to the Ailo palette
// with the busiest layers (shields, rail, path names, minor road names) removed.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

const LAND = '#FBF2E1';
const ink = '#4F474A';

const drop = /^(highway-shield|road_shield|railway|highway-name-path|highway-name-minor|aeroway-taxiway|boundary_disputed)/;

const paint = {
  background: { 'background-color': LAND },
  park: { 'fill-color': '#E6EBD8' },
  landcover_wood: { 'fill-color': '#E6EBD8' },
  water: { 'fill-color': '#CADCD7' },
  waterway: { 'line-color': '#CADCD7' },
  landuse_residential: { 'fill-color': '#F8EDD8' },
  building: { 'fill-color': '#F4E6CC', 'fill-outline-color': '#EEDFC3' },
  road_area_pier: { 'fill-color': LAND },
  road_pier: { 'line-color': LAND },
  'aeroway-area': { 'fill-color': '#F6EAD3' },
  'aeroway-runway': { 'line-color': '#FFFFFF' },
  'aeroway-runway-casing': { 'line-color': '#EEDFC3' },
  highway_minor: { 'line-color': '#FFFDF8' },
  highway_major_casing: { 'line-color': '#EEDFC3' },
  highway_major_inner: { 'line-color': '#FFFFFF' },
  highway_major_subtle: { 'line-color': '#F1E4CC' },
  highway_motorway_casing: { 'line-color': '#EEDFC3' },
  highway_motorway_inner: { 'line-color': '#FFFFFF' },
  highway_motorway_subtle: { 'line-color': '#F1E4CC' },
  highway_motorway_bridge_casing: { 'line-color': '#EEDFC3' },
  highway_motorway_bridge_inner: { 'line-color': '#FFFFFF' },
  tunnel_motorway_casing: { 'line-color': '#EEDFC3' },
  tunnel_motorway_inner: { 'line-color': '#FBF6EC' },
  boundary_2: { 'line-color': '#D9CDB8' },
  boundary_3: { 'line-color': '#D9CDB8' },
};

export async function loadBrandStyle() {
  const style = await (await fetch(STYLE_URL)).json();
  style.layers = style.layers
    .filter((l) => !drop.test(l.id))
    .map((l) => {
      const p = { ...l.paint, ...paint[l.id] };
      if (l.type === 'symbol') {
        const water = l.id.startsWith('water');
        p['text-color'] = water ? '#6F8C88' : ink;
        p['text-halo-color'] = water ? 'rgba(202,220,215,0.8)' : 'rgba(251,242,225,0.9)';
      }
      return { ...l, paint: p };
    });
  return style;
}
