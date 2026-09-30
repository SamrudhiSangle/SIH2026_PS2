import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#080e1a] border border-[#1b2a3f] rounded shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#162234] bg-[#050a12]">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-[#f8fafc] font-sans">
                SONAROPS Legal &amp; Compliance Documentation
              </h2>
              <p className="text-[11px] font-mono text-[#7d93ad]">
                Version 1.0.4 · SIH26057 Hydrographic Standards
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playSonarPing(1100, 0.3);
              onClose();
            }}
            className="p-1 rounded text-[#7d93ad] hover:text-[#f8fafc] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#162234] bg-[#070c16] px-6">
          <button
            onClick={() => {
              soundFx.playSonarPing(1200, 0.25);
              setActiveTab('privacy');
            }}
            className={`py-3 px-4 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-[#7d93ad] hover:text-[#f8fafc]'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => {
              soundFx.playSonarPing(1200, 0.25);
              setActiveTab('terms');
            }}
            className={`py-3 px-4 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-[#7d93ad] hover:text-[#f8fafc]'
            }`}
          >
            Terms &amp; Conditions
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#94a3b8] leading-relaxed font-sans">
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#0b1424] border border-[#1d2d46] rounded-sm font-mono text-[11px] text-[#cbd5e1]">
                <strong>Client-Side Acoustic Data Isolation:</strong> Sonar imagery, bathymetric rasters, and detection logs processed in the SONAROPS workstation remain locally constrained in user memory unless explicitly exported by an authenticated operator.
              </div>

              <h3 className="text-sm font-medium text-[#f8fafc]">1. Hydrographic Data Collection</h3>
              <p>
                SONAROPS collects only telemetry parameters and acoustic raster files directly uploaded into the survey ingest interface. All raw acoustic returns (.tif, .png, .jpg, .xtf) are processed in memory and are never transmitted to unauthorized external registries.
              </p>

              <h3 className="text-sm font-medium text-[#f8fafc]">2. Telemetry &amp; Coordinates</h3>
              <p>
                Navigation stream coordinates (WGS 84 / UTM) are parsed strictly for anomaly localization and spatial reporting. If navigation telemetry is not included with the acoustic scan, no synthetic or approximate latitude/longitude is captured or generated.
              </p>

              <h3 className="text-sm font-medium text-[#f8fafc]">3. Audit &amp; Export Registers</h3>
              <p>
                Operational logs, classification confidence records, and generated CSV/JSON reports reflect actual verified user sessions. Analysts maintain full custody of generated detection dossiers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#0b1424] border border-[#1d2d46] rounded-sm font-mono text-[11px] text-[#cbd5e1]">
                <strong>Navigational Safety Notice:</strong> Automated acoustic anomaly classifications are advisory aids intended for qualified sonar operators and hydrographic surveyors. They do not supersede official nautical charts (ENC/IHO).
              </div>

              <h3 className="text-sm font-medium text-[#f8fafc]">1. Workstation Intended Use</h3>
              <p>
                SONAROPS provides analytical tools for side-scan sonar image conditioning, synthetic feature recognition, spatial bounding, and hydrographic anomaly documentation under problem statement SIH26057.
              </p>

              <h3 className="text-sm font-medium text-[#f8fafc]">2. Classification Verification</h3>
              <p>
                Candidate detections flagged with status "REQUIRES REVIEW" must be validated by an accredited hydrographic analyst prior to deployment of subsea salvage, dredging, or mitigation operations.
              </p>

              <h3 className="text-sm font-medium text-[#f8fafc]">3. Data Rights &amp; Attribution</h3>
              <p>
                Surveys processed through this workstation remain the proprietary property of the conducting hydrographic institute or survey vessel operator.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#162234] bg-[#050a12] flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#50637c]">
            COMPLIANT WITH IHO S-44 STANDARDS
          </span>
          <button
            onClick={() => {
              soundFx.playSonarPing(1100, 0.3);
              onClose();
            }}
            className="px-4 py-1.5 rounded-sm bg-[#132338] hover:bg-[#1a2f4a] border border-[#273d5c] text-[#f1f5f9] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
}
