/**
 * SONAROPS — 05 ANOMALY REPORT DATA LAYER
 * 
 * Separates backend/model data schema from UI presentation.
 * Prepared for real-time ingestion from inference endpoints.
 * 
 * Strict Scientific & Cartographic Integrity:
 * - Image-space coordinates only (percentage offsets).
 * - Geolocation explicitly marked UNAVAILABLE / null for image-only inputs.
 * - No invented latitude/longitude coordinates or artificial dimensions.
 */

export const DEMO_REPORT_DETECTIONS = [
  {
    detection_id: "01",
    raw_id: "DET-01",
    classification: "SHIPWRECK",
    confidence: 0.94,
    confidence_display: "94%",
    source: "Side-Scan Sonar",
    image_position: {
      x_pct: 26,
      y_pct: 32,
      display: "X 26%, Y 32%",
      bbox: { x: 26, y: 32, w: 28, h: 22 }
    },
    geolocation: null,
    geolocation_status: "UNAVAILABLE",
    navigation_metadata: "NOT DETECTED",
    status: "REVIEW",
    evidence_image: "/assets/underwater_plate_final.jpg",
    acoustic_feature: "High specular hull return with trailing acoustic shadow void",
    analyst_notes: ""
  },
  {
    detection_id: "02",
    raw_id: "DET-02",
    classification: "PIPE / CYLINDER",
    confidence: 0.87,
    confidence_display: "87%",
    source: "Side-Scan Sonar",
    image_position: {
      x_pct: 54,
      y_pct: 41,
      display: "X 54%, Y 41%",
      bbox: { x: 54, y: 41, w: 22, h: 14 }
    },
    geolocation: null,
    geolocation_status: "UNAVAILABLE",
    navigation_metadata: "NOT DETECTED",
    status: "REVIEW",
    evidence_image: "/assets/underwater_hero_plate.jpg",
    acoustic_feature: "Continuous linear reflector with uniform acoustic shadow",
    analyst_notes: ""
  },
  {
    detection_id: "03",
    raw_id: "DET-03",
    classification: "DEBRIS",
    confidence: 0.76,
    confidence_display: "76%",
    source: "Side-Scan Sonar",
    image_position: {
      x_pct: 71,
      y_pct: 22,
      display: "X 71%, Y 22%",
      bbox: { x: 71, y: 22, w: 18, h: 16 }
    },
    geolocation: null,
    geolocation_status: "UNAVAILABLE",
    navigation_metadata: "NOT DETECTED",
    status: "REVIEW",
    evidence_image: "/assets/underwater_blend_test.jpg",
    acoustic_feature: "Irregular cluster; requires operator cross-check against bed texture",
    analyst_notes: ""
  },
  {
    detection_id: "04",
    raw_id: "DET-04",
    classification: "ENTANGLED NET",
    confidence: 0.91,
    confidence_display: "91%",
    source: "Side-Scan Sonar",
    image_position: {
      x_pct: 42,
      y_pct: 64,
      display: "X 42%, Y 64%",
      bbox: { x: 42, y: 64, w: 24, h: 18 }
    },
    geolocation: null,
    geolocation_status: "UNAVAILABLE",
    navigation_metadata: "NOT DETECTED",
    status: "REVIEW",
    evidence_image: "/assets/underwater_base_clean.jpg",
    acoustic_feature: "Diffuse filamentary acoustic reflection with snag hazard",
    analyst_notes: ""
  }
];

/**
 * Technical integrity checklist status
 */
export const REPORT_READINESS_SPEC = {
  detections: "AVAILABLE",
  classification: "AVAILABLE",
  confidence: "AVAILABLE",
  image_evidence: "AVAILABLE",
  geolocation: "UNAVAILABLE",
  status: "READY FOR REVIEW",
  verification_disclaimer: "Model detections require operator review. Not human-certified as ground truth."
};

/**
 * Computes summary statistics dynamically from any detection array
 */
export function computeReportSummary(detections = []) {
  const total = detections.length;
  // High confidence threshold: >= 85%
  const highConfidence = detections.filter(d => (d.confidence || 0) >= 0.85).length;
  const highPriority = detections.filter(d => d.priority === 'HIGH').length;
  const mediumPriority = detections.filter(d => d.priority === 'MEDIUM').length;
  const lowPriority = detections.filter(d => d.priority === 'LOW').length;
  // Requires review count: detections that specifically require review
  const requiresReview = detections.filter(d => 
    d.status === 'REQUIRES REVIEW' || d.status === 'PENDING REVIEW' || d.priority === 'HIGH'
  ).length;

  // Check if any detections possess validated coordinates
  const hasGeo = detections.some(d => (d.geolocation && d.geolocation.lat != null && d.geolocation.lon != null) || (d.latitude != null && d.longitude != null));
  const geolocation = hasGeo ? "AVAILABLE" : "UNAVAILABLE";

  return {
    totalDetections: total,
    highConfidence,
    highPriority,
    mediumPriority,
    lowPriority,
    requiresReview,
    geolocation
  };
}

/**
 * Formats structured JSON export payload adhering to guidelines
 */
export function buildJSONExportPayload(detections = [], globalNotes = "", surveyMeta = {}) {
  const summary = computeReportSummary(detections);
  const timestamp = new Date().toISOString();

  return {
    report_metadata: {
      system: "SONAROPS Marine Intelligence",
      dossier_type: "Acoustic Anomaly Assessment Report",
      stage: "05 — ANOMALY REPORT",
      generated_at: timestamp,
      source_input: surveyMeta?.name || "Side-Scan Sonar Swath Image (Image-Only)",
      input_type: "Raster Image Swath",
      geolocation_status: summary.geolocation === "AVAILABLE" ? "Available" : "Unavailable",
      geolocation_statement: summary.geolocation === "AVAILABLE" 
        ? "Survey anchor coordinates recorded from navigation telemetry. Image-space target localized."
        : "Image-only input. No navigation or GPS positioning stream provided. Geographic coordinates are unavailable.",
      workflow_stage_history: [
        "01 — SONAR INGEST (Complete)",
        "02 — SONAR QUALITY (Complete)",
        "03 — AI DETECTION (Complete)",
        "04 — GEOLOCATION / ACOUSTIC EVIDENCE (Complete)",
        "05 — ANOMALY REPORT (Final Output)"
      ]
    },
    summary: {
      total_detections: summary.totalDetections,
      high_priority: summary.highPriority,
      medium_priority: summary.mediumPriority,
      low_priority: summary.lowPriority,
      high_confidence_detections: summary.highConfidence,
      requires_review_count: summary.requiresReview,
      geolocation: summary.geolocation === "AVAILABLE" ? "Available" : "Unavailable"
    },
    report_readiness: {
      detections: REPORT_READINESS_SPEC.detections,
      classification: REPORT_READINESS_SPEC.classification,
      confidence: REPORT_READINESS_SPEC.confidence,
      image_evidence: REPORT_READINESS_SPEC.image_evidence,
      geolocation: summary.geolocation,
      status: REPORT_READINESS_SPEC.status,
      note: REPORT_READINESS_SPEC.verification_disclaimer
    },
    analyst_review: {
      notes: globalNotes || "No additional analyst commentary recorded.",
      reviewed_at: timestamp
    },
    detections: detections.map(item => {
      const isGeoAvailable = !!((item.geolocation && item.geolocation.lat != null) || (item.latitude != null));
      const latVal = item.geolocation?.lat ?? item.latitude;
      const lonVal = item.geolocation?.lon ?? item.longitude;
      return {
        detection_id: item.detection_id || item.id,
        classification: item.classification || item.className || item.class,
        confidence: item.confidence,
        confidence_formatted: `${Math.round((item.confidence > 1 ? item.confidence : item.confidence * 100))}%`,
        priority: item.priority || "LOW",
        priority_reason: item.priority_reason || "",
        review_status: item.review_status || item.status || "PENDING REVIEW",
        evidence_status: item.evidence_status || "AVAILABLE",
        model: item.model || "unknown",
        source: item.source || "Side-Scan Sonar",
        image_position: {
          x_pct: item.image_position?.x_pct ?? item.imagePosition?.x ?? item.box?.x ?? null,
          y_pct: item.image_position?.y_pct ?? item.imagePosition?.y ?? item.box?.y ?? null,
          width_pct: item.image_position?.bbox?.w ?? item.box?.w ?? null,
          height_pct: item.image_position?.bbox?.h ?? item.box?.h ?? null,
          coordinate_space: "swath_image_percentage"
        },
        geolocation_status: isGeoAvailable ? "Available" : "Unavailable",
        geographic_coordinates: isGeoAvailable ? {
          latitude: latVal,
          longitude: lonVal,
          crs: item.coordinateReference || item.geolocation?.crs || "EPSG:4326 (WGS 84)"
        } : null,
        bounding_box_image_space: item.box || item.image_position?.bbox || null,
        acoustic_feature_notes: item.acoustic_feature || item.acousticFeature || null,
        analyst_notes: item.analyst_notes || globalNotes || null
      };
    })
  };
}

/**
 * Formats CSV export payload
 */
export function buildCSVExportPayload(detections = [], globalNotes = "") {
  const headers = [
    "Detection ID",
    "Classification",
    "Model",
    "Priority",
    "Priority Reason",
    "Confidence",
    "Image Position",
    "Geolocation Status",
    "Latitude",
    "Longitude",
    "Review Status",
    "Evidence Status",
    "Acoustic Evidence Source",
    "Analyst Notes"
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = detections.map(d => {
    const isGeoAvailable = !!((d.geolocation && d.geolocation.lat != null) || (d.latitude != null));
    const latVal = d.geolocation?.lat ?? d.latitude;
    const lonVal = d.geolocation?.lon ?? d.longitude;
    return [
      escapeCSV(d.detection_id || d.id),
      escapeCSV(d.classification || d.className || d.class),
      escapeCSV(d.model || "unknown"),
      escapeCSV(d.priority || "LOW"),
      escapeCSV(d.priority_reason || ""),
      escapeCSV(`${Math.round((d.confidence > 1 ? d.confidence : d.confidence * 100))}%`),
      escapeCSV(d.image_position?.display || `X ${d.imagePosition?.x ?? d.box?.x ?? 0}%, Y ${d.imagePosition?.y ?? d.box?.y ?? 0}%`),
      escapeCSV(isGeoAvailable ? "Available" : "Unavailable"),
      escapeCSV(isGeoAvailable ? latVal : "Unavailable"),
      escapeCSV(isGeoAvailable ? lonVal : "Unavailable"),
      escapeCSV(d.review_status || d.status || "PENDING REVIEW"),
      escapeCSV(d.evidence_status || "AVAILABLE"),
      escapeCSV(d.source || "Side-Scan Sonar"),
      escapeCSV(d.analyst_notes || globalNotes || "")
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}
