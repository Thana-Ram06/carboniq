/**
 * Sentinel Hub Integration — VASUDHA Phase 2
 *
 * Provides authenticated access to Sentinel Hub Process API for real per-pixel
 * NDVI, NDWI, EVI, and SAVI for any GeoJSON farm polygon.
 *
 * Required environment variables (server-side only, no NEXT_PUBLIC_ prefix):
 *   SENTINEL_HUB_CLIENT_ID      — OAuth2 client ID from sentinel-hub.com
 *   SENTINEL_HUB_CLIENT_SECRET  — OAuth2 client secret
 *
 * When credentials are absent, all functions return null and the caller
 * falls back to src/lib/satellite/ndvi-engine.ts.
 *
 * Architecture: this module runs only in Next.js API routes (server-side).
 * Never import it from client components.
 */

import type { FarmBoundary } from "@/types";

const BASE_URL   = "https://services.sentinel-hub.com";
const TOKEN_URL  = `${BASE_URL}/auth/realms/main/protocol/openid-connect/token`;
const PROCESS_URL = `${BASE_URL}/api/v1/process`;

// ── Credential check ──────────────────────────────────────────────────────────

export function isSentinelHubConfigured(): boolean {
  return !!(
    process.env.SENTINEL_HUB_CLIENT_ID &&
    process.env.SENTINEL_HUB_CLIENT_SECRET
  );
}

// ── Token cache (in-memory, per Vercel function cold start) ───────────────────

let _cachedToken: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string | null> {
  if (_cachedToken && Date.now() < _tokenExpiry - 60_000) return _cachedToken;

  const clientId     = process.env.SENTINEL_HUB_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     clientId,
        client_secret: clientSecret,
      }),
    });
    if (!res.ok) return null;
    const { access_token, expires_in } = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    _cachedToken = access_token;
    _tokenExpiry = Date.now() + expires_in * 1000;
    return _cachedToken;
  } catch {
    return null;
  }
}

// ── Evalscripts ───────────────────────────────────────────────────────────────
// Returns mean band value across the polygon as JSON output.

const EVALSCRIPT_NDVI = `
//VERSION=3
function setup() {
  return { input:[{bands:["B04","B08","B11","B03"],units:"DN"}], output:{bands:4} };
}
function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04 + 1e-8);
  const ndwi = (s.B03 - s.B08) / (s.B03 + s.B08 + 1e-8);
  const evi  = 2.5 * (s.B08 - s.B04) / (s.B08 + 6*s.B04 - 7.5*s.B02 + 1 + 1e-8);
  const savi = 1.5 * (s.B08 - s.B04) / (s.B08 + s.B04 + 0.5 + 1e-8);
  return [ndvi, ndwi, evi, savi];
}
`.trim();

// ── Bounding box from polygon ─────────────────────────────────────────────────

function polygonBBox(boundary: FarmBoundary): [number, number, number, number] {
  const pts = boundary.coordinates[0];
  const lngs = pts.map(([lng]) => lng);
  const lats = pts.map(([, lat]) => lat);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface SentinelNDVIResult {
  ndvi: number;
  ndwi: number;
  evi: number;
  savi: number;
  cloudCoverage: number;
  source: "sentinel_hub";
  capturedAt: string;
}

export async function fetchNDVIFromSentinelHub(
  boundary: FarmBoundary,
  targetDate?: string
): Promise<SentinelNDVIResult | null> {
  if (!isSentinelHubConfigured()) return null;
  const token = await getAccessToken();
  if (!token) return null;

  // Use yesterday as default (avoid same-day cloud issues)
  const date = targetDate ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const bbox = polygonBBox(boundary);

  const body = {
    input: {
      bounds: {
        bbox,
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: { from: `${date}T00:00:00Z`, to: `${date}T23:59:59Z` },
            maxCloudCoverage: 80,
            mosaickingOrder: "leastCC",
          },
        },
      ],
    },
    evalscript: EVALSCRIPT_NDVI,
    output: {
      width: 64,
      height: 64,
      responses: [{ identifier: "default", format: { type: "image/tiff" } }],
    },
  };

  try {
    const res = await fetch(
      `${PROCESS_URL}?request=GetMap&service=WMS&version=1.3.0`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...body,
          output: { responses: [{ identifier: "default", format: { type: "application/json" } }] },
        }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { bands?: number[][] };
    // Parse mean of each band across returned pixels
    const flat = data.bands ?? [];
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    return {
      ndvi: parseFloat(mean(flat[0] ?? []).toFixed(4)),
      ndwi: parseFloat(mean(flat[1] ?? []).toFixed(4)),
      evi:  parseFloat(mean(flat[2] ?? []).toFixed(4)),
      savi: parseFloat(mean(flat[3] ?? []).toFixed(4)),
      cloudCoverage: 0,
      source: "sentinel_hub",
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ── WMS Tile URL builder (for Leaflet tile layer) ─────────────────────────────

export function buildSentinelWMSTileUrl(
  evalscript: string,
  token: string,
  instanceId: string
): string {
  const params = new URLSearchParams({
    service: "WMS",
    request: "GetMap",
    version: "1.3.0",
    layers: "custom_layer",
    crs: "CRS:84",
    format: "image/png",
    width: "512",
    height: "512",
    evalscript: btoa(evalscript),
    access_token: token,
  });
  return `${BASE_URL}/ogc/wms/${instanceId}?${params}`;
}
