import { useEffect, useRef } from 'react';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import 'ol/ol.css';

const pin = (radius, color) =>
  new Style({ image: new CircleStyle({ radius, fill: new Fill({ color }), stroke: new Stroke({ color: '#fff', width: 2 }) }) });
const styles = { base: pin(8, '#0f766e'), selected: pin(12, '#f2a900'), draft: pin(10, '#2563eb') };

export default function MapView({ businesses, selectedId, onSelect, draft, onPick }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const sourceRef = useRef(null);
  const handlers = useRef({});
  handlers.current = { onSelect, onPick };

  // Create the map once.
  useEffect(() => {
    const source = new VectorSource();
    const map = new OLMap({
      target: mapEl.current,
      layers: [
        new TileLayer({ source: new OSM() }), // keeps the required OpenStreetMap attribution
        new VectorLayer({ source, style: (f) => styles[f.get('kind')] }),
      ],
      view: new View({ center: fromLonLat([151.2093, -33.8688]), zoom: 12 }),
    });
    map.on('singleclick', (e) => {
      const f = map.forEachFeatureAtPixel(e.pixel, (ft) => ft);
      const { onSelect: select, onPick: pick } = handlers.current;
      if (pick) {
        const [lng, lat] = toLonLat(e.coordinate);
        pick({ lng, lat });
      } else if (f && f.get('id')) select(f.get('id'));
    });
    map.on('pointermove', (e) => {
      map.getTargetElement().style.cursor = map.hasFeatureAtPixel(e.pixel) ? 'pointer' : '';
    });
    sourceRef.current = source;
    mapRef.current = map;
    return () => map.setTarget(undefined);
  }, []);

  // Sync markers.
  useEffect(() => {
    const source = sourceRef.current;
    source.clear();
    source.addFeatures(
      businesses.map(
        (b) =>
          new Feature({
            geometry: new Point(fromLonLat([b.lng, b.lat])),
            id: b.id,
            kind: b.id === selectedId ? 'selected' : 'base',
          })
      )
    );
    if (draft) source.addFeature(new Feature({ geometry: new Point(fromLonLat([draft.lng, draft.lat])), kind: 'draft' }));
  }, [businesses, selectedId, draft]);

  // Fly to the selected business.
  useEffect(() => {
    if (selectedId == null) return;
    const f = sourceRef.current.getFeatures().find((ft) => ft.get('id') === selectedId);
    if (f) mapRef.current.getView().animate({ center: f.getGeometry().getCoordinates(), zoom: 16, duration: 400 });
  }, [selectedId]);

  return <div ref={mapEl} className="map" />;
}
