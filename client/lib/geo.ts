export type LatLng = { lat: number; lng: number };

// Basic list of UK cities with approximate coordinates for distance calculations
// Source: public domain datasets (approximate)
export const cityCoords: Record<string, LatLng> = {
  london: { lat: 51.5074, lng: -0.1278 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  birmingham: { lat: 52.4862, lng: -1.8904 },
  leeds: { lat: 53.8008, lng: -1.5491 },
  glasgow: { lat: 55.8642, lng: -4.2518 },
  liverpool: { lat: 53.4084, lng: -2.9916 },
  bristol: { lat: 51.4545, lng: -2.5879 },
  sheffield: { lat: 53.3811, lng: -1.4701 },
  edinburgh: { lat: 55.9533, lng: -3.1883 },
  leicester: { lat: 52.6369, lng: -1.1398 },
  coventry: { lat: 52.4068, lng: -1.5197 },
  bradford: { lat: 53.7950, lng: -1.7594 },
  cardiff: { lat: 51.4816, lng: -3.1791 },
  belfast: { lat: 54.5973, lng: -5.9301 },
  nottingham: { lat: 52.9548, lng: -1.1581 },
  newcastle: { lat: 54.9783, lng: -1.6178 },
  brighton: { lat: 50.8225, lng: -0.1372 },
  southampton: { lat: 50.9097, lng: -1.4043 },
  portsmouth: { lat: 50.8198, lng: -1.0880 },
  cambridge: { lat: 52.2053, lng: 0.1218 },
  oxford: { lat: 51.7520, lng: -1.2577 },
  leedsbradford: { lat: 53.8293, lng: -1.7125 },
  westmidlands: { lat: 52.4862, lng: -1.8904 },
  surrey: { lat: 51.3148, lng: -0.5596 }
};

export function getCityCoord(name: string | null | undefined): LatLng | null {
  if (!name) return null;
  const q = name.trim().toLowerCase();
  if (!q) return null;
  if (cityCoords[q]) return cityCoords[q];
  // try partial/contains match
  const key = Object.keys(cityCoords).find(k => k === q || k.includes(q) || q.includes(k));
  return key ? cityCoords[key] : null;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function toRad(v: number) { return (v * Math.PI) / 180; }

export function formatDistance(km: number): { km: string; miles: string } {
  const miles = km * 0.621371;
  return { km: `${km.toFixed(0)} km`, miles: `${miles.toFixed(0)} miles` };
}
