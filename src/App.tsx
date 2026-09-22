import React, { useState, useMemo, useEffect } from 'react';
import { MARKET_ASSETS } from './data/marketData';
import { calculateIndicators, DEFAULT_ICHIMOKU_CONFIG, IchimokuParamsConfig } from './utils/indicators';
import { ChartCanvas } from './components/ChartCanvas';
import { LayerControls } from './components/LayerControls';
import { StrategyPanel } from './components/StrategyPanel';
import { SignalScorecard } from './components/SignalScorecard';
import { AssetSelector } from './components/AssetSelector';
import { BacktestView } from './components/BacktestView';
import { Mt5ExportView } from './components/Mt5ExportView';
import { MultiTimeframeAIView } from './components/MultiTimeframeAIView';
import { LiveEaCommanderView } from './components/LiveEaCommanderView';
import { PatternAndCycleInspector } from './components/PatternAndCycleInspector';
import { IchimokuOptimizerWidget } from './components/IchimokuOptimizerWidget';
import { ElliottNeowaveLogo } from './components/ElliottNeowaveLogo';
import { BookOpen, Sparkles, Waves, BarChart3, HelpCircle, ExternalLink, LineChart, FileText, Coins, Terminal, Sliders, Brain, Layers, Radio, Lock, Unlock, ShieldAlert, ArrowRight, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live_commander' | 'ai_mtf' | 'mt5' | 'backtest' | 'chart'>('live_commander');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('btc_usdt');

  // Master Authentication State (Dark Gate like X)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('en_vip_panel_auth') === 'true' || localStorage.getItem('en_vip_panel_auth') === 'true';
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Dynamic Ichimoku Parameters (Default to Symphony TWIO 9, 45, 225 harmonic scales)
  const [ichimokuConfig, setIchimokuConfig] = useState<IchimokuParamsConfig>({
    sTenkan: 9,
    sKijun: 45,
    sSpanB: 225,
    mTenkan: 45,
    mKijun: 130,
    mSpanB: 260,
    lTenkan: 225,
    lKijun: 650,
    chikouShift: 15,
    fldShort: 20,
    fldMed: 35,
    fldLong: 50,
  });

  // Layer Visibility State
  const [visibleLayers, setVisibleLayers] = useState({
    sIchi: true,
    mIchi: true,
    lIchi: false,
    sFld: true,
    mFld: true,
    lFld: false,
    sCloud: true,
    mCloud: true,
    eszZone: true,
    boundaries: true,
    targets: true,
    cycleMarks: true,
    hosodaWaves: true,
    positionTool: true,
    timeWindows: true,
  });

  const activeAsset = useMemo(() => {
    return MARKET_ASSETS.find((a) => a.id === selectedAssetId) || MARKET_ASSETS[0];
  }, [selectedAssetId]);

  const calculatedData = useMemo(() => {
    return calculateIndicators(activeAsset.candles, ichimokuConfig);
  }, [activeAsset, ichimokuConfig]);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(false);

    setTimeout(() => {
      const trimmed = passwordInput.trim();
      // Validates master panel password: 142536.j.Blunt%
      if (trimmed === '142536.j.Blunt%') {
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('en_vip_panel_auth', 'true');
          localStorage.setItem('en_vip_panel_auth', 'true');
        }
      } else {
        setAuthError(true);
      }
      setAuthLoading(false);
    }, 250);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('en_vip_panel_auth');
      localStorage.removeItem('en_vip_panel_auth');
    }
  };

  // IF NOT AUTHENTICATED: Display Full-Screen Smoky Dark X-Terminal Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-[#e7e9ea] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Deep Smoky Radial Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(29,155,240,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,186,124,0.03),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

        {/* Minimalist Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        {/* Central Auth Container */}
        <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
          {/* Elliott Neowave Official Logo */}
          <div className="flex flex-col items-center gap-3">
            <ElliottNeowaveLogo size="xl" />

            <div className="text-center flex flex-col items-center gap-1 mt-1">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#71767b] uppercase">
                COCKPIT // ELLIOTTNEOWAVE.IR
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ورود به مرکز فرماندهی
              </h1>
              <p className="text-xs text-[#71767b] max-w-xs">
                جهت دسترسی به پنل مدیریت زنده اکسپرت و تله‌متری متاتریدر ۵ رمز عبور را وارد کنید.
              </p>
            </div>
          </div>

          {/* Form Box */}
          <form 
            onSubmit={handleUnlock}
            className="w-full bg-[#0c0d0e] border border-[#202327] rounded-3xl p-6 sm:p-7 flex flex-col gap-4 shadow-2xl shadow-black"
          >
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-bold text-[#e7e9ea] flex items-center justify-between">
                <span>رمز عبور مدیریت (Passcode)</span>
                <KeyRound className="w-3.5 h-3.5 text-[#71767b]" />
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  placeholder="رمز عبور..."
                  autoFocus
                  dir="ltr"
                  className={`w-full bg-[#000000] border ${
                    authError ? 'border-[#f4212e] focus:border-[#f4212e]' : 'border-[#27272a] focus:border-[#1d9bf0]'
                  } rounded-2xl px-4 py-3.5 text-center text-sm font-mono tracking-widest text-white placeholder-[#71767b] outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="text-[11px] text-[#f4212e] flex items-center gap-1.5 mt-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>رمز عبور نامعتبر است. مجدداً تلاش کنید.</span>
                </div>
              )}
            </div>

            {/* Submit Button - X Style High Contrast */}
            <button
              type="submit"
              disabled={authLoading || !passwordInput}
              className="w-full bg-[#eff3f4] hover:bg-white text-black font-black text-sm py-3.5 px-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>باز کردن و ورود به پنل</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>

            {/* Quick Helper / Subdomain Badge */}
            <div className="pt-2 border-t border-[#1e2226] flex items-center justify-between text-[11px] text-[#71767b]">
              <span className="font-mono">ea.elliottneowave.ir</span>
              <span className="flex items-center gap-1 text-[#00ba7c] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ba7c] animate-pulse" />
                <span>MT5 سرور آنلاین</span>
              </span>
            </div>
          </form>

          {/* Footer Branding Note */}
          <div className="text-[11px] text-[#71767b] text-center font-mono">
            SECURE REST-API BRIDGE // ENCRYPTED SESSION
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: Display Full X-Themed Smoky Dark Dashboard
  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] p-3 sm:p-5 lg:p-6 flex flex-col gap-4 selection:bg-[#1d9bf0] selection:text-white">
      {/* Top Header & Navigation Bar - Deep Smoky X-Style */}
      <header className="bg-[#0c0d0e] border border-[#202327] p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Indicator */}
        <div className="flex items-center gap-3.5">
          <ElliottNeowaveLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                پنل فرماندهی متاتریدر ۵
              </h1>
              <span className="text-[10px] bg-[#16181c] text-[#1d9bf0] border border-[#1d9bf0]/30 px-2 py-0.5 rounded-full font-mono font-bold">
                elliottneowave.ir
              </span>
              <span className="text-[10px] bg-[#00ba7c]/10 text-[#00ba7c] border border-[#00ba7c]/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ba7c] animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-xs text-[#71767b]">
              هدایت زنده پوزیشن‌ها و تله‌متری طلا در متاتریدر ۵
            </p>
          </div>
        </div>

        {/* Center/Right: View Mode Switcher & Lock Button */}
        <div className="w-full lg:w-auto flex flex-wrap items-center justify-between lg:justify-end gap-2">
          <div className="overflow-x-auto smooth-scroll-x flex items-center gap-1.5 bg-[#000000] p-1 rounded-xl border border-[#202327]">
            <button
              id="tab-live-commander"
              onClick={() => setActiveTab('live_commander')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'live_commander'
                  ? 'bg-[#eff3f4] text-black font-black shadow-md'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-[#16181c]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>هدایت زنده اکسپرت</span>
            </button>

            <button
              id="tab-ai-mtf"
              onClick={() => setActiveTab('ai_mtf')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'ai_mtf'
                  ? 'bg-[#eff3f4] text-black font-black shadow-md'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-[#16181c]'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>هوش مصنوعی (AI)</span>
            </button>

            <button
              id="tab-mt5"
              onClick={() => setActiveTab('mt5')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'mt5'
                  ? 'bg-[#eff3f4] text-black font-black shadow-md'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-[#16181c]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>کد MQL5</span>
            </button>

            <button
              id="tab-backtest"
              onClick={() => setActiveTab('backtest')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'backtest'
                  ? 'bg-[#eff3f4] text-black font-black shadow-md'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-[#16181c]'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>بک‌تست طلا</span>
            </button>

            <button
              id="tab-chart"
              onClick={() => setActiveTab('chart')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'chart'
                  ? 'bg-[#eff3f4] text-black font-black shadow-md'
                  : 'text-[#71767b] hover:text-[#e7e9ea] hover:bg-[#16181c]'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>چارت تعاملی</span>
            </button>
          </div>

          {/* Explicit Lock Button */}
          <button
            type="button"
            onClick={handleLock}
            title="قفل کردن پنل"
            className="px-3 py-2 rounded-xl bg-[#16181c] hover:bg-[#202327] text-[#71767b] hover:text-[#f4212e] border border-[#27272a] text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">قفل پنل</span>
          </button>
        </div>
      </header>

      {/* View -2: Live EA Commander & Web-to-MT5 Bridge */}
      {activeTab === 'live_commander' && (
        <LiveEaCommanderView onOpenMt5Export={() => setActiveTab('mt5')} />
      )}

      {/* View -1: AI Engine & Multi-Timeframe Matrix */}
      {activeTab === 'ai_mtf' && (
        <MultiTimeframeAIView onOpenMt5Export={() => setActiveTab('mt5')} />
      )}

      {/* View 0: MT5 MQL5 Code, Indicator & Compounding EA */}
      {activeTab === 'mt5' && (
        <Mt5ExportView />
      )}

      {/* View 1: 5M Gold Backtest Report */}
      {activeTab === 'backtest' && (
        <BacktestView onOpenMt5Export={() => setActiveTab('mt5')} />
      )}

      {/* View 2: Live Interactive System Chart & Strategy */}
      {activeTab === 'chart' && (
        <>
          {/* Sub-header with Asset Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0c0d0e] border border-[#202327] p-3 rounded-2xl">
            <AssetSelector
              assets={MARKET_ASSETS}
              selectedId={selectedAssetId}
              onSelect={setSelectedAssetId}
            />
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-[#71767b]">کانال فشردگی:</span>
              <span className="text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                ${activeAsset.lowerBoundary.toLocaleString()} - ${activeAsset.upperBoundary.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Signal Scorecard & Quantitative Indicators */}
          <SignalScorecard asset={activeAsset} />

          {/* The Visual Chart Area */}
          <main className="w-full">
            <ChartCanvas
              asset={activeAsset}
              data={calculatedData}
              visibleLayers={visibleLayers}
            />
          </main>

          {/* Precision Analytics: Patterns, Risk/Position Sizing, & Cycles Radar */}
          <PatternAndCycleInspector asset={activeAsset} />

          {/* Ichimoku Parameters Auto-Optimizer & AI Tuning Widget */}
          <IchimokuOptimizerWidget
            asset={activeAsset}
            activeConfig={ichimokuConfig}
            onApplyConfig={setIchimokuConfig}
          />

          {/* Interactive Layer Controllers */}
          <LayerControls
            layers={visibleLayers}
            setLayers={setVisibleLayers}
          />

          {/* Step-by-Step Strategy Walkthrough */}
          <StrategyPanel asset={activeAsset} />
        </>
      )}

      {/* Strategy Documentation & Architecture Card */}
      <footer className="bg-[#0c0d0e] border border-[#202327] rounded-2xl p-4 sm:p-5 text-xs text-[#71767b] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202327] pb-3">
          <div className="flex items-center gap-2 text-[#e7e9ea] font-bold text-sm">
            <BookOpen className="w-4 h-4 text-[#1d9bf0]" />
            <span>اصول و ساختار فنی سیستم معاملاتی (elliottneowave.ir)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#71767b]">
            <span className="bg-[#16181c] px-2 py-0.5 rounded text-[#e7e9ea]">۱. وب‌سایت مرجع elliottneowave.ir</span>
            <span className="bg-[#16181c] px-2 py-0.5 rounded text-[#1d9bf0]">۲. موتور هوش مصنوعی و محافظت اخبار v6.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 leading-relaxed">
          <div className="bg-[#000000] p-3 rounded-xl border border-[#202327] flex flex-col gap-1.5">
            <strong className="text-amber-400 block font-bold">۱. هارمونی لایه‌ها و ناحیه تراکم (ESZ):</strong>
            <p className="text-[#a0a6ad] text-[11px]">
              نسبت‌های هارمونیک سه‌گانه افق‌های زمانی بازار را متصل می‌کنند. فشردگی در منطقه آرامش انرژی فنر را شارژ کرده و زمینه حرکت انفجاری را می‌سازد.
            </p>
          </div>
          <div className="bg-[#000000] p-3 rounded-xl border border-[#202327] flex flex-col gap-1.5">
            <strong className="text-[#1d9bf0] block font-bold">۲. تاییدیه مومنتوم و فضای باز چیکو:</strong>
            <p className="text-[#a0a6ad] text-[11px]">
              تحلیل ضخامت ابر و تایید عبور خط راهنما در فضای باز (Clear Skies بدون مانع ۲۶ کندل قبل)، به همراه تارگت‌های امواج و الگوها.
            </p>
          </div>
          <div className="bg-[#000000] p-3 rounded-xl border border-[#202327] flex flex-col gap-1.5">
            <strong className="text-[#00ba7c] block font-bold">۳. مغناطیس زمانی و سپر اخبار:</strong>
            <p className="text-[#a0a6ad] text-[11px]">
              تلاقی چرخه‌های زمانی با سپر هوشمند اخبار اقتصادی، خروج به‌موقع پیش از نوسانات مخرب و فعال‌سازی تریلینگ‌استاپ داینامیک.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

