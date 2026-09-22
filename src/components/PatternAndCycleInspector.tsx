import React, { useState } from 'react';
import { MarketAsset } from '../types';
import { 
  Zap, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Calculator, 
  Sparkles, 
  Compass, 
  Crosshair, 
  Scale, 
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Target,
  Brain
} from 'lucide-react';
import { MLForecastWidget } from './MLForecastWidget';

interface PatternAndCycleInspectorProps {
  asset: MarketAsset;
}

export const PatternAndCycleInspector: React.FC<PatternAndCycleInspectorProps> = ({ asset }) => {
  const [activeTab, setActiveTab] = useState<'patterns' | 'position' | 'cycles' | 'ml_forecast'>('ml_forecast');
  const [accountBalance, setAccountBalance] = useState<number>(
    asset.id === 'gold_1m' ? 50 : 5000
  );
  const [riskPercent, setRiskPercent] = useState<number>(2.0);

  // Position Calculations
  const entryPrice = asset.positionConfig?.entryPrice || asset.upperBoundary;
  const slPrice = asset.positionConfig?.stopLossPrice || asset.stopLossPrice;
  const tp1Price = asset.positionConfig?.targetPrice1 || asset.targetPrice1;
  const tp2Price = asset.positionConfig?.targetPrice2 || asset.targetPrice2;

  const priceRisk = Math.abs(entryPrice - slPrice);
  const reward1 = Math.abs(tp1Price - entryPrice);
  const reward2 = Math.abs(tp2Price - entryPrice);
  const rr1 = priceRisk > 0 ? (reward1 / priceRisk).toFixed(2) : '0';
  const rr2 = priceRisk > 0 ? (reward2 / priceRisk).toFixed(2) : '0';

  const riskDollar = (accountBalance * (riskPercent / 100));
  
  // Calculate recommended lot size
  let calculatedLot = 0.01;
  if (asset.id === 'gold_1m') {
    // Cent account: 50 USD = 5,000 USC
    // 1 Cent Lot = 0.01 std lot = 1 oz
    // Risk in USD = riskDollar. Each $1 move in gold = $1 per 1 cent lot.
    calculatedLot = priceRisk > 0 ? Math.max(0.1, parseFloat((riskDollar / priceRisk).toFixed(1))) : 1.0;
  } else if (asset.id === 'xau_usd') {
    // Std Gold: 1 lot = 100 oz. 1 point move = $100.
    const pointRisk = priceRisk * 100;
    calculatedLot = pointRisk > 0 ? Math.max(0.01, parseFloat((riskDollar / pointRisk).toFixed(2))) : 0.05;
  } else {
    // BTC
    calculatedLot = priceRisk > 0 ? Math.max(0.001, parseFloat((riskDollar / priceRisk).toFixed(3))) : 0.05;
  }

  const profitDollarTP1 = (reward1 / priceRisk) * riskDollar;
  const profitDollarTP2 = (reward2 / priceRisk) * riskDollar;

  // Hosoda Targets calculations
  const hosoda = asset.hosodaTargets || {
    vTarget: Math.round(entryPrice + priceRisk * 1.5),
    nTarget: Math.round(entryPrice + priceRisk * 1.2),
    eTarget: Math.round(entryPrice + priceRisk * 2.2),
    ntTarget: Math.round(entryPrice - priceRisk * 0.3),
  };

  // Cycle Metrics
  const totalCandles = asset.candles.length;
  const compressionBars = asset.eszRange[1] - asset.eszRange[0];
  const postBreakoutBars = totalCandles - asset.breakoutIndex;
  const nextCycleTurning = asset.hosodaCycles?.nextTurningIndex || (asset.breakoutIndex + 17);
  const barsUntilTurn = Math.max(0, nextCycleTurning - totalCandles);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
              <span>دیدبان دقت: الگوهای امواج الیوت نئویو، پوزیشن‌سایزینگ و چرخه‌های زمانی</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                موتور تحلیلی فعال
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ترکیب ریاضی نظریه امواج و مقادیر هدف، محاسبات دقیق حد سود/ریسک، و انطباق دوره‌های زمانی کیهون‌سوچی
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('ml_forecast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'ml_forecast'
                ? 'bg-indigo-500 text-slate-950 shadow-md shadow-indigo-500/20'
                : 'text-indigo-400 hover:text-indigo-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>هوش پیش‌بین ML (۱۰ کندل)</span>
            <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-500/40">
              جدید
            </span>
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'patterns'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>الگوهای امواج و اهداف قیمتی</span>
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'position'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>محاسبه‌گر پوزیشن و ریسک</span>
          </button>
          <button
            onClick={() => setActiveTab('cycles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'cycles'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>رادار چرخه‌های زمانی</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Patterns (Hosoda Waves & Target Calculations) */}
      {activeTab === 'patterns' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Target V */}
            <div className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">هدف موج V (تارگت اول)</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono px-1.5 py-0.5 rounded">
                  $V = B + (B - C)$
                </span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-amber-400">${hosoda.vTarget.toLocaleString()}</span>
                <span className="text-xs text-slate-400">تارگت موج بازگشتی</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                برابری ارتفاع موج اصلاحی قبلی با گام بعدی قیمت. در این سطح معمولاً پله اول سود ذخیره و استاپ به نقطه ورود منتقل می‌شود.
              </p>
            </div>

            {/* Target N */}
            <div className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-colors rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">هدف موج N (پایه استاندارد)</span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-mono px-1.5 py-0.5 rounded">
                  $N = C + (B - A)$
                </span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-cyan-400">${hosoda.nTarget.toLocaleString()}</span>
                <span className="text-xs text-slate-400">گام پایه استاندارد</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                انتقال مستقیم طول موج محرک اول (A به B) از کف نقطه C. پایه و بنیاد محاسبات حرکتی سیستم الیوت نئویو.
              </p>
            </div>

            {/* Target E */}
            <div className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-colors rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">هدف موج E (روند امتدادی)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded">
                  $E = B + (B - A)$
                </span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-emerald-400">${hosoda.eTarget.toLocaleString()}</span>
                <span className="text-xs text-slate-400">هدف ماکزیمم روند</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                تکمیل موج تکانه‌ای امتدادیافته سیستم. این تارگت معمولاً همپوشانی شگفت‌انگیزی با خط چرخه L-FLD دارد.
              </p>
            </div>

            {/* San Yaku Kouten Status */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">تأییدیه سه‌گانه طلایی</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                  San Yaku Kouten
                </span>
              </div>
              <div className="flex flex-col gap-1 mt-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>۱. تقاطع طلایی تنکان-کیجن (TK Cross)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>۲. خروج چیکو اسپن به فضای باز (Chikou Free)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>۳. تثبیت کندل بالای ابر کومو (Kumo Breakout)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Breakdown Walkthrough */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>الگوی فعال چارت:</strong> تشکیل مثلث انقباضی فشردگی <span className="text-amber-400 font-bold">موج P (P-Wave)</span> در محدوده ESZ و شکست صعودی به سمت <span className="text-emerald-400 font-bold">موج ۵ پله‌ای N</span>
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">
                پیوت A: ${asset.wavePivots?.[0]?.price.toLocaleString() || '---'}
              </span>
              <span className="text-slate-500">→</span>
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">
                پیوت B: ${asset.wavePivots?.[1]?.price.toLocaleString() || '---'}
              </span>
              <span className="text-slate-500">→</span>
              <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">
                پیوت C: ${asset.wavePivots?.[2]?.price.toLocaleString() || '---'}
              </span>
              <span className="text-slate-500">→</span>
              <span className="bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded text-emerald-300 font-bold">
                شکست D: ${entryPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Position Precision & Risk Sizing Calculator */}
      {activeTab === 'position' && (
        <div className="flex flex-col gap-4">
          {/* Controls Bar */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">سرمایه حساب (Balance):</span>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Math.max(10, parseFloat(e.target.value) || 0))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-100 text-center focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-amber-400 font-bold">$</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">ریسک مجاز:</span>
                <div className="flex items-center gap-1">
                  {[1.0, 1.5, 2.0, 2.5, 3.0].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setRiskPercent(pct)}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                        riskPercent === pct
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>مبلغ ریسک معامله: <strong className="text-rose-400 font-mono">${riskDollar.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Entry Price */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400">نقطه ورود (Entry)</span>
              <span className="text-base font-black font-mono text-cyan-400">${entryPrice.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500">شکست معتبر مرز بالایی</span>
            </div>

            {/* Stop Loss Price */}
            <div className="bg-slate-950/80 border border-rose-500/40 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400">حد ضرر (Stop Loss)</span>
              <span className="text-base font-black font-mono text-rose-400">${slPrice.toLocaleString()}</span>
              <span className="text-[10px] text-rose-400 font-mono">ریسک: ${priceRisk.toLocaleString()} ({((priceRisk / entryPrice) * 100).toFixed(2)}%)</span>
            </div>

            {/* Target 1 */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400">تارگت ۱ (FLD/V)</span>
              <span className="text-base font-black font-mono text-emerald-400">${tp1Price.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 font-mono">R:R = 1:{rr1} (+${profitDollarTP1.toFixed(1)})</span>
            </div>

            {/* Target 2 */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400">تارگت ۲ (HPFP/E)</span>
              <span className="text-base font-black font-mono text-emerald-300">${tp2Price.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-300 font-mono">R:R = 1:{rr2} (+${profitDollarTP2.toFixed(1)})</span>
            </div>

            {/* Recommended Lot Size */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-3 flex flex-col gap-1 shadow-lg shadow-amber-950/10">
              <span className="text-[11px] text-slate-400">حجم معامله پیشنهادی</span>
              <span className="text-base font-black font-mono text-amber-400">{calculatedLot} Lot</span>
              <span className="text-[10px] text-amber-300/80">بر مبنای ریسک {riskPercent}%</span>
            </div>

            {/* Trailing Stop & Breakeven */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400">استاپ متحرک و ریسک‌فری</span>
              <span className="text-xs font-bold text-cyan-300">کیجنسن میان‌مدت</span>
              <span className="text-[10px] text-slate-400">انتقال به سر‌به‌سر در TP1</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cycles & Time Symmetry (Kihon Suchi & Taitou Suchi) */}
      {activeTab === 'cycles' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Compression Span */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-xs text-slate-400">طول دوره انقباض (ESZ Compression)</span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-amber-400">{compressionBars}</span>
                <span className="text-xs text-slate-400">کندل فشردگی</span>
              </div>
              <span className="text-[11px] text-slate-400">
                نزدیک به عدد پایه کیهون‌سوچی <strong className="text-amber-300 font-mono">۴۲</strong>
              </span>
            </div>

            {/* Taitou Suchi (Equal Time) Window */}
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">پنجره تقارن زمانی سیستم الیوت نئویو</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.5 rounded">
                  Taitou Suchi
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-cyan-400">کندل ۸۰ تا ۸۶</span>
              </div>
              <span className="text-[11px] text-slate-400">
                انتقال زمان فاز فشردگی به فاز رالی برای انفجار روند
              </span>
            </div>

            {/* Post-Breakout Bars */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="text-xs text-slate-400">کندل‌های سپری‌شده پس از شکست</span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-emerald-400">{postBreakoutBars}</span>
                <span className="text-xs text-slate-400">کندل در جریان روند</span>
              </div>
              <span className="text-[11px] text-slate-400">
                پوشش فراتر از چرخه کوتاه ۹ کندلی
              </span>
            </div>

            {/* Next Turning Point */}
            <div className="bg-slate-950/80 border border-purple-500/40 rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">پنجره چرخش زمانی بعدی</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-1.5 py-0.5 rounded">
                  Cycle Inflection
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-purple-400">{barsUntilTurn}</span>
                <span className="text-xs text-slate-400">کندل باقی‌مانده</span>
              </div>
              <span className="text-[11px] text-purple-300 font-mono">
                تلاقی در کندل {nextCycleTurning} (مضرب زمانی چرخه‌ها)
              </span>
            </div>
          </div>

          {/* Kihon Suchi Numbers Legend */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300 font-bold">اعداد زمانی پایه کیهون‌سوچی (Kihon Suchi):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300">
                ۹ (اینکان)
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300">
                ۱۷ (دو اینکان)
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-cyan-300 font-bold">
                ۲۶ (ایچی‌کی)
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                ۳۳
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-purple-300 font-bold">
                ۴۲
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                ۵۲ (دو ایچی‌کی)
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                ۶۵
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-emerald-300 font-bold">
                ۷۶ (سان‌کی / فصلی)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: ML Regression & 10-Candle Short-term Trajectory Forecast */}
      {activeTab === 'ml_forecast' && (
        <MLForecastWidget asset={asset} />
      )}
    </div>
  );
};
