import React from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, CheckCircle2, Check, Cpu, Database, Link2, Wifi } from 'lucide-react';

interface ProfileTabProps {
  user: UserProfile | null;
  onUpgrade?: (plan: 'Pro Monthly' | 'Pro Yearly' | 'Free') => void;
  loading?: boolean;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Account Profile Header Status Card */}
      <div className="p-6 rounded border border-gray-800 bg-[#14161B] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">Lisensi Aplikasi</p>
            <h3 className="font-bold text-gray-200 text-base md:text-lg">{user.email}</h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Akses Pribadi
              </span>
              <span className="text-[10px] text-gray-500 font-mono font-medium">
                Aktif Selamanya (Lifetime)
              </span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="px-3 py-1.5 rounded bg-gray-900 border border-gray-800 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wide">
            ✓ FULLY UNLOCKED
          </span>
        </div>
      </div>

      {/* Grid of Unlocked Features & System Integration specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Unlocked Capabilities */}
        <div className="p-6 rounded border border-gray-800 bg-[#14161B] space-y-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Fitur yang Terbuka</h4>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-300">100% Pemindaian Emiten BEI</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">Seluruh saham IDX dapat Anda filter dan telusuri sepuasnya tanpa batas.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-300">Analisis Laporan AI Gemini Sepuasnya</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">Menganalisis Broker Summary & merumuskan taktik trading langsung dari AI.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-300">Grafik Kumulatif Bandar Inventory</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">Visualisasi garis bandar (net lot accumulation) hingga rentang waktu 30 hari.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-300">Watchlist & Notifikasi Alert Tanpa Batas</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">Pantau puluhan saham kesayangan Anda dan dapatkan sinyal alert aktif harian.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Specs */}
        <div className="p-6 rounded border border-gray-800 bg-[#14161B] space-y-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Status Sistem & Integrasi</h4>
          </div>

          <div className="space-y-4 pt-1 text-xs">
            <div className="flex items-center justify-between p-3 rounded bg-gray-950 border border-gray-850">
              <div className="flex items-center gap-2 text-gray-400">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>State Engine Database</span>
              </div>
              <span className="font-mono text-gray-300 font-semibold uppercase text-[11px]">Local & Cloud Storage</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-gray-950 border border-gray-850">
              <div className="flex items-center gap-2 text-gray-400">
                <Link2 className="w-4 h-4 text-amber-400" />
                <span>Yahoo Finance API</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold uppercase text-[11px]">CONNECTED</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-gray-950 border border-gray-850">
              <div className="flex items-center gap-2 text-gray-400">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Kecerdasan Buatan AI</span>
              </div>
              <span className="font-mono text-gray-300 font-semibold uppercase text-[11px]">Gemini 2.5 Flash</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-gray-950 border border-gray-850">
              <div className="flex items-center gap-2 text-gray-400">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span>Status Latensi Server</span>
              </div>
              <span className="font-mono text-emerald-400 font-semibold uppercase text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> ONLINE
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
