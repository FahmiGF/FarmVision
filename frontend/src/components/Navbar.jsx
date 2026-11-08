import React, { useState } from 'react';
import {
  IconSprout, IconTractor, IconScan, IconRadio, IconDroplet,
  IconChart, IconSatellite, IconCalendar, IconBox, IconUserCheck,
  IconActivity, IconAlert
} from './Icons';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onSwitchRole,
  farms,
  activeFarmId,
  onSwitchFarm,
  alertCount = 0
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFarmMenu, setShowFarmMenu] = useState(false);

  const roles = [
    "Super Admin",
    "Farm Owner",
    "Farm Manager",
    "Agronomist",
    "Field Worker",
    "IoT Technician"
  ];

  const currentFarm = farms.find(f => f.id === activeFarmId) || farms[0];

  const navItems = [
    { id: 'overview', label: 'Ringkasan', icon: IconSprout },
    { id: 'fields', label: 'Lahan & Petak', icon: IconTractor },
    { id: 'scanner', label: 'AI Diagnosis', icon: IconScan, badge: 'CV' },
    { id: 'sensors', label: 'IoT & Tanah', icon: IconRadio, pulse: true },
    { id: 'irrigation', label: 'Irigasi FAO-56', icon: IconDroplet },
    { id: 'yield', label: 'Prediksi Panen', icon: IconChart },
    { id: 'ndvi', label: 'Satelit NDVI', icon: IconSatellite },
    { id: 'calendar', label: 'Kalender & Cuaca', icon: IconCalendar },
    { id: 'operations', label: 'Panen & Logistik', icon: IconBox },
    { id: 'agronomist', label: 'Agronomis', icon: IconUserCheck },
    { id: 'stress', label: 'Stress Bench', icon: IconActivity, highlight: true },
  ];

  return (
    <header className="bg-farm-900 border-b border-farm-700/70 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-lg shadow-black/20">
      {/* Top Banner & Control Strip */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between border-b border-farm-700/40 text-xs">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-farm-500 to-agri-cyan flex items-center justify-center text-white shadow-md shadow-farm-500/20">
            <IconSprout className="w-5 h-5 text-farm-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">Farm<span className="text-farm-400">Vision</span></span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-farm-800 border border-farm-700 text-farm-300 font-semibold">SAAS v2.4</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Intelligent Agriculture & Crop Optimization Platform</p>
          </div>
        </div>

        {/* Farm Selector & Role Badge */}
        <div className="flex items-center space-x-3">
          {/* Farm Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowFarmMenu(!showFarmMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-farm-850 hover:bg-farm-800 border border-farm-700 text-slate-200 transition"
            >
              <IconTractor className="w-3.5 h-3.5 text-farm-400" />
              <span className="font-medium max-w-[140px] truncate">{currentFarm ? currentFarm.name : "Pilih Lahan"}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>
            {showFarmMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-farm-850 border border-farm-700 rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider border-b border-farm-700/50">
                  Pilih Area Perkebunan
                </div>
                {farms.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSwitchFarm(f.id);
                      setShowFarmMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col transition hover:bg-farm-800 ${
                      f.id === activeFarmId ? 'bg-farm-800/80 text-farm-300 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{f.name}</span>
                    <span className="text-[10px] text-slate-400">{f.location} · {f.total_area_ha} ha</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-farm-800 hover:bg-farm-700/80 border border-farm-700 text-slate-200 transition"
            >
              <div className="w-2 h-2 rounded-full bg-farm-400 animate-pulse"></div>
              <span className="font-mono text-farm-300 font-semibold">{user.role}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>
            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-farm-850 border border-farm-700 rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider border-b border-farm-700/50">
                  Simulasi Hak Akses (RBAC)
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onSwitchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition hover:bg-farm-800 ${
                      user.role === r ? 'text-farm-400 font-bold bg-farm-800' : 'text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Pill */}
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-farm-950/80 border border-farm-700/60">
            <div className="w-5 h-5 rounded-full bg-farm-600 flex items-center justify-center text-[10px] font-bold text-white">
              FG
            </div>
            <span className="text-slate-300 font-medium">{user.name}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Horizontal Navigation */}
      <nav className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto py-1.5 text-xs no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-farm-500 text-farm-950 font-bold shadow-md shadow-farm-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-farm-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-farm-950' : item.highlight ? 'text-agri-amber' : 'text-farm-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                  isActive ? 'bg-farm-950 text-farm-300' : 'bg-farm-800 text-agri-cyan border border-farm-700'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.pulse && (
                <span className="w-1.5 h-1.5 rounded-full bg-agri-cyan animate-ping"></span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
