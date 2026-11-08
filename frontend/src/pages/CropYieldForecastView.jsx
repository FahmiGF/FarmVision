import React, { useState, useEffect } from 'react';
import { IconChart, IconRefresh, IconSprout, IconCheck, IconActivity } from '../components/Icons';
import { api } from '../lib/api';

export default function CropYieldForecastView() {
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('FLD-001');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation Sliders State
  const [simParams, setSimParams] = useState({
    soil_ph: 6.5,
    avg_moisture: 65.0,
    nitrogen_kg: 130.0,
    phosphorus_kg: 60.0,
    potassium_kg: 80.0,
    rainfall_mm: 380.0
  });

  const loadData = async (fId) => {
    try {
      const fRes = await api.getFields();
      setFields(fRes);
      const targetId = fId || (fRes.length > 0 ? fRes[0].id : 'FLD-001');
      setSelectedFieldId(targetId);
      const yRes = await api.getYield(targetId);
      setPrediction(yRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFieldChange = async (fId) => {
    setSelectedFieldId(fId);
    setLoading(true);
    try {
      const yRes = await api.getYield(fId);
      setPrediction(yRes);
    } catch (err) {
      alert("Error yield: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    const field = fields.find(f => f.id === selectedFieldId) || fields[0];
    try {
      const res = await api.simulateYield({
        field_id: field.id,
        crop: field.crop,
        area_ha: field.area_ha,
        dap: field.days_after_planting,
        soil_ph: parseFloat(simParams.soil_ph),
        avg_moisture: parseFloat(simParams.avg_moisture),
        nitrogen_kg: parseFloat(simParams.nitrogen_kg),
        phosphorus_kg: parseFloat(simParams.phosphorus_kg),
        potassium_kg: parseFloat(simParams.potassium_kg),
        rainfall_mm: parseFloat(simParams.rainfall_mm)
      });
      setPrediction(res);
    } catch (err) {
      alert("Error simulasi: " + err.message);
    }
  };

  if (loading && !prediction) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Menjalankan model regresi panen XGBoost...</span>
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
            <span className="p-1.5 rounded-lg bg-farm-500/20 text-farm-400 border border-farm-500/40">
              <IconChart className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Machine Learning Crop Yield Forecasting</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-farm-300 border border-farm-700">
              Ensemble XGBoost + LightGBM Regressor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prediksi produktivitas ton/hektar berbasis histori cuaca, hara tanah NPK, kelembapan, dan interval kepercayaan 95%
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

      {prediction && (
        <>
          {/* Main Forecast Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Estimasi Produktivitas</span>
              <div className="text-2xl font-extrabold text-farm-300 font-mono mt-1">
                {prediction.predicted_yield_ton_per_ha} <span className="text-xs font-normal text-slate-400">ton/ha</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Luas Petak: {prediction.planted_area_ha} hektar
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Total Proyeksi Panen</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {prediction.total_estimated_production_ton} <span className="text-xs font-normal text-slate-400">ton</span>
              </div>
              <span className="text-[10px] text-agri-cyan mt-1 block">
                Komoditas: {prediction.crop}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Interval Kepercayaan (95% CI)</span>
              <div className="text-lg font-bold text-agri-amber font-mono mt-1">
                {prediction.confidence_interval_low} – {prediction.confidence_interval_high} <span className="text-xs font-normal text-slate-400">t/ha</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Rentang variasi agronomi terukur
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Skor Indeks Kesehatan Panen</span>
              <div className="text-2xl font-extrabold text-farm-400 font-mono mt-1">
                {prediction.yield_health_score}/100
              </div>
              <span className="text-[10px] text-farm-400 mt-1 block">
                Potensi Hasil: Sangat Optimal
              </span>
            </div>
          </div>

          {/* Grid: Drivers & What-If Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Yield Drivers & Harvest Window */}
            <div className="p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-5">
              <div className="pb-3 border-b border-farm-700/50">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Faktor Penentu Produktivitas (Explainable AI Yield Drivers)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Analisis kontribusi hara dan iklim mikro terhadap formasi hasil</p>
              </div>

              <div className="space-y-3">
                {prediction.key_drivers.map((drv, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-farm-950 border border-farm-700/50 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{drv.factor}</span>
                      <span className="font-mono text-farm-400 font-bold">{drv.impact}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-farm-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-farm-500 to-agri-cyan rounded-full"
                        style={{ width: `${drv.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Harvest Window Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-farm-850 to-farm-800 border border-farm-700/60 space-y-1">
                <span className="text-[10px] font-bold text-agri-cyan uppercase tracking-wider">Prakiraan Jendela Waktu Panen Optimal</span>
                <div className="text-base font-extrabold text-white font-mono">{prediction.estimated_harvest_window}</div>
                <p className="text-[11px] text-slate-300">
                  Umur tanaman saat ini: <strong>{prediction.days_after_planting} HST</strong> (Fase: {prediction.growth_stage}).
                </p>
              </div>
            </div>

            {/* Right Col: Interactive What-If Simulator */}
            <div className="p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-farm-700/50">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Simulator Skenario Pemupukan & Iklim ("What-If")
                </h3>
                <span className="text-[10px] font-mono text-farm-400">Live Simulation</span>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Soil pH Slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Derajat Keasaman Tanah (pH):</span>
                    <span className="font-mono font-bold text-farm-400">{simParams.soil_ph}</span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="8.5"
                    step="0.1"
                    value={simParams.soil_ph}
                    onChange={(e) => setSimParams({ ...simParams, soil_ph: e.target.value })}
                    className="w-full accent-farm-500 cursor-pointer"
                  />
                </div>

                {/* Avg Moisture */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Rata-rata Lengas Tanah (%):</span>
                    <span className="font-mono font-bold text-agri-cyan">{simParams.avg_moisture}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="1"
                    value={simParams.avg_moisture}
                    onChange={(e) => setSimParams({ ...simParams, avg_moisture: e.target.value })}
                    className="w-full accent-agri-cyan cursor-pointer"
                  />
                </div>

                {/* Nitrogen N */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Dosis Pupuk Nitrogen N (kg/ha):</span>
                    <span className="font-mono font-bold text-slate-100">{simParams.nitrogen_kg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="220"
                    step="5"
                    value={simParams.nitrogen_kg}
                    onChange={(e) => setSimParams({ ...simParams, nitrogen_kg: e.target.value })}
                    className="w-full accent-farm-400 cursor-pointer"
                  />
                </div>

                {/* Potassium K */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Dosis Pupuk Kalium K2O (kg/ha):</span>
                    <span className="font-mono font-bold text-slate-100">{simParams.potassium_kg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    step="5"
                    value={simParams.potassium_kg}
                    onChange={(e) => setSimParams({ ...simParams, potassium_kg: e.target.value })}
                    className="w-full accent-farm-400 cursor-pointer"
                  />
                </div>

                {/* Rainfall */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Akumulasi Hujan Musim (mm):</span>
                    <span className="font-mono font-bold text-agri-cyan">{simParams.rainfall_mm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="800"
                    step="20"
                    value={simParams.rainfall_mm}
                    onChange={(e) => setSimParams({ ...simParams, rainfall_mm: e.target.value })}
                    className="w-full accent-agri-cyan cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleRunSimulation}
                  className="w-full mt-2 py-2.5 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-extrabold text-xs transition shadow-lg shadow-farm-500/20 active:scale-95"
                >
                  Hitung Ulang Proyeksi Panen
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
