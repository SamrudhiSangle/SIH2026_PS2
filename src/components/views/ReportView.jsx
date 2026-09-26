import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { MISSION_METADATA } from '../../data/mockData';

export default function ReportView({ 
  anomalies, 
  onSelectAnomaly, 
  onNavigate 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [downloadToast, setDownloadToast] = useState(null);

  // Filter logic
  const filteredAnomalies = anomalies.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.shortClass.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'REVIEW' && item.status === 'REQUIRES REVIEW') ||
                          (statusFilter === 'HAZARD' && item.riskLevel.includes('HIGH')) ||
                          (statusFilter === 'CONFIRMED' && item.status === 'CONFIRMED');
    return matchesSearch && matchesStatus;
  });

  // Export GeoJSON file
  const handleExportGeoJSON = () => {
    soundFx.playTargetLock();
    const geojsonData = {
      type: "FeatureCollection",
      name: "SONAROPS_Transect_07_Anomalies",
      crs: {
        type: "name",
        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
      },
      features: anomalies.map(a => ({
        type: "Feature",
        properties: {
          id: a.id,
          name: a.name,
          classification: a.shortClass,
          depth_m: a.depth,
          confidence_pct: a.confidence,
          risk_level: a.riskLevel,
          status: a.status,
          substrate: a.substrate,
          sonar_freq: a.sonarFreq,
          timestamp: a.detectedAt
        },
        geometry: {
          type: "Point",
          coordinates: [a.lon, a.lat, -a.depth]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SONAROPS_Transect_07_${new Date().toISOString().slice(0, 10)}.geojson`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadToast("Generated official GeoJSON Cartographic Package.");
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Export CSV file
  const handleExportCSV = () => {
    soundFx.playTargetLock();
    const headers = ["Target ID", "Name", "Classification", "Latitude", "Longitude", "Depth (m)", "Relief (m)", "Confidence (%)", "Risk Level", "Status", "Substrate"];
    const rows = anomalies.map(a => [
      a.id,
      `"${a.name}"`,
      `"${a.shortClass}"`,
      a.lat,
      a.lon,
      a.depth,
      a.relief,
      a.confidence,
      `"${a.riskLevel}"`,
      `"${a.status}"`,
      `"${a.substrate}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SONAROPS_Transect_07_Registry_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadToast("Generated Hydrographic CSV Dataset.");
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Trigger Print / PDF report
  const handlePrint = () => {
    soundFx.playSonarPing(1400, 0.6);
    window.print();
  };

  return (
    <section className="relative w-full h-[calc(100vh-3.5rem)] p-4 md:p-8 flex flex-col justify-between overflow-y-auto select-none bg-[#060a10]">
      {/* Toast Alert */}
      {downloadToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-panel px-4 py-2 rounded text-xs font-mono text-primary flex items-center space-x-2 shadow-2xl border-primary/50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-secondary" />
          <span>{downloadToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header & Debrief Actions */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-outline-variant/30 gap-4">
          <div>
            <div className="flex items-center space-x-2 font-mono text-primary text-xs uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              <span>MISSION DEBRIEF &amp; CARTOGRAPHIC REGISTRY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-headline text-on-surface mt-1 font-normal">
              {MISSION_METADATA.campaign}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Platform: <strong className="text-on-surface font-mono">{MISSION_METADATA.vessel}</strong> · Multi-Beam Multichannel Campaign · October 2026
            </p>
          </div>

          {/* Export suite action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <button
              onClick={handleExportGeoJSON}
              className="glass-panel hover:bg-surface-container hover:border-primary/50 text-on-surface px-3 py-2 rounded flex items-center space-x-2 transition-all active:scale-95 shadow-md"
              title="Download GIS GeoJSON"
            >
              <Download className="w-4 h-4 text-primary" />
              <span>EXPORT GEOJSON</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="glass-panel hover:bg-surface-container hover:border-secondary/50 text-on-surface px-3 py-2 rounded flex items-center space-x-2 transition-all active:scale-95 shadow-md"
              title="Download CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-secondary" />
              <span>EXPORT CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-surface-container-low border border-primary-container/60 hover:border-primary-container hover:bg-surface-container text-on-surface px-4 py-2 rounded flex items-center space-x-2 transition-all active:scale-95 shadow-[0_16px_36px_-12px_rgba(4,7,13,0.65)]"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span className="font-semibold">PRINT / PDF REPORT</span>
            </button>
          </div>
        </div>

        {/* Mission KPI Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded shadow-lg">
            <span className="font-mono text-on-surface-variant text-[11px] block uppercase tracking-wider">
              TOTAL SURVEYED ANOMALIES
            </span>
            <div className="text-2xl font-headline text-on-surface mt-1 font-semibold">
              {anomalies.length} Targets
            </div>
            <span className="font-mono text-primary text-[10px] mt-1 block">
              Across 142.8 km² swath coverage
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded shadow-lg">
            <span className="font-mono text-on-surface-variant text-[11px] block uppercase tracking-wider">
              OPERATOR ATTENTION
            </span>
            <div className="text-2xl font-headline text-secondary-fixed-dim mt-1 font-semibold">
              {anomalies.filter(a => a.status === 'REQUIRES REVIEW').length} Requiring Review
            </div>
            <span className="font-mono text-secondary text-[10px] mt-1 block">
              ConvNet classification flags &gt; 85%
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded shadow-lg">
            <span className="font-mono text-on-surface-variant text-[11px] block uppercase tracking-wider">
              NAVIGATIONAL HAZARDS
            </span>
            <div className="text-2xl font-headline text-primary mt-1 font-semibold">
              {anomalies.filter(a => a.riskLevel.includes('HIGH')).length} High Priority
            </div>
            <span className="font-mono text-on-surface-variant text-[10px] mt-1 block">
              Acoustic seabed relief &gt; 1.0 meter
            </span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded shadow-lg">
            <span className="font-mono text-on-surface-variant text-[11px] block uppercase tracking-wider">
              BATHYMETRIC DATUM
            </span>
            <div className="text-lg font-headline text-on-surface mt-1 font-medium truncate">
              WGS 84 / UTM 40N
            </div>
            <span className="font-mono text-secondary text-[10px] mt-1 block">
              Mean Depth: 218.4m
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Target ID, classification, or substrate..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded pl-9 pr-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-1.5 bg-surface-container-low p-1 rounded border border-outline-variant/30">
            {['ALL', 'REVIEW', 'HAZARD', 'CONFIRMED'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => {
                  soundFx.playSonarPing(900, 0.2);
                  setStatusFilter(filterKey);
                }}
                className={`px-3 py-1 rounded transition-colors text-[11px] ${
                  statusFilter === filterKey
                    ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        {/* Precision Ledger Table (Minimalist Rule-Divided Museum Style) */}
        <div className="border border-outline-variant/30 rounded bg-surface-container-low/40 overflow-hidden shadow-2xl">
          <div className="p-3 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center font-mono">
            <span className="text-on-surface font-semibold text-xs tracking-wider">
              BATHYMETRIC ANOMALY REGISTRY TABLE ({filteredAnomalies.length} RECORDS)
            </span>
            <span className="text-on-surface-variant text-[11px]">
              HYDROGRAPHIC STANDARDS S-44 / IHO
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#05080e]/90 text-on-surface-variant border-b border-outline-variant/30">
                <tr>
                  <th className="p-3">TARGET ID</th>
                  <th className="p-3">CLASSIFICATION</th>
                  <th className="p-3">SOUNDING DEPTH</th>
                  <th className="p-3">GEOLOCATION</th>
                  <th className="p-3">AI MATCH</th>
                  <th className="p-3">RISK SCORE</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredAnomalies.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      soundFx.playTargetLock();
                      onSelectAnomaly(item.id);
                      onNavigate('view-detections');
                    }}
                    className="hover:bg-surface-container-low/80 transition-colors cursor-pointer group"
                  >
                    <td className="p-3 text-primary font-bold">{item.id}</td>
                    <td className="p-3 text-on-surface">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{item.substrate}</div>
                    </td>
                    <td className="p-3 text-on-surface font-mono">{item.depth} m</td>
                    <td className="p-3 text-on-surface-variant font-mono">
                      {item.lat}° N, {item.lon}° E
                    </td>
                    <td className="p-3 text-primary font-semibold">{item.confidence}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.riskLevel.includes('HIGH') 
                          ? 'bg-error-container/20 text-error border border-error/40' 
                          : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        item.status === 'CONFIRMED'
                          ? 'bg-secondary/20 text-secondary border border-secondary/40'
                          : item.status === 'REQUIRES REVIEW'
                          ? 'bg-secondary-container/20 text-secondary border border-secondary-container/40'
                          : 'bg-surface-container text-on-surface-variant border border-outline-variant/40'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-primary group-hover:underline text-[11px] inline-flex items-center space-x-1">
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FOOTER (Exact Match from DESIGN.md and Shared Components JSON) */}
      <footer className="border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center w-full px-4 sm:px-8 py-5 font-mono text-xs text-on-surface-variant mt-10 gap-3">
        <div>
          © 2025 SONAROPS Marine Intelligence. Archival Bathymetric Cartography.
        </div>
        <div className="flex flex-wrap items-center space-x-6">
          <button onClick={() => alert("Coordinate Datum: WGS 84 / UTM Zone 40N")} className="hover:text-primary transition-colors">
            Coordinate Datum
          </button>
          <button onClick={() => alert("Ephemeris Index: UTC 11:42:09Z · Solar Noon: 12:14 UTC")} className="hover:text-primary transition-colors">
            Ephemeris Index
          </button>
          <button onClick={() => alert("Bathymetry Protocols: Multibeam Backscatter IHO S-44 Order 1a")} className="hover:text-primary transition-colors">
            Bathymetry Protocols
          </button>
          <button onClick={() => alert("Legal Registry: Hydrographic Survey Authority Licensed")} className="hover:text-primary transition-colors">
            Legal Registry
          </button>
        </div>
      </footer>
    </section>
  );
}
