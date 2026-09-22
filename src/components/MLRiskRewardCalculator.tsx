import React, { useState } from 'react';
import { MLRegressionResult, MLRiskRewardSetup, calculateMLRiskRewardSetup } from '../utils/mlRegressionEngine';
import { MarketAsset } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Sliders,
  Sparkles,
  Copy,
  Check,
  Percent,
  Coins,
  AlertTriangle,
  Info,
  DollarSign,
  Activity,
  Layers,
  Crosshair
} from 'lucide-react';

interface MLRiskRewardCalculatorProps {
  asset: MarketAsset;
  mlResult: MLRegressionResult;
  onUpdateRRSetup?: (setup: MLRiskRewardSetup) => void;
  showOnChartToggle?: boolean;
  isShowingOnChart?: boolean;
  onToggleShowOnChart?: (show: boolean) => void;
}

export const MLRiskRewardCalculator: React.FC<MLRiskRewardCalculatorProps> = ({
  asset,
  mlResult,
  onUpdateRRSetup,
  showOnChartToggle = true,
  isShowingOnChart = true,
  onToggleShowOnChart
}) => {
  const isCent = asset.id === 'gold_1m' || asset.id.includes('cent');
  const [accountBalance, setAccountBalance] = useState<number>(isCent ? 50 : 1000);
  const [riskPercent, setRiskPercent] = useState<number>(2.0);
  const [atrMultiplier, setAtrMultiplier] = useState<number>(1.8);
  const [entryMode, setEntryMode] = useState<'MARKET_INSTANT' | 'PULLBACK_FITTED' | 'BREAKOUT_CONE'>('MARKET_INSTANT');
  const [copied, setCopied] = useState<boolean>(false);

  // Recompute dynamic RR setup on any state change
  const rrSetup: MLRiskRewardSetup = React.useMemo(() => {
    const setup = calculateMLRiskRewardSetup({
      currentPrice: mlResult.currentPrice,
      baseATR: mlResult.baseATR,
      directionBias: mlResult.directionBias,
      directionalConfidence: mlResult.directionalConfidence,
      targetPriceAtHorizon: mlResult.targetPriceAtHorizon,
      predictedTurningStep: mlResult.predictedTurningStep,
      turningPointType: mlResult.turningPointType,
      forecastPoints: mlResult.forecastPoints,
      historicalPoints: mlResult.historicalPoints,
      options: {
        entryMode,
        atrMultiplier,
        accountBalance,
        riskPercent,
        minLotSize: isCent ? 1.0 : 0.10,
        isCentAccount: isCent
      }
    });

    if (onUpdateRRSetup) {
      onUpdateRRSetup(setup);
    }
    return setup;
  }, [
    mlResult,
    entryMode,
    atrMultiplier,
    accountBalance,
    riskPercent,
    isCent,
    onUpdateRRSetup
  ]);

  const {
    direction,
    baseATR,
    entryPrice,
    stopLossPrice,
    stopLossDistance,
    stopLossPoints,
    tp1Price,
    tp1Distance,
    tp1RR,
    tp2Price,
    tp2Distance,
    tp2RR,
    tp3Price,
    tp3Distance,
    tp3RR,
    antiNoiseSafetyRating,
    antiNoiseDescription,
    recommendedLot,
    riskDollar,
    tp1ProfitDollar,
    tp2ProfitDollar,
    tp3ProfitDollar,
    expectedValueDollar
  } = rrSetup;

  const isBuy = direction === 'BUY';

  const copyMt5OrderSpecs = () => {
    const text = `
=== MT5 ORDER SPECS (ML & ATR ENGINE) ===
Symbol: ${asset.symbol || 'XAUUSD'}
Direction: ${direction} (${entryMode === 'MARKET_INSTANT' ? 'Market' : 'Pending Limit/Stop'})
Volume (Lot): ${recommendedLot.toFixed(2)}
Entry Price: $${entryPrice.toFixed(2)}
Stop Loss (SL): $${stopLossPrice.toFixed(2)} (Risk: -$${riskDollar.toFixed(2)})
Take Profit 1 (TP1): $${tp1Price.toFixed(2)} (RR: 1:${tp1RR} | Profit: +$${tp1ProfitDollar.toFixed(2)})
Take Profit 2 (TP2): $${tp2Price.toFixed(2)} (RR: 1:${tp2RR} | Profit: +$${tp2ProfitDollar.toFixed(2)})
Take Profit 3 (TP3): $${tp3Price.toFixed(2)} (RR: 1:${tp3RR} | Profit: +$${tp3ProfitDollar.toFixed(2)})
ATR Volatility (14): $${baseATR.toFixed(2)} | ATR Multiplier: ${atrMultiplier}x
Expected Value (EV): +$${expectedValueDollar.toFixed(2)}
=========================================
`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-950/90 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <span>محاسبه‌گر هوشمند ریسک به ریوارد (RR) با فیلتر نوسانات ATR</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-black border ${
                  isBuy
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  سیگنال رگرسیون: {isBuy ? 'خرید (BUY)' : 'فروش (SELL)'}
                </span>
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تعیین نقاط ورود، حد ضرر پویا و اهداف خروج بر اساس گرادیان مدل یادگیری ماشین و محاسبه بافر نوسانات میانگین دامنه واقعی (ATR)
            </p>
          </div>
        </div>

        {/* Action Controls: Show on Chart & Copy */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {showOnChartToggle && onToggleShowOnChart && (
            <button
              onClick={() => onToggleShowOnChart(!isShowingOnChart)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isShowingOnChart
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isShowingOnChart ? 'سطوح روی نمودار: فعال' : 'نمایش سطوح روی نمودار'}</span>
            </button>
          )}

          <button
            onClick={copyMt5OrderSpecs}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد!' : 'کپی اردر برای MT5'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
        {/* Entry Strategy Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>استراتژی نقطه ورود (Entry Mode)</span>
          </label>
          <select
            value={entryMode}
            onChange={(e) => setEntryMode(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="MARKET_INSTANT">⚡ ورود مارکت لحظه‌ای ($ {mlResult.currentPrice.toFixed(2)})</option>
            <option value="PULLBACK_FITTED">🎯 پولبک به منحنی رگرسیون (Pullback Retest)</option>
            <option value="BREAKOUT_CONE">🚀 شکست باند ۶۸٪ اطمینان (Breakout)</option>
          </select>
        </div>

        {/* ATR Multiplier / Anti-Noise Buffer Slider/Pills */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ضریب بافر نوسان (ATR Multiplier)</span>
            </label>
            <span className="text-amber-300 font-mono font-bold">{atrMultiplier.toFixed(1)}x</span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[1.2, 1.5, 1.8, 2.4].map((val) => (
              <button
                key={val}
                onClick={() => setAtrMultiplier(val)}
                className={`py-1 text-[10px] font-bold font-mono rounded transition-all ${
                  atrMultiplier === val
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {val}x {val === 1.8 ? '★' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Account Capital */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>موجودی حساب ({isCent ? 'دلار / سنت' : 'دلار USD'})</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Math.max(10, parseFloat(e.target.value) || 0))}
              step={isCent ? 10 : 100}
              className="w-full bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-slate-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs font-mono">$</span>
          </div>
        </div>

        {/* Risk Percentage */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <label className="text-slate-400 font-medium flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-rose-400" />
              <span>درصد ریسک در این ترید</span>
            </label>
            <span className="text-rose-300 font-mono font-bold">{riskPercent}% (${riskDollar.toFixed(0)})</span>
          </div>
          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[1.0, 1.5, 2.0, 3.0].map((val) => (
              <button
                key={val}
                onClick={() => setRiskPercent(val)}
                className={`py-1 text-[10px] font-bold font-mono rounded transition-all ${
                  riskPercent === val
                    ? 'bg-rose-500 text-slate-100 shadow font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anti-Noise Buffer Guard Notice */}
      <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
        antiNoiseSafetyRating === 'OPTIMAL'
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : antiNoiseSafetyRating === 'HIGH'
          ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
          : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
      }`}>
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="flex items-center justify-between font-bold">
            <span>محافظت در برابر استاپ‌های زودهنگام (Anti-Noise Volatility Protection):</span>
            <span className="font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
              ATR(14) = ${baseATR.toFixed(2)} | بافر امن = ${ (baseATR * atrMultiplier).toFixed(2) }
            </span>
          </div>
          <p className="text-[11px] text-slate-300/90 leading-relaxed mt-0.5">
            {antiNoiseDescription}
          </p>
        </div>
      </div>

      {/* Main Trade Ladder: Stop Loss -> Entry -> TP1 -> TP2 -> TP3 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* 1. Stop Loss Card */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              حد ضرر (Stop Loss)
            </span>
            <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
              بافر {atrMultiplier}× ATR
            </span>
          </div>

          <div>
            <div className="text-lg font-black text-rose-300 font-mono">
              ${stopLossPrice.toFixed(2)}
            </div>
            <div className="text-[11px] text-rose-400/80 font-mono mt-0.5 flex items-center justify-between">
              <span>فاصله: {stopLossPoints.toFixed(1)} پیپ (${stopLossDistance.toFixed(2)})</span>
            </div>
          </div>

          <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">ریسک دلاری:</span>
            <span className="text-rose-400 font-bold">-${riskDollar.toFixed(2)}</span>
          </div>
        </div>

        {/* 2. Entry Price Card */}
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
              نقطه ورود ({entryMode === 'MARKET_INSTANT' ? 'لحظه‌ای' : entryMode === 'PULLBACK_FITTED' ? 'پولبک' : 'بریک‌اوت'})
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
              isBuy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {direction}
            </span>
          </div>

          <div>
            <div className="text-lg font-black text-slate-100 font-mono">
              ${entryPrice.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>قیمت مارکت: ${mlResult.currentPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">حجم پیشنهادی:</span>
            <span className="text-amber-400 font-bold">{recommendedLot.toFixed(2)} Lot</span>
          </div>
        </div>

        {/* 3. TP1 Card (Conservative) */}
        <div className="bg-emerald-950/15 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              تارگت ۱ (محافظه‌کارانه)
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
              R:R 1:{tp1RR}
            </span>
          </div>

          <div>
            <div className="text-lg font-black text-emerald-300 font-mono">
              ${tp1Price.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-400/80 font-mono mt-0.5 flex items-center justify-between">
              <span>فاصله: +{tp1Distance.toFixed(2)}$ ({(tp1Distance * 10).toFixed(0)} پیپ)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">سود احتمالی:</span>
            <span className="text-emerald-400 font-bold">+${tp1ProfitDollar.toFixed(2)}</span>
          </div>
        </div>

        {/* 4. TP2 Card (ML Horizon / Turning Point Target) */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-indigo-950/20 to-slate-900 border-2 border-emerald-400/60 rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-lg ring-1 ring-emerald-400/20 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              تارگت ۲ (افق رگرسیون)
            </span>
            <span className="text-[10px] font-mono bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded font-black">
              R:R 1:{tp2RR}
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-emerald-300 font-mono flex items-baseline gap-1">
              ${tp2Price.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-300/90 font-mono mt-0.5 flex items-center justify-between">
              <span>فاصله: +{tp2Distance.toFixed(2)}$ ({(tp2Distance * 10).toFixed(0)} پیپ)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-300 font-medium">سود تارگت اصلی:</span>
            <span className="text-emerald-300 font-black">+${tp2ProfitDollar.toFixed(2)}</span>
          </div>
        </div>

        {/* 5. TP3 Card (Extended 95% Volatility Cone Target) */}
        <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              تارگت ۳ (باند ۹۵٪)
            </span>
            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
              R:R 1:{tp3RR}
            </span>
          </div>

          <div>
            <div className="text-lg font-black text-purple-300 font-mono">
              ${tp3Price.toFixed(2)}
            </div>
            <div className="text-[11px] text-purple-400/80 font-mono mt-0.5 flex items-center justify-between">
              <span>فاصله: +{tp3Distance.toFixed(2)}$ ({(tp3Distance * 10).toFixed(0)} پیپ)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">سود حداکثری:</span>
            <span className="text-purple-400 font-bold">+${tp3ProfitDollar.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Visual Risk-Reward Spectrum Gauge */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>نوار تراز هندسی ریسک و ریوارد معامله (Risk vs Reward Spectrum)</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            امید ریاضی سود (EV): +${expectedValueDollar.toFixed(2)}
          </span>
        </div>

        {/* Multi-segment Bar */}
        <div className="w-full bg-slate-950 h-4 rounded-lg overflow-hidden border border-slate-800 flex items-center font-mono text-[9px] font-bold">
          {/* SL Zone */}
          <div
            className="bg-rose-600/80 h-full flex items-center justify-center text-rose-100 border-r border-rose-900"
            style={{ width: `${Math.min(35, Math.max(15, (1 / (1 + tp2RR)) * 100))}%` }}
          >
            ریسک 1.0 (SL)
          </div>

          {/* TP1 Zone */}
          <div
            className="bg-emerald-600/70 h-full flex items-center justify-center text-emerald-100 border-r border-emerald-800"
            style={{ width: `${Math.min(25, (tp1RR / (1 + tp3RR)) * 100)}%` }}
          >
            TP1 (1:{tp1RR})
          </div>

          {/* TP2 Zone */}
          <div
            className="bg-emerald-500 h-full flex items-center justify-center text-slate-950 font-black border-r border-emerald-400"
            style={{ width: `${Math.min(35, ((tp2RR - tp1RR) / (1 + tp3RR)) * 100)}%` }}
          >
            TP2 (1:{tp2RR})
          </div>

          {/* TP3 Zone */}
          <div
            className="bg-purple-600/80 h-full flex-1 flex items-center justify-center text-purple-100"
          >
            TP3 (1:{tp3RR})
          </div>
        </div>

        {/* Explanatory footnote */}
        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1">
          <span>• در صورت رسیدن به TP1، پیشنهاد می‌شود حد ضرر به نقطه ورود منتقل شود (Risk-Free).</span>
          <span>• نسبت ریوارد به ریسک تارگت اصلی ({tp2RR}) با وین‌ریت {mlResult.directionalConfidence}٪ هوش مصنوعی، برآیند سودآور قطعی ایجاد می‌کند.</span>
        </div>
      </div>
    </div>
  );
};
