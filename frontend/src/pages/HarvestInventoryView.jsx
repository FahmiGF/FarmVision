import React, { useState, useEffect } from 'react';
import { IconBox, IconPlus, IconCheck, IconTractor } from '../components/Icons';
import { api } from '../lib/api';

export default function HarvestInventoryView() {
  const [activeSubTab, setActiveSubTab] = useState('harvest'); // 'harvest', 'inventory', 'workorders'
  const [harvests, setHarvests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Harvest Form Modal
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [harvestForm, setHarvestForm] = useState({
    field_name: 'Petak Sawah Ciherang A',
    crop: 'Padi (Rice)',
    area_harvested_ha: 4.5,
    quantity_tons: 28.2,
    quality_grade: 'SUPER',
    selling_price_per_kg_idr: 7200,
    moisture_content_pct: 14.0
  });

  const loadData = async () => {
    try {
      const [hRes, iRes, wRes] = await Promise.all([
        api.getHarvests(),
        api.getInventory(),
        api.getWorkOrders()
      ]);
      setHarvests(hRes);
      setInventory(iRes);
      setWorkOrders(wRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHarvest = async (e) => {
    e.preventDefault();
    const area = parseFloat(harvestForm.area_harvested_ha);
    const tons = parseFloat(harvestForm.quantity_tons);
    const priceKg = parseFloat(harvestForm.selling_price_per_kg_idr);
    const rev = tons * 1000 * priceKg;

    try {
      const payload = {
        id: `HRV-2026-${String(harvests.length + 10).padStart(2, '0')}`,
        field_id: "FLD-001",
        field_name: harvestForm.field_name,
        crop: harvestForm.crop,
        harvest_date: new Date().toISOString().split('T')[0],
        area_harvested_ha: area,
        quantity_tons: tons,
        yield_ton_per_ha: parseFloat((tons / area).toFixed(2)),
        quality_grade: harvestForm.quality_grade,
        selling_price_per_kg_idr: priceKg,
        gross_revenue_idr: rev,
        moisture_content_pct: parseFloat(harvestForm.moisture_content_pct)
      };
      await api.logHarvest(payload);
      setHarvests(prev => [payload, ...prev]);
      setShowHarvestModal(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleUpdateWoStatus = async (id, status) => {
    try {
      await api.updateWorkOrderStatus(id, status);
      setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    } catch (err) {
      alert("Error WO: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-farm-400 font-mono text-xs flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-farm-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat data operasional & logistik...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-farm-900 via-farm-850 to-farm-900 border border-farm-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-farm-500/20 text-farm-400 border border-farm-500/40">
              <IconBox className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Operations, Harvest Ledger & Farm Logistics</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farm-800 text-farm-300 border border-farm-700">
              ERP Agrikultur
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan tonase panen riil, grading mutu komoditas, persediaan sarana produksi (saprodi), dan penugasan lapangan
          </p>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center bg-farm-950 p-1 rounded-xl border border-farm-700 text-xs">
          <button
            onClick={() => setActiveSubTab('harvest')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSubTab === 'harvest' ? 'bg-farm-500 text-farm-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Hasil Panen ({harvests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSubTab === 'inventory' ? 'bg-farm-500 text-farm-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Stok Saprodi ({inventory.length})
          </button>
          <button
            onClick={() => setActiveSubTab('workorders')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSubTab === 'workorders' ? 'bg-farm-500 text-farm-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Tugas Lapangan ({workOrders.length})
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Harvest Records */}
      {activeSubTab === 'harvest' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Buku Besar Hasil Panen Riil</h3>
            <button
              onClick={() => setShowHarvestModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-bold text-xs transition"
            >
              <IconPlus className="w-3.5 h-3.5 text-farm-950" />
              <span>Catat Panen Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-farm-700/80 bg-farm-900 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-farm-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-farm-700">
                <tr>
                  <th className="py-2.5 px-4">No. Panen</th>
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4">Petak / Komoditas</th>
                  <th className="py-2.5 px-4">Luas</th>
                  <th className="py-2.5 px-4">Hasil (Ton)</th>
                  <th className="py-2.5 px-4">Produktivitas</th>
                  <th className="py-2.5 px-4">Grade</th>
                  <th className="py-2.5 px-4">Pendapatan Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-farm-700/40 font-mono text-[11px]">
                {harvests.map((h) => (
                  <tr key={h.id} className="hover:bg-farm-850/60">
                    <td className="py-2.5 px-4 font-bold text-farm-300">{h.id}</td>
                    <td className="py-2.5 px-4 text-slate-400">{h.harvest_date}</td>
                    <td className="py-2.5 px-4 text-slate-200">
                      <div>{h.field_name}</div>
                      <div className="text-[10px] text-agri-cyan">{h.crop}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{h.area_harvested_ha} ha</td>
                    <td className="py-2.5 px-4 font-bold text-white">{h.quantity_tons} ton</td>
                    <td className="py-2.5 px-4 font-bold text-farm-400">{h.yield_ton_per_ha} ton/ha</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        h.quality_grade === 'SUPER'
                          ? 'bg-farm-500/20 text-farm-300 border border-farm-500/40'
                          : 'bg-agri-cyan/20 text-agri-cyan border border-agri-cyan/40'
                      }`}>
                        {h.quality_grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-100">
                      Rp {h.gross_revenue_idr.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Inventory */}
      {activeSubTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-farm-400 font-bold">{item.category}</span>
                  <h4 className="text-xs font-bold text-white mt-0.5">{item.name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                  item.status === 'LOW_STOCK'
                    ? 'bg-agri-danger/20 text-agri-danger border border-agri-danger/40 animate-pulse'
                    : 'bg-farm-500/20 text-farm-300 border border-farm-500/40'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="pt-2 border-t border-farm-700/40 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Stok Tersedia:</span>
                  <div className="text-base font-extrabold text-white font-mono">{item.stock_quantity} {item.unit}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Harga Satuan:</span>
                  <div className="font-mono text-slate-300">Rp {item.cost_per_unit_idr.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Tab 3: Work Orders */}
      {activeSubTab === 'workorders' && (
        <div className="space-y-3">
          {workOrders.map((wo) => (
            <div key={wo.id} className="p-4 rounded-xl bg-farm-900 border border-farm-700/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-farm-400">{wo.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    wo.priority === 'CRITICAL' ? 'bg-agri-danger/20 text-agri-danger' : 'bg-farm-800 text-slate-300'
                  }`}>
                    {wo.priority}
                  </span>
                  <span className="text-slate-400">· Batas Waktu: {wo.due_date}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{wo.title}</h4>
                <p className="text-slate-300">{wo.description}</p>
                <div className="text-[10px] text-slate-400">Ditugaskan kepada: <strong className="text-slate-200">{wo.assigned_worker}</strong></div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  wo.status === 'COMPLETED' ? 'bg-farm-500/20 text-farm-300' : 'bg-agri-amber/20 text-agri-amber'
                }`}>
                  {wo.status}
                </span>
                {wo.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateWoStatus(wo.id, 'COMPLETED')}
                    className="px-3 py-1.5 rounded-lg bg-farm-500 hover:bg-farm-400 text-farm-950 font-bold transition flex items-center space-x-1"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Selesaikan</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Harvest Modal */}
      {showHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-farm-900 border border-farm-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-farm-700">Catat Hasil Panen Baru</h3>
            <form onSubmit={handleCreateHarvest} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Petak Lahan</label>
                <input
                  type="text"
                  required
                  value={harvestForm.field_name}
                  onChange={(e) => setHarvestForm({ ...harvestForm, field_name: e.target.value })}
                  className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Luas Dipanen (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={harvestForm.area_harvested_ha}
                    onChange={(e) => setHarvestForm({ ...harvestForm, area_harvested_ha: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hasil Panen (Ton)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={harvestForm.quantity_tons}
                    onChange={(e) => setHarvestForm({ ...harvestForm, quantity_tons: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mutu / Grade</label>
                  <select
                    value={harvestForm.quality_grade}
                    onChange={(e) => setHarvestForm({ ...harvestForm, quality_grade: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="SUPER">SUPER (Ekspor / Retail Modern)</option>
                    <option value="GRADE_A">GRADE A (Pasar Induk)</option>
                    <option value="GRADE_B">GRADE B (Industri Olahan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Jual (Rp/kg)</label>
                  <input
                    type="number"
                    required
                    value={harvestForm.selling_price_per_kg_idr}
                    onChange={(e) => setHarvestForm({ ...harvestForm, selling_price_per_kg_idr: e.target.value })}
                    className="w-full bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowHarvestModal(false)}
                  className="px-4 py-2 rounded-xl bg-farm-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-farm-500 text-farm-950 font-bold"
                >
                  Simpan Catatan Panen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
