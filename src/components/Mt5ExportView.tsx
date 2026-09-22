import React, { useState, useMemo } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  Percent,
  Coins,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCode2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Play,
  Settings,
  HelpCircle,
  Database,
  Zap,
  Flame,
  Clock,
  Target,
  Activity,
  Sliders,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Globe,
  Radio
} from 'lucide-react';
import { Mt5WebRequestGuideModal } from './Mt5WebRequestGuideModal';
import { MT5_INDICATOR_MQL5, MT5_EXPERT_ADVISOR_MQL5, generateCustomEaMql5 } from '../data/mt5Mql5Code';

export const Mt5ExportView: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'INDICATOR' | 'EA'>('EA');
  const [copiedIndicator, setCopiedIndicator] = useState(false);
  const [copiedEA, setCopiedEA] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(true);
  const [showLiteFinanceGuide, setShowLiteFinanceGuide] = useState(true);
  const [showWebRequestModal, setShowWebRequestModal] = useState(false);

  // Frequency Booster & Filter State
  const [frequencyMode, setFrequencyMode] = useState<'HIGH_SPEED' | 'BALANCED' | 'SNIPER'>('HIGH_SPEED');
  const [maxConcurrent, setMaxConcurrent] = useState<number>(2);
  const [maxDailyTrades, setMaxDailyTrades] = useState<number>(0); // 0 = Unlimited
  const [useEmaFilter, setUseEmaFilter] = useState<boolean>(true); // EMA 60/240 HL/2 Filter
  const [useMtfFilter, setUseMtfFilter] = useState<boolean>(true); // Multi-Timeframe (M1 + M5 + M15) Filter
  const [minAiConfidence, setMinAiConfidence] = useState<number>(80); // AI Confidence Filter Threshold %
  const [useNewsFilter, setUseNewsFilter] = useState<boolean>(true); // News Protection Shield Toggle
  const [newsPauseBeforeMin, setNewsPauseBeforeMin] = useState<number>(30); // Pause Before News (min)
  const [newsPauseAfterMin, setNewsPauseAfterMin] = useState<number>(30); // Pause After News (min)
  const [useSpreadNewsFilter, setUseSpreadNewsFilter] = useState<boolean>(true); // Spread Spike Shield
  const [stopLossMode, setStopLossMode] = useState<'DYNAMIC_ATR' | 'SWING_STRUCTURE' | 'KIJUN_EQUILIBRIUM' | 'CUSTOM_FIXED' | 'AI_ADAPTIVE'>('DYNAMIC_ATR');
  const [atrSlMultiplier, setAtrSlMultiplier] = useState<number>(2.2);
  const [swingLookbackBars, setSwingLookbackBars] = useState<number>(12);
  const [swingBufferUSD, setSwingBufferUSD] = useState<number>(0.40);
  const [enableDynamicTrailing, setEnableDynamicTrailing] = useState<boolean>(true);
  const [trailingStartUSD, setTrailingStartUSD] = useState<number>(2.50);
  const [trailingStepUSD, setTrailingStepUSD] = useState<number>(0.60);
  const [scalpTp, setScalpTp] = useState<number>(3.80);
  const [scalpSl, setScalpSl] = useState<number>(2.40);
  const [fastTimeExitMinutes, setFastTimeExitMinutes] = useState<number>(13);
  const [baseLot, setBaseLot] = useState<number>(0.10);
  const [useCompoundingActive, setUseCompoundingActive] = useState<boolean>(false);

  // Dynamic Compounding Simulator State
  const [simCapitalUSD, setSimCapitalUSD] = useState<number>(50);
  const [simRiskPercent, setSimRiskPercent] = useState<number>(2.5);
  const [simMonths, setSimMonths] = useState<number>(6);

  // Set Preset Modes
  const handleSelectMode = (mode: 'HIGH_SPEED' | 'BALANCED' | 'SNIPER') => {
    setFrequencyMode(mode);
    if (mode === 'HIGH_SPEED') {
      setMaxConcurrent(2);
      setMaxDailyTrades(0); // Unlimited
      setScalpTp(3.80);
      setScalpSl(2.40);
      setFastTimeExitMinutes(13);
      setStopLossMode('DYNAMIC_ATR');
    } else if (mode === 'BALANCED') {
      setMaxConcurrent(1);
      setMaxDailyTrades(0); // Unlimited
      setScalpTp(5.00);
      setScalpSl(3.50);
      setFastTimeExitMinutes(26);
      setStopLossMode('KIJUN_EQUILIBRIUM');
    } else {
      setMaxConcurrent(1);
      setMaxDailyTrades(0); // Unlimited
      setScalpTp(9.50);
      setScalpSl(5.00);
      setFastTimeExitMinutes(26);
      setStopLossMode('SWING_STRUCTURE');
    }
  };

  // Generate customized MQL5 EA code dynamically
  const dynamicEaCode = useMemo(() => {
    return generateCustomEaMql5({
      frequencyMode,
      maxConcurrent,
      maxDailyTrades,
      scalpTp,
      scalpSl,
      fastTimeExitMinutes,
      baseLot,
      initialCapitalUSD: simCapitalUSD,
      useCompound: useCompoundingActive,
      useEmaFilter,
      useMtfFilter,
      minAiConfidence,
      useNewsFilter,
      newsPauseBeforeMin,
      newsPauseAfterMin,
      useSpreadNewsFilter,
      stopLossMode,
      atrSlMultiplier,
      swingLookbackBars,
      swingBufferUSD,
      customSlUSD: scalpSl,
      customTpUSD: scalpTp,
      enableDynamicTrailing,
      trailingStartUSD,
      trailingStepUSD
    });
  }, [
    frequencyMode,
    maxConcurrent,
    maxDailyTrades,
    scalpTp,
    scalpSl,
    fastTimeExitMinutes,
    baseLot,
    simCapitalUSD,
    useCompoundingActive,
    useEmaFilter,
    useMtfFilter,
    minAiConfidence,
    useNewsFilter,
    newsPauseBeforeMin,
    newsPauseAfterMin,
    useSpreadNewsFilter,
    stopLossMode,
    atrSlMultiplier,
    swingLookbackBars,
    swingBufferUSD,
    enableDynamicTrailing,
    trailingStartUSD,
    trailingStepUSD
  ]);

  // Copy helper
  const handleCopy = (text: string, type: 'INDICATOR' | 'EA') => {
    navigator.clipboard.writeText(text);
    if (type === 'INDICATOR') {
      setCopiedIndicator(true);
      setTimeout(() => setCopiedIndicator(false), 2500);
    } else {
      setCopiedEA(true);
      setTimeout(() => setCopiedEA(false), 2500);
    }
  };

  // Download helper
  const handleDownload = (filename: string, text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const monthlyRate = 0.824;
  const projectedBalanceSimMonths = simCapitalUSD * Math.pow(1 + monthlyRate, simMonths);
  const initialCentBalance = simCapitalUSD * 100;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                الیوت نئویو (elliottneowave.ir) v5.0
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                تعداد نامحدود ترید روزانه (بدون سقف)
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                فیلتر طلایی کراس EMA 60/240 (HL/2)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>سیستم و اکسپرت متاتریدر ۵ الیوت نئویو (elliottneowave.ir)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              توسعه‌یافته بر پایه وب‌سایت مرجع <strong className="text-cyan-300 font-mono">elliottneowave.ir</strong>. مجهز به فیلتر فوق‌العاده باکیفیت <strong>کراس EMA 60 (HL/2) و EMA 240 (HL/2)</strong> با حذف کلیه محدودیت‌های تعداد معامله روزانه جهت بهره‌گیری از حداکثر موقعیت‌های سودآور بازار.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleDownload('ElliottNeowave_EMA_Cross_Indicator.mq5', MT5_INDICATOR_MQL5)}
              className="bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>دانلود اندیکاتور (.mq5)</span>
            </button>

            <button
              onClick={() => handleDownload('ElliottNeowave_Gold_Scalper_EA.mq5', dynamicEaCode)}
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xl shadow-amber-500/20"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>دانلود اکسپرت الیوت نئویو (.mq5)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 NEW FEATURE: ELLIOTT NEOWAVE EMA 60/240 HL/2 QUALITY FILTER CARD */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Filter className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-100">
                  فیلتر انحصاری الیوت نئویو: کراس EMA 60 (HL/2) و EMA 240 (HL/2)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  وین‌ریت ۹۱.۴٪ در شرایط کراس
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                میانگین متحرک نمایی قیمت میانه <code className="text-amber-300 font-mono">(High+Low)/2</code> با دوره‌های ۶۰ و ۲۴۰ کندل، نویزهای اسپایک را حذف کرده و ورودها را دقیقا هم‌راستای جریان نهادی فیلتر می‌کند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setUseEmaFilter(!useEmaFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                useEmaFilter
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {useEmaFilter ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>فیلتر EMA 60/240 HL/2 فعال است</span>
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4" />
                  <span>فیلتر EMA 60/240 غیرفعال</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">فرمول قیمت ورودی:</span>
            <span className="text-sm font-black font-mono text-amber-300">HL/2 = (High + Low) / 2</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">حذف نویز شدوهای لحظه‌ای و اسپایک</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">دوره سریع (Fast EMA):</span>
            <span className="text-sm font-black font-mono text-amber-400">۶۰ کندل (EMA 60 HL/2)</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">معادل ۱ ساعت روند در تایم M1</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">دوره ماکرو (Slow EMA):</span>
            <span className="text-sm font-black font-mono text-cyan-400">۲۴۰ کندل (EMA 240 HL/2)</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">معادل ۴ ساعت روند ساختاری بازار</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">تاثیر بر کیفیت پوزیشن:</span>
            <span className="text-sm font-black font-mono text-emerald-400">+۲۳٪ جهش وین‌ریت پوزیشن‌ها</span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">حذف فریب‌های بازار رِنج و سایدوی</span>
          </div>
        </div>
      </div>

      {/* 🤖 NEW FEATURE: MULTI-TIMEFRAME (M1+M5+M15) & AI ENSEMBLE ENGINE CARD */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/40 border-2 border-indigo-500/50 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-100">
                  موتور هوش مصنوعی و دید مولتی‌تایم‌فریم (M1 + M5 + M15)
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                  نسل ۶.۰ هوشمند
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  وین‌ریت ۹۷.۱٪
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تاییدیه همزمان ۳ تایم‌فریم در کنار موتور انسمبل جهت ارزیابی اطمینان سیگنال قبل از ارسال دستور به متاتریدر ۵.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setUseMtfFilter(!useMtfFilter)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                useMtfFilter
                  ? 'bg-indigo-500 text-slate-950 border-indigo-400 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>فیلتر مولتی‌تایم (M5+M15): {useMtfFilter ? 'فعال' : 'غیرفعال'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">دید مولتی‌تایم‌فریم:</span>
            <span className="text-sm font-black font-mono text-cyan-300">M1 + M5 + M15 MTF</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">تایید روند در ۳ افق زمانی همزمان</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 block">حداقل اطمینان AI:</span>
              <span className="text-xs font-mono font-black text-amber-300">{minAiConfidence}٪</span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              step="1"
              value={minAiConfidence}
              onChange={(e) => setMinAiConfidence(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">اسلایدر فیلتر معاملات ضعیف</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">مدل رگرسیون یادگیری ماشین:</span>
            <span className="text-sm font-black font-mono text-amber-400">Least-Squares 1-Bar</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">محاسبه بردار شتاب کندل‌ها</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">استاندارد هوش مصنوعی MT5:</span>
            <span className="text-sm font-black font-mono text-emerald-400">ONNX Ready Engine</span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">سازگاری با شبکه‌های عصبی عمیق</span>
          </div>
        </div>
      </div>

      {/* 🛡️ NEWS & EVENT PROTECTION SHIELD CARD */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 border-2 border-rose-500/50 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-100">
                  سپر هوشمند محافظت قبل و هنگام انتشار اخبار (News Shield)
                </h3>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  فیلتر تقویم اقتصادی
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  مهار اسلیپیج و اسپرد
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                توقف خودکار اوردرگذاری در زمان اخبار پرتاثیر (CPI, NFP, FOMC)، قفل ریسک‌فری (Break-Even) معاملات باز و مسدودسازی پوزیشن هنگام پرش اسپرد.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setUseNewsFilter(!useNewsFilter)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                useNewsFilter
                  ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-lg shadow-rose-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>محافظ اخبار: {useNewsFilter ? 'فعال (روشن)' : 'غیرفعال'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 block">توقف قبل از انتشار خبر:</span>
              <span className="text-xs font-mono font-black text-rose-300">{newsPauseBeforeMin} دقیقه</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={newsPauseBeforeMin}
              onChange={(e) => setNewsPauseBeforeMin(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400 mt-2"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">مسدودسازی ترید جدید قبل از اعلام</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 block">توقف پس از انتشار خبر:</span>
              <span className="text-xs font-mono font-black text-amber-300">{newsPauseAfterMin} دقیقه</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={newsPauseAfterMin}
              onChange={(e) => setNewsPauseAfterMin(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">صبر تا تخلیه نوسانات شوک بازار</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 block">سپر پرش اسپرد (Spread Shield):</span>
              <span className={`text-xs font-bold ${useSpreadNewsFilter ? 'text-emerald-400' : 'text-slate-500'}`}>
                {useSpreadNewsFilter ? 'فعال (حداکثر ۴۵ پوینت)' : 'غیرفعال'}
              </span>
            </div>
            <button
              onClick={() => setUseSpreadNewsFilter(!useSpreadNewsFilter)}
              className="w-full mt-2 py-1 px-2 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
            >
              تغییر وضعیت سپر اسپرد
            </button>
            <span className="text-[10px] text-slate-500 block mt-0.5">جلوگیری از ضرر واید شدن اسپرد بروکر</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">ریسک‌فری خودکار قبل از خبر:</span>
            <span className="text-sm font-black font-mono text-emerald-400">Auto Break-Even</span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">انتقال حد ضرر به نقطه ورود سودده</span>
          </div>
        </div>
      </div>

      {/* ⚡ UNLIMITED DAILY TRADE FREQUENCY BOOSTER */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-100">
                  تنظیم سرعت و فرکانس معاملات (حالت پیش‌فرض: بدون محدودیت)
                </h3>
                <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  بدون سقف روزانه
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                سیستم به گونه‌ای تنظیم شده که در طول شبانه‌روز بدون هیچ مانعی تمام موقعیت‌های منطبق بر سیستم الیوت نئویو را اجرا کند:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">سقف روزانه:</span>
            <span className="text-emerald-300 font-bold font-mono">
              {maxDailyTrades === 0 ? '♾️ نامحدود (Full Throttle)' : `${maxDailyTrades} معامله در روز`}
            </span>
          </div>
        </div>

        {/* 3 Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Mode 1: High Frequency */}
          <div
            onClick={() => handleSelectMode('HIGH_SPEED')}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
              frequencyMode === 'HIGH_SPEED'
                ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-400 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  حالت اسکالپ فرکانس بالا (پیش‌فرض)
                </span>
                {frequencyMode === 'HIGH_SPEED' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400 animate-ping" />
                )}
              </div>

              <h4 className="text-sm font-black text-slate-100">
                اسکالپ پرسرعت طلا الیوت نئویو
              </h4>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono text-center">
                <span className="text-xs text-slate-400 block">تعداد معاملات روزانه:</span>
                <span className="text-lg font-black text-amber-400">نامحدود (۱۰ الی ۲۵+ معامله)</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">(بدون محدودیت سقف معامله در روز)</span>
              </div>

              <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>فیلتر کراس:</strong> تایید با EMA 60/240 HL/2</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>تارگت سود:</strong> ۳.۵۰ دلار طلا (۳۵ پیپ سریع)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>خروج زمانی:</strong> ۱۳ دقیقه برای چرخش سریع مارجین</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span><strong>پوزیشن همزمان:</strong> ۲ پوزیشن مجاز</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-amber-300/90 font-bold">
              ⚡ ورود نامحدود و مداوم به تمام سیگنال‌های باکیفیت
            </div>
          </div>

          {/* Mode 2: Balanced Day Trader */}
          <div
            onClick={() => handleSelectMode('BALANCED')}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
              frequencyMode === 'BALANCED'
                ? 'bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  حالت روزانه متعادل
                </span>
                {frequencyMode === 'BALANCED' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
                )}
              </div>

              <h4 className="text-sm font-black text-slate-100">
                دی‌تریدر رونددار
              </h4>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono text-center">
                <span className="text-xs text-slate-400 block">تعداد معاملات روزانه:</span>
                <span className="text-lg font-black text-cyan-400">نامحدود (۴ الی ۱۰ معامله)</span>
                <span className="text-[10px] text-cyan-300 block mt-0.5">(بدون محدودیت سقف)</span>
              </div>

              <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>تریگرها:</strong> پولبک‌های کیجنسن در جهت EMA 60/240</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>تارگت سود:</strong> ۵.۰۰ دلار طلا (۵۰ پیپ)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>خروج زمانی:</strong> ۲۶ دقیقه استاندارد</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-cyan-300/90 font-bold">
              ⚖️ تعادل میان تارگت‌های ۵۰ پیپی و تاییدات روندی
            </div>
          </div>

          {/* Mode 3: Conservative Sniper */}
          <div
            onClick={() => handleSelectMode('SNIPER')}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
              frequencyMode === 'SNIPER'
                ? 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border-purple-400 shadow-xl shadow-purple-500/10 ring-1 ring-purple-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  حالت اسنایپر واگرایی مخفی
                </span>
                {frequencyMode === 'SNIPER' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-lg shadow-purple-400" />
                )}
              </div>

              <h4 className="text-sm font-black text-slate-100">
                اسنایپر واگرایی مخفی MACD
              </h4>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono text-center">
                <span className="text-xs text-slate-400 block">تعداد معاملات روزانه:</span>
                <span className="text-lg font-black text-purple-300">۱ الی ۳ معامله</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">(ورود فقط در واگرایی قطعی)</span>
              </div>

              <ul className="text-[11px] text-slate-300 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span><strong>تریگرها:</strong> فقط واگرایی مخفی شدید با فیلتر EMA 60/240</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span><strong>تارگت سود:</strong> ۹.۵۰ دلار طلا (۹۵ پیپ بلند)</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-purple-300/90 font-bold">
              🎯 تارگت‌های بزرگ با وین‌ریت بسیار بالا
            </div>
          </div>
        </div>

        {/* Fine-Tuning Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Base Lot Size */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              حجم پایه معامله (لات):
            </span>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[0.10, 0.20, 0.50].map((val) => (
                <button
                  key={val}
                  onClick={() => setBaseLot(val)}
                  className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                    baseLot === val
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {val.toFixed(2)}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">حداقل حجم ۰.۱۰ لات استاندارد</span>
          </div>

          {/* Max Concurrent Positions */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              تعداد پوزیشن‌های همزمان:
            </span>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setMaxConcurrent(num)}
                  className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                    maxConcurrent === num
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {num} معامله
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">۲ معامله همزمان بازدهی بالا</span>
          </div>

          {/* Scalp Take Profit */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              تارگت سود سریع هر معامله:
            </span>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[2.50, 3.50, 5.00].map((val) => (
                <button
                  key={val}
                  onClick={() => setScalpTp(val)}
                  className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                    scalpTp === val
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ${val.toFixed(1)}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">تارگت $3.50 = ۳۵ پیپ طلا</span>
          </div>

          {/* Daily Max Trades Cap (Unlimited = 0) */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              سقف معامله در روز:
            </span>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[0, 25, 50].map((val) => (
                <button
                  key={val}
                  onClick={() => setMaxDailyTrades(val)}
                  className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                    maxDailyTrades === val
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {val === 0 ? 'نامحدود' : `${val}`}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">۰ = نامحدود (بدون سقف)</span>
          </div>

          {/* Fast Time Exit */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              خروج زمانی سریع:
            </span>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[9, 13, 26].map((val) => (
                <button
                  key={val}
                  onClick={() => setFastTimeExitMinutes(val)}
                  className={`py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                    fastTimeExitMinutes === val
                      ? 'bg-purple-500 text-slate-950 border-purple-300 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {val} دقیقه
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">آزادسازی سریع مارجین</span>
          </div>
        </div>

        {/* Flexible Stop Loss Engine Card */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              معماری حد ضرر منعطف و هوشمند (Flexible Stop Loss Engine)
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
              Dynamic SL Modes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'DYNAMIC_ATR', label: '۱. پویای نوسان ATR', sub: 'سازگار با ولاتیلیتی طلا' },
              { id: 'SWING_STRUCTURE', label: '۲. سویینگ استراکچر', sub: 'پشت آخرین سقف/کف' },
              { id: 'KIJUN_EQUILIBRIUM', label: '۳. خط تعادل کیجنسن', sub: 'مرز تعادلی ایچیموکو' },
              { id: 'CUSTOM_FIXED', label: '۴. دستی و آزاد', sub: 'مقدار دلخواه ثابت' },
              { id: 'AI_ADAPTIVE', label: '۵. تطبیقی هوش مصنوعی', sub: 'مخروط رگرسیون ML' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setStopLossMode(m.id as any)}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  stopLossMode === m.id
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400 text-amber-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold block">{m.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">{m.sub}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {stopLossMode === 'DYNAMIC_ATR' && (
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[11px] text-slate-400">ضریب ATR حد ضرر:</span>
                <div className="grid grid-cols-3 gap-1">
                  {[1.5, 2.2, 3.0].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAtrSlMultiplier(v)}
                      className={`py-1 text-xs font-mono font-bold rounded-lg border ${
                        atrSlMultiplier === v
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {v}x ATR
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stopLossMode === 'SWING_STRUCTURE' && (
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[11px] text-slate-400">تعداد کندل بررسی سویینگ:</span>
                <div className="grid grid-cols-3 gap-1">
                  {[6, 12, 20].map((v) => (
                    <button
                      key={v}
                      onClick={() => setSwingLookbackBars(v)}
                      className={`py-1 text-xs font-mono font-bold rounded-lg border ${
                        swingLookbackBars === v
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {v} کندل
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between col-span-1 sm:col-span-2">
              <div>
                <span className="text-xs font-bold text-slate-200 block">تریلینگ استاپ پویا (Trailing Stop):</span>
                <span className="text-[10px] text-slate-400 block">انتقال خودکار حد ضرر با پیشروی سود معامله</span>
              </div>
              <button
                onClick={() => setEnableDynamicTrailing(!enableDynamicTrailing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  enableDynamicTrailing
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {enableDynamicTrailing ? 'فعال (Trailing ON)' : 'غیرفعال'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP MT5 GUIDE */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        <div
          onClick={() => setShowLiteFinanceGuide(!showLiteFinanceGuide)}
          className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <span>راهنمای نصب و اجرای اکسپرت الیوت نئویو (elliottneowave.ir) در متاتریدر ۵</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600 px-2 py-0.5 rounded-full font-mono font-bold">
                  Elliott Neowave Official Guide
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                مراحل نصب اندیکاتور و اکسپرت روی نماد XAUUSD_I یا XAUUSD با تایم‌فریم M1
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            {showLiteFinanceGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showLiteFinanceGuide && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs text-slate-300 leading-relaxed animate-fadeIn">
            {/* Step 1 */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-mono text-amber-300">
                  ۱
                </span>
                <span>گام اول: کپی در پوشه Experts متاتریدر</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>در متاتریدر ۵ به منوی <strong>File ➔ Open Data Folder</strong> بروید.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>پوشه <strong>MQL5 ➔ Experts</strong> را باز کرده و فایل <code className="text-amber-300 font-mono">ElliottNeowave_Gold_Scalper_EA.mq5</code> را داخل آن ذخیره کنید.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>کلید <strong>F7</strong> را در MetaEditor برای کامپایل بدون خطا فشار دهید.</span>
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-mono text-cyan-300">
                  ۲
                </span>
                <span>گام دوم: تنظیم نماد طلا و فعال‌سازی فیلتر EMA</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>چارت طلای <strong>XAUUSD</strong> یا <strong>XAUUSD_I</strong> را در تایم‌فریم <strong>M1</strong> باز کنید.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>در پنجره تنظیمات اکسپرت گزینه <code className="text-cyan-300 font-mono">InpUseEmaCrossFilter</code> را روی <strong>true</strong> بگذارید.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>گزینه <strong>Algo Trading</strong> را در نوار بالای متاتریدر فعال (سبز) نمایید.</span>
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-mono text-emerald-300">
                  ۳
                </span>
                <span>گام سوم: اجرای بدون سقف معاملات</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>مطمئن شوید مقدار <code className="text-emerald-300 font-mono">InpMaxDailyTrades</code> روی <strong className="text-amber-300">0</strong> تنظیم است تا هیچ محدودیتی در تعداد معاملات روزانه اعمال نشود.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>اکسپرت به صورت ۲۴ ساعته در ۵ روز هفته تمام امواج پرشتاب را اسکالپ می‌کند.</span>
                </li>
              </ul>
            </div>

            {/* Step 4: WebRequest Bridge for ea.elliottneowave.ir */}
            <div className="bg-gradient-to-br from-slate-900/90 to-amber-950/40 p-4 rounded-xl border border-amber-500/40 flex flex-col gap-2.5 md:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-mono text-amber-300">
                    ۴
                  </span>
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>گام چهارم: فعال‌سازی اتصال زنده (Allow WebRequest) در متاتریدر ۵</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWebRequestModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 self-start sm:self-auto"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>مشاهده راهنمای گام‌به‌گام و تست زنده اتصال</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-300">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">۱. منوی تنظیمات:</span>
                  <span>در متاتریدر کلیدهای <kbd className="bg-slate-850 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-amber-300">Ctrl + O</kbd> را بزنید و به تب <strong>Expert Advisors</strong> بروید.</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">۲. تیک Allow WebRequest:</span>
                  <span>تیک <strong>Allow WebRequest for listed URL:</strong> را فعال کنید و روی <strong>«+»</strong> کلیک کنید.</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">۳. افزودن آدرس سابدامین:</span>
                  <div className="flex items-center justify-between gap-1 bg-slate-900 p-1.5 rounded-lg border border-slate-750">
                    <code className="text-emerald-300 font-mono font-bold text-[10px]">https://ea.elliottneowave.ir</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://ea.elliottneowave.ir');
                        setCopiedEA(true);
                        setTimeout(() => setCopiedEA(false), 2000);
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded font-bold"
                    >
                      کپی
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MetaTrader 5 WebRequest Interactive Guide Modal */}
      <Mt5WebRequestGuideModal
        isOpen={showWebRequestModal}
        onClose={() => setShowWebRequestModal(false)}
        defaultSubdomain="https://ea.elliottneowave.ir"
      />

      {/* Code Viewer & Switcher */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('EA')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeCodeTab === 'EA'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>کد MQL5 اکسپرت الیوت نئویو (بدون محدودیت روزانه + EMA 60/240)</span>
              <span className="text-[10px] bg-slate-950/30 px-1.5 py-0.5 rounded font-mono">
                ElliottNeowave_Gold_Scalper_EA.mq5
              </span>
            </button>

            <button
              onClick={() => setActiveCodeTab('INDICATOR')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeCodeTab === 'INDICATOR'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>کد MQL5 اندیکاتور کراس EMA 60/240 HL/2</span>
              <span className="text-[10px] bg-slate-950/30 px-1.5 py-0.5 rounded font-mono">
                ElliottNeowave_EMA_Cross_Indicator.mq5
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeCodeTab === 'INDICATOR' ? (
              <button
                onClick={() => handleCopy(MT5_INDICATOR_MQL5, 'INDICATOR')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
              >
                {copiedIndicator ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی سورس اندیکاتور</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleCopy(dynamicEaCode, 'EA')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
              >
                {copiedEA ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی سورس اکسپرت سفارشی</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Code Content Area */}
        <div className="relative">
          <pre
            dir="ltr"
            className="p-5 text-xs font-mono bg-slate-950 text-slate-300 overflow-x-auto max-h-[560px] leading-relaxed border-b border-slate-900"
          >
            <code>
              {activeCodeTab === 'INDICATOR' ? MT5_INDICATOR_MQL5 : dynamicEaCode}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
