import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import OverviewDashboard from './pages/OverviewDashboard';
import FarmsFieldsView from './pages/FarmsFieldsView';
import AIDiseaseScannerView from './pages/AIDiseaseScannerView';
import IoTSensorsView from './pages/IoTSensorsView';
import IrrigationPredictionView from './pages/IrrigationPredictionView';
import CropYieldForecastView from './pages/CropYieldForecastView';
import SatelliteNdviView from './pages/SatelliteNdviView';
import SmartPlantingCalendarView from './pages/SmartPlantingCalendarView';
import HarvestInventoryView from './pages/HarvestInventoryView';
import AgronomistReviewView from './pages/AgronomistReviewView';
import SystemStressBenchView from './pages/SystemStressBenchView';
import { api } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({
    id: "usr-001",
    name: "Fahmi Gunawan, S.Tr.P",
    email: "fahmi@farmvision.id",
    role: "Farm Manager",
    organization: "Nusantara Agri Corpora Mandiri",
    active_farm: "FRM-001"
  });

  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState('FRM-001');

  useEffect(() => {
    // Load active user and farms
    api.getMe().then(u => { if (u) setUser(u); }).catch(() => {});
    api.getFarms().then(f => {
      if (f && f.length > 0) {
        setFarms(f);
        setActiveFarmId(f[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSwitchRole = async (newRole) => {
    try {
      const res = await api.switchRole(newRole);
      if (res && res.user) setUser(res.user);
    } catch {
      setUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const handleSwitchFarm = async (farmId) => {
    try {
      await api.switchFarm(farmId);
      setActiveFarmId(farmId);
    } catch (err) {
      alert("Error ganti lahan: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-farm-950 text-slate-100 flex flex-col font-sans selection:bg-farm-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSwitchRole={handleSwitchRole}
        farms={farms}
        activeFarmId={activeFarmId}
        onSwitchFarm={handleSwitchFarm}
        alertCount={3}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'fields' && (
          <FarmsFieldsView />
        )}

        {activeTab === 'scanner' && (
          <AIDiseaseScannerView />
        )}

        {activeTab === 'sensors' && (
          <IoTSensorsView />
        )}

        {activeTab === 'irrigation' && (
          <IrrigationPredictionView />
        )}

        {activeTab === 'yield' && (
          <CropYieldForecastView />
        )}

        {activeTab === 'ndvi' && (
          <SatelliteNdviView />
        )}

        {activeTab === 'calendar' && (
          <SmartPlantingCalendarView />
        )}

        {activeTab === 'operations' && (
          <HarvestInventoryView />
        )}

        {activeTab === 'agronomist' && (
          <AgronomistReviewView />
        )}

        {activeTab === 'stress' && (
          <SystemStressBenchView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-farm-700/60 bg-farm-950 py-4 px-6 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <span>© 2026 FarmVision · Intelligent Agriculture & Crop Optimization Platform</span>
        <span>FAO-56 & Copernicus Sentinel-2 Enabled · Precision Ag Architecture</span>
      </footer>

      {/* Floating AI Agricultural Assistant */}
      <AIAssistantDrawer />
    </div>
  );
}
