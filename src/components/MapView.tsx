import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, MapLayerMouseEvent, MapMouseEvent } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Point, LineString } from 'geojson';
import countriesTopo from 'world-atlas/countries-110m.json';
import type { GraphNode, GraphEdge } from '../types/graph';
import { placeFor, spread } from '../map/places';

maplibregl.setWorkerUrl(workerUrl);

interface MapViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  highlightedPathNodeIds: string[];
  onSelectNode: (node: GraphNode | null) => void;
}

interface Located {
  node: GraphNode;
  place: string;
  lngLat: [number, number];
}

const endpointId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);

// Basemap ships with the app: no tile server, works offline and inside artifacts.
// Antarctica is dropped, and rings that cross the antimeridian are unwrapped so
// they don't smear horizontal bands across the map.
const unwrap = (ring: number[][]) => {
  const crosses = ring.some((pt, i) => i > 0 && Math.abs(pt[0] - ring[i - 1][0]) > 180);
  return crosses ? ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat]) : ring;
};
const countries: FeatureCollection = (() => {
  const topo = countriesTopo as unknown as Topology;
  const fc = feature(topo, topo.objects.countries as GeometryCollection) as FeatureCollection;
  return {
    type: 'FeatureCollection',
    features: fc.features
      .filter((f) => f.properties?.name !== 'Antarctica')
      .map((f) => {
        const g = f.geometry;
        if (g.type === 'Polygon') return { ...f, geometry: { ...g, coordinates: g.coordinates.map(unwrap) } };
        if (g.type === 'MultiPolygon') return { ...f, geometry: { ...g, coordinates: g.coordinates.map((poly) => poly.map(unwrap)) } };
        return f;
      }),
  };
})();

// Small places only get a label once zoomed in, so the US cluster stays readable
const LABEL_MIN_COUNT = 4;
const LABEL_ALL_ZOOM = 3.2;
const CITY_LABEL_ZOOM = 7.5;

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const MapView: React.FC<MapViewProps> = ({ nodes, edges, selectedNodeId, highlightedPathNodeIds, onSelectNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const framedRef = useRef(false);
  const onSelectRef = useRef(onSelectNode);
  const nodeByIdRef = useRef(new Map<string, GraphNode>());
  const [ready, setReady] = useState(false);
  const [linkNote, setLinkNote] = useState<{ shown: number; total: number } | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; label: string; place: string } | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelectNode;
  }, [onSelectNode]);

  // Place every entity that has a known location; entities sharing a place fan out
  const { located, unmapped, places } = useMemo(() => {
    const byPlace = new Map<string, Located[]>();
    const centers = new Map<string, [number, number]>();
    let missing = 0;
    for (const node of nodes) {
      // Exact coordinates from the source win; otherwise fall back to the country/region lookup
      const place = node.coordinates
        ? { name: node.location || 'Mapped location', lngLat: node.coordinates, exact: true }
        : placeFor(node.location);
      if (!place) {
        missing++;
        continue;
      }
      centers.set(place.name, place.lngLat);
      const group = byPlace.get(place.name) || [];
      group.push({ node, place: place.name, lngLat: spread(place.lngLat, group.length, 'exact' in place ? 0.035 : 0.9) });
      byPlace.set(place.name, group);
    }
    // Labels sit just above each place's cluster of dots
    const placeList = [...byPlace.entries()].map(([name, group]) => {
      const [lng, lat] = centers.get(name)!;
      const exact = group[0].node.coordinates !== undefined;
      const offset = exact ? 0.035 * Math.sqrt(group.length - 1) + 0.03 : 0.9 * Math.sqrt(group.length - 1) + 0.8;
      return { name, count: group.length, exact, lngLat: [lng, lat + offset] as [number, number] };
    });
    return { located: [...byPlace.values()].flat(), unmapped: missing, places: placeList };
  }, [nodes]);

  const byId = useMemo(() => new Map(located.map((l) => [l.node.id, l])), [located]);
  useEffect(() => {
    nodeByIdRef.current = new Map(located.map((l) => [l.node.id, l.node]));
  }, [located]);

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    edges.forEach((e) => {
      const s = endpointId(e.source);
      const t = endpointId(e.target);
      d.set(s, (d.get(s) || 0) + 1);
      d.set(t, (d.get(t) || 0) + 1);
    });
    return d;
  }, [edges]);

  // Create the map once
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: { countries: { type: 'geojson', data: countries } },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': cssVar('--bg-canvas') || '#07090e' } },
          { id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#111827' } },
          { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': 'rgba(148, 163, 184, 0.18)', 'line-width': 0.6 } },
        ],
      },
      center: [-20, 25],
      zoom: 1.3,
      minZoom: 0.8,
      maxZoom: 12,
      renderWorldCopies: false,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Natural Earth' }), 'bottom-right');
    const syncLabels = () => {
      containerRef.current?.classList.toggle('map-zoomed', map.getZoom() >= LABEL_ALL_ZOOM);
      containerRef.current?.classList.toggle('map-zoomed-city', map.getZoom() >= CITY_LABEL_ZOOM);
    };
    map.on('zoom', syncLabels);
    map.on('movestart', () => setHover(null));

    map.on('load', () => {
      map.addSource('links', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addSource('entities', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, promoteId: 'id' });
      map.addLayer({
        id: 'links',
        type: 'line',
        source: 'links',
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': cssVar('--color-cwi-gold') || '#f6ba13', 'line-width': 1.6, 'line-opacity': 0.75 },
      });
      map.addLayer({
        id: 'entities',
        type: 'circle',
        source: 'entities',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, ['get', 'r'], 6, ['*', ['get', 'r'], 2.2]],
          'circle-opacity': ['case', ['get', 'dim'], 0.25, 0.95],
          'circle-stroke-color': ['case', ['get', 'selected'], '#ffffff', '#07090e'],
          'circle-stroke-width': ['case', ['get', 'selected'], 2.5, 1],
        },
      });

      map.on('click', 'entities', (e: MapLayerMouseEvent) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        const hit = id ? nodeByIdRef.current.get(id) : undefined;
        if (hit) onSelectRef.current(hit);
        setHover(null);
      });
      map.on('click', (e: MapMouseEvent) => {
        if (!map.queryRenderedFeatures(e.point, { layers: ['entities'] }).length) onSelectRef.current(null);
      });
      map.on('mousemove', 'entities', (e: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer';
        const p = e.features?.[0]?.properties;
        if (p) setHover({ x: e.point.x, y: e.point.y, label: p.label, place: p.place });
      });
      map.on('mouseleave', 'entities', () => {
        map.getCanvas().style.cursor = '';
        setHover(null);
      });
      setReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Entity dots
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const focus = new Set(highlightedPathNodeIds);
    const data: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: located.map(({ node, place, lngLat }) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: lngLat },
        properties: {
          id: node.id,
          label: node.label,
          place,
          color: cssVar(`--color-${node.type}`) || '#8fa3bf',
          r: 3 + Math.min(5, Math.sqrt(degree.get(node.id) || 0)),
          selected: node.id === selectedNodeId,
          dim: focus.size > 0 && !focus.has(node.id),
        },
      })),
    };
    (map.getSource('entities') as GeoJSONSource).setData(data);

    // Frame everything that's mapped the first time there is data
    if (!framedRef.current && located.length > 0) {
      framedRef.current = true;
      // Frame the bulk of the points (most of the points) so one far-off partner doesn't zoom the map out
      const pct = (vals: number[], q: number) => vals.sort((a, b) => a - b)[Math.floor(q * (vals.length - 1))];
      const lngs = located.map((l) => l.lngLat[0]);
      const lats = located.map((l) => l.lngLat[1]);
      const bounds = new maplibregl.LngLatBounds([pct(lngs, 0.02), pct(lats, 0.05)], [pct(lngs, 0.88), pct(lats, 0.95)]);
      map.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 60, right: 60 }, maxZoom: 6, duration: 0 });
    }
  }, [ready, located, degree, selectedNodeId, highlightedPathNodeIds]);

  // Connections of the selected entity (or the highlighted path) between mapped places
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const focus = new Set(highlightedPathNodeIds);
    const relevant = edges.filter((e) => {
      const s = endpointId(e.source);
      const t = endpointId(e.target);
      if (selectedNodeId) return s === selectedNodeId || t === selectedNodeId;
      return focus.size > 0 && focus.has(s) && focus.has(t);
    });
    const data: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: relevant.flatMap((e) => {
        const a = byId.get(endpointId(e.source));
        const b = byId.get(endpointId(e.target));
        if (!a || !b || a === b) return [];
        return [{ type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: [a.lngLat, b.lngLat] }, properties: {} }];
      }),
    };
    (map.getSource('links') as GeoJSONSource).setData(data);

    const sel = selectedNodeId ? byId.get(selectedNodeId) : undefined;
    // Keep the selection clear of the dossier drawer on the right
    if (sel) map.easeTo({ center: sel.lngLat, zoom: Math.max(map.getZoom(), 2.5), duration: 600, padding: { top: 0, bottom: 0, left: 0, right: 440 } });
    setLinkNote(selectedNodeId ? { shown: data.features.length, total: relevant.length } : null);
  }, [ready, edges, byId, selectedNodeId, highlightedPathNodeIds]);

  // Place labels (HTML markers, since the basemap carries no font glyphs)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = places.map(({ name, count, lngLat, exact }) => {
      const el = document.createElement('div');
      // City-level places crowd each other, so their labels wait for a closer zoom
      el.className = exact ? 'map-place-label map-place-city' : count >= LABEL_MIN_COUNT ? 'map-place-label' : 'map-place-label map-place-minor';
      el.textContent = `${name} · ${count}`;
      return new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -14] }).setLngLat(lngLat).addTo(map);
    });
  }, [places]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {hover && (
        <div
          style={{
            position: 'absolute',
            left: hover.x + 12,
            top: hover.y + 12,
            pointerEvents: 'none',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            zIndex: 20,
          }}
        >
          <div style={{ fontWeight: 600 }}>{hover.label}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{hover.place}</div>
        </div>
      )}
      <div
        className="canvas-caption"
        style={{ bottom: 16, left: 16, maxWidth: 'calc(100% - 120px)' }}
      >
        {linkNote
          ? `${linkNote.shown} of ${linkNote.total} connections shown · the rest go to topics, hubs or entities without a location`
          : `${located.length} entities on the map · ${unmapped} global or without a location`}
      </div>
    </div>
  );
};

export default MapView;
