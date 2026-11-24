export interface PlaceMatch {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    osm_id?: number;
    osm_value?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    district?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

const SKIPPED = new Set(["plaque", "memorial", "artwork", "fountain", "viewpoint", "tree", "peak"]);

const unique = (parts: Array<string | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const value = part?.trim();
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    result.push(value);
  }
  return result;
};

export function formatPlace(feature: PhotonFeature): PlaceMatch | null {
  const properties = feature.properties ?? {};
  if (properties.osm_value && SKIPPED.has(properties.osm_value)) return null;
  const coordinates = feature.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) return null;

  const street = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const title = properties.name?.trim() || street;
  if (!title) return null;

  const locality = unique([properties.district, properties.city, properties.state]);
  const subtitle = unique([street && street !== title ? street : undefined, ...locality, properties.postcode]).join(", ");
  const label = unique([title, street !== title ? street : undefined, properties.city || properties.district, properties.postcode]).join(", ");

  return {
    id: String(properties.osm_id ?? label),
    title,
    subtitle,
    label,
    address: unique([title, street, ...locality, properties.postcode, properties.country]).join(", "),
    lat: coordinates[1],
    lng: coordinates[0],
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceMatch[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    q: trimmed,
    limit: "6",
    lang: "en",
    lat: "51.5074",
    lon: "-0.1278",
    bbox: "-8.74,49.84,1.96,60.9",
  });

  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return [];

  const body = (await response.json()) as { features?: PhotonFeature[] };
  const matches: PlaceMatch[] = [];
  const seen = new Set<string>();
  for (const feature of body.features ?? []) {
    const place = formatPlace(feature);
    if (!place || seen.has(place.label)) continue;
    seen.add(place.label);
    matches.push(place);
    if (matches.length === 5) break;
  }
  return matches;
}
