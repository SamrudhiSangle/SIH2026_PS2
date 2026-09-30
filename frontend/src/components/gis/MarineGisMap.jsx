import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Maximize2, Compass, Layers, Crosshair, MapPin } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { SURVEY_TRACK_LINE, SURVEY_SWATH_POLYGON } from '../../data/sharedDetections';

export default function MarineGisMap({
  detections = [],
  selectedId,
  onSelectDetection,
  surveyLocation = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const tracklineRef = useRef(null);
  const swathRef = useRef(null);
  const [cursorCoords, setCursorCoords] = useState(null);
  const [mapZoom, setMapZoom] = useState(15);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center near the survey area: ~18.9175° N, 72.8375° E
    const initialCenter = [18.9175, 72.8375];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    });

    // Dark Oceanographic / Nautical Basemap (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      opacity: 0.95
    }).addTo(map);

    // Sonar 150m Swath Corridor Footprint
    const swath = L.polygon(SURVEY_SWATH_POLYGON, {
      color: '#2dd4bf',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#2dd4bf',
      fillOpacity: 0.08
    }).addTo(map);
    swath.bindTooltip("Acoustic Swath Coverage (150m)", {
      direction: 'top',
      className: 'gis-swath-tooltip'
    });
    swathRef.current = swath;

    // Survey Vessel / Towfish Trackline
    const track = L.polyline(SURVEY_TRACK_LINE, {
      color: '#38bdf8',
      weight: 2,
      dashArray: '6, 6',
      opacity: 0.85
    }).addTo(map);
    track.bindTooltip("Survey Trackline (Towfish Transect)", {
      direction: 'top',
      className: 'gis-swath-tooltip'
    });
    tracklineRef.current = track;

    // Markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Cursor position tracker
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: e.latlng.lat.toFixed(5),
        lng: e.latlng.lng.toFixed(5)
      });
    });

    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Anomaly Markers on detections, survey location or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Render Survey Location marker if provided
    const surveyLat = surveyLocation?.latitude ?? surveyLocation?.lat;
    const surveyLon = surveyLocation?.longitude ?? surveyLocation?.lon ?? surveyLocation?.lng;
    
    if (surveyLat != null && surveyLon != null) {
      const surveyIconHtml = `
        <div class="gis-marker-container verified" style="border-color: #38bdf8;">
          <div class="gis-marker-ring" style="border-color: #38bdf8;"></div>
          <div class="gis-marker-dot" style="background: #38bdf8;"></div>
          <div class="gis-marker-label" style="background: #040812; color: #38bdf8; border-color: #38bdf8;">SURVEY</div>
        </div>
      `;

      const surveyIcon = L.divIcon({
        html: surveyIconHtml,
        className: 'custom-gis-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const sMarker = L.marker([surveyLat, surveyLon], { icon: surveyIcon });
      sMarker.bindPopup(`
        <div class="gis-popup-content">
          <div class="gis-popup-header">
            <span class="gis-code">SURVEY POINT</span>
            <span class="gis-class">ACOUSTIC INGEST</span>
          </div>
          <div class="gis-popup-body">
            <div class="gis-row"><span class="gis-lbl">Latitude:</span><span class="gis-val font-mono">${Number(surveyLat).toFixed(4)}° N</span></div>
            <div class="gis-row"><span class="gis-lbl">Longitude:</span><span class="gis-val font-mono">${Number(surveyLon).toFixed(4)}° E</span></div>
            ${surveyLocation.depth != null ? `<div class="gis-row"><span class="gis-lbl">Depth:</span><span class="gis-val font-mono">${surveyLocation.depth} m</span></div>` : ''}
            ${surveyLocation.heading != null ? `<div class="gis-row"><span class="gis-lbl">Heading:</span><span class="gis-val font-mono">${surveyLocation.heading}°</span></div>` : ''}
          </div>
        </div>
      `, { className: 'nautical-leaflet-popup', offset: [0, -12] });

      markersGroup.addLayer(sMarker);
    }

    // 2. Render Anomaly Detection Markers
    detections.forEach((det) => {
      if (!det.latitude || !det.longitude) return;

      const isSelected = det.id === selectedId;
      const isPending = det.reviewStatus === 'PENDING REVIEW' || det.reviewStatus === 'REVIEW';

      // Custom nautical reticle marker icon
      const iconHtml = `
        <div class="gis-marker-container ${isSelected ? 'selected' : ''} ${isPending ? 'review' : 'verified'}">
          <div class="gis-marker-ring"></div>
          <div class="gis-marker-dot"></div>
          <div class="gis-marker-label">${det.code || det.id.replace('DET-', '')}</div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-gis-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([det.latitude, det.longitude], { icon: customIcon });

      // Custom Nautical Popup
      const popupHtml = `
        <div class="gis-popup-content">
          <div class="gis-popup-header">
            <span class="gis-code">${det.code || det.id}</span>
            <span class="gis-class">${det.class || det.className}</span>
          </div>
          <div class="gis-popup-body">
            <div class="gis-row">
              <span class="gis-lbl">Confidence:</span>
              <span class="gis-val text-cyan">${det.confidence}%</span>
            </div>
            <div class="gis-row">
              <span class="gis-lbl">Latitude:</span>
              <span class="gis-val font-mono">${Number(det.latitude).toFixed(4)}° N</span>
            </div>
            <div class="gis-row">
              <span class="gis-lbl">Longitude:</span>
              <span class="gis-val font-mono">${Number(det.longitude).toFixed(4)}° E</span>
            </div>
            <div class="gis-row">
              <span class="gis-lbl">Status:</span>
              <span class="gis-val ${isPending ? 'text-amber' : 'text-teal'}">${det.reviewStatus || 'MODEL RESULT'}</span>
            </div>
            <div class="gis-row">
              <span class="gis-lbl">Source:</span>
              <span class="gis-val">${det.metadataSource || 'Side-Scan Sonar'}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'nautical-leaflet-popup',
        offset: [0, -12]
      });

      marker.on('click', () => {
        soundFx.playTargetLock();
        if (onSelectDetection) {
          onSelectDetection(det.id);
        }
      });

      markersGroup.addLayer(marker);

      // Open popup if selected
      if (isSelected) {
        marker.openPopup();
      }
    });

    // 3. Center map on survey location
    if (surveyLat != null && surveyLon != null) {
      map.setView([surveyLat, surveyLon], 15);
    }
  }, [detections, selectedId, onSelectDetection, surveyLocation]);

  // Smoothly center and fly to active detection if selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const active = detections.find(d => d.id === selectedId);
    if (active && active.latitude && active.longitude) {
      map.flyTo([active.latitude, active.longitude], Math.max(map.getZoom(), 15), {
        duration: 0.8
      });
    }
  }, [selectedId, detections]);

  // Zoom Handlers
  const handleZoomIn = () => {
    soundFx.playSonarPing(1300, 0.2);
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    soundFx.playSonarPing(1100, 0.2);
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetBounds = () => {
    soundFx.playSonarPing(1200, 0.2);
    if (mapInstanceRef.current && swathRef.current) {
      mapInstanceRef.current.fitBounds(swathRef.current.getBounds(), { padding: [30, 30] });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] bg-[#030712] overflow-hidden select-none border border-[#162234] rounded-sm">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Left: GIS Instrument Metadata & Datum */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col space-y-1">
        <div className="bg-[#040812]/90 border border-[#1a2638] px-2.5 py-1 rounded-sm text-[10px] font-mono text-[#8ea4bf] backdrop-blur-sm flex items-center space-x-2 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-semibold text-on-surface">GIS SURVEY VIEW</span>
          <span className="text-[#33465e]">|</span>
          <span>WGS 84 (EPSG:4326)</span>
        </div>
        <div className="bg-[#040812]/85 border border-[#1a2638] px-2 py-0.5 rounded-sm text-[9px] font-mono text-[#8ea4bf] backdrop-blur-sm w-fit">
          {surveyLocation && (surveyLocation.latitude != null || surveyLocation.lat != null) ? (
            <span>
              TRANSECT ANCHOR: {Number(surveyLocation.latitude ?? surveyLocation.lat).toFixed(4)}° N, {Number(surveyLocation.longitude ?? surveyLocation.lon ?? surveyLocation.lng).toFixed(4)}° E
              {surveyLocation.depth != null ? ` · DEPTH: ${surveyLocation.depth}m` : ''}
              {surveyLocation.heading != null ? ` · HDG: ${surveyLocation.heading}°` : ''}
            </span>
          ) : (
            <span className="text-[#64748b]">SURVEY GEOSPATIAL TRANSECT</span>
          )}
        </div>
      </div>

      {/* Top Right: Zoom & Reset Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col space-y-1">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-7 h-7 flex items-center justify-center bg-[#070d18]/90 hover:bg-[#0e1726] border border-[#1a2638] hover:border-primary/50 text-[#cbd5e1] rounded-sm transition-colors cursor-pointer shadow-md"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-7 h-7 flex items-center justify-center bg-[#070d18]/90 hover:bg-[#0e1726] border border-[#1a2638] hover:border-primary/50 text-[#cbd5e1] rounded-sm transition-colors cursor-pointer shadow-md"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetBounds}
          title="Fit Survey Swath"
          className="w-7 h-7 flex items-center justify-center bg-[#070d18]/90 hover:bg-[#0e1726] border border-[#1a2638] hover:border-primary/50 text-[#cbd5e1] rounded-sm transition-colors cursor-pointer shadow-md"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Left: Layer Legend */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none bg-[#040812]/90 border border-[#1a2638] px-2.5 py-1.5 rounded-sm text-[9px] font-mono text-[#8ea4bf] backdrop-blur-sm space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-0.5 bg-[#38bdf8] inline-block border-b border-dashed border-[#38bdf8]"></span>
          <span>Survey Trackline</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-2 bg-[#2dd4bf]/20 border border-[#2dd4bf] border-dashed inline-block"></span>
          <span>Acoustic Swath (150m)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full border border-primary bg-primary/40 inline-block"></span>
          <span>Acoustic Anomaly ({detections.length})</span>
        </div>
      </div>

      {/* Bottom Right: Live Cursor Readout */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none bg-[#040812]/90 border border-[#1a2638] px-2.5 py-1 rounded-sm text-[10px] font-mono text-[#8ea4bf] backdrop-blur-sm">
        {cursorCoords ? (
          <span>LAT: {cursorCoords.lat}° N &nbsp;|&nbsp; LON: {cursorCoords.lng}° E</span>
        ) : (
          <span>CURSOR: MOVING OVER MAP</span>
        )}
      </div>
    </div>
  );
}
