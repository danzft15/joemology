import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, ArrowUpRight, ArrowDownRight, Star, RefreshCw, BarChart2, ShieldAlert, Bot, TrendingUp, Layers } from 'lucide-react';
import { StockDetail } from '../types';
import TradingViewWidget from './TradingViewWidget';

interface DetailTabProps {
  stockCode: string;
  watchlistCodes: string[];
  onToggleWatchlist: (code: string) => void;
}

export default function DetailTab({
  stockCode,
  watchlistCodes,
  onToggleWatchlist,
}: DetailTabProps) {
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'tradingview' | 'bandar'>('tradingview');
  
  // AI report state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState(0);
  
  // SVG hover state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const aiProgressMessages = [
    "Membaca data historis & indikator teknikal MA...",
    "Menganalisis volume breakout & net foreign flow...",
    "Menghitung level support & resistance psikologis...",
    "Membuat kalkulasi rasio Risk & Reward (RRR)...",
    "Merumuskan strategi eksekusi trading (Buy/Sell/Hold)...",
    "Menghubungi asisten kecerdasan buatan Gemini AI..."
  ];

  useEffect(() => {
    fetchStockDetails();
  }, [stockCode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (generatingAi) {
      timer = setInterval(() => {
        setAiProgressStep(p => (p + 1) % aiProgressMessages.length);
      }, 2500);
    } else {
      setAiProgressStep(0);
    }
    return () => clearInterval(timer);
  }, [generatingAi]);

  const fetchStockDetails = async () => {
    setLoading(true);
    setError(null);
    setAiReport(null);
    try {
      const res = await fetch(`/api/stocks/${stockCode}`);
      if (!res.ok) {
        throw new Error('Gagal memuat detail saham.');
      }
      const data = await res.json();
      setStock(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const generateAiReport = async () => {
    setGeneratingAi(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: stockCode })
      });
      if (!res.ok) {
        throw new Error('Gagal memproduksi laporan analisis AI.');
      }
      const data = await res.json();
      setAiReport(data.report);
    } catch (err: any) {
      setAiReport(`### Gagal Menghasilkan Analisis AI\n\nTerjadi gangguan koneksi: ${err.message}. Harap coba beberapa saat lagi.`);
    } finally {
      setGeneratingAi(false);
    }
  };

  const formatMoney = (val: number) => {
    if (Math.abs(val) >= 1000000000000) {
      return `Rp ${(val / 1000000000000).toFixed(2)} T`;
    }
    if (Math.abs(val) >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(1)} M`;
    }
    return `Rp ${val.toLocaleString()}`;
  };

  const formatValue = (lots: number, avg: number) => {
    const total = lots * 100 * avg;
    return formatMoney(total);
  };

  const getBrokerCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Foreign':
        return 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
      case 'Domestic Institution':
        return 'text-purple-400 bg-purple-500/10 border border-purple-500/20';
      default:
        return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
    }
  };

  // Render SVG candlestick chart
  const renderCharts = () => {
    if (!stock || !stock.history || stock.history.length === 0) return null;
    
    const h = stock.history;
    const padding = 30;
    const chartHeight = 220;
    const chartWidth = 700;
    
    // Find min & max prices for scale
    const highs = h.map(d => d.high);
    const lows = h.map(d => d.low);
    const maxPrice = Math.max(...highs) * 1.02;
    const minPrice = Math.min(...lows) * 0.98;
    const priceRange = maxPrice - minPrice;

    // Bandar Inventory bounds for inventory chart
    const inventories = h.map(d => d.bandarInventory);
    const maxInv = Math.max(...inventories);
    const minInv = Math.min(...inventories);
    const invRange = maxInv - minInv || 1;

    const points: string[] = [];
    const step = (chartWidth - padding * 2) / (h.length - 1);
    
    // Construct coordinates for inventory
    h.forEach((d, i) => {
      const x = padding + i * step;
      // Map inventory to chart height (inverted since SVG 0 is top)
      const y = padding + (chartHeight - padding * 2) * (1 - (d.bandarInventory - minInv) / invRange);
      points.push(`${x},${y}`);
    });

    return (
      <div className="space-y-6">
        {/* Candlestick & Volume Chart */}
        <div className="p-4 rounded border border-gray-800 bg-[#14161B] space-y-3 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" /> Grafik Candlestick & Volume Transaksi (30 Hari)
            </h3>
            {hoverIndex !== null && (
              <div className="text-[11px] font-mono text-gray-400 flex items-center gap-3 bg-[#0A0B0D] px-3 py-1 rounded border border-gray-800">
                <span>Tgl: {h[hoverIndex].date}</span>
                <span>O: <span className="text-gray-200">{h[hoverIndex].open}</span></span>
                <span>H: <span className="text-emerald-400">{h[hoverIndex].high}</span></span>
                <span>L: <span className="text-rose-400">{h[hoverIndex].low}</span></span>
                <span>C: <span className="text-gray-200">{h[hoverIndex].close}</span></span>
                <span>Vol: <span className="text-gray-300">{(h[hoverIndex].volume).toLocaleString()} Lot</span></span>
              </div>
            )}
          </div>

          <div className="relative overflow-x-auto">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto min-w-[550px] select-none"
              onMouseLeave={() => setHoverIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const ratio = x / rect.width;
                const index = Math.min(
                  h.length - 1,
                  Math.max(0, Math.floor(ratio * h.length))
                );
                setHoverIndex(index);
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
            >
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1F2937" strokeDasharray="3" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#1F2937" strokeDasharray="3" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#1F2937" strokeDasharray="3" />

              {/* Price labels right side */}
              <text x={chartWidth - padding + 5} y={padding + 4} className="text-[9px] font-mono fill-gray-500" textAnchor="start">
                {Math.round(maxPrice).toLocaleString()}
              </text>
              <text x={chartWidth - padding + 5} y={chartHeight / 2 + 4} className="text-[9px] font-mono fill-gray-500" textAnchor="start">
                {Math.round(minPrice + priceRange / 2).toLocaleString()}
              </text>
              <text x={chartWidth - padding + 5} y={chartHeight - padding + 4} className="text-[9px] font-mono fill-gray-500" textAnchor="start">
                {Math.round(minPrice).toLocaleString()}
              </text>

              {/* Draw candlesticks */}
              {h.map((d, i) => {
                const x = padding + i * step;
                const openY = padding + (chartHeight - padding * 2) * (1 - (d.open - minPrice) / priceRange);
                const closeY = padding + (chartHeight - padding * 2) * (1 - (d.close - minPrice) / priceRange);
                const highY = padding + (chartHeight - padding * 2) * (1 - (d.high - minPrice) / priceRange);
                const lowY = padding + (chartHeight - padding * 2) * (1 - (d.low - minPrice) / priceRange);
                
                const bodyY = Math.min(openY, closeY);
                const bodyHeight = Math.max(1, Math.abs(openY - closeY));
                const isBull = d.close >= d.open;
                const candleColor = isBull ? '#10b981' : '#ef4444';

                // Volume Bar inside candlestick
                const maxVol = Math.max(...h.map(x => x.volume));
                const volHeight = (d.volume / maxVol) * 35; // Cap volume bar height at 35px
                const volY = chartHeight - padding - volHeight;

                return (
                  <g key={i}>
                    {/* Hover highlights */}
                    {hoverIndex === i && (
                      <rect 
                        x={x - step/2} 
                        y={padding} 
                        width={step} 
                        height={chartHeight - padding * 2} 
                        fill="#374151" 
                        fillOpacity="0.25" 
                      />
                    )}

                    {/* Volume Bar */}
                    <rect
                      x={x - 2.5}
                      y={volY}
                      width="5"
                      height={volHeight}
                      fill={candleColor}
                      fillOpacity="0.25"
                    />

                    {/* Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - 4}
                      y={bodyY}
                      width="8"
                      height={bodyHeight}
                      fill={candleColor}
                    />
                  </g>
                );
              })}

              {/* Dates indicator */}
              <text x={padding} y={chartHeight - 8} className="text-[9px] fill-gray-500 font-mono">
                {h[0].date}
              </text>
              <text x={chartWidth / 2} y={chartHeight - 8} className="text-[9px] fill-gray-500 font-mono" textAnchor="middle">
                Histori Tren Harga (30 Hari)
              </text>
              <text x={chartWidth - padding} y={chartHeight - 8} className="text-[9px] fill-gray-500 font-mono" textAnchor="end">
                Hari ini ({h[h.length - 1].date})
              </text>
            </svg>
          </div>
        </div>

        {/* Bandar Inventory Line Chart */}
        <div className="p-4 rounded border border-gray-800 bg-[#14161B] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse"></span> Bandar Inventory (Akumulasi Kumulatif)
            </h3>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Indicator Volume Flow
            </span>
          </div>

          <div className="relative overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight - 60}`} className="w-full h-auto min-w-[550px] select-none">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1F2937" strokeDasharray="3" />
              <line x1={padding} y1={(chartHeight - 60) / 2} x2={chartWidth - padding} y2={(chartHeight - 60) / 2} stroke="#1F2937" strokeDasharray="3" />
              <line x1={padding} y1={chartHeight - 60 - padding} x2={chartWidth - padding} y2={chartHeight - 60 - padding} stroke="#1F2937" strokeDasharray="3" />

              {/* Inventory values right side */}
              <text x={chartWidth - padding + 5} y={padding + 4} className="text-[9px] font-mono fill-gray-500" textAnchor="start">
                +{Math.round(maxInv / 1000).toLocaleString()}k Lot
              </text>
              <text x={chartWidth - padding + 5} y={chartHeight - 60 - padding + 4} className="text-[9px] font-mono fill-gray-500" textAnchor="start">
                {Math.round(minInv / 1000).toLocaleString()}k Lot
              </text>

              {/* Zero line reference */}
              {minInv < 0 && maxInv > 0 && (
                <line 
                  x1={padding} 
                  y1={padding + (chartHeight - 60 - padding * 2) * (1 - (0 - minInv) / invRange)} 
                  x2={chartWidth - padding} 
                  y2={padding + (chartHeight - 60 - padding * 2) * (1 - (0 - minInv) / invRange)} 
                  stroke="#374151" 
                  strokeWidth="1"
                />
              )}

              {/* Area Under Line (Gradient) */}
              <defs>
                <linearGradient id="invGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M ${padding},${chartHeight - 60 - padding} L ${points.join(' L ')} L ${chartWidth - padding},${chartHeight - 60 - padding} Z`}
                fill="url(#invGradient)"
              />

              {/* Draw Inventory Line */}
              <path
                d={`M ${points.join(' L ')}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Draw Interactive Hover Point */}
              {hoverIndex !== null && points[hoverIndex] && (() => {
                const [hx, hy] = points[hoverIndex].split(',');
                return (
                  <g>
                    <line x1={hx} y1={padding} x2={hx} y2={chartHeight - 60 - padding} stroke="#6366f1" strokeDasharray="2" strokeOpacity="0.5" />
                    <circle cx={hx} cy={hy} r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                    <foreignObject x={Number(hx) - 60} y={Number(hy) - 28} width="120" height="24">
                      <div className="bg-[#0A0B0D] border border-indigo-500/30 text-[9px] font-mono text-center rounded px-1 py-0.5 text-indigo-300 whitespace-nowrap shadow-md">
                        Net: {Math.round(h[hoverIndex].bandarInventory).toLocaleString()} Lot
                      </div>
                    </foreignObject>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-400 font-medium">Mengambil rekapitulasi data broker summary {stockCode}...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="p-12 text-center border border-red-950/30 bg-red-950/5 rounded-2xl max-w-lg mx-auto space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h4 className="font-bold text-slate-200">Terjadi Kendala Sistem</h4>
        <p className="text-xs text-slate-400">{error || 'Gagal memuat detail saham.'}</p>
        <button
          onClick={fetchStockDetails}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-all cursor-pointer"
        >
          Muat Ulang Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail Stock Header Card */}
      <div className="p-6 rounded border border-gray-800 bg-[#14161B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400 tracking-wider">{stock.code}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">{stock.sector}</span>
            <span className="text-xs text-gray-400 font-medium">{stock.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xl md:text-2xl font-mono font-bold text-gray-200">Rp {stock.price.toLocaleString()}</span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              stock.change > 0 ? 'bg-emerald-500/10 text-emerald-400' : stock.change < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-gray-800 text-gray-400'
            }`}>
              {stock.change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : stock.change < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
              {stock.change > 0 ? '+' : ''}{stock.change.toLocaleString()} ({stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onToggleWatchlist(stock.code)}
            className={`px-4 py-2 rounded border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              watchlistCodes.includes(stock.code)
                ? 'bg-amber-500 border-amber-600 text-black shadow-md shadow-amber-500/15'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
            }`}
          >
            <Star className={`w-4 h-4 ${watchlistCodes.includes(stock.code) ? 'fill-current' : ''}`} />
            {watchlistCodes.includes(stock.code) ? 'Tersimpan di Watchlist' : 'Tambah Watchlist'}
          </button>
          
          <button
            onClick={fetchStockDetails}
            className="p-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:text-white rounded text-gray-400 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stock Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Candlestick Chart, Bandar line, and summary */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Chart Mode Toggle */}
          <div className="flex items-center justify-between bg-[#14161B] p-1.5 rounded-xl border border-gray-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChartMode('tradingview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartMode === 'tradingview'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                API TradingView Interactive (MA20/50/200 + RSI)
              </button>
              <button
                onClick={() => setChartMode('bandar')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartMode === 'bandar'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Bandar Inventory & Accumulation
              </button>
            </div>
          </div>

          {/* Chart Content Display */}
          {chartMode === 'tradingview' ? (
            <TradingViewWidget symbol={stockCode} height={580} />
          ) : (
            renderCharts()
          )}

          {/* Market & Technical Stats Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-800 bg-[#14161B] space-y-1">
              <span className="text-[10px] text-gray-400 font-mono block">Net Foreign Flow</span>
              <span className={`text-sm font-bold font-mono ${stock.foreignNetBuy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stock.foreignNetBuy >= 0 ? '+' : ''}{formatMoney(stock.foreignNetBuy)}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-[#14161B] space-y-1">
              <span className="text-[10px] text-gray-400 font-mono block">Volume Breakout Ratio</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {stock.volumeBreakoutRatio}x Avg 20D
              </span>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-[#14161B] space-y-1">
              <span className="text-[10px] text-gray-400 font-mono block">Volume Harian</span>
              <span className="text-sm font-bold font-mono text-gray-200">
                {stock.volume.toLocaleString()} Lot
              </span>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-[#14161B] space-y-1">
              <span className="text-[10px] text-gray-400 font-mono block">Market Cap</span>
              <span className="text-sm font-bold font-mono text-gray-200">
                {formatMoney(stock.marketCap)}
              </span>
            </div>
          </div>

          {/* Quick Sinyal Otomatis Banner */}
          <div className="p-5 rounded-xl border border-gray-800 bg-[#14161B] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Ringkasan Sinyal & Rangkuman Pasar
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed font-sans pt-1">
              {stock.summaryText}
            </p>
          </div>

        </div>

        {/* Right Side: AI Assistant & Commentary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded border border-gray-800 bg-[#14161B] space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1">
                  AI Deep Analysis Report <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-[10px] text-gray-400">Didukung oleh Gemini AI</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Dapatkan riset komprehensif menggunakan kecerdasan buatan Gemini AI. Menganalisis moving averages (MA20/50/200), aliran dana asing, rasio breakout volume, support/resistance, dan rencana trading terstruktur.
            </p>

            {generatingAi ? (
              <div className="p-6 rounded border border-indigo-500/20 bg-indigo-950/10 text-center space-y-3.5">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-indigo-300">Memproses Laporan Analisis...</p>
                  <p className="text-[10px] text-gray-500 italic px-2">{aiProgressMessages[aiProgressStep]}</p>
                </div>
              </div>
            ) : aiReport ? (
              <div className="space-y-4">
                <div className="p-4 rounded border border-gray-800 bg-[#0A0B0D] text-xs text-gray-300 leading-relaxed font-sans max-h-[380px] overflow-y-auto space-y-3 whitespace-pre-wrap markdown-body select-text">
                  {aiReport}
                </div>
                <button
                  onClick={generateAiReport}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-200 font-semibold rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Buat Ulang Analisis AI
                </button>
              </div>
            ) : (
              <button
                onClick={generateAiReport}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-950/20 cursor-pointer"
              >
                <Bot className="w-4 h-4" /> Hasilkan Analisis AI (Gemini)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
