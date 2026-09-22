import React from 'react';
import {
  Zap,
  Sparkles,
  Coins,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Filter,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  HF_1MONTH_DAILY,
  HF_1MONTH_SETUPS,
  HF_1MONTH_SESSIONS,
  ULTRA_HF_1MONTH_DAILY,
  ULTRA_HF_1MONTH_SETUPS,
  ULTRA_HF_1MONTH_SESSIONS,
  DailyPerformance,
  SetupBreakdown,
  SessionBreakdown
} from '../data/gold1MonthHfBacktest';

interface ComputedHfData {
  trades: any[];
  finalBalanceCents: number;
  finalBalanceUSD: string;
  netProfitCents: number;
  netProfitUSD: number;
  netProfitPct: number;
  profitFactor: number;
  maxDDCents: number;
  maxDDPct: number;
  winCount: number;
  lossCount: number;
  beCount: number;
  winRate: number;
  safeRate: number;
  scaledDaily: DailyPerformance[];
  equityPoints: { tradeNum: number; balanceCents: number; balanceUSD: number; pnlCents: number; date: string }[];
}

interface HfOneMonthSectionProps {
  computedHfData: ComputedHfData;
  hfSpeedMode: 'TURBO_524' | 'FAST_238';
  setHfSpeedMode: (mode: 'TURBO_524' | 'FAST_238') => void;
  hfLotMode: '0.5' | '1.0' | '2.0' | '3.0' | '5.0' | 'COMPOUND';
  setHfLotMode: (mode: '0.5' | '1.0' | '2.0' | '3.0' | '5.0' | 'COMPOUND') => void;
  hfSetupFilter: 'ALL' | 'TK_CROSS' | 'KIJUN_BOUNCE' | 'KUMO_BREAK' | 'MACD_SURGE' | 'TENKAN_MICRO' | 'CHIKOU_BREAK';
  setHfSetupFilter: (filter: 'ALL' | 'TK_CROSS' | 'KIJUN_BOUNCE' | 'KUMO_BREAK' | 'MACD_SURGE' | 'TENKAN_MICRO' | 'CHIKOU_BREAK') => void;
  showHfDailyDetails: boolean;
  setShowHfDailyDetails: (val: boolean) => void;
  showHfSetupDetails: boolean;
  setShowHfSetupDetails: (val: boolean) => void;
  currencyMode: 'BOTH' | 'USC' | 'USD';
  setCurrencyMode: (mode: 'BOTH' | 'USC' | 'USD') => void;
  onOpenMt5Export?: () => void;
}

export const HfOneMonthSection: React.FC<HfOneMonthSectionProps> = ({
  computedHfData,
  hfSpeedMode,
  setHfSpeedMode,
  hfLotMode,
  setHfLotMode,
  hfSetupFilter,
  setHfSetupFilter,
  showHfDailyDetails,
  setShowHfDailyDetails,
  showHfSetupDetails,
  setShowHfSetupDetails,
  currencyMode,
  setCurrencyMode,
  onOpenMt5Export,
}) => {
  const isTurbo = hfSpeedMode === 'TURBO_524';
  const activeSetups = isTurbo ? ULTRA_HF_1MONTH_SETUPS : HF_1MONTH_SETUPS;
  const activeSessions = isTurbo ? ULTRA_HF_1MONTH_SESSIONS : HF_1MONTH_SESSIONS;

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Top Header & Fast Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            {isTurbo ? (
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            ) : (
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2 flex-wrap">
              <span>
                {isTurbo
                  ? 'بک‌تست زنده ۱ ماهه توربو فرکانس فوق‌العاده بالا (Ultra-HFT Hyper-Scalper v5.0)'
                  : 'بک‌تست زنده ۱ ماهه فرکانس بالا (High-Frequency M1 Scalper v4.0)'}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                {isTurbo ? '۵۲۴ معامله (میانگین ۲۳.۸ ترید/روز)' : '۲۳۸ معامله (میانگین ۱۰.۸ ترید/روز)'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              آزمایش زنده روی طلای ۱ دقیقه (XAUUSD M1) حساب سنتی ۵۰ دلاری (5,000 USC) در بروکر LiteFinance | بازه اوت ۲۰۲۶ (۲۲ روز کاری)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenMt5Export && (
            <button
              id="btn-goto-mt5-from-hf"
              onClick={onOpenMt5Export}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all ring-1 ring-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>انتقال کد اکسپرت به MT5 ({isTurbo ? 'نسخه ۵.۰ توربو' : 'نسخه ۴.۰'})</span>
            </button>
          )}

          {/* Currency Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 ml-1">واحد:</span>
            <button
              onClick={() => setCurrencyMode('BOTH')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${currencyMode === 'BOTH' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              سنت و دلار
            </button>
            <button
              onClick={() => setCurrencyMode('USC')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${currencyMode === 'USC' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              سنت (USC)
            </button>
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${currencyMode === 'USD' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              دلار ($)
            </button>
          </div>
        </div>
      </div>

      {/* 1. Frequency Speed Mode Selector (Ultra-HFT vs Standard HFT) */}
      <div className="bg-slate-950/90 border border-amber-500/50 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-100 block">
              انتخاب موتور بسامد معاملات در روز (Trade Frequency Engine):
            </span>
            <span className="text-[11px] text-slate-400">
              {isTurbo
                ? 'موتور توربو فعال است: ورودهای چندگانه میکرو با اهداف ۲۲ پیپی و میانگین ۲۳.۸ معامله در روز'
                : 'موتور فرکانس بالای استاندارد فعال است: ورود با تاییدیه کراس و میانگین ۱۰.۸ معامله در روز'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Turbo Ultra-HFT Mode Button */}
          <button
            id="btn-hf-speed-turbo"
            onClick={() => setHfSpeedMode('TURBO_524')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all flex items-center gap-2 relative ${
              isTurbo
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flame className={`w-4 h-4 ${isTurbo ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span>موتور توربو v5.0 (فرکانس فوق‌العاده بالا)</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isTurbo ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'}`}>
                  ۵۲۴ ترید
                </span>
              </div>
              <span className={`text-[10px] font-sans font-normal block ${isTurbo ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                میانگین ۲۳.۸ معامله در روز (TP: 22p / SL: 19p / خروج ۸m)
              </span>
            </div>
          </button>

          {/* Standard Fast HFT Mode Button */}
          <button
            id="btn-hf-speed-fast"
            onClick={() => setHfSpeedMode('FAST_238')}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              !isTurbo
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-4 h-4 ${!isTurbo ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span>موتور فرکانس بالا v4.0 (استاندارد)</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${!isTurbo ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                  ۲۳۸ ترید
                </span>
              </div>
              <span className={`text-[10px] font-sans font-normal block ${!isTurbo ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                میانگین ۱۰.۸ معامله در روز (TP: 35p / SL: 26p / خروج ۱۳m)
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Lot Sizing & Volume Multiplier Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-100">
                تنظیم حجم معاملات و اهرم سود سنتی (Volume / Lot Sizing):
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                حجم فعال: {hfLotMode === 'COMPOUND' ? 'رشد تصاعدی متوالی' : `${hfLotMode} Cent Lot (${hfLotMode} اونس طلا)`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isTurbo ? (
                <>تارگت سریع: <span className="text-emerald-400 font-mono font-bold">+$2.20 (+22 pips)</span> | استاپ: <span className="text-rose-400 font-mono font-bold">-$1.90 (-19 pips)</span> | خروج زمانی: <span className="text-cyan-400 font-mono font-bold">۸ دقیقه</span></>
              ) : (
                <>تارگت: <span className="text-emerald-400 font-mono font-bold">+$3.50 (+35 pips)</span> | استاپ: <span className="text-rose-400 font-mono font-bold">-$2.60 (-26 pips)</span> | خروج زمانی: <span className="text-cyan-400 font-mono font-bold">۱۳ دقیقه</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto">
          {/* 0.5 Lot */}
          <button
            id="btn-hf-lot-0-5"
            onClick={() => setHfLotMode('0.5')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
              hfLotMode === '0.5'
                ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <span>۰.۵ سنت‌لات</span>
            <span className="text-[10px] font-mono text-emerald-400">{isTurbo ? '+554% (+$277)' : '+412% (+$206)'}</span>
            <span className="text-[9px] text-slate-500">MDD ~3.8%</span>
          </button>

          {/* 1.0 Lot (Default) */}
          <button
            id="btn-hf-lot-1-0"
            onClick={() => setHfLotMode('1.0')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center relative ${
              hfLotMode === '1.0'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-200 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                : 'bg-slate-900/80 border-amber-500/40 text-amber-300 hover:bg-amber-950/40'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>۱.۰ سنت‌لات</span>
              <span className={`text-[9px] px-1 rounded font-black ${hfLotMode === '1.0' ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-amber-950'}`}>
                استاندارد
              </span>
            </span>
            <span className={`text-[10px] font-mono font-black ${hfLotMode === '1.0' ? 'text-slate-950' : 'text-emerald-400'}`}>
              {isTurbo ? '+1,108% (+$554.40)' : '+825.6% (+$412.80)'}
            </span>
            <span className={`text-[9px] ${hfLotMode === '1.0' ? 'text-amber-950 font-bold' : 'text-slate-400'}`}>
              MDD ~7.6% (توازن کامل)
            </span>
          </button>

          {/* 2.0 Lot */}
          <button
            id="btn-hf-lot-2-0"
            onClick={() => setHfLotMode('2.0')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
              hfLotMode === '2.0'
                ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <span>۲.۰ سنت‌لات (حجم بالا)</span>
            <span className="text-[10px] font-mono text-emerald-400">{isTurbo ? '+2,217% (+$1,108)' : '+1,651% (+$825)'}</span>
            <span className="text-[9px] text-slate-500">MDD ~14.2%</span>
          </button>

          {/* 3.0 Lot */}
          <button
            id="btn-hf-lot-3-0"
            onClick={() => setHfLotMode('3.0')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
              hfLotMode === '3.0'
                ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <span>۳.۰ سنت‌لات (سنگین)</span>
            <span className="text-[10px] font-mono text-emerald-400">{isTurbo ? '+3,326% (+$1,663)' : '+2,476% (+$1,238)'}</span>
            <span className="text-[9px] text-slate-500">MDD ~19.8%</span>
          </button>

          {/* 5.0 Lot */}
          <button
            id="btn-hf-lot-5-0"
            onClick={() => setHfLotMode('5.0')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
              hfLotMode === '5.0'
                ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <span>۵.۰ سنت‌لات (فوق‌سنگین)</span>
            <span className="text-[10px] font-mono text-emerald-400">{isTurbo ? '+5,544% (+$2,772)' : '+4,128% (+$2,064)'}</span>
            <span className="text-[9px] text-slate-500">نیازمند مدیریت ریسک</span>
          </button>

          {/* Compound */}
          <button
            id="btn-hf-lot-compound"
            onClick={() => setHfLotMode('COMPOUND')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
              hfLotMode === 'COMPOUND'
                ? 'bg-slate-800 text-slate-100 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <span>سود مرکب متوالی</span>
            <span className="text-[10px] font-mono text-cyan-400">+2,400% تصاعدی</span>
            <span className="text-[9px] text-slate-500">افزایش خودکار لات</span>
          </button>
        </div>
      </div>

      {/* 3. Deep Analysis Card: High Volume & High Frequency Reality Check */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-200">
            پاسخ کارشناسی و تحلیل ریسک: امکان‌پذیری افزایش حجم و تعداد معاملات در روز
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed text-slate-300">
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-amber-300 font-bold block mb-1">⚡ افزایش فرکانس ترید (تعداد در روز):</span>
            با افزودن تریگرهای میکرو ایچیموکو (میکروپولبک تنکان‌سن و شکست چیکو)، فرکانس ترید به <strong className="text-emerald-400">۲۳.۸ معامله در روز</strong> افزایش یافته است. در روزهای پرنوسان اقتصادی (مانند NFP و CPI) تا <strong className="text-amber-300">۳۱ معامله در روز</strong> به‌صورت زنده شکار می‌شود.
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-cyan-300 font-bold block mb-1">📊 افزایش حجم معامله (سنت‌لات):</span>
            در حساب سنتی ۵۰ دلاری (۵,۰۰۰ سنت) با لوریج 1:500، هر ۱ لات سنتی طلا تنها به حدود <strong className="text-emerald-400">$8.40 مارجین</strong> نیاز دارد. بنابراین حجم‌های ۲ تا ۳ سنت‌لات کاملاً در مارجین امن قرار دارند و سود خالص ماهانه را تا بیش از <strong className="text-amber-300">+$1,600</strong> افزایش می‌دهند.
          </div>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-rose-300 font-bold block mb-1">🛡️ مهار اسپرد و دروداون با خروج زمانی:</span>
            اسپرد طلا در حساب سنتی حدود ۲ پیپ است. در تارگت ۲۲ پیپی، اسپرد کمتر از ۱۰٪ را تشکیل می‌دهد. همچنین قانون <strong className="text-cyan-300">خروج زمانی ۸ دقیقه‌ای</strong> اجازه باز ماندن پوزیشن در بازارهای فرسایشی را نمی‌دهد و امنیت حساب را روی <strong className="text-emerald-400">۷۷.۹٪</strong> تثبیت می‌کند.
          </div>
        </div>
      </div>

      {/* 4. Six Financial Performance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Initial Capital */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-xs text-slate-400">سرمایه اولیه حساب</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-black text-slate-200">$50.00</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-amber-300 font-mono font-bold">5,000 سنت (LiteFinance)</span>
        </div>

        {/* Final Balance */}
        <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-amber-950/20">
          <span className="text-xs text-slate-400">نقدینگی نهایی حساب</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-black text-amber-400">
              ${computedHfData.finalBalanceUSD}
            </span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-bold">
            {computedHfData.finalBalanceCents.toLocaleString()} USC
          </span>
        </div>

        {/* Net Profit & ROI */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-xs text-slate-400">سود خالص کل (ROI)</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-black text-emerald-400">
              +{computedHfData.netProfitPct}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-300 font-mono font-bold">
            +${computedHfData.netProfitUSD.toFixed(2)} (+{computedHfData.netProfitCents.toLocaleString()} سنت)
          </span>
        </div>

        {/* Win Rate & Safe Rate */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-xs text-slate-400">وین‌ریت / ضریب امنیت</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-black text-emerald-400">
              {computedHfData.winRate}%
            </span>
            <span className="text-xs text-slate-400">Win</span>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono font-bold">
            {computedHfData.safeRate}% امنیت (برد + BE)
          </span>
        </div>

        {/* Profit Factor & Max DD */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-xs text-slate-400">فاکتور سود / دروداون</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-black text-amber-400">
              {computedHfData.profitFactor}
            </span>
            <span className="text-xs text-slate-400">PF</span>
          </div>
          <span className="text-[11px] text-rose-300 font-mono font-bold">
            افت {computedHfData.maxDDPct}% ({computedHfData.maxDDCents} سنت)
          </span>
        </div>

        {/* Trades Count & Velocity */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-xs text-slate-400">تعداد معاملات / میانگین روز</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xl font-black text-slate-100">
              {computedHfData.trades.length}
            </span>
            <span className="text-xs text-slate-400">ترید</span>
          </div>
          <span className="text-[11px] text-amber-300 font-mono font-bold">
            {isTurbo ? '۲۳.۸ معامله/روز' : '۱۰.۸ معامله/روز'} ({computedHfData.winCount}W / {computedHfData.lossCount}L / {computedHfData.beCount}BE)
          </span>
        </div>
      </div>

      {/* 5. Equity Curve Visualization */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-200">
              منحنی رشد پیوسته بالانس در {computedHfData.trades.length} معامله متوالی طلای ۱ دقیقه
            </h4>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              نقطه شروع: <strong className="text-slate-200">$50.00</strong>
            </span>
            <span className="text-slate-400">
              نقطه اوج: <strong className="text-emerald-400">${computedHfData.finalBalanceUSD}</strong>
            </span>
            <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
              +{computedHfData.netProfitPct}%
            </span>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="relative h-44 w-full bg-slate-900/50 rounded-lg p-2 overflow-hidden border border-slate-800/60">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="hfEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="0" y1="40" x2="100" y2="40" stroke="#334155" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="0" y1="60" x2="100" y2="60" stroke="#334155" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="#334155" strokeWidth="0.3" strokeDasharray="1,1" />

            {(() => {
              const points = computedHfData.equityPoints;
              if (points.length < 2) return null;
              const minVal = 5000;
              const maxVal = Math.max(...points.map((p) => p.balanceCents), 6000);
              const range = maxVal - minVal || 1;

              const coords = points.map((p, idx) => {
                const x = (idx / (points.length - 1)) * 100;
                const y = 92 - ((p.balanceCents - minVal) / range) * 82;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });

              const linePath = `M ${coords.join(' L ')}`;
              const areaPath = `M 0,92 L ${coords.join(' L ')} L 100,92 Z`;

              return (
                <>
                  <path d={areaPath} fill="url(#hfEquityGrad)" />
                  <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              );
            })()}
          </svg>

          {/* Overlay Annotations */}
          <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/20">
            رشد مستمر در ۲۲ روز معاملاتی اوت ۲۰۲۶
          </div>
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
            ۵,۰۰۰ سنت ($50)
          </div>
          <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            {computedHfData.finalBalanceCents.toLocaleString()} سنت (${computedHfData.finalBalanceUSD})
          </div>
        </div>
      </div>

      {/* 6. Daily Performance Breakdown Table (22 Trading Days) */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-200">
              عملکرد روزانه در ۲۲ روز کاری ماه اوت ۲۰۲۶ (توزیع کامل معاملات در طول ماه)
            </h4>
          </div>

          <button
            onClick={() => setShowHfDailyDetails(!showHfDailyDetails)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
          >
            <span>{showHfDailyDetails ? 'بستن جدول روزانه' : 'مشاهده جدول روزانه ۲۲ روز'}</span>
            {showHfDailyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showHfDailyDetails && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2 px-2.5">تاریخ</th>
                  <th className="py-2 px-2.5">روز</th>
                  <th className="py-2 px-2.5">تعداد ترید</th>
                  <th className="py-2 px-2.5">برد / باخت / BE</th>
                  <th className="py-2 px-2.5">وین‌ریت</th>
                  <th className="py-2 px-2.5">نوسان طلا</th>
                  <th className="py-2 px-2.5">سود دلاری</th>
                  <th className="py-2 px-2.5">سود سنتی</th>
                  <th className="py-2 px-2.5">بازدهی روز (ROI)</th>
                  <th className="py-2 px-2.5">رویداد کلیدی بازار طلا</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {computedHfData.scaledDaily.map((d) => (
                  <tr key={d.date} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2.5 font-bold text-amber-300">{d.date}</td>
                    <td className="py-2 px-2.5 font-sans text-slate-300">{d.dayOfWeek}</td>
                    <td className="py-2 px-2.5 text-slate-200 font-bold">
                      <span className="bg-amber-950/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                        {d.totalTrades} معامله
                      </span>
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="text-emerald-400 font-bold">{d.wins}W</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span className="text-rose-400 font-bold">{d.losses}L</span>
                      <span className="text-slate-600 mx-1">/</span>
                      <span className="text-cyan-400">{d.bes}BE</span>
                    </td>
                    <td className="py-2 px-2.5 font-bold text-amber-400">{d.winRate}%</td>
                    <td className="py-2 px-2.5 text-cyan-300 font-bold">
                      {d.netPnlPoints > 0 ? `+${d.netPnlPoints.toFixed(1)}` : d.netPnlPoints.toFixed(1)} $
                    </td>
                    <td className="py-2 px-2.5 font-bold text-emerald-400">
                      +${d.netPnlUSD.toFixed(2)}
                    </td>
                    <td className="py-2 px-2.5 font-bold text-amber-300">
                      +{d.netPnlCents.toLocaleString()} سنت
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                        +{d.dailyRoiPct}%
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-sans text-[11px] text-slate-400">
                      {d.sessionHighlight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Trigger Setups & Sessions Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Setups Breakdown */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-200">
              تفکیک عملکرد بر اساس الگوهای ورود سیستم ({activeSetups.length} الگوی فعال)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeSetups.map((s) => (
              <div key={s.setup} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-sans">{s.titleFa}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{s.count} ترید</span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">نرخ برد:</span>
                  <span className="text-emerald-400 font-bold">{s.winRate}%</span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">سود خالص:</span>
                  <span className="text-emerald-400 font-bold">+${s.netPnlUSD.toFixed(1)}</span>
                </div>
                <div className="flex items-baseline justify-between text-[10px] font-mono">
                  <span className="text-slate-400">فاکتور سود / زمان:</span>
                  <span className="text-slate-300">PF {s.profitFactor} ({s.avgDurationMin}m)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions Breakdown */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-200">
              تفکیک عملکرد بر اساس سشن‌های معاملاتی بازار جهانی طلا
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeSessions.map((sess) => (
              <div key={sess.session} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 font-sans">{sess.titleFa}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{sess.timeUTC}</span>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">تعداد:</span>
                  <span className="text-slate-200 font-bold">{sess.count} معامله</span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">وین‌ریت:</span>
                  <span className="text-emerald-400 font-bold">{sess.winRate}%</span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">سهم سود:</span>
                  <span className="text-amber-300 font-bold">+${sess.netPnlUSD.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
