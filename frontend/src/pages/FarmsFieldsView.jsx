import React, { useState, useEffect } from 'react';
import { IconTractor, IconPlus, IconCheck, IconX, IconDroplet, IconSprout } from '../components/Icons';
import { api } from '../lib/api';

export default function FarmsFieldsView() {
  const [fields, setFields] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crop: 'Padi (Rice)',
    crop_variety: 'Inpari 32 HDB',
    area_ha: 2.5,
    soil_type: 'Tanah Liat (Clay) Aluvial',
    irrigation_system: 'Irigasi Berselang (Intermittent)'
  });

  const loadData = async () => {
    try {
      const [fRes, fmRes] = await Promise.all([
        api.getFields(),
        api.getFarms()
      ]);
      setFields(fRes);
      setFarms(fmRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateField = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createField({
        name: formData.name,
        crop: formData.crop,
        crop_variety: formData.crop_variety,
        area_ha: parseFloat(formData.area_ha),
        soil_type: formData.soil_type,
        irrigation_system: formData.irrigation_system
      });
      setFields(prev => [res.field, ...prev]);
      setShowAddModal(false);
      setFormData({
        name: '',
        crop: 'Padi (Rice)',
        crop_variety: 'Inpari 32 HDB',
        area_ha: 2.5,
        soil_type: 'Tanah Liat (Clay) Aluvial',
        irrigation_system: 'Irigasi Berselang (Intermittent)'
      });
    } catch (err) {
      alert("Error membuat petak: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat data lahan & petak sawah...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-farm-900 border border-farm-700/80 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <IconTractor className="w-5 h-5 text-farm-400" />
            <span>Farm & Field Management System</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan poligon lahan, jenis tanah, varietas komoditas, dan siklus musim tanam
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-bold text-xs transition shadow-lg shadow-farm-500/20 active:scale-95"
        >
          <IconPlus className="w-4 h-4 text-farm-950" />
          <span>Tambah Petak Baru</span>
        </button>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map((f) => (
          <div
            key={f.id}
            className="rounded-2xl bg-farm-900 border border-farm-700/80 overflow-hidden shadow-lg hover:border-farm-500/50 transition-all duration-200"
          >
            {/* Visual Header / Crop Banner */}
            <div className="p-4 bg-gradient-to-r from-farm-850 to-farm-800 border-b border-farm-700/50 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-farm-400">{f.id}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{f.name}</h3>
                <span className="text-xs font-semibold text-agri-cyan">{f.crop}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                f.health_status === 'HEALTHY'
                  ? 'bg-farm-500/20 text-farm-300 border border-farm-500/40'
                  : 'bg-agri-amber/20 text-agri-amber border border-agri-amber/40'
              }`}>
                {f.health_status}
              </span>
            </div>

            {/* Field Detail Specs */}
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-farm-950/60 border border-farm-700/40">
                  <span className="text-slate-400 text-[10px]">Varietas Benih</span>
                  <div className="font-semibold text-slate-200 truncate">{f.crop_variety}</div>
                </div>
                <div className="p-2 rounded-lg bg-farm-950/60 border border-farm-700/40">
                  <span className="text-slate-400 text-[10px]">Luas Hektar</span>
                  <div className="font-semibold text-farm-400">{f.area_ha} ha</div>
                </div>
                <div className="p-2 rounded-lg bg-farm-950/60 border border-farm-700/40">
                  <span className="text-slate-400 text-[10px]">Tanggal Tanam</span>
                  <div className="font-semibold text-slate-200">{f.planting_date}</div>
                </div>
                <div className="p-2 rounded-lg bg-farm-950/60 border border-farm-700/40">
                  <span className="text-slate-400 text-[10px]">Hari Setelah Tanam</span>
                  <div className="font-semibold text-agri-cyan">{f.days_after_planting} HST</div>
                </div>
              </div>

              <div className="pt-2 border-t border-farm-700/50 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jenis Tanah:</span>
                  <span className="font-medium text-slate-200">{f.soil_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sistem Irigasi:</span>
                  <span className="font-medium text-agri-cyan">{f.irrigation_system}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fase Tumbuh:</span>
                  <span className="font-semibold text-farm-300">{f.growth_stage}</span>
                </div>
              </div>

              {/* Polygon Coordinates Tag */}
              <div className="pt-2 text-[10px] text-slate-400 font-mono bg-farm-950/80 p-2 rounded-lg border border-farm-700/40">
                <span>GPS Poligon: {f.polygon_coordinates[0][0]}, {f.polygon_coordinates[0][1]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-farm-900 border border-farm-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-farm-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <IconPlus className="w-4 h-4 text-farm-400" />
                <span>Tambah Petak Lahan Baru</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateField} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Petak Lahan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Petak Sawah Blok Timur C"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-farm-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Komoditas Tanaman</label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-farm-500"
                  >
                    <option value="Padi (Rice)">Padi (Rice)</option>
                    <option value="Jagung (Corn)">Jagung (Corn)</option>
                    <option value="Cabai Merah (Chili)">Cabai Merah (Chili)</option>
                    <option value="Tomat (Tomato)">Tomat (Tomato)</option>
                    <option value="Kedelai (Soybean)">Kedelai (Soybean)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Varietas Benih</label>
                  <input
                    type="text"
                    required
                    placeholder="Inpari 32 / Bisi 18"
                    value={formData.crop_variety}
                    onChange={(e) => setFormData({ ...formData, crop_variety: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-farm-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Luas (Hektar)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.area_ha}
                    onChange={(e) => setFormData({ ...formData, area_ha: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-farm-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jenis Tanah</label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-farm-500"
                  >
                    <option value="Tanah Liat (Clay) Aluvial">Tanah Liat (Clay) Aluvial</option>
                    <option value="Andosol Vulkanik">Andosol Vulkanik</option>
                    <option value="Lempung Berpasir">Lempung Berpasir</option>
                    <option value="Grumusol Hitam">Grumusol Hitam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sistem Irigasi</label>
                <select
                  value={formData.irrigation_system}
                  onChange={(e) => setFormData({ ...formData, irrigation_system: e.target.value })}
                  className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-farm-500"
                >
                  <option value="Irigasi Berselang (Intermittent)">Irigasi Berselang (Intermittent Sawah)</option>
                  <option value="Drip Irrigation (Tetes)">Drip Irrigation (Tetes Hortikultura)</option>
                  <option value="Sprinkler">Sprinkler Otomatis</option>
                  <option value="Furrow Irrigation">Furrow Irrigation (Alur Lahan Kering)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-farm-800 hover:bg-farm-750 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-bold"
                >
                  Simpan Petak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
