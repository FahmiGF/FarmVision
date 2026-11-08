import React, { useState, useEffect } from 'react';
import { IconScan, IconCheck, IconAlert, IconRefresh, IconUserCheck, IconSprout } from '../components/Icons';
import { api } from '../lib/api';

export default function AIDiseaseScannerView() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  const [selectedCrop, setSelectedCrop] = useState('Tomat (Tomato)');
  const [presetDisease, setPresetDisease] = useState('TOMATO_EARLY_BLIGHT');

  const presets = [
    { label: "Tomat: Hawar Daun Dini (Alternaria)", crop: "Tomat (Tomato)", code: "TOMATO_EARLY_BLIGHT" },
    { label: "Padi: Blas Daun (Pyricularia)", crop: "Padi (Rice)", code: "RICE_BLAST" },
    { label: "Cabai: Antraknosa / Patek (Colletotrichum)", crop: "Cabai Merah (Chili)", code: "CHILI_ANTHRACNOSE" },
    { label: "Jagung: Hawar Daun (Exserohilum)", crop: "Jagung (Corn)", code: "CORN_NORTHERN_BLIGHT" },
    { label: "Daun Sehat Prima (Kontrol Negatif)", crop: "Padi (Rice)", code: "HEALTHY_LEAF" },
  ];

  const loadScans = async () => {
    try {
      const res = await api.getDiseaseScans();
      setScans(res);
      if (res.length > 0 && !selectedScan) {
        setSelectedScan(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await api.analyzeDisease(selectedCrop, presetDisease);
      setScans(prev => [res, ...prev]);
      setSelectedScan(res);
    } catch (err) {
      alert("Error analisis daun: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedScan) return;
    try {
      const note = prompt("Catatan rekomendasi agronomis:", `Ditinjau oleh Tim Agronomi pada ${new Date().toLocaleDateString('id-ID')}`);
      if (note === null) return;
      const res = await api.reviewDiseaseScan(selectedScan.id, status, note);
      setSelectedScan(res.scan);
      setScans(prev => prev.map(s => s.id === selectedScan.id ? res.scan : s));
    } catch (err) {
      alert("Error submit review: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat model AI Plant Pathology...</span>
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
            <span className="p-1.5 rounded-lg bg-agri-violet/20 text-agri-violet border border-agri-violet/40">
              <IconScan className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">AI Computer Vision Plant Pathology Scanner</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 border border-farm-700 text-farm-300">
              EfficientNet-B0 + MobileNetV3
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sistem klasifikasi multi-penyakit tanaman tropis, estimasi luas lesi daun, dan rekomendasi Pengendalian Hama Terpadu (PHT)
          </p>
        </div>

        {/* Scan Selector / Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={presetDisease}
            onChange={(e) => {
              setPresetDisease(e.target.value);
              const p = presets.find(item => item.code === e.target.value);
              if (p) setSelectedCrop(p.crop);
            }}
            className="bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-farm-500"
          >
            {presets.map(p => (
              <option key={p.code} value={p.code}>{p.label}</option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-farm-500 to-agri-cyan text-farm-950 font-extrabold text-xs transition shadow-lg shadow-farm-500/20 active:scale-95 disabled:opacity-50"
          >
            <IconScan className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Inference CNN...' : 'Jalankan Diagnosis AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Diagnosis View & Scan History List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Selected Diagnosis Detail */}
        {selectedScan && (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-5">
              {/* Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-farm-700/50">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-farm-400">{selectedScan.id}</span>
                    <span className="text-xs text-slate-400">· {new Date(selectedScan.created_at).toLocaleString('id-ID')}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">{selectedScan.disease_name}</h3>
                  <p className="text-xs font-mono text-agri-cyan italic mt-0.5">Patogen: {selectedScan.pathogen}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                    selectedScan.severity_level === 'NONE'
                      ? 'bg-farm-500/20 text-farm-300 border border-farm-500/40'
                      : selectedScan.severity_level === 'MODERATE'
                      ? 'bg-agri-amber/20 text-agri-amber border border-agri-amber/40'
                      : 'bg-agri-danger/20 text-agri-danger border border-agri-danger/40'
                  }`}>
                    Keparahan: {selectedScan.severity_level}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-farm-800 text-slate-200 border border-farm-700">
                    Akurasi: {(selectedScan.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Severity & Affected Area Heat Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Estimasi Kerusakan Jaringan Daun (Severity Index):</span>
                  <span className="font-mono font-bold text-agri-amber">{selectedScan.affected_area_pct}% Luas Kanopi</span>
                </div>
                <div className="w-full h-3 rounded-full bg-farm-950 border border-farm-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      selectedScan.affected_area_pct < 5
                        ? 'bg-farm-400'
                        : selectedScan.affected_area_pct < 25
                        ? 'bg-agri-cyan'
                        : selectedScan.affected_area_pct < 40
                        ? 'bg-agri-amber'
                        : 'bg-agri-danger'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, selectedScan.affected_area_pct))}%` }}
                  ></div>
                </div>
              </div>

              {/* Symptoms Checklist */}
              <div className="p-4 rounded-xl bg-farm-950/70 border border-farm-700/50">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Gejala Patologis Teridentifikasi</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedScan.symptoms.map((s, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-agri-amber mt-0.5">●</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations: Organic & Chemical */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-farm-850 border border-farm-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-farm-400">Rekomendasi Organik / Hayati</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedScan.organic_recommendation}</p>
                </div>
                <div className="p-4 rounded-xl bg-farm-850 border border-farm-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-agri-cyan">Rekomendasi Kimiawi Terukur</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedScan.chemical_recommendation}</p>
                </div>
              </div>

              {/* Agronomist Review Workflow Bar */}
              <div className="p-4 rounded-xl bg-farm-950 border border-farm-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status Validasi Ahli Agronomi</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`text-xs font-mono font-bold ${
                      selectedScan.agronomist_status === 'APPROVED'
                        ? 'text-farm-400'
                        : selectedScan.agronomist_status === 'REVISED'
                        ? 'text-agri-amber'
                        : 'text-slate-400'
                    }`}>
                      {selectedScan.agronomist_status}
                    </span>
                    {selectedScan.agronomist_notes && (
                      <span className="text-xs text-slate-300 italic">· "{selectedScan.agronomist_notes}"</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReview('APPROVED')}
                    className="px-3 py-1.5 rounded-lg bg-farm-600 hover:bg-farm-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Setujui (Approve)</span>
                  </button>
                  <button
                    onClick={() => handleReview('REVISED')}
                    className="px-3 py-1.5 rounded-lg bg-farm-800 hover:bg-farm-750 text-slate-200 border border-farm-700 text-xs font-semibold transition"
                  >
                    <span>Revisi Dosis</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column (1 Col): Scan History List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Histori Pemindaian Daun</h4>
            <span className="text-[10px] font-mono text-slate-400">{scans.length} riwayat</span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {scans.map((sc) => (
              <div
                key={sc.id}
                onClick={() => setSelectedScan(sc)}
                className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                  selectedScan?.id === sc.id
                    ? 'bg-farm-850 border-farm-500 shadow-md'
                    : 'bg-farm-900 hover:bg-farm-850/80 border-farm-700/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{sc.id}</span>
                    <h5 className="text-xs font-bold text-white mt-0.5">{sc.disease_name}</h5>
                    <p className="text-[11px] text-slate-300">{sc.crop}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    sc.severity_level === 'NONE'
                      ? 'bg-farm-500/20 text-farm-300'
                      : sc.severity_level === 'MODERATE'
                      ? 'bg-agri-amber/20 text-agri-amber'
                      : 'bg-agri-danger/20 text-agri-danger'
                  }`}>
                    {sc.severity_level}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-farm-700/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Akurasi: {(sc.confidence * 100).toFixed(1)}%</span>
                  <span>{sc.agronomist_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
