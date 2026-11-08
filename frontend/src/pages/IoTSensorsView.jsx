import React, { useState, useEffect } from 'react';
import { IconRadio, IconRefresh, IconAlert, IconCheck, IconDroplet, IconSun } from '../components/Icons';
import { api } from '../lib/api';

export default function IoTSensorsView() {
  const [sensors, setSensors] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticking, setTicking] = useState(false);

  const [selectedSensorId, setSelectedSensorId] = useState('ESP32-SUB-01');
  const [anomalyType, setAnomalyType] = useState('MOISTURE_CRITICAL_DROP');

  const loadData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        api.getSensors(),
        api.getTelemetry()
      ]);
      setSensors(sRes);
      setTelemetry(tRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  const handleTick = async () => {
    setTicking(true);
    try {
      await api.tickSensors();
      await loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setTicking(false);
    }
  };

  const handleInjectAnomaly = async () => {
    try {
      await api.injectAnomaly(selectedSensorId, anomalyType);
      await loadData();
      alert(`Anomali '${anomalyType}' berhasil disimulasikan pada node ${selectedSensorId}!`);
    } catch (err) {
      alert("Error inject anomaly: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Menghubungkan ke broker MQTT & Gateway ESP32...</span>
        </div>
      </div>
    );
  }

  const latestReading = telemetry[0] || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-farm-900 via-farm-850 to-farm-900 border border-farm-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-agri-cyan/20 text-agri-cyan border border-agri-cyan/40">
              <IconRadio className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">IoT Soil & Environmental Monitoring Network</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-farm-300 border border-farm-700">
              ESP32 FreeRTOS + RS485 Modbus
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transmisi telemetri nirkabel: kelembapan tanah, derajat keasaman (pH), hara NPK, suhu kanopi, dan debit irigasi
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleTick}
            disabled={ticking}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-farm-800 hover:bg-farm-750 border border-farm-700 text-slate-200 text-xs font-semibold transition active:scale-95"
          >
            <IconRefresh className={`w-4 h-4 text-farm-400 ${ticking ? 'animate-spin' : ''}`} />
            <span>Kirim Telemetri Live</span>
          </button>
        </div>
      </div>

      {/* Anomaly Simulator Controls Strip */}
      <div className="p-4 rounded-xl bg-farm-900/90 border border-farm-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <IconAlert className="w-4 h-4 text-agri-amber" />
          <span className="font-bold text-white">Simulator Kondisi Ekstrem & Anomali Sensor:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSensorId}
            onChange={(e) => setSelectedSensorId(e.target.value)}
            className="bg-farm-950 border border-farm-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            {sensors.map(s => (
              <option key={s.id} value={s.id}>{s.id} ({s.field_name})</option>
            ))}
          </select>

          <select
            value={anomalyType}
            onChange={(e) => setAnomalyType(e.target.value)}
            className="bg-farm-950 border border-farm-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="MOISTURE_CRITICAL_DROP">Kelembapan Anjlok (Kekeringan Akar)</option>
            <option value="SOIL_ACIDIC_SPIKE">pH Tanah Masam Ekstrem (pH 4.2)</option>
            <option value="SENSOR_DISCONNECTED">Sensor Terputus (Offline LoRa)</option>
          </select>

          <button
            onClick={handleInjectAnomaly}
            className="px-3.5 py-1.5 rounded-lg bg-agri-amber hover:bg-amber-600 text-farm-950 font-bold transition active:scale-95"
          >
            Suntikkan Anomali
          </button>
        </div>
      </div>

      {/* Active Sensor Node Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensors.map((s) => {
          // Find latest reading for this sensor
          const r = telemetry.find(t => t.sensor_id === s.id) || {};
          const isAbnormal = r.is_abnormal || false;

          return (
            <div
              key={s.id}
              className={`p-4 rounded-xl border transition shadow-md ${
                isAbnormal
                  ? 'bg-agri-danger/10 border-agri-danger/60'
                  : 'bg-farm-900 border-farm-700/80 hover:border-farm-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-farm-400">{s.id}</span>
                  <h4 className="text-xs font-bold text-white mt-0.5 truncate">{s.field_name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{s.sensor_type}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                  r.freshness_status === 'OFFLINE'
                    ? 'bg-agri-danger/20 text-agri-danger'
                    : isAbnormal
                    ? 'bg-agri-amber/20 text-agri-amber animate-pulse'
                    : 'bg-farm-500/20 text-farm-300'
                }`}>
                  {r.freshness_status === 'OFFLINE' ? 'OFFLINE' : isAbnormal ? 'ALERT' : 'FRESH'}
                </span>
              </div>

              {/* Primary Sensor Values */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-farm-950/70 border border-farm-700/40">
                  <span className="text-[10px] text-slate-400">Kelembapan Tanah</span>
                  <div className={`text-base font-extrabold font-mono ${
                    r.soil_moisture_pct < 30 ? 'text-agri-danger' : 'text-agri-cyan'
                  }`}>
                    {r.soil_moisture_pct || s.base_moisture}%
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-farm-950/70 border border-farm-700/40">
                  <span className="text-[10px] text-slate-400">pH Tanah</span>
                  <div className={`text-base font-extrabold font-mono ${
                    r.soil_ph < 5.0 ? 'text-agri-danger' : 'text-farm-300'
                  }`}>
                    {r.soil_ph || s.base_ph}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-farm-950/70 border border-farm-700/40">
                  <span className="text-[10px] text-slate-400">Suhu Udara</span>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    {r.air_temperature_c || 28.5}°C
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-farm-950/70 border border-farm-700/40">
                  <span className="text-[10px] text-slate-400">NPK (N-P-K)</span>
                  <div className="text-[11px] font-bold text-farm-400 font-mono truncate">
                    {r.nitrogen_mg_kg || s.base_n}-{r.phosphorus_mg_kg || s.base_p}-{r.potassium_mg_kg || s.base_k}
                  </div>
                </div>
              </div>

              {isAbnormal && (
                <div className="mt-2 text-[10px] text-agri-danger font-medium leading-tight">
                  ⚠️ {r.abnormal_reason}
                </div>
              )}

              {/* Hardware meta footer */}
              <div className="mt-2.5 pt-2 border-t border-farm-700/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Baterai: {s.battery_pct}%</span>
                <span>RSSI: {s.rssi_dbm} dBm</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Telemetry Time-Series Log Table */}
      <div className="p-5 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span>Log Aliran Telemetri Sensor Real-Time</span>
            <span className="w-1.5 h-1.5 rounded-full bg-agri-cyan animate-ping"></span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Menampilkan {telemetry.length} data paket</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-farm-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-farm-700">
              <tr>
                <th className="py-2 px-3">Waktu Transmisi</th>
                <th className="py-2 px-3">Sensor Node</th>
                <th className="py-2 px-3">Petak Lahan</th>
                <th className="py-2 px-3">Kelembapan</th>
                <th className="py-2 px-3">pH Tanah</th>
                <th className="py-2 px-3">Suhu Tanah / Udara</th>
                <th className="py-2 px-3">NPK (mg/kg)</th>
                <th className="py-2 px-3">Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-farm-700/40 font-mono text-[11px]">
              {telemetry.map((t, idx) => (
                <tr key={idx} className={t.is_abnormal ? 'bg-agri-danger/10' : 'hover:bg-farm-850/50'}>
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(t.timestamp).toLocaleTimeString('id-ID')}
                  </td>
                  <td className="py-2 px-3 font-bold text-farm-300">{t.sensor_id}</td>
                  <td className="py-2 px-3 text-slate-200">{t.field_name}</td>
                  <td className={`py-2 px-3 font-bold ${t.soil_moisture_pct < 30 ? 'text-agri-danger' : 'text-agri-cyan'}`}>
                    {t.soil_moisture_pct}%
                  </td>
                  <td className={`py-2 px-3 ${t.soil_ph < 5.0 ? 'text-agri-danger font-bold' : 'text-slate-200'}`}>
                    {t.soil_ph}
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    {t.soil_temperature_c}°C / {t.air_temperature_c}°C
                  </td>
                  <td className="py-2 px-3 text-farm-400">
                    {t.nitrogen_mg_kg} · {t.phosphorus_mg_kg} · {t.potassium_mg_kg}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      t.freshness_status === 'OFFLINE' ? 'bg-agri-danger/20 text-agri-danger' : 'bg-farm-500/20 text-farm-300'
                    }`}>
                      {t.freshness_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
