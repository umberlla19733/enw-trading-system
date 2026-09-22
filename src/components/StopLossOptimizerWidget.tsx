import React, { useState, useMemo } from 'react';
import {
  StopLossMode,
  StopLossConfig,
  StopLossTestSummary,
  DEFAULT_STOP_LOSS_CONFIGS,
  runStopLossBacktest,
  generateStopLossComparisonReport
} from '../utils/stopLossOptimizer';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  Award,
  Layers,
  Sparkles,
  BarChart3,
  Percent,
  DollarSign,
  Clock,
  Target,
  ArrowUpRight,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface StopLossOptimizerWidgetProps {
  onApplyToMt5?: (config: {
    slMode: StopLossMode;
    atrMultiplier: number;
    scalpSl: number;
    scalpTp: number;
    trailingEnabled: boolean;
    breakEvenTrigger: number;
  }) => void;
}

export const StopLossOptimizerWidget: React.FC<StopLossOptimizerWidgetProps> = ({ onApplyToMt5 }) => {
  const [selectedMode, setSelectedMode] = useState<StopLossMode>('DYNAMIC_ATR');
  const [activeConfig, setActiveConfig] = useState<StopLossConfig>(DEFAULT_STOP_LOSS_CONFIGS.DYNAMIC_ATR);
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'SAVED' | 'WIN' | 'LOSS' | 'BE'>('ALL');
  const [showAllComparison, setShowAllComparison] = useState<boolean>(true);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  // Switch mode and reset defaults for that mode
  const handleModeChange = (mode: StopLossMode) => {
    setSelectedMode(mode);
    setActiveConfig(DEFAULT_STOP_LOSS_CONFIGS[mode]);
  };

  // Run backtest with current config
  const testResults: StopLossTestSummary = useMemo(() => {
    return runStopLossBacktest(activeConfig);
  }, [activeConfig]);

  // Run full comparison across all 5 modes for benchmark comparison
  const comparisonResults = useMemo(() => {
    return generateStopLossComparisonReport({
      accountBalanceUSD: activeConfig.accountBalanceUSD,
      riskPercent: activeConfig.riskPercent
    });
  }, [activeConfig.accountBalanceUSD, activeConfig.riskPercent]);

  // Filtered trades list
  const filteredTrades = useMemo(() => {
    return testResults.trades.filter(t => {
      if (tradeFilter === 'SAVED') return t.whipsawAvoided;
      if (tradeFilter === 'WIN') return t.result === 'WIN';
      if (tradeFilter === 'LOSS') return t.result === 'LOSS';
      if (tradeFilter === 'BE') return t.result === 'BE';
      return true;
    });
  }, [testResults.trades, tradeFilter]);

  const handleApplyToMt5 = () => {
    if (onApplyToMt5) {
      onApplyToMt5({
        slMode: activeConfig.mode,
        atrMultiplier: activeConfig.atrMultiplier,
        scalpSl: activeConfig.customSlUSD,
        scalpTp: activeConfig.customTpUSD,
        trailingEnabled: activeConfig.enableTrailingStop,
        breakEvenTrigger: activeConfig.breakEvenTriggerUSD
      });
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 4000);
    }
  };

  const handleSimulateClick = () => {
    setIsRunningTest(true);
    setTimeout(() => {
      setIsRunningTest(false);
    }, 450);
  };

  const modesList: {
    id: StopLossMode;
    title: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    accentBorder: string;
  }[] = [
    {
      id: 'DYNAMIC_ATR',
      title: '۱. حد ضرر پویای ATR (انعطاف‌پذیر بر اساس نوسان بازار)',
      badge: 'پیشنهادی الگوریتمی',
      desc: 'محاسبه خودکار فاصله حد ضرر متناسب با شتاب و نوسان لحظه‌ای طلا (ATR M1/M5) جهت مصونیت از تلاطم‌های مقطعی.',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-950/40 to-slate-900 border-emerald-500/40 text-emerald-300',
      accentBorder: 'border-emerald-500'
    },
    {
      id: 'SWING_STRUCTURE',
      title: '۲. ساختار سویینگ High/Low + بافر محافظتی',
      badge: 'ضد استاپ هانتینگ',
      desc: 'قرار دادن حد ضرر در پشت کف‌ها و سقف‌های ساختاری معتبر گذشته (Swing Points) با بافر ایمن دلاری.',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-950/40 to-slate-900 border-cyan-500/40 text-cyan-300',
      accentBorder: 'border-cyan-500'
    },
    {
      id: 'KIJUN_EQUILIBRIUM',
      title: '۳. خط تعادل کیجنسن (ایچیموکو الیوت نئویو)',
      badge: 'تعادل داینامیک',
      desc: 'استفاده از سطح حمایت/مقاومت میانگین تعادلی ۲۶ کندل کیجنسن به عنوان استاپ متحرک و داینامیک.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-950/40 to-slate-900 border-amber-500/40 text-amber-300',
      accentBorder: 'border-amber-500'
    },
    {
      id: 'CUSTOM_FIXED',
      title: '۴. حد ضرر و تارگت کاملاً آزاد و دستی (Free-form USD)',
      badge: 'سفارشی و منعطف',
      desc: 'تنظیم دستی و دلخواه حد ضرر (از ۰.۸۰$ تا ۱۰.۰۰$) و تارگت (از ۱.۵۰$ تا ۲۰.۰۰$) با محاسبه ریسک‌به‌ریوارد اختصاصی.',
      icon: <Sliders className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-950/40 to-slate-900 border-purple-500/40 text-purple-300',
      accentBorder: 'border-purple-500'
    },
    {
      id: 'AI_ADAPTIVE_CONE',
      title: '۵. مخروط هوش مصنوعی و رگرسیون ML (AI Adaptive)',
      badge: 'هوش مصنوعی انسمبل',
      desc: 'انعطاف حد ضرر بر مبنای خطای معیار رگرسیون خطی و باند اطمینان ۹۵٪؛ گشاد کردن استاپ در عدم‌قطعیت و قفل کردن در روند قطعی.',
      icon: <Cpu className="w-5 h-5 text-rose-400" />,
      color: 'from-rose-950/40 to-slate-900 border-rose-500/40 text-rose-300',
      accentBorder: 'border-rose-500'
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner & Introduction */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-100">
                  موتور بهینه‌ساز و شبیه‌ساز حد ضرر منعطف و هوشمند (Flexible SL Optimizer)
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  تست زنده بر روی ۵۹۰ معامله ۲ ماهه طلا
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                این ماژول به شما اجازه می‌دهد حد ضرر سیستم را از حالت بسته و خشک به حالت‌های کاملاً پویا (ضریب ATR، کف/سقف ساختاری، خط کیجنسن، مخروط هوش مصنوعی و تنظیمات آزاد دلاری) تغییر دهید و نتایج زنده را بر روی وین‌ریت، افت سرمایه (Drawdown) و سود نهایی تست بگیرید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleSimulateClick}
              disabled={isRunningTest}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Play className={`w-4 h-4 fill-current ${isRunningTest ? 'animate-spin' : ''}`} />
              <span>{isRunningTest ? 'در حال شبیه‌سازی...' : 'تست مجدد محاسبات SL'}</span>
            </button>

            {onApplyToMt5 && (
              <button
                onClick={handleApplyToMt5}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>اعمال تنظیمات به کد اکسپرت MT5</span>
              </button>
            )}
          </div>
        </div>

        {appliedNotice && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تنظیمات حد ضرر منعطف با موفقیت به کد متاتریدر ۵ (MQL5) و ماژول‌های سیستم تزریق شد!</span>
          </div>
        )}
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {modesList.map((m) => {
          const isSelected = selectedMode === m.id;
          return (
            <div
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`cursor-pointer rounded-2xl p-4 transition-all border-2 flex flex-col justify-between gap-3 ${
                isSelected
                  ? `bg-slate-900 shadow-xl ring-2 ring-emerald-400/30 ${m.accentBorder}`
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    {m.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.color}`}>
                    {m.badge}
                  </span>
                </div>
                <h3 className="font-black text-sm text-slate-100 line-clamp-2 leading-tight">
                  {m.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px]">وضعیت:</span>
                <span className={`font-bold text-[11px] flex items-center gap-1 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>فعال و در حال تست</span>
                    </>
                  ) : (
                    <span>کلیک جهت فعال‌سازی</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls & Sliders for the Selected SL Mode */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">
              تنظیم پارامترهای آزاد و شخصی‌سازی حد ضرر ({modesList.find(m => m.id === selectedMode)?.title})
            </h3>
          </div>
          <button
            onClick={() => setActiveConfig(DEFAULT_STOP_LOSS_CONFIGS[selectedMode])}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی به مقادیر پیش‌فرض این مدل</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Dynamic ATR Multiplier */}
          {selectedMode === 'DYNAMIC_ATR' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">ضریب پویای ATR (انعطاف نوسان):</span>
                <span className="text-xs font-mono font-black text-emerald-400">{activeConfig.atrMultiplier.toFixed(1)}x ATR</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="4.5"
                step="0.1"
                value={activeConfig.atrMultiplier}
                onChange={(e) => setActiveConfig({ ...activeConfig, atrMultiplier: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 my-2"
              />
              <span className="text-[10px] text-slate-500">
                فاصله استاپ = ATR طلا × ضریب (با افزایش ضریب، نویزهای بازار حذف می‌شوند)
              </span>
            </div>
          )}

          {/* 2. Swing Lookback Bars */}
          {(selectedMode === 'SWING_STRUCTURE' || selectedMode === 'KIJUN_EQUILIBRIUM') && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">دوره کندلی جستجوی سقف/کف:</span>
                <span className="text-xs font-mono font-black text-cyan-400">{activeConfig.swingLookbackBars} کندل اخیر</span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={activeConfig.swingLookbackBars}
                onChange={(e) => setActiveConfig({ ...activeConfig, swingLookbackBars: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-2"
              />
              <span className="text-[10px] text-slate-500">
                کف و سقف ساختاری در این تعداد کندل مبنای استاپ قرار می‌گیرد
              </span>
            </div>
          )}

          {/* 3. Swing Cushion Buffer */}
          {(selectedMode === 'SWING_STRUCTURE' || selectedMode === 'KIJUN_EQUILIBRIUM' || selectedMode === 'AI_ADAPTIVE_CONE') && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold">بافر ایمنی اضافی (Safety Buffer):</span>
                <span className="text-xs font-mono font-black text-amber-400">${activeConfig.swingBufferUSD.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.50"
                step="0.05"
                value={activeConfig.swingBufferUSD}
                onChange={(e) => setActiveConfig({ ...activeConfig, swingBufferUSD: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 my-2"
              />
              <span className="text-[10px] text-slate-500">
                فاصله دلاری زیر کف/سویینگ برای عبور از شدوهای نفوذی (Shadows)
              </span>
            </div>
          )}

          {/* 4. Custom Fixed SL USD */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold">حد ضرر آزاد دلاری (Gold SL):</span>
              <span className="text-xs font-mono font-black text-rose-400">${activeConfig.customSlUSD.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.80"
              max="10.00"
              step="0.10"
              value={activeConfig.customSlUSD}
              onChange={(e) => setActiveConfig({ ...activeConfig, customSlUSD: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400 my-2"
            />
            <span className="text-[10px] text-slate-500">
              {Math.round(activeConfig.customSlUSD * 10)} پیپ طلا ($3.50 = ۳۵ پیپ استاندارد)
            </span>
          </div>

          {/* 5. Custom Fixed TP USD */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold">تارگت سود آزاد (Take Profit):</span>
              <span className="text-xs font-mono font-black text-emerald-400">${activeConfig.customTpUSD.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.50"
              max="20.00"
              step="0.10"
              value={activeConfig.customTpUSD}
              onChange={(e) => setActiveConfig({ ...activeConfig, customTpUSD: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 my-2"
            />
            <span className="text-[10px] text-slate-500">
              نسبت R:R = {(activeConfig.customTpUSD / activeConfig.customSlUSD).toFixed(2)}:1
            </span>
          </div>

          {/* 6. Break-Even Trigger Slider */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold">تریگر فعال‌سازی ریسک‌فری (BE):</span>
              <span className="text-xs font-mono font-black text-cyan-400">+${activeConfig.breakEvenTriggerUSD.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.00"
              max="6.00"
              step="0.10"
              value={activeConfig.breakEvenTriggerUSD}
              onChange={(e) => setActiveConfig({ ...activeConfig, breakEvenTriggerUSD: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-2"
            />
            <span className="text-[10px] text-slate-500">
              انتقال خودکار حد ضرر به نقطه ورود به محض رسیدن سود به این عدد
            </span>
          </div>

          {/* 7. Trailing Stop Step Slider */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold">فاصله تریلینگ استاپ پویا:</span>
              <span className="text-xs font-mono font-black text-purple-400">${activeConfig.trailingStepUSD.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="2.00"
              step="0.05"
              value={activeConfig.trailingStepUSD}
              onChange={(e) => setActiveConfig({ ...activeConfig, trailingStepUSD: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 my-2"
            />
            <span className="text-[10px] text-slate-500">
              دنبال کردن پله‌ای قیمت جهت قفل کردن حداکثر سود در روندهای طلا
            </span>
          </div>

          {/* 8. Risk Management / Lot sizing */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold">ریسک در هر معامله (Risk %):</span>
              <span className="text-xs font-mono font-black text-amber-300">{activeConfig.riskPercent}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={activeConfig.riskPercent}
              onChange={(e) => setActiveConfig({ ...activeConfig, riskPercent: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-300 my-2"
            />
            <span className="text-[10px] text-slate-500">
              محاسبه خودکار حجم لات متناسب با فاصله حد ضرر تنظیمی
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Backtest Results Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">وین‌ریت استراتژی:</span>
          <span className="text-xl font-black font-mono text-emerald-400">{testResults.winRate}%</span>
          <span className="text-[10px] text-emerald-500">
            {testResults.wins} برد / {testResults.losses} باخت / {testResults.bes} بی‌ضرر
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">سود خالص کل:</span>
          <span className="text-xl font-black font-mono text-cyan-300">+${testResults.netProfitUSD.toLocaleString()}</span>
          <span className="text-[10px] text-cyan-400">
            بازدهی +{testResults.totalRoiPct}% روی موجودی اولیه
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">فاکتور سود (Profit Factor):</span>
          <span className="text-xl font-black font-mono text-amber-300">{testResults.profitFactor}</span>
          <span className="text-[10px] text-slate-400">
            سود ناخالص: ${testResults.grossProfitUSD.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">حداکثر افت سرمایه (Drawdown):</span>
          <span className="text-xl font-black font-mono text-rose-400">{testResults.maxDrawdownPct}%</span>
          <span className="text-[10px] text-slate-400">
            -${testResults.maxDrawdownUSD.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/40 bg-emerald-950/20 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[11px] text-emerald-300 font-bold">معاملات نجات‌یافته از استاپ فیک:</span>
          <span className="text-xl font-black font-mono text-emerald-300">{testResults.whipsawsAvoidedCount} معامله</span>
          <span className="text-[10px] text-emerald-400">
            +${testResults.whipsawAvoidedProfitUSD.toLocaleString()} سود ناشی از انعطاف SL
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">میانگین نسبت سود به ضرر:</span>
          <span className="text-xl font-black font-mono text-purple-300">{testResults.riskRewardRatio}:1</span>
          <span className="text-[10px] text-slate-400">
            میانگین سود: ${testResults.avgWinUSD} | ضرر: ${testResults.avgLossUSD}
          </span>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix between all 5 Stop Loss Modes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">
              جدول مقایسه‌ای ۵ مدل حد ضرر بر روی دیتاست معاملات واقعی طلا (XAU/USD)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            موجودی اولیه: ${activeConfig.accountBalanceUSD.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                <th className="p-3">مدل حد ضرر (Stop Loss Mode)</th>
                <th className="p-3 text-center">وین‌ریت (Win Rate)</th>
                <th className="p-3 text-center">سود خالص کل ($)</th>
                <th className="p-3 text-center">فاکتور سود (PF)</th>
                <th className="p-3 text-center">حداکثر افت (Max DD)</th>
                <th className="p-3 text-center">نجات از استاپ فیک</th>
                <th className="p-3 text-center">نسبت R:R میانگین</th>
                <th className="p-3 text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {comparisonResults.map((comp) => {
                const isCurrent = comp.mode === selectedMode;
                const modeInfo = modesList.find(m => m.id === comp.mode);
                return (
                  <tr
                    key={comp.mode}
                    onClick={() => handleModeChange(comp.mode)}
                    className={`cursor-pointer transition-colors ${
                      isCurrent ? 'bg-emerald-950/30 font-bold text-slate-100' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="p-3 font-sans">
                      <div className="flex items-center gap-2">
                        {modeInfo?.icon}
                        <div>
                          <span className="font-bold block text-slate-100">{modeInfo?.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{modeInfo?.badge}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center text-emerald-400 font-black text-sm">
                      {comp.winRate}%
                    </td>
                    <td className="p-3 text-center text-cyan-300 font-black">
                      +${comp.netProfitUSD.toLocaleString()}
                    </td>
                    <td className="p-3 text-center text-amber-300 font-bold">
                      {comp.profitFactor}
                    </td>
                    <td className="p-3 text-center text-rose-400 font-bold">
                      {comp.maxDrawdownPct}%
                    </td>
                    <td className="p-3 text-center text-emerald-300 font-bold">
                      {comp.whipsawsAvoidedCount} معامله
                    </td>
                    <td className="p-3 text-center text-purple-300">
                      {comp.riskRewardRatio}:1
                    </td>
                    <td className="p-3 text-center">
                      {isCurrent ? (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                          در حال استفاده
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-sans hover:text-slate-300">
                          انتخاب این مدل
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade-by-Trade Inspection Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">
              گزارش زنده رفتار حد ضرر در معاملات (Trade Execution Log)
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap">
            <button
              onClick={() => setTradeFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                tradeFilter === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({testResults.trades.length})
            </button>
            <button
              onClick={() => setTradeFilter('SAVED')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                tradeFilter === 'SAVED' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              نجات‌یافته از استاپ فیک ({testResults.whipsawsAvoidedCount})
            </button>
            <button
              onClick={() => setTradeFilter('WIN')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                tradeFilter === 'WIN' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              برنده‌ها ({testResults.wins})
            </button>
            <button
              onClick={() => setTradeFilter('LOSS')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                tradeFilter === 'LOSS' ? 'bg-rose-950 text-rose-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              استاپ‌خورده ({testResults.losses})
            </button>
            <button
              onClick={() => setTradeFilter('BE')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                tradeFilter === 'BE' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ریسک‌فری ({testResults.bes})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-2.5">شناسه / تاریخ</th>
                <th className="p-2.5 text-center">جهت / الگو</th>
                <th className="p-2.5 text-center">قیمت ورود</th>
                <th className="p-2.5 text-center">حد ضرر (SL)</th>
                <th className="p-2.5 text-center">فاصله استاپ</th>
                <th className="p-2.5 text-center">تارگت (TP)</th>
                <th className="p-2.5 text-center">علت خروج</th>
                <th className="p-2.5 text-center">سود/زیان ($)</th>
                <th className="p-2.5 text-center">نتیجه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {filteredTrades.slice(0, 50).map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-slate-800/30 ${
                    t.whipsawAvoided ? 'bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="p-2.5">
                    <span className="font-bold text-slate-200 block">{t.id}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{t.date}</span>
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      t.type === 'BUY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {t.type}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">{t.setup}</span>
                  </td>
                  <td className="p-2.5 text-center text-slate-200 font-bold">${t.entryPrice.toFixed(2)}</td>
                  <td className="p-2.5 text-center text-rose-300">${t.initialSL.toFixed(2)}</td>
                  <td className="p-2.5 text-center text-amber-300">${t.slDistanceUSD.toFixed(2)}</td>
                  <td className="p-2.5 text-center text-emerald-300">${t.initialTP.toFixed(2)}</td>
                  <td className="p-2.5 text-center font-sans text-[11px]">
                    {t.exitReason === 'TP_HIT' && <span className="text-emerald-400">🎯 تارگت کامل</span>}
                    {t.exitReason === 'TRAILING_STOP' && <span className="text-purple-300">🛡️ تریلینگ استاپ</span>}
                    {t.exitReason === 'BREAK_EVEN' && <span className="text-cyan-300">🔒 ریسک‌فری</span>}
                    {t.exitReason === 'SL_HIT' && <span className="text-rose-400">❌ استاپ‌لاس</span>}
                    {t.exitReason === 'TIME_EXIT' && <span className="text-slate-400">⏰ گردش زمانی</span>}
                  </td>
                  <td className={`p-2.5 text-center font-black ${
                    t.pnlUSD > 0 ? 'text-emerald-400' : t.pnlUSD < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {t.pnlUSD > 0 ? `+$${t.pnlUSD.toFixed(2)}` : t.pnlUSD < 0 ? `-$${Math.abs(t.pnlUSD).toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="p-2.5 text-center">
                    {t.whipsawAvoided ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-sans font-bold flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        نجات از استاپ فیک
                      </span>
                    ) : t.result === 'WIN' ? (
                      <span className="text-emerald-400 text-[11px] font-bold">موفق (WIN)</span>
                    ) : t.result === 'LOSS' ? (
                      <span className="text-rose-400 text-[11px] font-bold">زیان (LOSS)</span>
                    ) : (
                      <span className="text-cyan-300 text-[11px] font-bold">بی‌ضرر (BE)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
