import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Radio, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Waves, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Compass, 
  ChevronRight,
  Info
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { ARGO_FLOATS, AUV_GLIDER } from '../../data/mockData';

export default function WorkspaceView({ 
  anomalies, 
  selectedAnomalyId, 
  onSelectAnomaly, 
  onNavigate,
  onOpenDispersalModal,
  layerDrawerOpen,
  onToggleLayerDrawer
}) {
  // Layer Toggles
  const [layers, setLayers] = useState({
    bathymetry: true,
    temperature: true,
    salinity: false,
    currents: true,
    argoBuoys: true,
    gliderTracks: true,
    anomalies: true,
    predictionZones: true,
  });

  // Map Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Cursor Telemetry
  const [telemetry, setTelemetry] = useState({
    lat: "23.4120",
    lon: "068.2145",
    depth: "184.4",
    substrate: "CALCIFIED SILT / RIPARIAN SAND"
  });

  // Historical Timeline Replay State
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [replayYear, setReplayYear] = useState(2026);
  const [toastMessage, setToastMessage] = useState(null);

  const canvasRef = useRef(null);
  const selectedAnomaly = anomalies.find(a => a.id === selectedAnomalyId) || anomalies[0];

  // Replay timeline animation loop
  useEffect(() => {
    let interval;
    if (isPlayingReplay) {
      interval = setInterval(() => {
        setReplayYear(prev => {
          if (prev >= 2026) return 2020;
          return prev + 2;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlayingReplay]);

  // Show quick toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setPanOffset({
        x: panOffset.x + (e.clientX - dragStart.x) * 0.5,
        y: panOffset.y + (e.clientY - dragStart.y) * 0.5
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }

    const lat = (23.2 + (y / rect.height) * 0.35).toFixed(4);
    const lon = (68.0 + (x / rect.width) * 0.45).toFixed(4);
    const depth = (80 + ((x * 1.2 + y * 0.8) / (rect.width + rect.height)) * 280).toFixed(1);

    let sub = "CALCIFIED SILT";
    if (depth < 120) sub = "FINE RIPARIAN SAND";
    else if (depth > 250) sub = "DEEP CLAY / BASALTIC BED";

    setTelemetry({ lat, lon, depth, substrate: sub });
  };

  const toggleLayer = (layerKey) => {
    soundFx.playSonarPing(900, 0.2);
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const resetViewport = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    soundFx.playSonarPing(1100, 0.3);
  };

  return (
    <section className="relative w-full h-[calc(100vh-3.5rem)] flex overflow-hidden select-none bg-[#060a10]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 glass-panel px-4 py-2 rounded text-xs font-mono text-primary flex items-center space-x-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] border-primary/50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-secondary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* LEFT: Cartographic Layer Control HUD                     */}
      {/* ======================================================== */}
      <aside className={`relative z-30 h-full w-72 bg-[#080d17]/95 backdrop-blur-xl border-r border-outline-variant/30 flex flex-col justify-between p-4 flex-shrink-0 transition-transform duration-300 ${
        layerDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="overflow-y-auto pr-1">
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-on-surface font-semibold tracking-wider">CARTOGRAPHIC STACK</span>
            </div>
            <span className="font-mono text-[10px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded border border-secondary/30">
              {Object.values(layers).filter(Boolean).length} ACTIVE
            </span>
          </div>

          {/* Layer Toggles List */}
          <div className="space-y-1.5 font-mono text-xs">
            {/* Bathymetry */}
            <div 
              onClick={() => toggleLayer('bathymetry')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.bathymetry 
                  ? 'bg-surface-container-low border-primary/40 text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.bathymetry} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-outline text-primary focus:ring-0" 
                />
                <span className="font-medium">BATHYMETRY</span>
              </div>
              <span className="text-[10px] text-primary">0–4000m</span>
            </div>

            {/* SST Temperature */}
            <div 
              onClick={() => toggleLayer('temperature')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.temperature 
                  ? 'bg-surface-container-low border-secondary/40 text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.temperature} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-outline text-secondary focus:ring-0" 
                />
                <span className="font-medium">TEMPERATURE</span>
              </div>
              <span className="text-[10px] text-secondary">SST 19.4°C</span>
            </div>

            {/* Salinity */}
            <div 
              onClick={() => toggleLayer('salinity')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.salinity 
                  ? 'bg-surface-container-low border-primary/40 text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.salinity} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-outline text-primary focus:ring-0" 
                />
                <span>SALINITY</span>
              </div>
              <span className="text-[10px] text-on-surface-variant">35.2 PSU</span>
            </div>

            {/* Ocean Currents Flow */}
            <div 
              onClick={() => toggleLayer('currents')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.currents 
                  ? 'bg-surface-container-low border-primary/40 text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.currents} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-outline text-primary focus:ring-0" 
                />
                <span className="font-medium">CURRENTS VECTORS</span>
              </div>
              <span className="text-[10px] text-primary font-semibold">0.82 kt</span>
            </div>

            {/* Argo Buoys */}
            <div 
              onClick={() => toggleLayer('argoBuoys')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.argoBuoys 
                  ? 'bg-surface-container-low border-secondary/40 text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.argoBuoys} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-outline text-secondary focus:ring-0" 
                />
                <span>ARGO BUOYS</span>
              </div>
              <span className="text-[10px] text-secondary">3 Units</span>
            </div>

            {/* Glider Tracks */}
            <div 
              onClick={() => toggleLayer('gliderTracks')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.gliderTracks 
                  ? 'bg-surface-container-low border-primary/40 text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.gliderTracks} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-outline text-primary focus:ring-0" 
                />
                <span>AUV GLIDER TRACKS</span>
              </div>
              <span className="text-[10px] text-primary">AUV-04</span>
            </div>

            {/* Anomalies */}
            <div 
              onClick={() => toggleLayer('anomalies')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.anomalies 
                  ? 'bg-surface-container-low border-primary-container text-on-surface shadow-[0_0_10px_rgba(56,189,248,0.15)]' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.anomalies} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-primary-container text-primary-container focus:ring-0" 
                />
                <span className="text-primary font-semibold">ANOMALIES</span>
              </div>
              <span className="text-[10px] text-primary bg-primary-container/20 px-1.5 py-0.5 rounded font-bold">
                {anomalies.length} TARGETS
              </span>
            </div>

            {/* Prediction Zones */}
            <div 
              onClick={() => toggleLayer('predictionZones')}
              className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                layers.predictionZones 
                  ? 'bg-surface-container-low border-secondary/40 text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-outline-variant/20 text-on-surface-variant/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <input 
                  type="checkbox" 
                  checked={layers.predictionZones} 
                  onChange={() => {}}
                  className="rounded bg-transparent border-outline text-secondary focus:ring-0" 
                />
                <span>PREDICTION ZONES</span>
              </div>
              <span className="text-[10px] text-secondary">DISPERSAL</span>
            </div>
          </div>

          {/* Sound Velocity Profile Sparkline Widget */}
          <div className="mt-5 border border-outline-variant/30 bg-surface-container-lowest/70 p-3 rounded">
            <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant mb-2">
              <span className="font-semibold uppercase tracking-wider">SVP GRADIENT (0–500m)</span>
              <span className="text-primary">CTD CAST 07</span>
            </div>
            <div className="h-14 flex items-end justify-between space-x-1.5 px-1 bg-surface-container-lowest rounded py-1">
              <div className="w-2 bg-primary/30 h-12 rounded-t-sm" title="0m: 1530 m/s"></div>
              <div className="w-2 bg-primary/45 h-10 rounded-t-sm" title="50m: 1515 m/s"></div>
              <div className="w-2 bg-primary/60 h-8 rounded-t-sm" title="100m: 1495 m/s"></div>
              <div className="w-2 bg-primary/75 h-6 rounded-t-sm" title="150m: 1485 m/s"></div>
              <div className="w-2 bg-secondary/80 h-5 rounded-t-sm" title="200m: 1480 m/s"></div>
              <div className="w-2 bg-secondary h-7 rounded-t-sm" title="300m: 1488 m/s"></div>
              <div className="w-2 bg-secondary h-9 rounded-t-sm" title="500m: 1498 m/s"></div>
            </div>
            <div className="flex justify-between font-mono text-[9px] text-on-surface-variant/70 mt-1">
              <span>0m</span>
              <span>200m (MIN)</span>
              <span>500m</span>
            </div>
          </div>
        </div>

        {/* Coordinates HUD at bottom */}
        <div className="border-t border-outline-variant/30 pt-3 font-mono text-[10px] text-on-surface-variant space-y-1">
          <div className="flex justify-between">
            <span>GRID DATUM:</span>
            <span className="text-on-surface">UTM 40N / WGS84</span>
          </div>
          <div className="flex justify-between">
            <span>CHART SCALE:</span>
            <span className="text-on-surface">1 : 25,000</span>
          </div>
          <div className="flex justify-between">
            <span>TELEMETRY:</span>
            <span className="text-secondary font-medium">LIVE AUV STREAM</span>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* CENTER: Interactive Hydrographic Map Viewport Canvas     */}
      {/* ======================================================== */}
      <div 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX, y: e.clientY });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        className="relative flex-1 h-full overflow-hidden bg-[#060a10] cursor-crosshair"
      >
        {/* Transform container for pan/zoom */}
        <div 
          className="w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Main Map SVG Topology Canvas */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="oceanCenterGrad" cx="55%" cy="45%" r="65%">
                <stop offset="0%" stopColor="#111d30" />
                <stop offset="45%" stopColor="#0a121f" />
                <stop offset="100%" stopColor="#060a10" />
              </radialGradient>
              <pattern id="bathymetryGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.04)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Depth Backdrop */}
            <rect width="100%" height="100%" fill="url(#oceanCenterGrad)" />
            <rect width="100%" height="100%" fill="url(#bathymetryGridPattern)" />

            {/* Bathymetry Contours Layer */}
            {layers.bathymetry && (
              <g fill="none" stroke="rgba(142, 213, 255, 0.18)" strokeWidth="1.2">
                <path d="M 80,60 C 240,160 340,320 480,390 S 780,510 940,430 S 1220,580 1600,520" />
                <path d="M 120,110 C 280,210 390,340 520,420 S 820,530 980,470 S 1250,610 1650,560" stroke="rgba(79, 219, 200, 0.25)" strokeWidth="1.5" />
                <path d="M 160,160 C 320,250 430,370 560,450 S 850,560 1020,500 S 1290,650 1700,600" />
                <path d="M 200,210 C 350,290 470,400 600,480 S 890,590 1060,540 S 1320,690 1750,640" stroke="rgba(142, 213, 255, 0.12)" />
                <path d="M 240,260 C 380,330 510,430 640,510 S 930,620 1100,580 S 1360,730 1800,680" stroke="rgba(79, 219, 200, 0.15)" />
              </g>
            )}

            {/* Current Flow Vectors */}
            {layers.currents && (
              <g fill="none" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.5">
                <path className="flow-line" d="M 200,540 C 440,490 720,620 1050,550 S 1420,440 1750,510" />
                <path className="flow-line" style={{ animationDelay: '-2.5s' }} d="M 160,680 C 410,640 760,740 1120,670 S 1490,590 1850,630" />
                <path className="flow-line" style={{ animationDelay: '-4s' }} d="M 240,380 C 510,320 820,460 1190,390 S 1540,310 1900,380" />
              </g>
            )}

            {/* AUV Glider Track Line */}
            {layers.gliderTracks && (
              <g>
                <polyline 
                  fill="none" 
                  points="260,260 410,330 600,390 720,360 890,460" 
                  stroke="#4fdbc8" 
                  strokeWidth="1.8" 
                  strokeDasharray="4 4" 
                  opacity="0.85" 
                />
                <circle cx="890" cy="460" r="6" fill="#4fdbc8" className="animate-pulse" />
                <circle cx="890" cy="460" r="14" fill="none" stroke="#4fdbc8" strokeWidth="1" opacity="0.4" />
                <text fill="#4fdbc8" fontFamily="'JetBrains Mono', monospace" fontSize="10" x="904" y="464" fontWeight="600">
                  AUV GLIDER 04 [DEPTH 184m · 3.8 kts]
                </text>
              </g>
            )}

            {/* Argo Floats Coordinates */}
            {layers.argoBuoys && ARGO_FLOATS.map(float => (
              <g key={float.id} className="cursor-pointer">
                <circle cx={float.lon > 68.2 ? 1150 : 460} cy={float.lat > 23.4 ? 210 : 310} r="5" fill="#8ed5ff" />
                <circle cx={float.lon > 68.2 ? 1150 : 460} cy={float.lat > 23.4 ? 210 : 310} r="12" fill="none" stroke="#8ed5ff" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                <text 
                  fill="#8ed5ff" 
                  fontFamily="'JetBrains Mono', monospace" 
                  fontSize="10" 
                  x={(float.lon > 68.2 ? 1150 : 460) + 12} 
                  y={(float.lat > 23.4 ? 210 : 310) + 4}
                >
                  {float.id} ({float.status})
                </text>
              </g>
            ))}

            {/* Anomaly Dispersion Prediction Cone */}
            {layers.predictionZones && (
              <g>
                <polygon 
                  points="660,420 830,360 940,400 860,490" 
                  fill="rgba(56, 189, 248, 0.09)" 
                  stroke="rgba(56, 189, 248, 0.4)" 
                  strokeDasharray="3 3" 
                  strokeWidth="1.2" 
                />
                <text 
                  fill="rgba(56, 189, 248, 0.75)" 
                  fontFamily="'JetBrains Mono', monospace" 
                  fontSize="10" 
                  textAnchor="middle" 
                  x="790" 
                  y="425"
                >
                  DISPERSION ENVELOPE (72h DRIFT CONE)
                </text>
              </g>
            )}
          </svg>

          {/* Rotating Acoustic Sweep from central vessel position */}
          <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] pointer-events-none rounded-full">
            <div className="w-full h-full radar-sweep relative">
              <div 
                className="absolute top-0 right-1/2 w-1/2 h-1/2 origin-bottom-right" 
                style={{ background: 'conic-gradient(from 180deg at 100% 100%, rgba(56, 189, 248, 0.22) 0deg, transparent 55deg)' }}
              />
            </div>
          </div>

          {/* Interactive Georeferenced Anomaly Reticles */}
          {layers.anomalies && anomalies.map((item) => {
            const isSelected = item.id === selectedAnomalyId;
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playTargetLock();
                  onSelectAnomaly(item.id);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 transition-transform ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-110'
                }`}
                style={{ top: `${item.mapY}%`, left: `${item.mapX}%` }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Pulsing Sonar Ping */}
                  <span className={`w-10 h-10 rounded-full border absolute ${
                    isSelected ? 'border-primary-container sonar-ping shadow-[0_0_12px_#38bdf8]' : 'border-outline-variant opacity-60'
                  }`}></span>

                  {/* Core Reticle Badge */}
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-primary-container bg-primary/20 shadow-[0_0_14px_#38bdf8]' 
                      : 'border-outline bg-surface-container-low hover:border-primary'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      item.riskLevel.includes('HIGH') ? 'bg-primary-container' : 'bg-secondary'
                    }`}></span>
                  </span>

                  {/* Target Tag Label */}
                  <div className={`absolute top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-xl border backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-[#080d17]/95 border-primary-container text-primary shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                      : 'bg-[#080d17]/85 border-outline-variant/40 text-on-surface-variant group-hover:text-on-surface group-hover:border-outline'
                  }`}>
                    {item.id} · {item.shortClass} ({item.confidence}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Controls: Zoom & View Reset */}
        <div className="absolute top-4 right-4 z-20 flex flex-col space-y-1.5 glass-panel p-1 rounded font-mono text-xs shadow-xl">
          <button
            onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.25))}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetViewport}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
            title="Reset Map Center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Cartographic Scale Bar */}
        <div className="absolute top-4 left-4 z-20 glass-panel px-3 py-1.5 rounded font-mono text-on-surface-variant flex items-center space-x-3 text-xs shadow-lg">
          <div className="flex flex-col">
            <div className="w-24 h-1 border-b border-l border-r border-primary"></div>
            <span className="text-[9px] mt-0.5 text-primary text-center">500 METERS</span>
          </div>
          <span className="text-outline-variant">|</span>
          <span className="text-[10px]">SOUNDING: MULTIBEAM EM2040</span>
        </div>

        {/* Live Crosshair Coordinates Badge */}
        <div className="absolute bottom-14 left-4 z-20 glass-panel px-3 py-1.5 rounded font-mono text-xs text-on-surface-variant flex items-center space-x-3 pointer-events-none shadow-lg">
          <span>CURSOR: <strong className="text-on-surface font-normal">{telemetry.lat}°N {telemetry.lon}°E</strong></span>
          <span className="text-outline-variant">·</span>
          <span>DEPTH: <strong className="text-primary font-medium">{telemetry.depth} m</strong></span>
          <span className="text-outline-variant">·</span>
          <span>SUBSTRATE: <strong className="text-secondary font-medium">{telemetry.substrate}</strong></span>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM: Temporal Scrubber Bar & Replay Engine            */}
        {/* ======================================================== */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-[#080d17]/95 backdrop-blur-md border-t border-outline-variant/30 z-20 px-4 sm:px-6 flex items-center justify-between font-mono text-xs">
          {/* Replay Trigger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundFx.playSonarPing(isPlayingReplay ? 1000 : 1400, 0.4);
                setIsPlayingReplay(!isPlayingReplay);
              }}
              className={`w-7 h-7 rounded border flex items-center justify-center transition-colors ${
                isPlayingReplay 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_8px_#38bdf8]' 
                  : 'border-outline-variant text-on-surface hover:text-primary hover:border-primary'
              }`}
            >
              {isPlayingReplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-on-surface-variant">HISTORICAL REPLAY</span>
          </div>

          {/* Timeline Nodes Bar */}
          <div className="flex-1 max-w-xl mx-4 sm:mx-8 relative flex items-center">
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-container transition-all duration-300"
                style={{ width: `${((replayYear - 2020) / 6) * 100}%` }}
              />
            </div>
            {/* Year Nodes */}
            <div className="absolute inset-x-0 flex justify-between text-[10px] text-on-surface-variant -top-4">
              <span className={replayYear === 2020 ? 'text-primary font-bold' : ''}>2020</span>
              <span className={replayYear === 2022 ? 'text-primary font-bold' : ''}>2022</span>
              <span className={replayYear === 2024 ? 'text-primary font-bold' : ''}>2024</span>
              <span className={replayYear === 2026 ? 'text-primary font-bold animate-pulse' : ''}>2026 [LIVE]</span>
            </div>
            {/* Thumb */}
            <div 
              className="absolute w-3.5 h-3.5 bg-primary rounded-full border border-surface-container-lowest shadow-[0_0_8px_#8ed5ff] -translate-x-1/2 cursor-pointer"
              style={{ left: `${((replayYear - 2020) / 6) * 100}%` }}
            />
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-on-surface-variant">
            <span>DRIFT: <span className="text-secondary font-medium">+0.14 kt WNW</span></span>
            <span className="text-outline-variant">|</span>
            <span className="text-primary font-medium">AUV SYNC: LIVE</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT: Slide-in Contextual Intelligence Panel            */}
      {/* ======================================================== */}
      {selectedAnomaly && (
        <aside className="relative z-30 h-full w-96 bg-[#080d17]/95 backdrop-blur-xl border-l border-outline-variant/30 p-5 flex flex-col justify-between overflow-y-auto flex-shrink-0 shadow-2xl">
          <div>
            {/* Header & Close */}
            <div className="flex items-start justify-between pb-3 border-b border-outline-variant/30">
              <div>
                <span className="font-mono text-primary text-[10px] tracking-widest uppercase">CLASSIFIED TARGET</span>
                <h2 className="text-xl font-headline text-on-surface font-medium mt-0.5">{selectedAnomaly.id}</h2>
                <span className="font-mono text-on-surface-variant text-xs">{selectedAnomaly.name}</span>
              </div>
              <button 
                onClick={() => soundFx.playSonarPing(900, 0.2)}
                className="text-on-surface-variant hover:text-on-surface p-1"
                title="Target Details"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* AI Confidence & Status Cards */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {/* Confidence Circle */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-3 rounded flex items-center space-x-3">
                <div className="relative w-11 h-11 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-variant"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${selectedAnomaly.confidence}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-on-surface font-bold">
                    {Math.round(selectedAnomaly.confidence)}%
                  </div>
                </div>
                <div>
                  <span className="font-mono text-on-surface-variant text-[10px] block">AI CONFIDENCE</span>
                  <span className="font-mono text-primary font-semibold text-xs">{selectedAnomaly.confidence}% MATCH</span>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-surface-container-low border border-outline-variant/30 p-3 rounded flex flex-col justify-center">
                <span className="font-mono text-on-surface-variant text-[10px] block">REVIEW STATUS</span>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
                  <span className="font-mono text-secondary-fixed-dim font-medium text-[11px]">{selectedAnomaly.status}</span>
                </div>
              </div>
            </div>

            {/* Hydrographic Target Parameters Ledger */}
            <div className="border border-outline-variant/30 bg-surface-container-low/40 rounded divide-y divide-outline-variant/20 font-mono text-xs">
              <div className="p-2.5 flex justify-between">
                <span className="text-on-surface-variant">SOUNDING DEPTH:</span>
                <span className="text-on-surface font-semibold">{selectedAnomaly.depth} METERS</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-on-surface-variant">ACOUSTIC RELIEF:</span>
                <span className="text-primary font-semibold">+{selectedAnomaly.relief} m above bed</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-on-surface-variant">GEOLOCATION:</span>
                <span className="text-on-surface">{selectedAnomaly.lat}° N, {selectedAnomaly.lon}° E</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-on-surface-variant">BENTHIC SUBSTRATE:</span>
                <span className="text-on-surface">{selectedAnomaly.substrate}</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-on-surface-variant">MODEL INFERENCE:</span>
                <span className="text-primary font-medium">ConvNet v4.2 + YOLO</span>
              </div>
            </div>

            {/* Side-scan Sonar Thumbnail Crop */}
            <div className="mt-4 border border-outline-variant/30 rounded p-2.5 bg-surface-container-low/60">
              <div className="flex items-center justify-between font-mono text-[10px] text-on-surface-variant mb-1.5">
                <span>WATERFALL CROP [1.4m SHADOW]</span>
                <span className="text-secondary font-medium">{selectedAnomaly.sonarFreq}</span>
              </div>
              <div className="h-24 bg-[#05080e] rounded border border-outline-variant/20 relative overflow-hidden flex items-center justify-center">
                {/* Sonar pixel texture */}
                <div className="w-full h-full opacity-60 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-10 border border-dashed border-primary bg-primary/15 rounded flex items-center justify-center">
                    <span className="font-mono text-[9px] text-primary font-semibold">{selectedAnomaly.shortClass}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2 pt-4 border-t border-outline-variant/30 mt-4">
            <button
              onClick={() => {
                soundFx.playSonarPing(1300, 0.5);
                onNavigate('view-detections');
              }}
              className="w-full bg-surface-container-low border border-primary/50 hover:border-primary hover:bg-surface-container text-on-surface font-mono py-2 rounded text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              <Crosshair className="w-4 h-4 text-primary" />
              <span>INSPECT IN DETECTION WORKSTATION</span>
            </button>

            <button
              onClick={() => {
                soundFx.playSonarPing(1100, 0.4);
                onOpenDispersalModal(selectedAnomaly);
              }}
              className="w-full bg-surface-container-low border border-outline-variant/40 hover:border-outline-variant text-on-surface-variant hover:text-on-surface font-mono py-2 rounded text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Waves className="w-4 h-4 text-secondary" />
              <span>PREDICT HYDRODYNAMIC DISPERSAL</span>
            </button>

            <button
              onClick={() => {
                soundFx.playTargetLock();
                showToast(`Target ${selectedAnomaly.id} added to Mission Transect 07 Debrief.`);
              }}
              className="w-full bg-surface-container-low border border-outline-variant/40 hover:border-outline-variant text-on-surface-variant hover:text-on-surface font-mono py-2 rounded text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4 text-on-surface-variant" />
              <span>ADD TO MISSION REPORT</span>
            </button>
          </div>
        </aside>
      )}
    </section>
  );
}
