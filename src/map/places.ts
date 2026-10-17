// Turns the free-text `location` on a node into a point on the map.
// The landscape sheet records locations mostly at country or region level,
// so each place is a representative point, ordered most specific first.

export interface Place {
  name: string;
  lngLat: [number, number];
}

const PLACES: Array<{ match: RegExp; name: string; lngLat: [number, number] }> = [
  // Cities and states
  { match: /berkeley/, name: 'Berkeley, CA', lngLat: [-122.27, 37.87] },
  { match: /mountain view/, name: 'Mountain View, CA', lngLat: [-122.08, 37.39] },
  { match: /sacramento/, name: 'Sacramento, CA', lngLat: [-121.49, 38.58] },
  { match: /california|\bca\b/, name: 'California', lngLat: [-119.6, 37.2] },
  { match: /colorado/, name: 'Colorado', lngLat: [-105.5, 39.0] },
  { match: /western us/, name: 'Western USA', lngLat: [-114.0, 41.5] },
  // Countries
  { match: /\busa?\b|united states|\bu\.s\.?\b/, name: 'United States', lngLat: [-98.5, 39.5] },
  { match: /canada/, name: 'Canada', lngLat: [-106.0, 56.0] },
  { match: /brazil/, name: 'Brazil', lngLat: [-51.9, -10.5] },
  { match: /chile/, name: 'Chile', lngLat: [-71.0, -35.7] },
  { match: /\buk\b|united kingdom|england/, name: 'United Kingdom', lngLat: [-2.0, 53.0] },
  { match: /germany/, name: 'Germany', lngLat: [10.4, 51.2] },
  { match: /spain/, name: 'Spain', lngLat: [-3.7, 40.2] },
  { match: /italy/, name: 'Italy', lngLat: [12.6, 42.8] },
  { match: /norway/, name: 'Norway', lngLat: [9.0, 61.0] },
  { match: /turkey|türkiye/, name: 'Türkiye', lngLat: [35.2, 39.0] },
  { match: /south africa/, name: 'South Africa', lngLat: [24.7, -29.0] },
  { match: /ghana/, name: 'Ghana', lngLat: [-1.0, 7.9] },
  { match: /austr?alia/, name: 'Australia', lngLat: [134.5, -25.7] },
  // Regions
  { match: /north america/, name: 'North America', lngLat: [-100.0, 45.0] },
  { match: /south america|latin america/, name: 'South America', lngLat: [-60.0, -15.0] },
  { match: /southern europe/, name: 'Southern Europe', lngLat: [5.0, 41.0] },
  { match: /\beu\b|europe/, name: 'Europe', lngLat: [9.0, 49.0] },
  { match: /west africa/, name: 'West Africa', lngLat: [-3.0, 11.0] },
  { match: /southern africa/, name: 'Southern Africa', lngLat: [25.0, -22.0] },
  { match: /africa/, name: 'Africa', lngLat: [20.0, 5.0] },
];

export const placeFor = (location: string | undefined): Place | null => {
  if (!location) return null;
  const text = location.toLowerCase();
  const hit = PLACES.find((p) => p.match.test(text));
  return hit ? { name: hit.name, lngLat: hit.lngLat } : null;
};

// Spread entities that share a place on a sunflower spiral so each stays clickable.
export const spread = ([lng, lat]: [number, number], index: number, spacing = 0.9): [number, number] => {
  if (index === 0) return [lng, lat];
  const angle = index * 2.39996; // golden angle
  const r = spacing * Math.sqrt(index);
  return [lng + (r * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180), lat + r * Math.sin(angle)];
};
