import { useEffect, useRef } from 'react';
import OLMap from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { applyStyle } from 'ol-mapbox-style';
import { loadBrandStyle } from './mapStyle';
import { stickerFor, stickerUrl } from './stickers';
import 'ol/ol.css';

const ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

const draftStyle = new Style({
  image: new CircleStyle({ radius: 10, fill: new Fill({ color: '#E7246C' }), stroke: new Stroke({ color: '#FEF2D9', width: 3 }) }),
});

export default function MapView({ businesses, selectedId, onSelect, draft, onPick }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const draftSource = useRef(null);
  const pins = useRef(new Map()); // id -> Overlay
  const handlers = useRef({});
  handlers.current = { onSelect, onPick };

  // Create the map once.
  useEffect(() => {
    const basemap = new VectorTileLayer({ declutter: true });
    loadBrandStyle()
      .then((style) => applyStyle(basemap, style, 'openmaptiles'))
      .then(() => basemap.getSource()?.setAttributions(ATTRIBUTION))
      .catch((e) => console.error('Basemap failed to load', e));

    const source = new VectorSource();
    const map = new OLMap({
      target: mapEl.current,
      layers: [basemap, new VectorLayer({ source, style: draftStyle })],
      view: new View({ center: fromLonLat([151.2093, -33.8688]), zoom: 12 }),
    });
    map.on('singleclick', (e) => {
      const pick = handlers.current.onPick;
      if (pick) {
        const [lng, lat] = toLonLat(e.coordinate);
        pick({ lng, lat });
      }
    });
    draftSource.current = source;
    mapRef.current = map;
    return () => map.setTarget(undefined);
  }, []);

  // Sync sticker pins (HTML overlays so they can carry shadows and hover states).
  useEffect(() => {
    const map = mapRef.current;
    pins.current.forEach((o) => map.removeOverlay(o));
    pins.current.clear();
    businesses.forEach((b) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'pin';
      el.setAttribute('aria-label', b.name);
      el.title = b.name;
      const img = document.createElement('img');
      img.src = stickerUrl(stickerFor(b));
      img.alt = '';
      el.append(img);
      el.addEventListener('click', () => handlers.current.onSelect(b.id));
      const overlay = new Overlay({ element: el, position: fromLonLat([b.lng, b.lat]), positioning: 'bottom-center' });
      map.addOverlay(overlay);
      pins.current.set(b.id, overlay);
    });
  }, [businesses]);

  useEffect(() => {
    pins.current.forEach((o, id) => o.getElement().classList.toggle('selected', id === selectedId));
  }, [selectedId, businesses]);

  // Fly to the selected business.
  useEffect(() => {
    const o = pins.current.get(selectedId);
    if (o) mapRef.current.getView().animate({ center: o.getPosition(), zoom: Math.max(15, mapRef.current.getView().getZoom()), duration: 400 });
  }, [selectedId]);

  useEffect(() => {
    const source = draftSource.current;
    source.clear();
    if (draft) source.addFeature(new Feature({ geometry: new Point(fromLonLat([draft.lng, draft.lat])) }));
  }, [draft]);

  return <div ref={mapEl} className={`map${onPick ? ' picking' : ''}`} />;
}
