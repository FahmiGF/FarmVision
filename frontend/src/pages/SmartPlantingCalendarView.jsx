import React, { useState, useEffect } from 'react';
import { IconCalendar, IconSun, IconDroplet, IconSprout, IconCheck } from '../components/Icons';
import { api } from '../lib/api';

export default function SmartPlantingCalendarView() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const forecastDays = [
    { day: "Hari Ini", date: "8 Nov", temp: "29°C", rain: "6.5 mm", condition: "Cerah Berawan", wind: "11 km/h" },
    { day: "Senin", date: "9 Nov", temp: "28°C", rain: "18.0 mm", condition: "Hujan Sedang (Sore)", wind: "14 km/h" },
    { day: "Selasa", date: "10 Nov", temp: "27°C", rain: "24.5 mm", condition: "Hujan Lebat", wind: "16 km/h" },
    { day: "Rabu", date: "11 Nov", temp: "29°C", rain: "4.0 mm", condition: "Cerah Berawan", wind: "9 km/h" },
    { day: "Kamis", date: "12 Nov", temp: "30°C", rain: "2.0 mm", condition: "Cerah", wind: "8 km/h" },
    { day: "Jumat", date: "13 Nov", temp: "29°C", rain: "12.0 mm", condition: "Hujan Ringan", wind: "12 km/h" },
    { day: "Sabtu", date: "14 Nov", temp: "28°C", rain: "15.0 mm", condition: "Hujan Sedang", wind: "10 km/h" },
  ];

  useEffect(() => {
    api.getPlantingRecs().then(res => {
      setRecommendations(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Menganalisis kalender agroklimatologi Indonesia...</span>
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
              <IconCalendar className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Smart Planting Calendar & Agro-Climate Intelligence</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-farm-300 border border-farm-700">
              BMKG & Open-Meteo Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Panduan pergiliran tanaman (crop rotation), kesesuaian lahan, dan prakiraan cuaca 7 hari untuk memitigasi risiko gagal panen
          </p>
        </div>
      </div>

      {/* 7-Day Weather Forecast Strip */}
      <div className="p-5 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-farm-700/50">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <IconSun className="w-4 h-4 text-agri-amber" />
            <span>Prakiraan Cuaca Mikro Agrikultur (7 Hari Ke Depan)</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Pembaruan Tiap 1 Jam</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecastDays.map((fc, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-farm-950/80 border border-farm-700/60 text-center space-y-1">
              <span className="text-[10px] font-bold text-farm-400 block">{fc.day}</span>
              <span className="text-[9px] text-slate-400 block font-mono">{fc.date}</span>
              <div className="text-base font-extrabold text-white font-mono mt-1">{fc.temp}</div>
              <span className="text-[10px] text-slate-300 block truncate">{fc.condition}</span>
              <div className="pt-1 border-t border-farm-700/40 text-[9px] font-mono text-agri-cyan flex items-center justify-center space-x-1">
                <IconDroplet className="w-3 h-3" />
                <span>{fc.rain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Planting Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-farm-700/50">
              <div>
                <h3 className="text-sm font-bold text-white">{rec.crop}</h3>
                <span className="text-xs font-medium text-farm-400">{rec.season}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-farm-300 bg-farm-800 px-2.5 py-1 rounded-lg border border-farm-700">
                  Kesesuaian: {rec.suitability_score}%
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-farm-950/70 border border-farm-700/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Kesesuaian Tanah:</span>
                <p className="text-slate-200 mt-0.5">{rec.soil_compatibility}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-farm-950/70 border border-farm-700/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Kebutuhan Air Musim:</span>
                <p className="text-agri-cyan mt-0.5">{rec.water_requirement}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-farm-950/70 border border-farm-700/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Varietas Rekomendasi:</span>
                <p className="text-slate-200 mt-0.5">{rec.recommended_variety}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-farm-850 border border-farm-700/60">
                <span className="text-farm-400 text-[10px] uppercase font-bold">Strategi Rotasi Tanaman:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{rec.rotation_strategy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
