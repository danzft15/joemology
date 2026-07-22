import React, { useState, useEffect } from 'react';
import { MAScreenerItem } from '../types';
import TradingViewWidget from './TradingViewWidget';
import { 
  TrendingUp, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  ChevronRight, 
  Activity, 
  Zap, 
  BarChart2, 
  Info,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Maximize2
} from 'lucide-react';

interface MAScreenerTabProps {
  onSelectStock: (code: string) => void;
}

export default function MAScreenerTab({ onSelectStock }: MAScreenerTabProps) {
  const [data, setData] = useState<MAScreenerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChartStock, setActiveChartStock] = useState<MAScreenerItem | null>(null);

  // Filter States
  const [strategy, setStrategy] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly'>('Daily');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [minVolume, setMinVolume] = useState<number>(0);
  const [sector, setSector] = useState<string>('All');
  const [marketCap, setMarketCap] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchScreenerData();
  }, [strategy, timeframe, minPrice, minVolume, sector, marketCap]);

  const fetchScreenerData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        strategy,
        timeframe,
        minPrice: minPrice.toString(),
        minVolume: minVolume.toString(),
        sector,
        marketCap
      });
      const res = await fetch(`/api/ma-screener?${queryParams.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch MA screener data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting money
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  // Filtered by local search
  const displayedData = data.filter(item => 
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top Valid Signals (Rating Kuat or Sedang)
  const topRankedData = displayedData
    .filter(item => !item.isFalseSignalRisk || item.signalRating === '🟢 Kuat')
    .slice(0, 6);

  // Early Warning Watchlist (mendekati sinyal)
  const earlyWarningData = displayedData.filter(item => item.isEarlyWarning);

  // False Signal Warnings
  const falseSignalData = displayedData.filter(item => item.isFalseSignalRisk);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER BANNER WITH DOW THEORY & PRICE ACTION PRINCIPLES */}
      <div className="p-6 md:p-8 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-[#14161B] via-[#101918] to-[#14161B] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> DOW THEORY & PRICE ACTION ENGINE
          </div>

          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white">
            MA Technical Stock Screener <span className="text-emerald-400">(MA20 / MA50 / MA200)</span>
          </h1>

          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Sistem pemindai saham presisi berbasis prinsip Dow Theory & Price Action. Mengevaluasi konfirmasi <strong>Closing Candle</strong>, <strong>Volume 20-Day</strong>, <strong>Slope MA50</strong>, serta <strong>RSI (14)</strong> untuk mengeliminasi false signal dan whipsaw.
          </p>

          {/* 5 VALIDATION RULES SUMMARY BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
            <div className="p-2.5 rounded bg-gray-950/80 border border-gray-800 text-[11px] flex flex-col gap-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Closing Price</span>
              <span className="text-gray-400 text-[10px]">Minimal 1-2 Candle</span>
            </div>
            <div className="p-2.5 rounded bg-gray-950/80 border border-gray-800 text-[11px] flex flex-col gap-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Volume MA20</span>
              <span className="text-gray-400 text-[10px]">≥ Rata-rata 20 Hari</span>
            </div>
            <div className="p-2.5 rounded bg-gray-950/80 border border-gray-800 text-[11px] flex flex-col gap-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> MA Slope</span>
              <span className="text-gray-400 text-[10px]">Cek Kemiringan MA50</span>
            </div>
            <div className="p-2.5 rounded bg-gray-950/80 border border-gray-800 text-[11px] flex flex-col gap-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1"><Zap className="w-3 h-3" /> Anti-Whipsaw</span>
              <span className="text-gray-400 text-[10px]">Filter &lt; 5 Hari Choppy</span>
            </div>
            <div className="p-2.5 rounded bg-gray-950/80 border border-gray-800 text-[11px] flex flex-col gap-1">
              <span className="text-emerald-400 font-bold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> RSI (14) Guard</span>
              <span className="text-gray-400 text-[10px]">Proteksi Zona Ekstrem</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS & STRATEGY SELECTION */}
      <div className="p-6 rounded-xl border border-gray-800 bg-[#14161B] space-y-6">
        
        {/* Strategy Selector Tabs */}
        <div>
          <label className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider mb-3 block flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Pilih Strategi / Jenis Screening MA:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua Strategi' },
              { id: 'golden_cross', label: '1. Golden Cross (Bullish)' },
              { id: 'death_cross', label: '2. Death Cross (Bearish)' },
              { id: 'trend_stacking', label: '3. Trend Alignment / Stacking' },
              { id: 'pullback', label: '4. Pullback to MA (Buy on Dip)' },
              { id: 'ma200_breakout', label: '5. MA200 Breakout' },
              { id: 'squeeze', label: '6. MA Compression / Squeeze' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStrategy(tab.id)}
                className={`px-3.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                  strategy === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-850">
          
          {/* Timeframe */}
          <div>
            <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Timeframe:</label>
            <div className="flex rounded border border-gray-800 bg-gray-950 p-1">
              {(['Daily', 'Weekly'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`flex-1 py-1 text-xs font-bold rounded transition-colors ${
                    timeframe === tf ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Minimal Price */}
          <div>
            <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Minimum Harga:</label>
            <select
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value={0}>Semua Harga</option>
              <option value={50}>&gt; Rp 50 (Non-Gocap)</option>
              <option value={200}>&gt; Rp 200</option>
              <option value={500}>&gt; Rp 500</option>
              <option value={1000}>&gt; Rp 1.000</option>
              <option value={2500}>&gt; Rp 2.500</option>
            </select>
          </div>

          {/* Minimal Volume */}
          <div>
            <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Minimum Volume Harian:</label>
            <select
              value={minVolume}
              onChange={(e) => setMinVolume(Number(e.target.value))}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value={0}>Semua Likuiditas</option>
              <option value={10000}>&gt; 10.000 Lot</option>
              <option value={50000}>&gt; 50.000 Lot</option>
              <option value={200000}>&gt; 200.000 Lot</option>
              <option value={500000}>&gt; 500.000 Lot</option>
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Sektor Industri:</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">Semua Sektor</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Energi">Energi</option>
              <option value="Teknologi">Teknologi</option>
              <option value="Infrastruktur">Infrastruktur</option>
              <option value="Konsumen Primer">Konsumen Primer</option>
              <option value="Bahan Baku">Bahan Baku</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Perindustrian">Perindustrian</option>
            </select>
          </div>

          {/* Market Cap */}
          <div>
            <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Kapitalisasi Pasar:</label>
            <select
              value={marketCap}
              onChange={(e) => setMarketCap(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">Semua Market Cap</option>
              <option value="Big Cap (> 50T)">Big Cap (&gt; 50 Triliun)</option>
              <option value="Mid Cap (5T - 50T)">Mid Cap (5T - 50 Triliun)</option>
              <option value="Small Cap (< 5T)">Small Cap (&lt; 5 Triliun)</option>
            </select>
          </div>

        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode emiten atau nama perusahaan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded pl-9 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      {/* SECTION 1: RANKING TOP 5-10 SAHAM DENGAN SINYAL PALING VALID & KUAT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide">
              Top Ranked Setup (Sinyal Paling Valid & Strong)
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Rekomendasi Level Entry, TP, SL, & Risk/Reward
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-gray-900/60 rounded-xl animate-pulse border border-gray-800"></div>
            ))}
          </div>
        ) : topRankedData.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-xl">
            Tidak ada saham yang memenuhi kriteria Top Ranked untuk strategi ini saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRankedData.map((stock, idx) => (
              <div 
                key={stock.code}
                className="p-5 rounded-xl border border-gray-800 bg-[#14161B] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-md"
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm font-mono">{stock.code}</h4>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white font-mono">Rp {formatMoney(stock.price)}</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {stock.signalRating}
                      </span>
                    </div>
                  </div>

                  {/* Signal Title */}
                  <div className="p-2.5 rounded bg-gray-950 border border-gray-850 text-xs">
                    <div className="text-[10px] text-gray-500 font-mono uppercase">Strategi Signal</div>
                    <div className="font-bold text-emerald-400 text-xs mt-0.5">{stock.signalName}</div>
                  </div>

                  {/* Trading Setup Matrix (Entry, TP, SL, RRR) */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-gray-950/60 border border-gray-850">
                      <span className="text-[10px] text-gray-500 block">Entry Ideal:</span>
                      <span className="font-bold text-gray-200">Rp {stock.entryLevel}</span>
                    </div>
                    <div className="p-2 rounded bg-gray-950/60 border border-gray-850">
                      <span className="text-[10px] text-gray-500 block">Risk / Reward (RRR):</span>
                      <span className="font-bold text-emerald-400">{stock.riskRewardRatio}</span>
                    </div>
                    <div className="p-2 rounded bg-gray-950/60 border border-gray-850">
                      <span className="text-[10px] text-emerald-400 block">Target Price (TP):</span>
                      <span className="font-bold text-emerald-400">Rp {formatMoney(stock.targetPrice)}</span>
                    </div>
                    <div className="p-2 rounded bg-gray-950/60 border border-gray-850">
                      <span className="text-[10px] text-rose-400 block">Stop Loss (SL):</span>
                      <span className="font-bold text-rose-400">Rp {formatMoney(stock.stopLoss)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-850 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">RSI (14): <strong>{stock.rsi14.toFixed(1)}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveChartStock(stock)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-slate-950 font-bold rounded text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <BarChart2 className="w-3.5 h-3.5" /> Analisa Chart <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: TABEL HASIL SCREENING UTAMA (FORMAT OUTPUT WAJIB) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide">
              Tabel Hasil Screening MA ({displayedData.length} Saham Terfilter)
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">
            Formulasi Dow Theory: MA20 / MA50 / MA200 + Volume & Slope
          </span>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#14161B] overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              Sedang memproses algoritma pemindaian MA Technical...
            </div>
          ) : displayedData.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              Tidak ada saham yang ditemukan cocok dengan kriteria filter saat ini.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-800 text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-4 text-right">Harga</th>
                  <th className="py-3 px-4 text-right">MA20</th>
                  <th className="py-3 px-4 text-right">MA50</th>
                  <th className="py-3 px-4 text-right">MA200</th>
                  <th className="py-3 px-4 text-center">Slope MA50</th>
                  <th className="py-3 px-4">Sinyal Strategy</th>
                  <th className="py-3 px-4 text-center">Volume Confirm</th>
                  <th className="py-3 px-4 text-center">Kekuatan Sinyal</th>
                  <th className="py-3 px-4 text-center">RSI (14)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850 text-xs font-sans">
                {displayedData.map((item) => (
                  <tr key={item.code} className="hover:bg-white/5 transition-colors">
                    {/* Ticker */}
                    <td className="py-3 px-4 font-bold font-mono text-white">
                      <div>{item.code}</div>
                      <div className="text-[10px] text-gray-500 font-normal truncate max-w-[110px]">{item.name}</div>
                    </td>

                    {/* Harga */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-200">
                      Rp {formatMoney(item.price)}
                    </td>

                    {/* MA20 */}
                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {formatMoney(item.ma20)}
                    </td>

                    {/* MA50 */}
                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {formatMoney(item.ma50)}
                    </td>

                    {/* MA200 */}
                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {formatMoney(item.ma200)}
                    </td>

                    {/* Slope MA50 */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.ma50SlopeType === 'up' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : item.ma50SlopeType === 'down'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.ma50Slope}
                      </span>
                    </td>

                    {/* Sinyal Strategy */}
                    <td className="py-3 px-4 font-semibold text-gray-200">
                      <div className="text-xs">{item.signalName}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{item.whipsawStatus}</div>
                    </td>

                    {/* Volume Confirm */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.isVolumeConfirmed 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {item.volumeConfirm}
                      </span>
                    </td>

                    {/* Kekuatan Sinyal */}
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        item.signalRating === '🟢 Kuat' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : item.signalRating === '🟡 Sedang'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {item.signalRating}
                      </span>
                    </td>

                    {/* RSI */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`font-bold ${
                        item.rsi14 >= 75 ? 'text-rose-400' : item.rsi14 <= 25 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.rsi14.toFixed(1)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveChartStock(item)}
                          className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 rounded text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <BarChart2 className="w-3 h-3" /> Chart
                        </button>
                        <button
                          onClick={() => onSelectStock(item.code)}
                          className="px-2.5 py-1 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 rounded text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          Detail <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION 3: WATCHLIST EARLY WARNING (MENDEKATI SINYAL TAPI BELUM FIX) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide">
            Watchlist Early Warning (Mendekati Cross / Squeeze Setup)
          </h3>
        </div>

        {earlyWarningData.length === 0 ? (
          <div className="p-6 rounded-xl border border-gray-800 bg-[#14161B] text-xs text-gray-500 text-center">
            Tidak ada saham dalam status early warning saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {earlyWarningData.map(stock => (
              <div key={stock.code} className="p-4 rounded-xl border border-indigo-500/20 bg-[#14161B] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white font-mono text-sm">{stock.code}</div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    EARLY WARNING
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Garis MA20, MA50, atau MA200 sedang mendekat (Jarak &lt; 1.5%). Bersiap untuk konfirmasi breakout volume.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-850 text-[11px] font-mono">
                  <span className="text-gray-400">Harga: Rp {formatMoney(stock.price)}</span>
                  <button
                    onClick={() => onSelectStock(stock.code)}
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    Pantau Chart →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: PERINGATAN EKSPLISIT SINYAL BERISIKO TINGGI (FALSE SIGNAL WARNING) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide">
            Peringatan Sinyal Berisiko Tinggi (Potensi False Signal / Choppy)
          </h3>
        </div>

        {falseSignalData.length === 0 ? (
          <div className="p-6 rounded-xl border border-gray-800 bg-[#14161B] text-xs text-gray-500 text-center">
            Seluruh sinyal yang ditampilkan saat ini memiliki konfirmasi tren yang stabil tanpa temuan false signal kritis.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {falseSignalData.map(stock => (
              <div key={stock.code} className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-rose-300 font-mono text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    {stock.code} - {stock.signalName}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400">
                    🔴 HIGH RISK
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong>Penyebab Risiko:</strong> {stock.falseSignalReason}
                </p>
                <div className="text-[11px] text-gray-400 pt-1 font-mono">
                  Saran Dow Theory: Jangan melakukan entry sebelum adanya konfirmasi closing candle baru + dorongan volume di atas rata-rata 20 hari.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRADINGVIEW CHART MODAL OVERLAY */}
      {activeChartStock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in overflow-y-auto">
          <div className="bg-[#101216] border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-4 md:px-6 border-b border-gray-800 bg-[#14161B] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-base flex items-center justify-center">
                  {activeChartStock.code.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-mono font-bold text-white tracking-wide">{activeChartStock.code}</h3>
                    <span className="text-xs text-gray-400 font-medium">• {activeChartStock.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {activeChartStock.signalRating}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                    Strategi: {activeChartStock.signalName} (Harga: Rp {formatMoney(activeChartStock.price)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const code = activeChartStock.code;
                    setActiveChartStock(null);
                    onSelectStock(code);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Full Broker Summary
                </button>
                <button
                  onClick={() => setActiveChartStock(null)}
                  className="p-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-xl transition-colors cursor-pointer"
                  title="Tutup Chart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: TradingView Interactive Chart & Setup Specs */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-4">
              
              {/* Trading Setup Matrix Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 p-3 rounded-xl bg-gray-950/80 border border-gray-850 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-500 block">Entry Ideal:</span>
                  <span className="font-bold text-gray-200">Rp {activeChartStock.entryLevel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 block">Target Price (TP):</span>
                  <span className="font-bold text-emerald-400">Rp {formatMoney(activeChartStock.targetPrice)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 block">Stop Loss (SL):</span>
                  <span className="font-bold text-rose-400">Rp {formatMoney(activeChartStock.stopLoss)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Risk/Reward (RRR):</span>
                  <span className="font-bold text-emerald-400">{activeChartStock.riskRewardRatio}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Slope MA50:</span>
                  <span className="font-bold text-gray-300">{activeChartStock.ma50Slope}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">RSI (14) Indicator:</span>
                  <span className="font-bold text-amber-400">{activeChartStock.rsi14.toFixed(1)}</span>
                </div>
              </div>

              {/* TradingView Interactive Widget Container */}
              <TradingViewWidget symbol={activeChartStock.code} height={520} />

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
