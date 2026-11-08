import React, { useState, useEffect } from 'react';
import { IconDroplet, IconCheck, IconAlert, IconRefresh, IconActivity } from '../components/Icons';
import { api } from '../lib/api';

export default function IrrigationPredictionView() {
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('FLD-001');
  const [irrigation, setIrrigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operatingPump, setOperatingPump] = useState(false);
  const [pumpStatus, setPumpStatus] = useState({ running: false, action: null });

  const loadFieldsAndPrediction = async (fId) => {
    try {
      const fRes = await api.getFields();
      setFields(fRes);
      const targetId = fId || (fRes.length > 0 ? fRes[0].id : 'FLD-001');
      setSelectedFieldId(targetId);
      const irrRes = await api.getIrrigation(targetId);
      setIrrigation(irrRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFieldsAndPrediction();
  }, []);

  const handleFieldChange = async (fId) => {
    setSelectedFieldId(fId);
    setLoading(true);
    try {
      const irrRes = await api.getIrrigation(fId);
      setIrrigation(irrRes);
    } catch (err) {
      alert("Error load irigasi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePumpOverride = async (action) => {
    setOperatingPump(true);
    try {
      const res = await api.overrideIrrigation(selectedFieldId, action, 30);
      setPumpStatus({
        running: action === 'START_PUMP',
        action: res.action
      });
      alert(`Perintah irigasi '${action}' berhasil dikirim ke relay pompa petak ${selectedFieldId}!`);
    } catch (err) {
      alert("Error pompa: " + err.message);
    } finally {
      setOperatingPump(false);
    }
  };

  if (loading && !irrigation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Mengkalkulasi Evapotranspirasi FAO-56 Penman-Monteith...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-farm-900 via-farm-850 to-farm-900 border border-farm-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-agri-cyan/20 text-agri-cyan border border-agri-cyan/40">
              <IconDroplet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Intelligent Irrigation & Water Optimization Engine</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-agri-cyan border border-farm-700">
              FAO-56 Penman-Monteith Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kalkulasi keseimbangan air tanah harian: ET0 acuan, koefisien tanaman (Kc), curah hujan efektif, dan debit air presisi
          </p>
        </div>

        {/* Field Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-300 font-medium">Pilih Petak:</span>
          <select
            value={selectedFieldId}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-farm-500 font-semibold"
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.crop})</option>
            ))}
          </select>
        </div>
      </div>

      {irrigation && (
        <>
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Status Kelembapan Tanah</span>
              <div className="text-2xl font-extrabold text-agri-cyan font-mono mt-1">
                {irrigation.soil_moisture_pct}%
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Kapasitas Lapang: {irrigation.field_capacity_pct}% · Layu: {irrigation.wilting_point_pct}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Evapotranspirasi ETc</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {irrigation.crop_et_etc_mm} <span className="text-xs font-normal text-slate-400">mm/hari</span>
              </div>
              <span className="text-[10px] text-farm-400 mt-1 block">
                ET0: {irrigation.evapotranspiration_et0_mm} mm · Kc: {irrigation.crop_coefficient_kc}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Defisit Air Bersih</span>
              <div className="text-2xl font-extrabold text-agri-amber font-mono mt-1">
                {irrigation.water_deficit_mm} <span className="text-xs font-normal text-slate-400">mm</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Hujan Efektif: -{irrigation.effective_rainfall_mm} mm
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Volume Rekomendasi</span>
              <div className="text-2xl font-extrabold text-farm-300 font-mono mt-1">
                {irrigation.recommended_water_volume_liters.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">L</span>
              </div>
              <span className="text-[10px] text-agri-cyan mt-1 block">
                Durasi Pompa: ~{irrigation.pump_run_duration_minutes} menit
              </span>
            </div>
          </div>

          {/* Detailed Decision Grid & Override Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Prescription & Water Budget */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-farm-700/50">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Preskripsi Irigasi Petak {irrigation.field_name}</span>
                  </h3>
                  <span className="text-xs text-agri-cyan font-medium">{irrigation.crop}</span>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${
                  irrigation.irrigation_urgency === 'CRITICAL'
                    ? 'bg-agri-danger/20 text-agri-danger border border-agri-danger/40'
                    : irrigation.irrigation_urgency === 'HIGH'
                    ? 'bg-agri-amber/20 text-agri-amber border border-agri-amber/40'
                    : irrigation.irrigation_urgency === 'MODERATE'
                    ? 'bg-agri-cyan/20 text-agri-cyan border border-agri-cyan/40'
                    : 'bg-farm-500/20 text-farm-300 border border-farm-500/40'
                }`}>
                  URGENSI: {irrigation.irrigation_urgency}
                </span>
              </div>

              {/* Window Card */}
              <div className="p-4 rounded-xl bg-farm-950 border border-farm-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-farm-400">Jendela Waktu Penyiraman Terbaik (Irrigation Window)</span>
                <div className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-farm-400"></span>
                  <span>{irrigation.recommended_time_window}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Penyiraman pada jam ini meminimalkan laju evaporasi akibat sinar matahari langsung dan mengoptimalkan penyerapan perakaran tanaman.
                </p>
              </div>

              {/* Water Balance Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Perincian Neraca Air Tanah (Soil Water Balance)</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-lg bg-farm-850 border border-farm-700/40">
                    <span className="text-slate-300">Evapotranspirasi Acuan Standar (ET0 Penman-Monteith):</span>
                    <span className="font-mono font-bold text-slate-100">{irrigation.evapotranspiration_et0_mm} mm/hari</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-farm-850 border border-farm-700/40">
                    <span className="text-slate-300">Koefisien Tanaman Menurut Fase Pertumbuhan (Kc):</span>
                    <span className="font-mono font-bold text-agri-cyan">{irrigation.crop_coefficient_kc}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-farm-850 border border-farm-700/40">
                    <span className="text-slate-300">Kebutuhan Air Tanaman Harian (ETc = ET0 × Kc):</span>
                    <span className="font-mono font-bold text-white">{irrigation.crop_et_etc_mm} mm/hari</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-farm-850 border border-farm-700/40">
                    <span className="text-slate-300">Kontribusi Hujan Efektif Terserap Tanah:</span>
                    <span className="font-mono font-bold text-farm-400">-{irrigation.effective_rainfall_mm} mm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Pump Safeguards & Manual Override */}
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <IconActivity className="w-4 h-4 text-agri-cyan" />
                  <span>Kontrol Pompa & Relay Lapangan</span>
                </h3>

                <div className="p-4 rounded-xl bg-farm-950 border border-farm-700/50 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Status Pompa Irigasi:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${pumpStatus.running ? 'bg-farm-400 animate-ping' : 'bg-slate-500'}`}></span>
                    <span className="text-sm font-bold text-white font-mono">
                      {pumpStatus.running ? "AKTIF (MENGAIRKAN PETAK)" : "STANDBY (OFF)"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handlePumpOverride('START_PUMP')}
                    disabled={operatingPump}
                    className="w-full py-2.5 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-extrabold text-xs transition shadow-lg shadow-farm-500/20 active:scale-95 disabled:opacity-50"
                  >
                    Aktifkan Irigasi Presisi (Override)
                  </button>

                  <button
                    onClick={() => handlePumpOverride('EMERGENCY_SHUTOFF')}
                    disabled={operatingPump}
                    className="w-full py-2.5 rounded-xl bg-agri-danger hover:bg-red-600 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    Hentikan Pompa Darurat (Cut-Off)
                  </button>
                </div>

                {/* Safety Safeguards Checklist */}
                <div className="pt-3 border-t border-farm-700/50 space-y-2 text-[11px] text-slate-300">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitur Proteksi Keselamatan Pompa:</span>
                  <div className="flex items-center space-x-2">
                    <IconCheck className="w-3.5 h-3.5 text-farm-400" />
                    <span>Auto Cut-off jika kelembapan &gt; {irrigation.safeguards.auto_cutoff_moisture_threshold}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IconCheck className="w-3.5 h-3.5 text-farm-400" />
                    <span>Batas maksimal nyala kontinu: 180 menit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IconCheck className="w-3.5 h-3.5 text-farm-400" />
                    <span>Sensor dry-run prevention (anti-pompa kering)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
