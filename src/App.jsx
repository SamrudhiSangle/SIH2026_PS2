import React, { useState, useEffect } from 'react';
import TopAppBar from './components/TopAppBar';
import ExploreLanding from './components/views/ExploreLanding';
import WorkspaceView from './components/views/WorkspaceView';
import DetectionsView from './components/views/DetectionsView';
import ReportView from './components/views/ReportView';
import SensorTunerModal from './components/modals/SensorTunerModal';
import DispersalSimulationModal from './components/modals/DispersalSimulationModal';
import { INITIAL_ANOMALIES } from './data/mockData';
import { soundFx } from './utils/audio';
import { SonarHero } from './components/SonarHero';

export default function App() {
  const [currentView, setCurrentView] = useState('view-hero');
  const [anomalies, setAnomalies] = useState(INITIAL_ANOMALIES);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState('A-001');

  // Modals & Drawers
  const [isSensorTunerOpen, setIsSensorTunerOpen] = useState(false);
  const [dispersalTarget, setDispersalTarget] = useState(null);
  const [layerDrawerOpen, setLayerDrawerOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1') {
        soundFx.playSonarPing(1100, 0.4);
        setCurrentView('view-landing');
      } else if (e.key === '2') {
        soundFx.playSonarPing(1200, 0.4);
        setCurrentView('view-workspace');
      } else if (e.key === '3') {
        soundFx.playSonarPing(1300, 0.4);
        setCurrentView('view-detections');
      } else if (e.key === '4') {
        soundFx.playSonarPing(1400, 0.4);
        setCurrentView('view-summary');
      } else if (e.key.toLowerCase() === 'm') {
        soundFx.toggleMute();
      } else if (e.key === 'Escape') {
        setIsSensorTunerOpen(false);
        setDispersalTarget(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update Anomaly Status from Operator in Detections view
  const handleUpdateAnomalyStatus = (id, newStatus, operatorNotes) => {
    setAnomalies(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          notes: operatorNotes || item.notes,
          reviewedBy: "Operator (Verified)",
          reviewedAt: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  return (
    <div className="h-screen w-screen bg-[#060a10] text-[#f1f5f9] overflow-hidden flex flex-col">
      {/* Top Application Bar */}
      <TopAppBar
        currentView={currentView}
        onSwitchView={setCurrentView}
        onToggleLayerDrawer={() => setLayerDrawerOpen(!layerDrawerOpen)}
        onOpenSensorTuner={() => setIsSensorTunerOpen(true)}
        anomalyCount={anomalies.filter(a => a.status === 'REQUIRES REVIEW').length}
      />

      {/* Main View Container */}
      <main className="relative flex-1 mt-14 overflow-hidden">
        {currentView === 'view-hero' && (
          <div className="animate-fade-in h-full">
            <SonarHero
              onExplore={() => {
                setCurrentView('view-workspace');
              }}
            />
          </div>
        )}

        {currentView === 'view-landing' && (
          <div className="animate-fade-in h-full">
            <ExploreLanding
              anomalies={anomalies}
              onNavigate={setCurrentView}
              onSelectAnomaly={setSelectedAnomalyId}
            />
          </div>
        )}

        {currentView === 'view-workspace' && (
          <div className="animate-fade-in h-full">
            <WorkspaceView
              anomalies={anomalies}
              selectedAnomalyId={selectedAnomalyId}
              onSelectAnomaly={setSelectedAnomalyId}
              onNavigate={setCurrentView}
              onOpenDispersalModal={setDispersalTarget}
              layerDrawerOpen={layerDrawerOpen}
              onToggleLayerDrawer={() => setLayerDrawerOpen(!layerDrawerOpen)}
            />
          </div>
        )}

        {currentView === 'view-detections' && (
          <div className="animate-fade-in h-full">
            <DetectionsView
              anomalies={anomalies}
              selectedAnomalyId={selectedAnomalyId}
              onSelectAnomaly={setSelectedAnomalyId}
              onUpdateAnomalyStatus={handleUpdateAnomalyStatus}
              onNavigate={setCurrentView}
            />
          </div>
        )}

        {currentView === 'view-summary' && (
          <div className="animate-fade-in h-full">
            <ReportView
              anomalies={anomalies}
              onSelectAnomaly={setSelectedAnomalyId}
              onNavigate={setCurrentView}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <SensorTunerModal
        isOpen={isSensorTunerOpen}
        onClose={() => setIsSensorTunerOpen(false)}
      />

      <DispersalSimulationModal
        isOpen={!!dispersalTarget}
        anomaly={dispersalTarget}
        onClose={() => setDispersalTarget(null)}
      />
    </div>
  );
}
