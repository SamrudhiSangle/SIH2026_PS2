import React, { useState } from 'react';
import { 
  Check, 
  X, 
  SlidersHorizontal, 
  Maximize2, 
  HelpCircle, 
  FileCheck, 
  Scan, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Tag, 
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function DetectionsView({ 
  anomalies, 
  selectedAnomalyId, 
  onSelectAnomaly, 
  onUpdateAnomalyStatus,
  onNavigate
}) {
  const [sonarMode, setSonarMode] = useState('segmented'); // 'raw' | 'segmented'
  const [colorPalette, setColorPalette] = useState('cyan'); // 'cyan' | 'amber' | 'emerald' | 'gray'
  const [operatorNotes, setOperatorNotes] = useState('');
  const [feedbackToast, setFeedbackToast] = useState(null);

  const currentAnomaly = anomalies.find(a => a.id === selectedAnomalyId) || anomalies[0];

  const handleDecision = (decisionType) => {
    soundFx.playTargetLock();
    onUpdateAnomalyStatus(currentAnomaly.id, decisionType, operatorNotes);
    setFeedbackToast(`Target ${currentAnomaly.id} marked as [${decisionType}]. Model telemetry logged.`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const colormapStyles = {
    cyan: {
      bg: '#070e17',
      primary: '#38bdf8',
      secondary: '#4fdbc8',
      grid: 'radial-gradient(#1e293b 1px, transparent 1px)'
    },
    amber: {
      bg: '#120d06',
      primary: '#f59e0b',
      secondary: '#fbbf24',
      grid: 'radial-gradient(#3d2406 1px, transparent 1px)'
    },
    emerald: {
      bg: '#04120c',
      primary: '#10b981',
      secondary: '#34d399',
      grid: 'radial-gradient(#06301d 1px, transparent 1px)'
    },
    gray: {
      bg: '#0d1117',
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      grid: 'radial-gradient(#30363d 1px, transparent 1px)'
    }
  };

  const activeTheme = colormapStyles[colorPalette];

  return (
    <section className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden select-none bg-[#060a10]">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 glass-panel px-4 py-2 rounded text-xs font-mono text-primary flex items-center space-x-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] border-primary/50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-secondary" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* LEFT 60%: High-Fidelity Side-Scan Sonar Waterfall View   */}
      {/* ======================================================== */}
      <div className="w-full md:w-[60%] h-full bg-[#060a10] border-r border-outline-variant/30 flex flex-col justify-between p-4 md:p-6 relative">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-outline-variant/30 z-10 gap-2">
          <div className="flex items-center space-x-3 font-mono text-xs">
            <span className="text-on-surface font-semibold text-sm font-headline">ACOUSTIC WATERFALL INSPECTION</span>
            <span className="text-outline-variant">|</span>
            <span className="text-on-surface-variant text-[11px]">PORT / STARBOARD SWATH 75m</span>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            {/* Color Palette Selector */}
            <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded p-0.5">
              <button
                onClick={() => setColorPalette('cyan')}
                className={`px-2 py-0.5 rounded text-[10px] ${colorPalette === 'cyan' ? 'bg-primary/20 text-primary border border-primary/40' : 'text-on-surface-variant'}`}
                title="Abyssal Cyan"
              >
                CYAN
              </button>
              <button
                onClick={() => setColorPalette('amber')}
                className={`px-2 py-0.5 rounded text-[10px] ${colorPalette === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-on-surface-variant'}`}
                title="Amber Sonar"
              >
                AMBER
              </button>
              <button
                onClick={() => setColorPalette('emerald')}
                className={`px-2 py-0.5 rounded text-[10px] ${colorPalette === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-on-surface-variant'}`}
                title="Emerald Phosphor"
              >
                PHOSPHOR
              </button>
            </div>

            {/* Raw vs AI Segmented Toggle */}
            <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded p-0.5">
              <button
                onClick={() => {
                  soundFx.playSonarPing(900, 0.2);
                  setSonarMode('raw');
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  sonarMode === 'raw' 
                    ? 'bg-primary-container/20 text-primary border border-primary-container/40' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                RAW CHIRP
              </button>
              <button
                onClick={() => {
                  soundFx.playSonarPing(1300, 0.3);
                  setSonarMode('segmented');
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  sonarMode === 'segmented' 
                    ? 'bg-primary-container/20 text-primary border border-primary-container/40' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                AI SEGMENTED
              </button>
            </div>
          </div>
        </div>

        {/* Target Quick Selector Strip */}
        <div className="flex items-center space-x-2 py-2 overflow-x-auto font-mono text-[11px] border-b border-outline-variant/20">
          <span className="text-on-surface-variant mr-1 text-[10px] uppercase">Select Anomaly:</span>
          {anomalies.map(item => (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playTargetLock();
                onSelectAnomaly(item.id);
              }}
              className={`px-2.5 py-0.5 rounded border transition-all flex items-center space-x-1.5 ${
                item.id === currentAnomaly.id
                  ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'CONFIRMED' ? 'bg-secondary' : 'bg-primary'}`}></span>
              <span>{item.id}</span>
            </button>
          ))}
        </div>

        {/* Sonar Waterfall Canvas Display */}
        <div 
          className="relative flex-1 my-3 rounded border border-outline-variant/30 overflow-hidden flex items-center justify-center transition-colors duration-500"
          style={{ backgroundColor: activeTheme.bg }}
        >
          {/* Sonar Waterfall Grid Texture */}
          <div 
            className="absolute inset-0 opacity-45"
            style={{ backgroundImage: activeTheme.grid, backgroundSize: '12px 12px' }}
          />

          {/* Animated Scanning Waterfall Line */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-b from-primary/30 to-transparent pointer-events-none sonar-scanline opacity-60" />

          {/* Center Nadir Line (The water column directly beneath towfish) */}
          <div className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-[#020508] border-x border-outline-variant/20 flex flex-col justify-between items-center py-2 font-mono text-[8px] text-outline-variant">
            <span>NADIR</span>
            <span>0m</span>
            <span>NADIR</span>
          </div>

          {/* Synthetic Sonar Backscatter Target Box */}
          <div className="relative z-10 w-[420px] h-72 border border-primary/40 bg-surface-container-low/40 rounded p-3 backdrop-blur-[2px]">
            {/* Measurement Reticle Badge */}
            <div className="absolute -top-3 left-3 font-mono text-[10px] text-primary bg-[#060a10] px-2 py-0.5 border border-primary/40 rounded">
              TARGET {currentAnomaly.id} · {currentAnomaly.dimensions.length}m × {currentAnomaly.dimensions.width}m
            </div>

            {/* Acoustic Shadow Projection Zone */}
            <div className="absolute right-6 top-10 w-48 h-36 bg-[#020408] border border-outline-variant/30 rounded flex flex-col items-center justify-center p-2 text-center">
              <span className="font-mono text-[9px] text-outline-variant">ACOUSTIC SHADOW</span>
              <span className="font-mono text-[10px] text-primary mt-0.5">+{currentAnomaly.relief}m RELIEF</span>
            </div>

            {/* Tangled Fiber AI Segment SVG Overlay */}
            {sonarMode === 'segmented' && (
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 50,90 Q 80,60 130,85 T 200,100 T 230,140 T 180,180 T 90,150 Z"
                  fill="rgba(56, 189, 248, 0.22)"
                  stroke={activeTheme.primary}
                  strokeWidth="1.6"
                  strokeDasharray="3 3"
                />
                <circle cx="130" cy="85" r="3.5" fill={activeTheme.primary} />
                <circle cx="200" cy="100" r="3.5" fill={activeTheme.primary} />
                <circle cx="180" cy="180" r="3.5" fill={activeTheme.primary} />
                <line x1="50" y1="90" x2="230" y2="140" stroke={activeTheme.secondary} strokeWidth="1.2" strokeDasharray="4 4" />
                <text 
                  fill={activeTheme.secondary} 
                  fontFamily="'JetBrains Mono', monospace" 
                  fontSize="10" 
                  textAnchor="middle" 
                  x="140" 
                  y="125"
                  fontWeight="600"
                >
                  SPAN: {currentAnomaly.dimensions.length}m
                </text>
              </svg>
            )}

            {/* Center Crosshairs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-60">
              <div className="w-full h-px bg-primary absolute top-1/2"></div>
              <div className="h-full w-px bg-primary absolute left-1/2"></div>
            </div>
          </div>

          {/* Range ticks horizontal scale */}
          <div className="absolute bottom-2 inset-x-8 flex justify-between font-mono text-[9px] text-on-surface-variant">
            <span>-75m (PORT)</span>
            <span>-50m</span>
            <span>-25m</span>
            <span className="text-primary font-bold">0m (NADIR)</span>
            <span>+25m</span>
            <span>+50m</span>
            <span>+75m (STBD)</span>
          </div>
        </div>

        {/* Bottom Waterfall Status Bar */}
        <div className="flex flex-wrap items-center justify-between font-mono text-xs text-on-surface-variant pt-1 gap-2">
          <div className="flex items-center space-x-4">
            <span>SPEED: <strong className="text-on-surface">3.8 KTS</strong></span>
            <span>ALTITUDE: <strong className="text-on-surface">18.4 M</strong></span>
            <span>BACKSCATTER: <strong className="text-primary">{currentAnomaly.backscatterIntensity} dB</strong></span>
          </div>
          <span className="text-[10px] text-secondary font-mono">XTF: {currentAnomaly.waterfallFile}</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT 40%: AI Inference & Operator Decision Panel       */}
      {/* ======================================================== */}
      <div className="w-full md:w-[40%] h-full bg-[#080d17] flex flex-col justify-between p-4 md:p-6 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="pb-3 border-b border-outline-variant/30">
            <div className="flex items-center space-x-2 text-secondary font-mono text-xs tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>NEURAL INFERENCE ENGINE</span>
            </div>
            <h2 className="text-2xl font-headline text-on-surface font-medium mt-1">
              {currentAnomaly.name}
            </h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Target ID: <strong className="text-primary font-mono">{currentAnomaly.id}</strong> · Subsea Multimodal ConvNet v4.2
            </p>
          </div>

          {/* Confidence Breakdown Bars */}
          <div className="mt-5 space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">SYNTHETIC DETECTOR CONFIDENCE:</span>
                <span className="text-primary font-bold">{currentAnomaly.confidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${currentAnomaly.confidence}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">SEABED CONTRAST RATIO:</span>
                <span className="text-secondary font-bold">{currentAnomaly.seabedContrast}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${currentAnomaly.seabedContrast}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-on-surface-variant">ACOUSTIC SHADOW CORRELATION:</span>
                <span className="text-primary font-bold">{currentAnomaly.shadowCorrelation}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${currentAnomaly.shadowCorrelation}%` }}></div>
              </div>
            </div>
          </div>

          {/* Geometric Estimates Grid */}
          <div className="mt-5 p-3.5 bg-surface-container-low border border-outline-variant/30 rounded font-mono">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mb-2 font-semibold">
              CALIBRATED GEOMETRIC ESTIMATES
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-on-surface-variant text-[10px]">MAJOR AXIS SPAN:</span>
                <div className="text-on-surface font-bold text-sm font-headline">{currentAnomaly.dimensions.length} METERS</div>
              </div>
              <div>
                <span className="text-on-surface-variant text-[10px]">MINOR AXIS WIDTH:</span>
                <div className="text-on-surface font-bold text-sm font-headline">{currentAnomaly.dimensions.width} METERS</div>
              </div>
              <div>
                <span className="text-on-surface-variant text-[10px]">TOTAL TANGLE AREA:</span>
                <div className="text-primary font-semibold">{currentAnomaly.dimensions.area} m²</div>
              </div>
              <div>
                <span className="text-on-surface-variant text-[10px]">ACOUSTIC RELIEF:</span>
                <div className="text-secondary font-semibold">+{currentAnomaly.relief} m above bed</div>
              </div>
            </div>
          </div>

          {/* Operator Notes Field */}
          <div className="mt-4">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">
              Operator Debrief Notes:
            </label>
            <textarea
              rows={2}
              value={operatorNotes || currentAnomaly.notes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="Add observation log for this target..."
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded p-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Operator Authorization Action Buttons */}
        <div className="pt-4 border-t border-outline-variant/30 mt-4 space-y-2">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1 font-semibold">
            OPERATOR AUTHORIZATION &amp; LOGGING:
          </span>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <button
              onClick={() => handleDecision('CONFIRMED')}
              className="bg-secondary/15 border border-secondary text-secondary hover:bg-secondary/25 py-2.5 rounded transition-all flex items-center justify-center space-x-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span className="font-semibold">CONFIRM</span>
            </button>

            <button
              onClick={() => handleDecision('REJECTED')}
              className="bg-surface-container-low border border-error/50 text-error hover:bg-error/10 py-2.5 rounded transition-all flex items-center justify-center space-x-1.5"
            >
              <X className="w-4 h-4" />
              <span>REJECT (NOISE)</span>
            </button>

            <button
              onClick={() => handleDecision('RECLASSIFIED')}
              className="bg-surface-container-low border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary py-2 rounded transition-colors text-[11px]"
            >
              CORRECT CLASS
            </button>

            <button
              onClick={() => handleDecision('LOGGED')}
              className="bg-surface-container-low border border-outline-variant hover:border-secondary text-on-surface-variant hover:text-secondary py-2 rounded transition-colors text-[11px]"
            >
              MARK ARCHIVED
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
