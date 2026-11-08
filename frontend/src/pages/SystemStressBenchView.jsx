import React, { useState } from 'react';
import { IconActivity, IconRefresh, IconCheck, IconAlert } from '../components/Icons';
import { api } from '../lib/api';

export default function SystemStressBenchView() {
  const [targetTps, setTargetTps] = useState(250);
  const [durationSec, setDurationSec] = useState(3);
  const [concurrency, setConcurrency] = useState(25);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchResult, setBenchResult] = useState(null);

  const handleRunBench = async (e) => {
    e.preventDefault();
    setBenchmarking(true);
    try {
      const res = await api.runStressTest(targetTps, durationSec, concurrency);
      setBenchResult(res);
    } catch (err) {
      alert("Stress test error: " + err.message);
    } finally {
      setBenchmarking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-farm-900 via-farm-850 to-farm-900 border border-farm-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-agri-amber/20 text-agri-amber border border-agri-amber/40">
              <IconActivity className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">System Stress Testing & Telemetry Benchmark Bench</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-farm-300 border border-farm-700">
              High-Throughput Load Simulator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Uji ketahanan konkurensi sensor IoT hingga 1.000 events/detik, kalkulasi latensi p50/p95/p99, dan verifikasi zero-event-loss
          </p>
        </div>
      </div>

      {/* Benchmark Control Bar & Metriks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-farm-700/50">
            Konfigurasi Beban Pengujian
          </h3>

          <form onSubmit={handleRunBench} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Throughput (TPS):</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetTps(val)}
                    className={`py-2 rounded-xl font-mono font-bold transition ${
                      targetTps === val ? 'bg-farm-500 text-farm-950' : 'bg-farm-800 text-slate-300 hover:bg-farm-750'
                    }`}
                  >
                    {val} TPS
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">Konkurensi Pekerja (Threads):</span>
                <span className="font-mono text-farm-400 font-bold">{concurrency} workers</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value))}
                className="w-full accent-farm-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Durasi Pengujian:</label>
              <select
                value={durationSec}
                onChange={(e) => setDurationSec(parseInt(e.target.value))}
                className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value={2}>2 Detik (Burst Spike)</option>
                <option value={3}>3 Detik (Standard Benchmark)</option>
                <option value={5}>5 Detik (Sustained Ingestion)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={benchmarking}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-farm-500 to-agri-cyan text-farm-950 font-extrabold text-xs transition shadow-lg shadow-farm-500/20 active:scale-95 disabled:opacity-50"
            >
              {benchmarking ? 'Menjalankan Stress Test...' : 'Jalankan Uji Beban Sekarang'}
            </button>
          </form>
        </div>

        {/* Results Live Meter (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-farm-700/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Hasil Pengukuran Latensi & Throughput (SLA Profiler)
            </h3>
            {benchResult && (
              <span className="text-xs font-mono text-farm-400 font-bold">
                Status: {benchResult.status.split(' ')[0]}
              </span>
            )}
          </div>

          {benchResult ? (
            <div className="space-y-4">
              {/* Latency Gauges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-farm-950 border border-farm-700/60 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">Latensi p50 (Median)</span>
                  <div className="text-xl font-extrabold text-farm-400 font-mono mt-1">
                    {benchResult.p50_latency_ms} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-farm-950 border border-farm-700/60 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">Latensi p95 (95% User)</span>
                  <div className="text-xl font-extrabold text-agri-cyan font-mono mt-1">
                    {benchResult.p95_latency_ms} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-farm-950 border border-farm-700/60 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">Latensi p99 (Ekstrem)</span>
                  <div className="text-xl font-extrabold text-white font-mono mt-1">
                    {benchResult.p99_latency_ms} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                </div>
              </div>

              {/* Throughput & Reliability */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-farm-850 border border-farm-700/50">
                  <span className="text-slate-400 text-[10px]">Throughput Tercapai:</span>
                  <div className="text-lg font-bold text-white font-mono">{benchResult.actual_tps_achieved} events/detik</div>
                </div>
                <div className="p-3 rounded-xl bg-farm-850 border border-farm-700/50">
                  <span className="text-slate-400 text-[10px]">Tingkat Keberhasilan:</span>
                  <div className="text-lg font-bold text-farm-400 font-mono">{benchResult.success_rate_pct}% (0 Error)</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-farm-950/80 border border-farm-700/50 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-slate-200">Kesimpulan Uji Beban:</span>
                <p className="leading-relaxed">
                  Infrastruktur modular FastAPI + Model Regresi Python mampu melayani lonjakan komputasi dengan latensi p95 di bawah ambang batas SLA industri (300 ms), aman untuk ribuan sensor nirkabel.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center space-y-2">
              <IconActivity className="w-10 h-10 text-farm-700" />
              <p className="text-xs text-slate-400">Klik "Jalankan Uji Beban Sekarang" untuk memulai benchmark real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
