import React, { useState } from 'react';
import { IconBot, IconSend, IconX, IconSprout, IconDroplet, IconScan, IconChart } from './Icons';
import { api } from '../lib/api';

export default function AIAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Halo! Saya **FarmVision AI Agronomist Copilot**. Ada yang bisa saya bantu terkait kondisi tanah, rekomendasi irigasi FAO-56, deteksi penyakit tanaman, atau estimasi hasil panen?'
    }
  ]);

  const quickPrompts = [
    { label: "Kondisi Lahan Hari Ini", query: "Bagaimana kondisi dan status kesehatan lahan saat ini?", icon: IconSprout },
    { label: "Kebutuhan Irigasi", query: "Berapa kebutuhan air irigasi petak aktif hari ini?", icon: IconDroplet },
    { label: "Peringatan Penyakit", query: "Apakah ada indikasi serangan penyakit atau hama yang perlu diperiksa?", icon: IconScan },
    { label: "Proyeksi Panen", query: "Berapa estimasi tonase hasil panen yang diproyeksikan?", icon: IconChart },
  ];

  const handleSend = async (msgToSend) => {
    const text = msgToSend || inputMsg;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await api.chatAI(text);
      if (res && res.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: res.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Maaf, terjadi gangguan komunikasi dengan server telemetri FarmVision.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-farm-500 to-agri-cyan text-farm-950 font-bold shadow-2xl shadow-farm-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
        >
          <IconBot className="w-5 h-5 text-farm-950 animate-bounce" />
          <span className="text-sm font-sans tracking-tight">AI Agronomist</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[95vw] h-[540px] bg-farm-900 border border-farm-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-farm-850 border-b border-farm-700 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-farm-500/20 border border-farm-500/40 flex items-center justify-center text-farm-400">
                <IconBot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>FarmVision AI Copilot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-farm-400 animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">Precision Ag Intelligence v2.4</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-farm-800 text-slate-400 hover:text-white transition"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-farm-950/60 border-b border-farm-700/50 flex space-x-1.5 overflow-x-auto no-scrollbar text-[11px]">
            {quickPrompts.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(q.query)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-farm-800 hover:bg-farm-700 border border-farm-700/70 text-slate-300 hover:text-white whitespace-nowrap transition"
                >
                  <Icon className="w-3 h-3 text-farm-400" />
                  <span>{q.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                    m.sender === 'user'
                      ? 'bg-farm-500 text-farm-950 font-medium rounded-br-none'
                      : 'bg-farm-800 border border-farm-700 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line prose-invert">
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-farm-800 border border-farm-700 rounded-2xl rounded-bl-none px-3.5 py-2 text-slate-400 text-xs flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-farm-400 animate-ping"></div>
                  <span>Menganalisis data telemetri & agronomi...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-farm-850 border-t border-farm-700 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Tanya kondisi tanah, hama, irigasi..."
              className="flex-1 bg-farm-950 border border-farm-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-farm-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="p-2 rounded-xl bg-farm-500 hover:bg-farm-400 text-farm-950 font-bold disabled:opacity-50 transition"
            >
              <IconSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
