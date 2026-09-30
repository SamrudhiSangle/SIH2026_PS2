import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  SlidersHorizontal,
  Activity, 
  Layers, 
  Eye, 
  Split, 
  FileCode, 
  ShieldCheck
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function SonarQualityView({ 
  surveyFile, 
  onNavigate, 
  onContinueToDetection,
  isAnalyzing = false
}) {
  // Preprocessing Settings
  const [denoiseLevel, setDenoiseLevel] = useState('STANDARD'); // 'OFF' | 'LOW' | 'STANDARD' | 'HIGH'
  const [contrastBoost, setContrastBoost] = useState(1.4); // 1.0 to 2.0
  const [normalizeIntensity, setNormalizeIntensity] = useState(true);
  const [artifactCheckEnabled, setArtifactCheckEnabled] = useState(true);

  // Comparison view mode: 'split' (side by side) | 'slider' (interactive divider)
  const [viewMode, setViewMode] = useState('split');
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100 for slider mode
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Processing Lifecycle: 'idle' | 'analyzing' | 'complete'
  const [processingStatus, setProcessingStatus] = useState('idle');

  // Object URL for actual uploaded image preview if available
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!surveyFile) {
      setImageUrl(null);
      return;
    }

    if (surveyFile.type && surveyFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(surveyFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [surveyFile]);

  // Execute Quality Check Analysis
  const handleRunQualityCheck = () => {
    soundFx.playSonarPing(1350, 0.6);
    setProcessingStatus('analyzing');

    setTimeout(() => {
      soundFx.playTargetLock();
      setProcessingStatus('complete');
    }, 1400);
  };

  const handleProceedToDetection = () => {
    soundFx.playTargetLock();
    if (onContinueToDetection) {
      onContinueToDetection();
    } else if (onNavigate) {
      onNavigate('view-detections');
    }
  };

  const handleSliderMove = (e) => {
    if (!isDraggingSlider) return;
    const container = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - container.left, container.width));
    setSliderPos(Math.round((x / container.width) * 100));
  };

  // 1. EMPTY STATE: NO SURVEY LOADED
  if (!surveyFile) {
    return (
      <section className="relative w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#060911] text-[#f1f5f9] select-none p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6">
          <div className="border-b border-[#162234] pb-4">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-primary"></span>
              <span className="font-mono text-xs tracking-[0.2em] text-[#8ea4bf] uppercase font-semibold">
                02 — SONAR QUALITY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline tracking-tight text-on-surface font-normal">
              Prepare the signal.
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#94a3b8] max-w-xl mt-1 font-normal leading-relaxed">
              Assess sonar quality and condition survey imagery for anomaly detection.
            </p>
          </div>

          <div className="bg-[#0b111e] border border-[#1a2638] rounded-sm p-10 sm:p-14 text-center space-y-4 my-8">
            <div className="w-10 h-10 rounded-sm bg-[#101b2b] border border-[#22354e] flex items-center justify-center text-primary mx-auto">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
            </div>

            <div className="space-y-1">
              <h2 className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-on-surface uppercase">
                NO SURVEY LOADED
              </h2>
              <p className="font-sans text-xs text-[#8ea4bf] max-w-sm mx-auto">
                Import Side-Scan Sonar imagery in Stage 01 to begin quality assessment and signal conditioning.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate && onNavigate('view-ingest')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-sm bg-[#132338] hover:bg-[#1a2f4a] border border-[#273d5c] hover:border-primary/60 text-[#f1f5f9] font-mono text-xs tracking-wider uppercase font-semibold transition-colors cursor-pointer"
              >
                <span>Return to Sonar Ingest</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const denoiseFilterValue = denoiseLevel === 'HIGH' ? 'blur(0.8px) contrast(1.15)' 
                           : denoiseLevel === 'STANDARD' ? 'blur(0.4px) contrast(1.1)' 
                           : denoiseLevel === 'LOW' ? 'blur(0.2px)' 
                           : 'none';

  const processedFilter = `${denoiseFilterValue} contrast(${contrastBoost}) brightness(${normalizeIntensity ? 1.08 : 1.0})`;

  return (
    <section className="relative w-full h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#060911] text-[#f1f5f9] select-none p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        
        {/* ======================================================== */}
        {/* 1. HEADER & WORKFLOW SEQUENCE                            */}
        {/* ======================================================== */}
        <div className="border-b border-[#162234] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-sm bg-primary"></span>
              <span className="font-mono text-xs tracking-[0.2em] text-[#8ea4bf] uppercase font-semibold">
                02 — SONAR QUALITY
              </span>
              <span className="text-[#33465e]">|</span>
              <span className="font-mono text-[10px] text-[#64748b] truncate max-w-xs">
                {surveyFile.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline tracking-tight text-on-surface font-normal">
              Prepare the signal.
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#94a3b8] max-w-xl mt-1 font-normal leading-relaxed">
              Assess signal-to-noise ratio, swath continuity, and condition imagery prior to inference.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[10px] text-[#64748b] shrink-0">
            <button 
              onClick={() => onNavigate && onNavigate('view-ingest')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              01 INGEST
            </button>
            <span className="text-[#33465e]">→</span>
            <span className="text-primary font-semibold bg-[#101b2c] px-2 py-0.5 rounded-sm border border-[#22354e]">
              02 QUALITY
            </span>
            <span className="text-[#33465e]">→</span>
            <span className="text-[#50637c]">03 DETECTION</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. MAIN WORKSPACE: RAW VS PROCESSED COMPARISON           */}
        {/* ======================================================== */}
        <div className="space-y-2">
          {/* Workspace Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#0b111e] border border-[#1a2638] rounded-t-sm text-xs font-mono">
            <div className="flex items-center space-x-3">
              <span className="text-on-surface font-semibold tracking-wider text-[11px] uppercase">
                SWATH CONDITIONING
              </span>
              <span className="text-[#33465e]">|</span>
              <span className="text-[10px] text-[#64748b]">PORT &amp; STARBOARD CHANNELS</span>
            </div>

            {/* View Mode Selector: Side-by-side vs Slider */}
            <div className="flex items-center space-x-1 bg-[#070c14] border border-[#1a2638] rounded-sm p-0.5">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2 py-0.5 rounded-sm text-[10px] transition-colors cursor-pointer ${
                  viewMode === 'split' 
                    ? 'bg-[#101b2c] text-primary border border-[#22354e]' 
                    : 'text-[#64748b] hover:text-on-surface'
                }`}
              >
                SIDE-BY-SIDE
              </button>
              <button
                onClick={() => setViewMode('slider')}
                className={`px-2 py-0.5 rounded-sm text-[10px] transition-colors cursor-pointer ${
                  viewMode === 'slider' 
                    ? 'bg-[#101b2c] text-primary border border-[#22354e]' 
                    : 'text-[#64748b] hover:text-on-surface'
                }`}
              >
                DIVIDER SLIDER
              </button>
            </div>
          </div>

          {/* Comparison Display Canvas */}
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#080d16] border-x border-b border-[#1a2638] p-3 rounded-b-sm">
              {/* Left Panel: RAW SONAR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] px-1">
                  <span className="text-[#8ea4bf] uppercase font-medium flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#50637c]"></span>
                    <span>RAW BACKSCATTER</span>
                  </span>
                  <span className="text-[#50637c]">PORT (-75m) / STBD (+75m)</span>
                </div>

                <div className="relative h-64 sm:h-72 lg:h-80 bg-[#03070e] border border-[#1a2638] rounded-sm overflow-hidden flex flex-col justify-between">
                  <div 
                    className="absolute inset-0 opacity-50 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, #03070e 0%, #07101c 50%, #03070e 100%), repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, rgba(45, 212, 191, 0.05) 3px, transparent 4px)',
                      backgroundSize: '100% 100%, 16px 16px'
                    }}
                  />

                  {imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt="Raw Sonar" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  )}

                  {/* Center Nadir Line */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-[#010408] border-x border-[#1a2638] flex flex-col justify-between items-center py-2 font-mono text-[8px] text-[#50637c] pointer-events-none">
                    <span>N</span>
                    <span>0</span>
                    <span>N</span>
                  </div>

                  <div className="relative z-10 p-2 font-mono text-[9px] text-[#64748b] flex justify-between">
                    <span>UNPROCESSED SWATH</span>
                    <span>PORT CH 01 / STBD CH 02</span>
                  </div>

                  <div className="relative z-10 p-2 font-mono text-[9px] text-[#64748b] flex justify-between bg-gradient-to-t from-[#020509] to-transparent">
                    <span>RAW SENSOR FEED</span>
                    <span className="text-[#50637c]">AWAITING CONDITIONING</span>
                  </div>
                </div>
              </div>

              {/* Right Panel: PROCESSED PREVIEW */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] px-1">
                  <span className="text-primary uppercase font-medium flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-sm bg-primary"></span>
                    <span>CONDITIONED PREVIEW</span>
                  </span>
                  <span className="text-primary/70">
                    {processingStatus === 'complete' ? 'READY FOR DETECTION' : 'NORMALIZED'}
                  </span>
                </div>

                <div className="relative h-64 sm:h-72 lg:h-80 bg-[#03070e] border border-[#22354e] rounded-sm overflow-hidden flex flex-col justify-between">
                  <div 
                    className="absolute inset-0 opacity-60 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, #03070e 0%, #091526 50%, #03070e 100%), repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, rgba(45, 212, 191, 0.08) 3px, transparent 4px)',
                      backgroundSize: '100% 100%, 16px 16px',
                      filter: processedFilter
                    }}
                  />

                  {imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt="Processed Sonar" 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 transition-all duration-300"
                      style={{ filter: processedFilter }}
                    />
                  )}

                  {/* Center Nadir Line */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-[#010408] border-x border-[#22354e] flex flex-col justify-between items-center py-2 font-mono text-[8px] text-primary/70 pointer-events-none">
                    <span>N</span>
                    <span>0</span>
                    <span>N</span>
                  </div>

                  <div className="relative z-10 p-2 font-mono text-[9px] text-primary/80 flex justify-between">
                    <span>FILTERED SWATH</span>
                    <span>GAIN NORMALIZED</span>
                  </div>

                  <div className="relative z-10 p-2 font-mono text-[9px] text-[#8ea4bf] flex justify-between bg-gradient-to-t from-[#020509] to-transparent">
                    <span>DENOISE: {denoiseLevel}</span>
                    <span>CONTRAST: {contrastBoost}x</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Divider Slider */
            <div 
              onMouseMove={handleSliderMove}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              className="relative h-72 sm:h-80 lg:h-96 bg-[#03070e] border border-[#1a2638] rounded-b-sm overflow-hidden select-none cursor-ew-resize"
            >
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <div 
                  className="absolute inset-0 w-[100vw] max-w-7xl opacity-75"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, #03070e 0%, #07101c 50%, #03070e 100%)'
                  }}
                />
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="Raw" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80" 
                  />
                )}
                <div className="absolute top-3 left-4 font-mono text-[10px] text-[#8ea4bf] font-semibold tracking-wider uppercase bg-[#03070e]/90 px-2 py-0.5 rounded-sm border border-[#1a2638]">
                  RAW SONAR
                </div>
              </div>

              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ left: `${sliderPos}%`, width: `${100 - sliderPos}%` }}
              >
                <div 
                  className="absolute inset-0 w-[100vw] max-w-7xl opacity-85"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, #03070e 0%, #091526 50%, #03070e 100%)',
                    filter: processedFilter
                  }}
                />
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="Processed" 
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    style={{ filter: processedFilter }} 
                  />
                )}
                <div className="absolute top-3 right-4 font-mono text-[10px] text-primary font-semibold tracking-wider uppercase bg-[#03070e]/90 px-2 py-0.5 rounded-sm border border-[#22354e]">
                  CONDITIONED PREVIEW
                </div>
              </div>

              <div 
                onMouseDown={() => setIsDraggingSlider(true)}
                className="absolute inset-y-0 w-0.5 bg-primary cursor-ew-resize flex items-center justify-center z-20"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-4 h-4 rounded-sm bg-primary text-[#03070e] font-bold text-[8px] flex items-center justify-center shadow">
                  ↔
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. SIGNAL PROCESSING CONTROLS & QUALITY DIAGNOSTICS      */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (lg:col-span-7): Signal Processing Controls */}
          <div className="lg:col-span-7 bg-[#0b111e] border border-[#1a2638] rounded-sm p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#162234]">
              <span className="font-mono text-xs tracking-wider text-on-surface font-semibold uppercase flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>Signal Conditioning Controls</span>
              </span>
              <span className="font-mono text-[9px] text-[#64748b] uppercase">
                PREPROCESSING PIPELINE
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Denoise */}
              <div className="p-3 bg-[#080d16] border border-[#162234] rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-on-surface font-semibold text-xs">
                      1. ACOUSTIC DENOISING
                    </span>
                    <p className="font-sans text-[11px] text-[#8ea4bf] mt-0.5">
                      Reduce speckle noise while preserving object boundaries and shadows.
                    </p>
                  </div>
                  <span className="text-primary text-[11px]">{denoiseLevel}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {['OFF', 'LOW', 'STANDARD', 'HIGH'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        soundFx.playSonarPing(1100, 0.2);
                        setDenoiseLevel(lvl);
                      }}
                      className={`py-1 rounded-sm text-[10px] transition-colors cursor-pointer border ${
                        denoiseLevel === lvl
                          ? 'bg-[#101b2c] text-primary border-[#22354e] font-semibold'
                          : 'bg-[#0b111e] text-[#64748b] hover:text-on-surface border-[#162234]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast */}
              <div className="p-3 bg-[#080d16] border border-[#162234] rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-on-surface font-semibold text-xs">
                      2. CONTRAST &amp; DYNAMIC RANGE
                    </span>
                    <p className="font-sans text-[11px] text-[#8ea4bf] mt-0.5">
                      Adjust dynamic range to accentuate weak seabed returns.
                    </p>
                  </div>
                  <span className="text-primary text-[11px]">{contrastBoost}x</span>
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-[10px] text-[#50637c]">1.0x</span>
                  <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={contrastBoost}
                    onChange={(e) => setContrastBoost(parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#162234] rounded appearance-none cursor-pointer accent-teal-400"
                  />
                  <span className="text-[10px] text-[#50637c]">2.0x</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-3 bg-[#080d16] border border-[#162234] rounded-sm flex items-center justify-between">
                  <div>
                    <span className="text-on-surface font-semibold text-xs block">
                      3. INTENSITY NORMALIZATION
                    </span>
                    <span className="font-sans text-[10px] text-[#64748b]">
                      Standardize mean intensity across swath.
                    </span>
                  </div>
                  <button
                    onClick={() => setNormalizeIntensity(!normalizeIntensity)}
                    className={`px-2 py-0.5 rounded-sm text-[10px] border cursor-pointer ${
                      normalizeIntensity
                        ? 'bg-[#101b2c] border-[#22354e] text-primary'
                        : 'bg-[#080d16] border-[#162234] text-[#64748b]'
                    }`}
                  >
                    {normalizeIntensity ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-3 bg-[#080d16] border border-[#162234] rounded-sm flex items-center justify-between">
                  <div>
                    <span className="text-on-surface font-semibold text-xs block">
                      4. ARTIFACT SCREENING
                    </span>
                    <span className="font-sans text-[10px] text-[#64748b]">
                      Flag vessel motion and towfish jitter.
                    </span>
                  </div>
                  <button
                    onClick={() => setArtifactCheckEnabled(!artifactCheckEnabled)}
                    className={`px-2 py-0.5 rounded-sm text-[10px] border cursor-pointer ${
                      artifactCheckEnabled
                        ? 'bg-[#101b2c] border-[#22354e] text-primary'
                        : 'bg-[#080d16] border-[#162234] text-[#64748b]'
                    }`}
                  >
                    {artifactCheckEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (lg:col-span-5): Diagnostics & Action */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="bg-[#0b111e] border border-[#1a2638] rounded-sm p-4 sm:p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#162234]">
                <span className="font-semibold text-on-surface uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>Quality Diagnostics</span>
                </span>
                <span className="text-[9px] text-[#64748b]">ANALYSIS</span>
              </div>

              <div className="divide-y divide-[#162234]">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#8ea4bf]">SIGNAL-TO-NOISE</span>
                  <span className="text-on-surface">18.4 dB (NOMINAL)</span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#8ea4bf]">SWATH CONTINUITY</span>
                  <span className="text-primary">98.2% (VERIFIED)</span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#8ea4bf]">SENSOR ARTIFACTS</span>
                  <span className="text-on-surface">NONE DETECTED</span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#8ea4bf]">PREPROCESSING</span>
                  <span className={`text-[11px] font-semibold ${
                    processingStatus === 'complete' 
                      ? 'text-primary' 
                      : processingStatus === 'analyzing' 
                        ? 'text-amber-300' 
                        : 'text-[#64748b]'
                  }`}>
                    {processingStatus === 'complete' 
                      ? 'SIGNAL CONDITIONED' 
                      : processingStatus === 'analyzing' 
                        ? 'ANALYZING...' 
                        : 'READY TO RUN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Notice */}
            <div className="p-3 bg-[#131109] border border-amber-500/30 rounded-sm font-mono text-xs text-amber-300 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Navigation Metadata Unavailable</span>
              </div>
              <p className="font-sans text-[11px] text-[#c9a66b] leading-relaxed">
                Detection can proceed in image-space. Geolocation will remain unavailable unless survey navigation telemetry is provided.
              </p>
            </div>

            {/* Next Action Box */}
            <div className="bg-[#0b111e] border border-[#1a2638] rounded-sm p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#64748b] uppercase">
                <span>Next Workflow Phase</span>
                <span className="text-primary font-medium">03 — AI Detection & Segmentation</span>
              </div>

              {processingStatus !== 'complete' ? (
                <button
                  id="btn-run-quality-check"
                  disabled={processingStatus === 'analyzing'}
                  onClick={handleRunQualityCheck}
                  className="w-full inline-flex items-center justify-center space-x-2.5 px-5 py-3 rounded-sm bg-[#132338] hover:bg-[#1a2f4a] border border-[#273d5c] hover:border-primary/60 text-[#f1f5f9] font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  <span>{processingStatus === 'analyzing' ? 'ANALYZING SIGNAL...' : 'Run Quality Diagnostics'}</span>
                </button>
              ) : (
                <button
                  id="btn-continue-detection"
                  disabled={isAnalyzing}
                  onClick={handleProceedToDetection}
                  className="w-full inline-flex items-center justify-center space-x-2.5 px-5 py-3 rounded-sm bg-[#102a24] hover:bg-[#14352e] border border-[#1b5e50] hover:border-primary text-[#99f6e4] font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isAnalyzing ? 'RUNNING AI INFERENCE...' : 'Continue to Detection'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 text-primary ${isAnalyzing ? 'animate-pulse' : ''}`} />
                </button>
              )}

              <p className="font-sans text-[11px] text-[#64748b] text-center">
                {processingStatus === 'complete'
                  ? 'Signal verified. Ready to initiate candidate anomaly screening.'
                  : 'Execute quality diagnostics to condition the acoustic signal.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
