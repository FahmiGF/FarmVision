import React, { useState, useEffect } from 'react';
import { IconUserCheck, IconCheck, IconScan, IconAlert } from '../components/Icons';
import { api } from '../lib/api';

export default function AgronomistReviewView() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.getDiseaseScans();
      setScans(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    const note = prompt("Catatan persetujuan resep agronomi:", "Resep disetujui. Rekomendasi rotasi fungisida sesuai SOP.");
    if (note === null) return;
    try {
      const res = await api.reviewDiseaseScan(id, "APPROVED", note);
      setScans(prev => prev.map(s => s.id === id ? res.scan : s));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat antrean tinjauan agronomis...</span>
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
              <IconUserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Agronomist Clinical Review & Sign-Off Center</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-farm-300 border border-farm-700">
              Human-in-the-Loop Protocol
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validasi diagnosis computer vision oleh ahli agronomi tersertifikasi untuk kepatuhan dosis pestisida & kesehatan tanaman
          </p>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="space-y-4">
        {scans.map((sc) => (
          <div
            key={sc.id}
            className={`p-5 rounded-2xl border shadow-lg space-y-3 transition ${
              sc.agronomist_status === 'APPROVED'
                ? 'bg-farm-900/90 border-farm-700/80'
                : 'bg-farm-900 border-agri-amber/50 shadow-agri-amber/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-farm-700/50">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-farm-400">{sc.id}</span>
                <h3 className="text-sm font-bold text-white">{sc.disease_name}</h3>
                <span className="text-xs text-slate-400">· {sc.crop}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                  sc.agronomist_status === 'APPROVED' ? 'bg-farm-500/20 text-farm-300' : 'bg-agri-amber/20 text-agri-amber'
                }`}>
                  Status: {sc.agronomist_status}
                </span>
                <span className="text-xs font-mono text-slate-400">Akurasi AI: {(sc.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-farm-950/70 border border-farm-700/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Diagnosa & Gejala:</span>
                <p className="text-slate-200">Patogen: <strong className="text-agri-cyan">{sc.pathogen}</strong></p>
                <p className="text-slate-300">Estimasi Luas Kerusakan: <strong className="text-agri-amber">{sc.affected_area_pct}%</strong></p>
              </div>

              <div className="p-3 rounded-xl bg-farm-950/70 border border-farm-700/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-farm-400">Catatan Agronomis:</span>
                <p className="text-slate-200 italic">
                  {sc.agronomist_notes ? `"${sc.agronomist_notes}"` : "Belum ada catatan validasi."}
                </p>
              </div>
            </div>

            {sc.agronomist_status !== 'APPROVED' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleApprove(sc.id)}
                  className="px-4 py-2 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95"
                >
                  <IconCheck className="w-4 h-4 text-farm-950" />
                  <span>Validasi & Terbitkan Rekomendasi Resmi</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
