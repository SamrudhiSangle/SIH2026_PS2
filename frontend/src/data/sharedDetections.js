/**
 * SONAROPS — Shared Anomaly & Survey Detection Data Model
 * 
 * Strict Truthfulness Rules:
 * 1. Default review state is "PENDING REVIEW" / "MODEL RESULT" (never claim verified without backend/operator confirmation).
 * 2. If navigation metadata does NOT exist: latitude & longitude are null.
 * 3. If navigation metadata exists: real geographic coordinates and CRS are populated.
 */

export const MASTER_DETECTIONS = [
  {
    id: "DET-01",
    code: "01",
    className: "SHIPWRECK",
    type: "Submerged Maritime Vessel",
    confidence: 94,
    status: "PENDING REVIEW",
    bbox: { x: 26, y: 32, w: 28, h: 22 },
    imagePosition: { x: 26, y: 32, display: "X: 26%, Y: 32%" },
    geoLat: 18.9169,
    geoLon: 72.8365,
    coordinateReference: "WGS 84 / UTM ZONE 43N",
    dimensions: "12.4 m × 4.8 m",
    acousticShadow: "18.4 m",
    shadowLength: "18.4 m",
    metadataSource: "Side-Scan Sonar (EdgeTech 4200)",
    acousticFeature: "High specular hull return with trailing acoustic shadow void",
    evidenceImage: "/assets/underwater_plate_final.jpg"
  },
  {
    id: "DET-02",
    code: "02",
    className: "PIPE / CYLINDER",
    type: "Industrial Subsea Conduit",
    confidence: 87,
    status: "PENDING REVIEW",
    bbox: { x: 62, y: 55, w: 22, h: 14 },
    imagePosition: { x: 62, y: 55, display: "X: 62%, Y: 55%" },
    geoLat: 18.9184,
    geoLon: 72.8392,
    coordinateReference: "WGS 84 / UTM ZONE 43N",
    dimensions: "4.8 m × 1.2 m",
    acousticShadow: "4.8 m",
    shadowLength: "4.8 m",
    metadataSource: "Side-Scan Sonar (EdgeTech 4200)",
    acousticFeature: "Continuous linear reflector with uniform trailing shadow",
    evidenceImage: "/assets/underwater_hero_plate.jpg"
  },
  {
    id: "DET-03",
    code: "03",
    className: "DEBRIS",
    type: "Concentrated Metallic Cluster",
    confidence: 76,
    status: "PENDING REVIEW",
    bbox: { x: 71, y: 22, w: 18, h: 16 },
    imagePosition: { x: 71, y: 22, display: "X: 71%, Y: 22%" },
    geoLat: 18.9152,
    geoLon: 72.8335,
    coordinateReference: "WGS 84 / UTM ZONE 43N",
    dimensions: "3.2 m × 2.6 m",
    acousticShadow: "2.1 m",
    shadowLength: "2.1 m",
    metadataSource: "Side-Scan Sonar (EdgeTech 4200)",
    acousticFeature: "Irregular cluster; requires operator cross-check against bed texture",
    evidenceImage: "/assets/underwater_blend_test.jpg"
  },
  {
    id: "DET-04",
    code: "04",
    className: "ENTANGLED NET",
    type: "Synthetic Polymer Hazard",
    confidence: 91,
    status: "PENDING REVIEW",
    bbox: { x: 18, y: 68, w: 24, h: 18 },
    imagePosition: { x: 18, y: 68, display: "X: 18%, Y: 68%" },
    geoLat: 18.9198,
    geoLon: 72.8420,
    coordinateReference: "WGS 84 / UTM ZONE 43N",
    dimensions: "18.2 m × 6.4 m",
    acousticShadow: "12.6 m",
    shadowLength: "12.6 m",
    metadataSource: "Side-Scan Sonar (EdgeTech 4200)",
    acousticFeature: "Diffuse filamentary web matrix with prominent snag shadow",
    evidenceImage: "/assets/underwater_base_clean.jpg"
  }
];

// Survey Trackline coordinates (populated only when survey navigation stream is present)
export const SURVEY_TRACK_LINE = [
  [18.9135, 72.8305],
  [18.9150, 72.8335],
  [18.9168, 72.8365],
  [18.9185, 72.8395],
  [18.9205, 72.8430],
  [18.9220, 72.8455]
];

// Sonar 150m Swath Corridor Footprint on Seabed
export const SURVEY_SWATH_POLYGON = [
  [18.9142, 72.8298],
  [18.9227, 72.8448],
  [18.9213, 72.8462],
  [18.9128, 72.8312]
];

/**
 * Returns detections formatted strictly according to whether navigation metadata exists
 * @param {boolean} hasMetadata 
 */
export function getFormattedDetections(hasMetadata = false) {
  return MASTER_DETECTIONS.map(item => ({
    id: item.id,
    code: item.code,
    class: item.className,
    className: item.className,
    type: item.type,
    confidence: item.confidence,
    bbox: item.bbox,
    imagePosition: item.imagePosition,
    latitude: hasMetadata ? item.geoLat : null,
    longitude: hasMetadata ? item.geoLon : null,
    coordinateReference: hasMetadata ? item.coordinateReference : "UNAVAILABLE",
    dimensions: item.dimensions,
    acousticShadow: item.acousticShadow,
    shadowLength: item.shadowLength,
    metadataSource: hasMetadata ? item.metadataSource : "Image-only sonar input",
    reviewStatus: item.status,
    status: item.status,
    acousticFeature: item.acousticFeature,
    evidenceImage: item.evidenceImage
  }));
}
