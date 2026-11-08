import React, { useState, useEffect } from 'react';
import { IconSatellite, IconCheck, IconRefresh } from '../components/Icons';
import { api } from '../lib/api';

export default function SatelliteNdviView() {
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('FLD-001');
  const [ndviData, setNdviData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (fId) => {
    try {
      const fRes = await api.getFields();
      setFields(fRes);
      const targetId = fId || (fRes.length > 0 ? fRes[0].id : 'FLD-001');
      setSelectedFieldId(targetId);
      const nRes = await api.getNdvi(targetId);
      setNdviData(nRes);
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
      const nRes = await api.getNdvi(fId);
      setNdviData(nRes);
    } catch (err) {
      alert("Error load NDVI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCellColor = (val) => {
    if (val >= 0.75) return 'bg-emerald-600 text-white';
    if (val >= 0.60) return 'bg-emerald-500 text-farm-950 font-bold';
    if (val >= 0.45) return 'bg-emerald-400 text-farm-950 font-bold';
    if (val >= 0.30) return 'bg-amber-400 text-farm-950 font-bold';
    return 'bg-amber-600 text-white';
  };

  if (loading && !ndviData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Mengambil citra multispektral satelit Sentinel-2...</span>
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
              <IconSatellite className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Geospatial Satellite & Drone NDVI Analytics</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-agri-cyan border border-farm-700">
              Copernicus Sentinel-2 10m Bands
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Indeks Vegetasi NDVI (NIR-Red)/(NIR+Red) & Indeks Kelembapan Kanopi NDWI untuk deteksi dini kanopi stres
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

      {ndviData && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Rata-Rata NDVI</span>
              <div className="text-2xl font-extrabold text-farm-300 font-mono mt-1">
                {ndviData.mean_ndvi}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Min: {ndviData.min_ndvi} · Max: {ndviData.max_ndvi}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Indeks Air Kanopi (NDWI)</span>
              <div className="text-2xl font-extrabold text-agri-cyan font-mono mt-1">
                {ndviData.mean_ndwi_water_index}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Kandungan cairan daun optimal
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Tutupan Kanopi (Coverage)</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {ndviData.canopy_coverage_pct}%
              </div>
              <span className="text-[10px] text-farm-400 mt-1 block">
                Kerapatan daun di atas tanah
              </span>
            </div>

            <div className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md">
              <span className="text-[11px] font-medium text-slate-400">Indeks Klorofil Daun</span>
              <div className="text-2xl font-extrabold text-farm-400 font-mono mt-1">
                {ndviData.chlorophyll_content_index} <span className="text-xs font-normal text-slate-400">SPAD</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Laju fotosintesis sangat baik
              </span>
            </div>
          </div>

          {/* Heatmap & Metadata Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spatial Raster Heatmap */}
            <div className="p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-farm-700/50">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Grid Raster Spasial NDVI (Resolusi 10 Meter)
                  </h3>
                  <span className="text-xs text-farm-300 font-medium">{ndviData.field_name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Sentinel-2B BOA</span>
              </div>

              {/* 6x6 Spatial Grid Visualizer */}
              <div className="p-4 bg-farm-950 rounded-xl border border-farm-700/60 flex flex-col items-center justify-center">
                <div className="grid grid-cols-6 gap-2 w-full max-w-sm aspect-square">
                  {ndviData.spatial_raster_grid.flatMap((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`rounded-lg flex flex-col items-center justify-center text-[10px] font-mono shadow-inner transition hover:scale-105 cursor-pointer ${getCellColor(val)}`}
                        title={`Piksel [${rIdx},${cIdx}]: NDVI = ${val}`}
                      >
                        <span>{val}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Legend Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-between text-[10px] text-slate-300 gap-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600"></span>
                  <span>&gt; 0.75 Sangat Lebat</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-400"></span>
                  <span>0.50–0.74 Sehat Normal</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400"></span>
                  <span>0.30–0.49 Stres Air/Hara</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-amber-600"></span>
                  <span>&lt; 0.30 Tanah Terbuka</span>
                </div>
              </div>
            </div>

            {/* Satellite Metadata & Interpretation */}
            <div className="p-6 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-4">
              <div className="pb-3 border-b border-farm-700/50">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Hasil Interpretasi Spektral & Status Vegetasi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Analisis biometrik kanopi pertanian presisi</p>
              </div>

              <div className="p-4 rounded-xl bg-farm-950 border border-farm-700/50 space-y-2">
                <span className="text-[10px] font-bold text-farm-400 uppercase tracking-wider">Status Vitalitas Tanaman (Vigor):</span>
                <div className="text-sm font-bold text-white">{ndviData.vegetation_vigor_status}</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kanopi tanaman menyerap gelombang merah (Red) secara masif untuk fotosintesis dan memantulkan inframerah-dekat (NIR) dengan efisiensi tinggi, menandakan turgor sel yang sehat.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-farm-850 border border-farm-700/40">
                  <span className="text-slate-400">Platform Satelit:</span>
                  <span className="font-mono text-slate-200">{ndviData.satellite_source}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-farm-850 border border-farm-700/40">
                  <span className="text-slate-400">Tanggal Akusisi Citra:</span>
                  <span className="font-mono text-slate-200">{ndviData.acquisition_date}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-farm-850 border border-farm-700/40">
                  <span className="text-slate-400">Tutupan Awan (Cloud Cover):</span>
                  <span className="font-mono text-farm-400">{ndviData.cloud_cover_pct}% (Bebas Awan)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
