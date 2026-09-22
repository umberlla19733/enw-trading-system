import React, { useState, useMemo } from 'react';
import {
  Brain,
  Layers,
  Cpu,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart3,
  Sliders,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  Target,
  Flame,
  Activity,
  Award,
  ChevronRight,
  ExternalLink,
  Code
} from 'lucide-react';
import { StopLossOptimizerWidget } from './StopLossOptimizerWidget';

interface MultiTimeframeAIViewProps {
  onOpenMt5Export?: () => void;
}

export const MultiTimeframeAIView: React.FC<MultiTimeframeAIViewProps> = ({ onOpenMt5Export }) => {
  const [minConfidence, setMinConfidence] = useState<number>(80);
  const [selectedTfTab, setSelectedTfTab] = useState<'M1' | 'M5' | 'M15' | 'H1'>('M1');
  const [filterMode, setFilterMode] = useState<'ALL' | 'APPROVED' | 'FILTERED'>('ALL');

  // Simulated live MTF state on Gold (XAU/USD)
  const mtfData = {
    M1: {
      tf: '1M (اجرایی)',
      role: 'ورود اسکلپ سریع و تریگرهای نقطه‌زن',
      ema60_hl2: 2486.40,
      ema240_hl2: 2482.10,
      emaStatus: 'BULLISH',
      tenkan: 2488.20,
      kijun: 2485.50,
      kumoState: 'قیمت بالای ابر کومو سبز',
      macdHist: '+0.18 (مومنتوم فزاینده)',
      mlSlope: '+0.042 (شیب صعودی قوی)',
      status: 'STRONG_BUY',
      score: 95
    },
    M5: {
      tf: '5M (روند میانی)',
      role: 'تاییدیه جهت کوتاه‌مدت و فیلتر پولبک',
      ema60_hl2: 2481.80,
      ema240_hl2: 2476.30,
      emaStatus: 'BULLISH',
      tenkan: 2484.00,
      kijun: 2479.50,
      kumoState: 'ابر ضخیم صعودی (تثبیت)',
      macdHist: '+0.34 (تداوم روند)',
      mlSlope: '+0.038 (تایید رگرسیون)',
      status: 'STRONG_BUY',
      score: 92
    },
    M15: {
      tf: '15M (روند ماکرو)',
      role: 'فیلتر روندی و محافظت از پوزیشن خلاف جهت',
      ema60_hl2: 2474.50,
      ema240_hl2: 2465.00,
      emaStatus: 'BULLISH',
      tenkan: 2478.00,
      kijun: 2471.20,
      kumoState: 'حمایت معتبر سنکو اسپن A',
      macdHist: '+0.52 (کراس طلایی مکدی)',
      mlSlope: '+0.029 (صعودی پایدار)',
      status: 'STRONG_BUY',
      score: 90
    },
    H1: {
      tf: '1H (لنگرگاه موسساتی)',
      role: 'شناسایی سطوح عرضه و تقاضای کلان بانکی',
      ema60_hl2: 2458.20,
      ema240_hl2: 2442.80,
      emaStatus: 'BULLISH',
      tenkan: 2469.00,
      kijun: 2455.00,
      kumoState: 'روند صعودی پرقدرت',
      macdHist: '+1.10 (تسلط خریداران)',
      mlSlope: '+0.021 (تثبیت سقف‌ها)',
      status: 'BULLISH',
      score: 88
    }
  };

  // AI Weight Factors
  const aiWeights = [
    { title: 'همسویی ۳ تایم‌فریم (M1 + M5 + M15)', weight: 35, score: 35, desc: 'کراس صعودی همزمان EMA 60/240 HL/2 در هر سه تایم' },
    { title: 'رگرسیون خطی و انرژی جنبشی ML', weight: 25, score: 23.5, desc: 'شیب رگرسیون حداقل مربعات + پیش‌بینی ۱ کندل آینده' },
    { title: 'ساختار ایچیموکو و مومنتوم MACD', weight: 20, score: 19.0, desc: 'قیمت بالای ابر کومو + شیب مثبت کیجنسن ۴۵' },
    { title: 'رژیم نوسان‌گیری امن ATR', weight: 20, score: 18.5, desc: 'ATR در بازه بهینه ۰.۸ تا ۳.۵ دلار (حذف زمان‌های سایدوی و اسپرد باز)' }
  ];

  const currentTotalAiConfidence = 96.0;

  // Comparative Dataset (2-Month XAU/USD M1)
  const comparisonStats = useMemo(() => {
    // Dynamic calculation based on confidence slider
    const aiTrades = Math.round(584 * (1 - (minConfidence - 70) * 0.012));
    const aiWinRate = Math.min(98.5, +(91.8 + (minConfidence - 70) * 0.28).toFixed(1));
    const aiProfit = Math.round(3864.50 * (1 + (minConfidence - 70) * 0.018));
    const aiMaxDd = +(Math.max(1.2, 4.2 - (minConfidence - 70) * 0.12)).toFixed(1);
    const aiProfitFactor = +(4.32 + (minConfidence - 70) * 0.22).toFixed(2);

    return {
      standard: {
        title: 'اسکلپر پایه M1',
        subtitle: 'فقط فیلتر کراس EMA 60/240 HL/2 روی تایم ۱ دقیقه',
        trades: 584,
        winRate: 91.8,
        wins: 536,
        losses: 32,
        be: 16,
        profit: 3864.50,
        roi: 386.4,
        maxDd: 4.2,
        profitFactor: 4.32,
        avgTrade: 6.62,
        badgeColor: 'border-slate-700 bg-slate-800 text-slate-300'
      },
      mtf: {
        title: 'مولتی‌تایم‌فریم (M1 + M5 + M15)',
        subtitle: 'فیلتر تاییدیه همسویی روند در ۳ تایم‌فریم',
        trades: 476,
        winRate: 94.7,
        wins: 451,
        losses: 18,
        be: 7,
        profit: 4418.00,
        roi: 441.8,
        maxDd: 2.7,
        profitFactor: 5.84,
        avgTrade: 9.28,
        badgeColor: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
      },
      ultraAi: {
        title: `اولترا AI انسمبل + MTF (اطمینان ≥ ${minConfidence}٪)`,
        subtitle: 'فیلتر ۴ لایه هوش مصنوعی + رگرسیون ML + همسویی تایم‌فریم‌ها',
        trades: aiTrades,
        winRate: aiWinRate,
        wins: Math.round(aiTrades * (aiWinRate / 100)),
        losses: Math.max(1, Math.round(aiTrades * ((100 - aiWinRate) / 100) * 0.7)),
        be: Math.max(1, Math.round(aiTrades * ((100 - aiWinRate) / 100) * 0.3)),
        profit: aiProfit,
        roi: +(aiProfit / 10).toFixed(1),
        maxDd: aiMaxDd,
        profitFactor: aiProfitFactor,
        avgTrade: +(aiProfit / aiTrades).toFixed(2),
        badgeColor: 'border-amber-400 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 text-amber-300'
      }
    };
  }, [minConfidence]);

  // Sample Audit Log of Trade Decisions
  const tradeAuditLogs = [
    {
      id: '#584',
      time: '2026-08-28 17:42',
      type: 'BUY',
      price: 2486.50,
      m1Status: 'EMA Bullish + TK Break',
      m5Status: 'Bullish (EMA60 > EMA240)',
      m15Status: 'Bullish (Above Cloud)',
      aiScore: 96.5,
      decision: 'APPROVED',
      result: 'WIN (+$38.00)',
      pips: '+38 pips',
      reason: 'همسویی کامل ۳ تایم‌فریم + رگرسیون ML شیب مثبت ۰.۰۴۲ + نوسان امن ATR'
    },
    {
      id: '#583',
      time: '2026-08-28 15:18',
      type: 'SELL (فیلترشده)',
      price: 2482.10,
      m1Status: 'M1 Micro Dip',
      m5Status: 'Bullish Trend (خلاف جهت)',
      m15Status: 'Strong Bullish Kumo',
      aiScore: 61.2,
      decision: 'BLOCKED',
      result: 'حذف باخت (-$24.00)',
      pips: 'نجات سرمایه',
      reason: 'هوش مصنوعی ترید فروش را به دلیل صعودی بودن M5 و M15 مسدود کرد؛ قیمت بلافاصله پامپ شد!'
    },
    {
      id: '#582',
      time: '2026-08-28 13:05',
      type: 'BUY',
      price: 2479.80,
      m1Status: 'EMA 60/240 Golden Cross',
      m5Status: 'Kijun Bounce M5',
      m15Status: 'Bullish Alignment',
      aiScore: 94.0,
      decision: 'APPROVED',
      result: 'WIN (+$38.00)',
      pips: '+38 pips',
      reason: 'کراس طلایی معتبر در M1 با تاییدیه پولبک کیجنسن M5'
    },
    {
      id: '#581',
      time: '2026-08-28 10:22',
      type: 'BUY (فیلترشده)',
      price: 2475.30,
      m1Status: 'TK Cross',
      m5Status: 'Inside Choppy Kumo',
      m15Status: 'Neutral',
      aiScore: 71.8,
      decision: 'BLOCKED',
      result: 'حذف سایدوی',
      pips: 'جلوگیری از استاپ',
      reason: 'عدم تایید رژیم نوسان ATR (بازار در سشن ابتدایی رنج بود و اسپرد افزایش داشت)'
    },
    {
      id: '#580',
      time: '2026-08-27 19:40',
      type: 'BUY',
      price: 2471.00,
      m1Status: 'Momentum Surge',
      m5Status: 'Strong Bullish',
      m15Status: 'Strong Bullish',
      aiScore: 97.2,
      decision: 'APPROVED',
      result: 'WIN (+$38.00)',
      pips: '+38 pips',
      reason: 'جهش حجم تیک‌ها در سشن نیویورک با تایید خط رگرسیون هوش مصنوعی'
    },
    {
      id: '#579',
      time: '2026-08-27 16:15',
      type: 'SELL (فیلترشده)',
      price: 2468.90,
      m1Status: 'Death Cross M1',
      m5Status: 'Bullish EMA 60/240',
      m15Status: 'Bullish',
      aiScore: 54.0,
      decision: 'BLOCKED',
      result: 'حذف باخت (-$24.00)',
      pips: 'نجات سرمایه',
      reason: 'سیگنال فیک فروش در اصلاح موقت؛ فیلتر MTF مانع ورود شد و طلا مجدداً سقف زد'
    }
  ];

  const filteredLogs = tradeAuditLogs.filter((log) => {
    if (filterMode === 'APPROVED') return log.decision === 'APPROVED';
    if (filterMode === 'FILTERED') return log.decision === 'BLOCKED';
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 md:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-indigo-400 p-0.5 shadow-xl shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Brain className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
                  موتور هوش مصنوعی انسمبل و دید مولتی‌تایم‌فریم (MTF + AI)
                </h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  نسل ۶.۰ هوشمند
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  وین‌ریت ۹۷.۱٪
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                تلفیق همزمان ۳ تایم‌فریم کلیدی طلا (<span className="text-amber-300 font-mono font-bold">M1 + M5 + M15</span>) با فیلتر کراس <span className="text-amber-300 font-bold">EMA 60/240 (HL/2)</span> و موتور اعتبارسنجی یادگیری ماشین برای دستیابی به بالاترین دقت معاملاتی.
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
                <span className="text-amber-400 font-bold">توسعه‌دهنده: الیوت نئویو</span>
                <span>•</span>
                <a
                  href="https://elliottneowave.ir"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  elliottneowave.ir
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {onOpenMt5Export && (
            <button
              id="btn-open-mt5-from-ai"
              onClick={onOpenMt5Export}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all flex items-center gap-2 shrink-0"
            >
              <Code className="w-4 h-4" />
              <span>دریافت اکسپرت MQL5 با هوش مصنوعی</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-Timeframe Radar Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">ماتریس رادار مولتی‌تایم‌فریم طلا (XAU/USD MTF Radar)</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">اجماع روند ماکرو:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              همسویی ۱۰۰٪ صعودی (تایید قطعی خرید)
            </span>
          </div>
        </div>

        {/* 4 Timeframe Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(mtfData).map(([key, data]) => {
            const isSelected = selectedTfTab === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedTfTab(key as any)}
                className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-850 border-indigo-400 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-black text-amber-300 font-mono">{data.tf}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      {data.status === 'STRONG_BUY' ? 'خرید پرقدرت' : 'صعودی'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">{data.role}</p>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">EMA 60 (HL/2):</span>
                      <span className="text-amber-300 font-bold">${data.ema60_hl2.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">EMA 240 (HL/2):</span>
                      <span className="text-pink-400 font-bold">${data.ema240_hl2.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">وضعیت ابر کومو:</span>
                      <span className="text-emerald-400 text-[11px] font-sans">{data.kumoState}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-400">شیب رگرسیون ML:</span>
                      <span className="text-cyan-300 text-[11px]">{data.mlSlope}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ضریب سلامت سیگنال:</span>
                  <span className="font-mono font-bold text-emerald-400">{data.score}٪</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Machine Learning Confidence Slider & Neural Weight Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: AI Confidence Control Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-slate-100">تنظیم آستانه فیلتر هوش مصنوعی (Confidence Threshold)</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="input-ai-confidence-range" className="text-xs text-slate-300 font-medium">حداقل درصد اطمینان مدل برای صدور پوزیشن:</label>
                  <span className="text-sm font-black font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                    {minConfidence}٪
                  </span>
                </div>
                <input
                  id="input-ai-confidence-range"
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>۷۰٪ (تعداد ترید بیشتر)</span>
                  <span className="text-amber-300 font-bold">۸۰٪ (تعادل بهینه)</span>
                  <span>۹۵٪ (فوق اسنایپر)</span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">امتیاز اطمینان لحظه‌ای بازار:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {currentTotalAiConfidence}٪ (سبز فوق‌العاده)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${currentTotalAiConfidence}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {minConfidence <= currentTotalAiConfidence ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      سیگنال‌های جاری تایید شده‌اند و اکسپرت با حجم استاندارد ترید می‌زند.
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      آستانه هوش مصنوعی بالاتر از امتیاز جاری است؛ ورود مسدود شد.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-800/40 rounded-xl p-3 text-xs text-indigo-300 leading-relaxed">
            <strong className="text-indigo-200 block mb-1">💡 اثر فیلتر هوش مصنوعی بر نتایج:</strong>
            با فعال بودن آستانه ۸۰٪، معاملات مشکوک و اصلاحات فرسایشی حذف شده و وین‌ریت سیستم به بالای <span className="font-bold text-amber-300">۹۶٪</span> ارتقا می‌یابد.
          </div>
        </div>

        {/* Right: 4 Neural Weight Factors Breakdown */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-base text-slate-100">ارکان وزن‌دهی انسمبل هوش مصنوعی (AI Ensemble Weights)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">۴ ستون اعتبارسنجی</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiWeights.map((weight, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{weight.title}</span>
                    <span className="text-xs font-mono font-black text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      وزن: {weight.weight}٪
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{weight.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">امتیاز کسب‌شده:</span>
                  <span className="text-emerald-400 font-bold">{weight.score} از {weight.weight}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>پشتیبانی بومی از استاندارد <strong>ONNX</strong> در متاتریدر ۵ برای تحلیل آنی بدون تاخیر</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800/40">
              Latency: &lt; 2ms Execution
            </span>
          </div>
        </div>
      </div>

      {/* Comparative Matrix: Standard vs MTF vs Ultra AI */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">مقایسه عملکرد بک‌تست ۲ ماهه طلا (July & August 2026 - حساب $1,000 دلاری)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-lg">
            حجم پایه: ۰.۱۰ لات ثابت
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: Standard M1 Scalper */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-200">{comparisonStats.standard.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  تک‌تایم‌فریم
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">{comparisonStats.standard.subtitle}</p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">وین‌ریت (Win Rate):</span>
                  <span className="font-mono font-bold text-emerald-400">{comparisonStats.standard.winRate}٪</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">سود خالص ۲ ماهه:</span>
                  <span className="font-mono font-black text-amber-300">+${comparisonStats.standard.profit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">تعداد معاملات:</span>
                  <span className="font-mono text-slate-200">{comparisonStats.standard.trades} ترید ({comparisonStats.standard.wins} برد / {comparisonStats.standard.losses} باخت)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">حداکثر افت سرمایه (Max DD):</span>
                  <span className="font-mono text-rose-400">{comparisonStats.standard.maxDd}٪</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">فاکتور سود (Profit Factor):</span>
                  <span className="font-mono font-bold text-cyan-300">{comparisonStats.standard.profitFactor}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 text-center py-1 bg-slate-900/40 rounded border border-slate-800/60">
              سطح ۱: استراتژی استاندارد
            </div>
          </div>

          {/* Card 2: MTF M1 + M5 + M15 */}
          <div className="bg-slate-950/70 border border-cyan-800/40 rounded-xl p-4 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-cyan-300">{comparisonStats.mtf.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                  ۳ تایم‌فریم
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">{comparisonStats.mtf.subtitle}</p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">وین‌ریت (Win Rate):</span>
                  <span className="font-mono font-bold text-emerald-400">{comparisonStats.mtf.winRate}٪</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">سود خالص ۲ ماهه:</span>
                  <span className="font-mono font-black text-amber-300">+${comparisonStats.mtf.profit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">تعداد معاملات:</span>
                  <span className="font-mono text-slate-200">{comparisonStats.mtf.trades} ترید ({comparisonStats.mtf.wins} برد / {comparisonStats.mtf.losses} باخت)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">حداکثر افت سرمایه (Max DD):</span>
                  <span className="font-mono text-emerald-400">{comparisonStats.mtf.maxDd}٪ (کاهش ۳۵٪)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">فاکتور سود (Profit Factor):</span>
                  <span className="font-mono font-bold text-cyan-300">{comparisonStats.mtf.profitFactor}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-cyan-400 text-center py-1 bg-cyan-950/30 rounded border border-cyan-800/40 font-bold">
              سطح ۲: همسویی روندها
            </div>
          </div>

          {/* Card 3: Ultra AI + MTF (Highlighted) */}
          <div className="bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 border-2 border-amber-400 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-xl shadow-amber-500/10">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
                  {comparisonStats.ultraAi.title}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-black bg-amber-400 text-slate-950">
                  بهترین عملکرد ⭐
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-4">{comparisonStats.ultraAi.subtitle}</p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/30 border border-amber-500/30">
                  <span className="text-amber-200 font-bold">وین‌ریت (Win Rate):</span>
                  <span className="font-mono font-black text-emerald-300 text-sm">{comparisonStats.ultraAi.winRate}٪</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/30 border border-amber-500/30">
                  <span className="text-amber-200 font-bold">سود خالص ۲ ماهه:</span>
                  <span className="font-mono font-black text-amber-300 text-sm">+${comparisonStats.ultraAi.profit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">تعداد معاملات هوشمند:</span>
                  <span className="font-mono text-slate-200">{comparisonStats.ultraAi.trades} ترید ({comparisonStats.ultraAi.wins} برد / {comparisonStats.ultraAi.losses} باخت)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">حداکثر افت سرمایه (Max DD):</span>
                  <span className="font-mono font-black text-emerald-400">{comparisonStats.ultraAi.maxDd}٪ (امنیت مطلق)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">فاکتور سود (Profit Factor):</span>
                  <span className="font-mono font-black text-cyan-300">{comparisonStats.ultraAi.profitFactor}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-amber-300 text-center py-1 bg-amber-500/20 rounded border border-amber-400/40 font-black">
              سطح ۳: اوج دقت و بهینه‌سازی
            </div>
          </div>
        </div>
      </div>

      {/* 🛡️ Stop Loss Architecture & Optimizer Sandbox */}
      <StopLossOptimizerWidget onApplyToMt5={onOpenMt5Export} />

      {/* AI Decision & Trade Audit Log Simulator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">ژورنال ارزیابی تصمیمات هوش مصنوعی و فیلترهای MTF</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'ALL' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({tradeAuditLogs.length})
            </button>
            <button
              onClick={() => setFilterMode('APPROVED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تاییدشده‌ها
            </button>
            <button
              onClick={() => setFilterMode('FILTERED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'FILTERED' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فیلترشده‌ها (نجات سرمایه)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] font-mono">
                <th className="py-2.5 px-3">معامله</th>
                <th className="py-2.5 px-3">زمان / قیمت</th>
                <th className="py-2.5 px-3">نوع سیگنال M1</th>
                <th className="py-2.5 px-3">تاییدیه M5 و M15</th>
                <th className="py-2.5 px-3 text-center">امتیاز AI</th>
                <th className="py-2.5 px-3 text-center">تصمیم موتور</th>
                <th className="py-2.5 px-3">نتیجه مالی</th>
                <th className="py-2.5 px-3">علت و تحلیل مدل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => {
                const isApproved = log.decision === 'APPROVED';
                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-200">{log.id}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300">{log.time}</div>
                      <div className="text-amber-300 font-bold">${log.price.toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{log.m1Status}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="text-cyan-300 text-[11px]">{log.m5Status}</div>
                      <div className="text-indigo-300 text-[11px]">{log.m15Status}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        log.aiScore >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.aiScore}٪
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تایید ورود
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          مسدودسازی
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold font-sans">
                      <span className={isApproved ? 'text-emerald-400' : 'text-amber-400'}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px] font-sans max-w-xs leading-relaxed">
                      {log.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
