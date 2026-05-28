import type { Farm } from "@/types";
import type { GpsCoordinate, GpsValidationStatus } from "@/types";

function haversineMeters(a: GpsCoordinate, b: GpsCoordinate): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinLat * sinLat +
          Math.cos((a.lat * Math.PI) / 180) *
            Math.cos((b.lat * Math.PI) / 180) *
            sinLng * sinLng
      )
    );
  return R * c;
}

// Ray-casting point-in-polygon for GeoJSON ring [lng, lat][]
function pointInPolygon(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Distance from point to nearest polygon vertex (approximation for boundary distance)
function minDistanceToPolygonVertices(lat: number, lng: number, ring: number[][]): number {
  let minDist = Infinity;
  for (const vertex of ring) {
    const d = haversineMeters({ lat, lng }, { lat: vertex[1], lng: vertex[0] });
    if (d < minDist) minDist = d;
  }
  return minDist;
}

export interface EvidenceValidationResult {
  status: GpsValidationStatus;
  distanceMeters?: number;
  message: string;
}

export function validateEvidenceGps(
  gps: GpsCoordinate | undefined,
  farm: Farm,
  maxDistanceMeters = 500
): EvidenceValidationResult {
  if (!gps || !isFinite(gps.lat) || !isFinite(gps.lng)) {
    return { status: "invalid_coordinates", message: "GPS coordinates are missing or invalid." };
  }

  const hasBoundary =
    (farm.boundary?.coordinates?.[0]?.length ?? 0) > 0;

  if (!hasBoundary) {
    // No boundary — use haversine from farm center point
    const dist = haversineMeters(gps, {
      lat: farm.coordinates.lat,
      lng: farm.coordinates.lng,
    });
    if (dist <= maxDistanceMeters) {
      return {
        status: "valid",
        distanceMeters: Math.round(dist),
        message: `Within ${Math.round(dist)}m of farm center. Validated.`,
      };
    }
    return {
      status: "outside_boundary",
      distanceMeters: Math.round(dist),
      message: `${Math.round(dist)}m from farm center (max ${maxDistanceMeters}m allowed).`,
    };
  }

  const ring = farm.boundary!.coordinates[0];
  const inside = pointInPolygon(gps.lat, gps.lng, ring);

  if (inside) {
    return { status: "valid", distanceMeters: 0, message: "GPS coordinate is within the farm boundary polygon." };
  }

  const dist = minDistanceToPolygonVertices(gps.lat, gps.lng, ring);

  // Allow a small buffer (50m) outside the polygon for GPS drift
  if (dist <= 50) {
    return {
      status: "valid",
      distanceMeters: Math.round(dist),
      message: `Within ${Math.round(dist)}m of boundary edge. Accepted with GPS drift allowance.`,
    };
  }

  return {
    status: "outside_boundary",
    distanceMeters: Math.round(dist),
    message: `GPS is ${Math.round(dist)}m outside the farm boundary polygon.`,
  };
}

export function formatGpsValidation(status: GpsValidationStatus): {
  label: string;
  color: string;
  bg: string;
} {
  const MAP = {
    valid: { label: "GPS Validated", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    outside_boundary: { label: "Outside Boundary", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    invalid_coordinates: { label: "Invalid GPS", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    no_boundary: { label: "No Boundary", color: "text-muted-foreground", bg: "bg-muted border-border" },
  };
  return MAP[status];
}
