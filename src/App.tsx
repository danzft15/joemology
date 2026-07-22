import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  BellRing,
  HelpCircle
} from 'lucide-react';
import { Stock, UserProfile } from './types';
import MAScreenerTab from './components/MAScreenerTab';
import DetailTab from './components/DetailTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ma-screener' | 'detail' | 'profile'>('ma-screener');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [selectedStockCode, setSelectedStockCode] = useState<string>('BBCA');
  
  // Watchlist & alert states (loaded from localStorage for client durability)
  const [watchlistCodes, setWatchlistCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('bei_watchlist_codes');
    return saved ? JSON.parse(saved) : ['BBCA', 'TLKM'];
  });

  const [alertSettings, setAlertSettings] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('bei_alert_settings');
    return saved ? JSON.parse(saved) : { 'BBCA': true };
  });

  // User simulated profile state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Notification toasts state
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchStocksList();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem('bei_watchlist_codes', JSON.stringify(watchlistCodes));
  }, [watchlistCodes]);

  useEffect(() => {
    localStorage.setItem('bei_alert_settings', JSON.stringify(alertSettings));
  }, [alertSettings]);

  const fetchStocksList = async () => {
    setLoadingStocks(true);
    try {
      const res = await fetch('/api/stocks');
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch (err) {
      console.error('Error fetching stock lists:', err);
      showToast('Gagal memuat daftar saham dari server.', 'error');
    } finally {
      setLoadingStocks(false);
    }
  };

  const fetchUserProfile = async () => {
    setLoadingUser(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        
        // Sync with local storage backup in case user refreshed
        const backupPremium = localStorage.getItem('bei_user_premium_backup');
        if (backupPremium) {
          const backup = JSON.parse(backupPremium);
          if (backup.isPremium && !data.isPremium) {
            // Apply backup premium
            upgradeUserProfile(backup.subscriptionPlan);
            return;
          }
        }
        setUser(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const upgradeUserProfile = async (plan: 'Pro Monthly' | 'Pro Yearly' | 'Free') => {
    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        
        // Save backup to local storage
        localStorage.setItem('bei_user_premium_backup', JSON.stringify(data));
        
        if (plan !== 'Free') {
          showToast(`Akun berhasil ditingkatkan ke ${plan}!`, 'success');
        } else {
          showToast('Akun Anda sekarang kembali ke paket Free.', 'info');
        }
        
        // Refresh stocks list to update state if necessary
        fetchStocksList();
      }
    } catch (err) {
      console.error('Error upgrading profile:', err);
      showToast('Gagal memproses perubahan langganan.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const toggleWatchlist = (code: string) => {
    const isWatched = watchlistCodes.includes(code);
    if (isWatched) {
      setWatchlistCodes(prev => prev.filter(c => c !== code));
      showToast(`Saham ${code} dihapus dari watchlist.`, 'info');
    } else {
      setWatchlistCodes(prev => [...prev, code]);
      showToast(`Saham ${code} berhasil ditambahkan ke watchlist.`, 'success');
    }
  };

  const toggleAlert = (code: string) => {
    const current = alertSettings[code] ?? false;
    setAlertSettings(prev => ({
      ...prev,
      [code]: !current
    }));
    showToast(`Notifikasi alert perubahan status untuk ${code} berhasil ${!current ? 'diaktifkan 🔔' : 'dimatikan 🔕'}.`, 'success');
  };

  const navigateToDetail = (code: string) => {
    setSelectedStockCode(code);
    setActiveTab('detail');
    setMobileMenuOpen(false);
  };

  return (
    <div id="main-root-container" className="min-h-screen bg-[#0A0B0D] text-gray-200 flex flex-col font-sans select-none antialiased">
      
      {/* HEADER NAVBAR ON MOBILE */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#14161B] border-b border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500 text-black font-bold text-xs">
            B
          </div>
          <span className="font-bold text-sm tracking-tight text-white italic">BANDAR<span className="text-emerald-500 font-bold">LOGIC</span></span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-gray-900 border border-gray-700 text-gray-400 hover:text-white rounded transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* FULL RESPONSIVE CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className={`w-60 bg-[#14161B] border-r border-gray-800 p-0 flex flex-col justify-between z-30 md:sticky md:top-0 md:h-screen ${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 top-[61px] md:top-0 right-0 bg-[#14161B]/95 backdrop-blur-xs' : 'hidden md:flex'
        }`}>
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Logo Brand Brandarmologi */}
              <div className="hidden md:flex items-center gap-2 p-6 border-b border-gray-800">
                <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-black text-sm">
                  B
                </div>
                <span className="text-xl font-bold tracking-tight text-white italic">BANDAR<span className="text-emerald-500 font-bold">LOGIC</span></span>
              </div>

              {/* Navigation Menu Links */}
              <div className="py-4">
                <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Main Menu</div>
                <nav className="space-y-0.5">
                  <button
                    onClick={() => { setActiveTab('ma-screener'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                      activeTab === 'ma-screener' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500 font-semibold' 
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 opacity-80 text-xs">📈</span> Screener Teknikal MA
                  </button>

                  <button
                    onClick={() => { setActiveTab('detail'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                      activeTab === 'detail' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500 font-semibold' 
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 opacity-80 text-xs">📊</span> Detail Analisis
                  </button>
                </nav>
              </div>
            </div>

            {/* Sidebar Account Profile Indicator */}
            <div className="p-6 border-t border-gray-800 space-y-4">
              {loadingUser ? (
                <div className="h-10 bg-gray-800 animate-pulse rounded-lg"></div>
              ) : user && (
                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-gray-800 bg-gray-900/30 hover:bg-gray-800/60'
                  }`}
                >
                  <div className={`p-1.5 rounded ${user.isPremium ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">Profil Akun</p>
                    <p className="text-xs font-semibold text-gray-300 truncate leading-none mt-0.5">{user.email}</p>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-1 font-mono leading-none">{user.subscriptionPlan}</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN BODY AREA CONTENT */}
        <main id="main-content" className="flex-1 flex flex-col min-h-screen overflow-hidden">
          
          {/* TOP HEADER BAR (From Professional Polish Theme) */}
          <header className="h-16 bg-[#14161B] border-b border-gray-800 flex items-center justify-between px-6 md:px-8 shrink-0">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <span className="text-gray-500 uppercase font-bold">IHSG</span>
                <span className="font-mono font-bold text-emerald-400">7,234.12</span>
                <span className="text-xs text-emerald-500">+0.45% ▲</span>
              </div>
              <div className="h-4 w-[1px] bg-gray-700"></div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-emerald-500 tracking-wider">MARKET OPEN</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                {user ? user.email.substring(0, 2).toUpperCase() : 'JD'}
              </div>
            </div>
          </header>

          {/* ACTIVE VIEW PORT CONTAINER WITH PROFESSIONAL PADDING & LAYOUT */}
          <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto space-y-8 max-w-7xl w-full mx-auto">
            
            {/* SCREEN HEADER */}
            <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase font-mono">
                  {activeTab === 'ma-screener' && "Screener Teknikal MA (Dow Theory & Price Action)"}
                  {activeTab === 'detail' && `Deep-Dive Analisis Saham: ${selectedStockCode}`}
                  {activeTab === 'profile' && "Status Lisensi & Aplikasi"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeTab === 'ma-screener' && "Strategi MA20, MA50, MA200, slope filter, volume confirm, & anti-whipsaw."}
                  {activeTab === 'detail' && `Laporan mendetail rekapitulasi data broker summary untuk emiten ${selectedStockCode}.`}
                  {activeTab === 'profile' && "Informasi detail akun akses pribadi Anda."}
                </p>
              </div>
            </div>

            {/* RENDER ACTIVE TAB */}
            {activeTab === 'ma-screener' && (
              <MAScreenerTab 
                onSelectStock={navigateToDetail}
              />
            )}

            {activeTab === 'detail' && (
              <DetailTab 
                stockCode={selectedStockCode}
                watchlistCodes={watchlistCodes}
                onToggleWatchlist={toggleWatchlist}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab 
                user={user}
                onUpgrade={upgradeUserProfile}
                loading={loadingUser}
              />
            )}

          </div>

          {/* GLOBAL DISCLAIMER STICKY COMPLIANCE FOOTER */}
          <footer className="bg-[#0A0B0D] border-t border-gray-800 py-4 px-6 md:px-8 text-center text-[10px] text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
            <div className="text-[10px] text-gray-500 text-left max-w-xl">
              Data delayed by 15 mins. <span className="font-bold">Disclaimer:</span> Seluruh data, chart, pola, status akumulasi/distribusi bandarmologi, serta laporan asisten pintar kecerdasan buatan Gemini di aplikasi ini hanya digunakan sebagai referensi pendukung edukasi. Berinvestasi mengandung risiko kerugian finansial yang signifikan.
            </div>
            <div className="flex gap-4 text-[10px] text-gray-500 uppercase tracking-tighter shrink-0">
              <span className="text-gray-700">v1.2.0-PERSONAL</span>
            </div>
          </footer>
        </main>
      </div>

      {/* TOAST NOTIFICATION CONTAINER SYSTEM */}
      <div id="toast-wrapper" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border text-xs md:text-sm font-semibold flex items-center justify-between gap-3 animate-slide-in-right ${
              toast.type === 'success' 
                ? 'bg-[#14161B] border-emerald-500/30 text-emerald-400' 
                : toast.type === 'error' 
                ? 'bg-[#14161B] border-rose-500/30 text-rose-400' 
                : 'bg-[#14161B] border-blue-500/30 text-blue-400'
            }`}
          >
            <p className="flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-gray-500 hover:text-gray-300 transition-colors font-bold text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
