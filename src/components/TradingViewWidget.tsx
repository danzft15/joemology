import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  height?: number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function TradingViewWidget({ symbol, height = 580 }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Format ticker for IDX / BEI (e.g. BBCA -> IDX:BBCA)
    const cleanSymbol = symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const tvSymbol = cleanSymbol.startsWith('IDX:') ? cleanSymbol : `IDX:${cleanSymbol}`;
    const uniqueId = `tradingview_widget_${cleanSymbol}_${Math.random().toString(36).substring(2, 7)}`;

    if (containerRef.current) {
      containerRef.current.innerHTML = `<div id="${uniqueId}" style="height: ${height}px; width: 100%;"></div>`;
    }

    const initWidget = () => {
      if (window.TradingView) {
        try {
          new window.TradingView.widget({
            autosize: true,
            symbol: tvSymbol,
            interval: "D",
            timezone: "Asia/Jakarta",
            theme: "dark",
            style: "1",
            locale: "id",
            toolbar_bg: "#14161B",
            enable_publishing: false,
            allow_symbol_change: true,
            hide_side_toolbar: false,
            container_id: uniqueId,
            studies: [
              {
                id: "MASimple@tv-basicstudies",
                inputs: { length: 20 }
              },
              {
                id: "MASimple@tv-basicstudies",
                inputs: { length: 50 }
              },
              {
                id: "MASimple@tv-basicstudies",
                inputs: { length: 200 }
              },
              {
                id: "RSI@tv-basicstudies",
                inputs: { length: 14 }
              },
              {
                id: "Volume@tv-basicstudies"
              }
            ]
          });
        } catch (e) {
          console.error("Error initializing TradingView widget:", e);
        }
      }
    };

    if (window.TradingView) {
      initWidget();
    } else {
      const existingScript = document.getElementById('tradingview-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'tradingview-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          initWidget();
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', initWidget);
      }
    }
  }, [symbol, height]);

  const cleanCode = symbol.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const tvSymbol = cleanCode.startsWith('IDX:') ? cleanCode : `IDX:${cleanCode}`;

  return (
    <div className="w-full rounded-xl border border-gray-800 bg-[#14161B] overflow-hidden shadow-2xl relative">
      <div className="bg-[#0e1014] px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-white font-bold">{tvSymbol}</span>
          <span className="text-gray-500">• TradingView Interactive Real-time Chart</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-emerald-400">
          <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">MA20</span>
          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">MA50</span>
          <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">MA200</span>
          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">RSI(14)</span>
          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded">Volume</span>
        </div>
      </div>
      <div ref={containerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}
