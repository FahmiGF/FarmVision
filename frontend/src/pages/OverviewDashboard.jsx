import React, { useState, useEffect } from 'react';
import {
  IconSprout, IconTractor, IconRadio, IconDroplet, IconChart,
  IconSun, IconAlert, IconCheck, IconRefresh, IconScan
} from '../components/Icons';
import { api } from '../lib/api';

export default function OverviewDashboard({ onNavigateTab }) {
  const [kpis, setKpis] = useState(null);
  const [fields, setFields] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticking, setTicking] = useState(false);

  const loadData = async () => {
    try {
      const [kRes, fRes, aRes] = await Promise.all([
        api.getKPIs(),
        api.getFields(),
        api.getAlerts()
      ]);
      setKpis(kRes);
      setFields(fRes);
      setAlerts(aRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSensorTick = async () => {
    setTicking(true);
    try {
      await api.tickSensors();
      await loadData();
    } finally {
      setTicking(false);
    }
  };

  const handleAckAlert = async (id) => {
    try {
      await api.ackAlert(id);
      setAlerts(prev => prev.map(a => (a.id === id ? { ...a, is_acknowledged: true } : a)));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center space-x-3 text-farm-400">
          <div className="w-6 h-6 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-mono text-sm">Memuat telemetri pertanian FarmVision...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Farm Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-farm-900 via-farm-850 to-farm-900 border border-farm-700/80 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-farm-500/20 border border-farm-500/40 flex items-center justify-center text-farm-400">
            <IconSprout className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">{kpis?.farm_name || "Lahan Pertanian"}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-farm-800 text-farm-300 border border-farm-700 font-semibold">
                {kpis?.location}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Musim Tanam Rendengan 2026/2027 · Total Lahan: <strong className="text-slate-200">{kpis?.total_farm_area_ha} ha</strong> ({kpis?.managed_fields_area_ha} ha aktif dibudidayakan)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSensorTick}
            disabled={ticking}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-farm-800 hover:bg-farm-750 border border-farm-700 text-slate-200 text-xs font-semibold transition active:scale-95"
          >
            <IconRefresh className={`w-4 h-4 text-farm-400 ${ticking ? 'animate-spin' : ''}`} />
            <span>{ticking ? 'Sinkronisasi...' : 'Sinkronkan Sensor IoT'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('scanner')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-extrabold text-xs transition shadow-lg shadow-farm-500/20 active:scale-95"
          >
            <IconScan className="w-4 h-4 text-farm-950" />
            <span>Pindai Daun AI</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
          <span className="text-[11px] font-medium text-slate-400">Total Luas Lahan</span>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">{kpis?.total_farm_area_ha} <span className="text-xs font-normal text-slate-400">ha</span></div>
          <span className="text-[10px] text-farm-400 mt-1 block">100% Hak Kelola</span>
        </div>

        <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
          <span className="text-[11px] font-medium text-slate-400">Petak Aktif</span>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">{kpis?.active_fields_count} <span className="text-xs font-normal text-slate-400">petak</span></div>
          <span className="text-[10px] text-agri-cyan mt-1 block">{kpis?.managed_fields_area_ha} ha tertanami</span>
        </div>

        <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
          <span className="text-[11px] font-medium text-slate-400">Kesehatan Tanaman</span>
          <div className="text-xl font-extrabold text-farm-400 mt-1 font-mono">{kpis?.healthy_crop_pct}%</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Status Prima / Optimal</span>
        </div>

        <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
          <span className="text-[11px] font-medium text-slate-400">Sensor IoT Lapangan</span>
          <div className="text-xl font-extrabold text-agri-cyan mt-1 font-mono">{kpis?.online_sensors_count}/{kpis?.total_sensors_count}</div>
          <span className="text-[10px] text-farm-400 mt-1 block flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-farm-400 animate-ping"></span>
            <span>ESP32 Gateway Online</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
          <span className="text-[11px] font-medium text-slate-400">Peringatan Kritis</span>
          <div className={`text-xl font-extrabold mt-1 font-mono ${kpis?.active_alerts_count > 0 ? 'text-agri-amber' : 'text-farm-400'}`}>
            {kpis?.active_alerts_count}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Perlu Tindakan Lapangan</span>
        </div>

        <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
          <span className="text-[11px] font-medium text-slate-400">Proyeksi Panen</span>
          <div className="text-xl font-extrabold text-agri-cyan mt-1 font-mono">{kpis?.total_upcoming_yield_ton} <span className="text-xs font-normal text-slate-400">ton</span></div>
          <span className="text-[10px] text-slate-400 mt-1 block">Model Ensemble XGBoost</span>
        </div>
      </div>

      {/* Main Grid: Weather & Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Fields Condition */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Monitoring Petak Lahan Real-Time</span>
                <span className="w-2 h-2 rounded-full bg-farm-400 animate-pulse"></span>
              </h3>
              <p className="text-xs text-slate-400">Kondisi tanaman, fase pertumbuhan, dan data sensor live</p>
            </div>
            <button
              onClick={() => onNavigateTab('fields')}
              className="text-xs text-farm-400 hover:text-farm-300 font-semibold flex items-center space-x-1"
            >
              <span>Kelola Semua Petak →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div
                key={f.id}
                onClick={() => onNavigateTab('fields')}
                className="p-4 rounded-xl bg-farm-900 hover:bg-farm-850 border border-farm-700/80 transition-all duration-200 cursor-pointer shadow-md hover:border-farm-500/50 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{f.id}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-farm-300 transition">{f.name}</h4>
                    <p className="text-xs text-farm-400 font-medium">{f.crop} · {f.crop_variety}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    f.health_status === 'HEALTHY'
                      ? 'bg-farm-500/20 text-farm-300 border border-farm-500/40'
                      : f.health_status === 'WARNING'
                      ? 'bg-agri-amber/20 text-agri-amber border border-agri-amber/40'
                      : 'bg-agri-danger/20 text-agri-danger border border-agri-danger/40'
                  }`}>
                    {f.health_status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-farm-700/50 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px]">Luas</span>
                    <div className="font-semibold text-slate-200">{f.area_ha} ha</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Umur Tanam</span>
                    <div className="font-semibold text-slate-200">{f.days_after_planting} HST</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Irigasi</span>
                    <div className="font-semibold text-agri-cyan truncate">{f.irrigation_system.split(' ')[0]}</div>
                  </div>
                </div>

                <div className="mt-2.5 text-[11px] text-slate-300 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span className="text-[10px] text-slate-400">Fase:</span>
                  <span className="font-medium text-slate-200 truncate">{f.growth_stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Weather Widget & Live Alerts */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-farm-900 to-farm-850 border border-farm-700/80 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-farm-700/50">
              <div className="flex items-center space-x-2">
                <IconSun className="w-5 h-5 text-agri-amber animate-spin-slow" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cuaca Mikro Pertanian</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Open-Meteo API</span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-3xl font-extrabold text-white font-mono">{kpis?.weather_summary?.temp_c}°C</div>
                <p className="text-xs text-slate-300 mt-0.5">{kpis?.weather_summary?.condition}</p>
              </div>
              <div className="text-right text-xs space-y-1">
                <div className="text-slate-400">Kelembapan: <strong className="text-slate-200">{kpis?.weather_summary?.humidity_pct}%</strong></div>
                <div className="text-slate-400">Curah Hujan 24j: <strong className="text-agri-cyan">{kpis?.weather_summary?.rainfall_forecast_24h_mm} mm</strong></div>
                <div className="text-slate-400">Angin: <strong className="text-slate-200">{kpis?.weather_summary?.wind_speed_kmh} km/h</strong></div>
              </div>
            </div>

            <div className="mt-3.5 p-2 rounded-lg bg-farm-950/70 border border-farm-700/40 text-[11px] text-slate-300 flex items-center space-x-2">
              <IconDroplet className="w-4 h-4 text-agri-cyan flex-shrink-0" />
              <span>Kondisi evaporasi hari ini <strong>3.4 mm/hari</strong>. Rekomendasi penyiraman optimal pada pukul 16:30 WIB.</span>
            </div>
          </div>

          {/* Policy & Operational Alerts */}
          <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-farm-700/50">
              <div className="flex items-center space-x-2">
                <IconAlert className="w-4 h-4 text-agri-amber" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Peringatan & Tugas Lapangan</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{alerts.length} notifikasi</span>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-3 rounded-lg border text-xs transition ${
                    al.severity === 'CRITICAL'
                      ? 'bg-agri-danger/10 border-agri-danger/40 text-slate-200'
                      : al.severity === 'WARNING'
                      ? 'bg-agri-amber/10 border-agri-amber/40 text-slate-200'
                      : 'bg-farm-800 border-farm-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white leading-tight">{al.title}</span>
                    {!al.is_acknowledged && (
                      <button
                        onClick={() => handleAckAlert(al.id)}
                        className="p-1 rounded bg-farm-700 hover:bg-farm-600 text-slate-200 text-[10px] flex items-center space-x-1"
                        title="Tandai Selesai"
                      >
                        <IconCheck className="w-3 h-3 text-farm-300" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{al.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Sumber: {al.source}</span>
                    <span>{al.is_acknowledged ? '✓ Diakui' : '● Menunggu'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
