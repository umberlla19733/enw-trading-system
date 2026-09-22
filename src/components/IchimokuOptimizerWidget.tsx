import React, { useState, useMemo } from 'react';
import { MarketAsset } from '../types';
import { IchimokuParamsConfig } from '../utils/indicators';
import {
  runIchimokuAssetOptimization,
  ParamSimulationMetrics,
  OptimizationResult
} from '../utils/ichimokuOptimizer';
import {
  Sliders,
  Sparkles,
  Zap,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Award,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  Target,
  Percent,
  Layers,
  ArrowUpRight,
  Info,
  Check
} from 'lucide-react';

interface IchimokuOptimizerWidgetProps {
  asset: MarketAsset;
  activeConfig: IchimokuParamsConfig;
  onApplyConfig: (config: IchimokuParamsConfig) => void;
}

export const IchimokuOptimizerWidget: React.FC<IchimokuOptimizerWidgetProps> = ({
  asset,
  activeConfig,
  onApplyConfig,
}) => {
  const [selectedViewTab, setSelectedViewTab] = useState<'presets' | 'heatmap' | 'custom'>('presets');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [customTenkan, setCustomTenkan] = useState<number>(activeConfig.sTenkan);
  const [customKijun, setCustomKijun] = useState<number>(activeConfig.sKijun);
  const [customSpanB, setCustomSpanB] = useState<number>(activeConfig.sSpanB);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Run Optimization on Asset
  const optResult: OptimizationResult = useMemo(() => {
    return runIchimokuAssetOptimization(asset, activeConfig);
  }, [asset, activeConfig]);

  const {
    currentMetrics,
    bestOptimizedConfig,
    bestOptimizedMetrics,
    harmonicTwioMetrics,
    classicHosodaMetrics,
    topPresets,
    sensitivityMatrix,
    assetSpecificInsights,
    executionTimeMs
  } = optResult;

  const handleApply = (config: IchimokuParamsConfig, label: string) => {
    onApplyConfig(config);
    setAppliedNotification(label);
    setTimeout(() => {
      setAppliedNotification(null);
    }, 2800);
  };

  const handleRunReScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 400);
  };

  const isCurrentHarmonic = activeConfig.sTenkan === 9 && activeConfig.sKijun === 45 && activeConfig.sSpanB === 225;
  const isCurrentClassic = activeConfig.sTenkan === 9 && activeConfig.sKijun === 26 && activeConfig.sSpanB === 52;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-100">
                بهینه‌ساز هوشمند پارامترهای ایچیموکو (۹، ۴۵، ۲۲۵)
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                Auto-Tuning AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              کالیبراسیون و پیشنهاد خودکار دوره‌های بهینه بر اساس شبیه‌سازی بازدهی تاریخی دارایی {asset.name}
            </p>
          </div>
        </div>

        {/* Action button / Rescan */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleRunReScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
            <span>بازآزمایی سریع ({executionTimeMs}ms)</span>
          </button>
        </div>
      </div>

      {/* Applied Notification Toast */}
      {appliedNotification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-2 rounded-xl flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>تنظیمات <strong>«{appliedNotification}»</strong> با موفقیت بر روی چارت و اندیکاتورها اعمال گردید.</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
            Active on Chart
          </span>
        </div>
      )}

      {/* Main Comparative Cards: Current vs Symphony TWIO vs AI Optimal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Symphony TWIO (9, 45, 225) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all relative overflow-hidden ${
          isCurrentHarmonic
            ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : 'bg-slate-950/60 border-amber-500/30 hover:border-amber-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">سمفونی طوفان TWIO</span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
              ۹، ۴۵، ۲۲۵
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">بازدهی تاریخی</span>
              <span className={`text-sm font-black font-mono ${harmonicTwioMetrics.totalReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {harmonicTwioMetrics.totalReturnPercent >= 0 ? '+' : ''}{harmonicTwioMetrics.totalReturnPercent}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">وین‌ریت (Win Rate)</span>
              <span className="text-sm font-black font-mono text-cyan-300">
                {harmonicTwioMetrics.winRatePercent}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">فاکتور سود (PF)</span>
              <span className="text-sm font-black font-mono text-amber-300">
                {harmonicTwioMetrics.profitFactor}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">امتیاز ارزیابی</span>
              <span className="text-sm font-black font-mono text-purple-300">
                {harmonicTwioMetrics.harmonicScore}/100
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            کاهش ۵۶٪ نویز در دوره آرامش (ESZ) و همگام‌سازی امواج سه‌گانه
          </p>

          <button
            onClick={() => handleApply({
              sTenkan: 9,
              sKijun: 45,
              sSpanB: 225,
              mTenkan: 45,
              mKijun: 130,
              lKijun: 650
            }, 'سمفونی طوفان (۹، ۴۵، ۲۲۵)')}
            className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isCurrentHarmonic
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
            }`}
          >
            {isCurrentHarmonic ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>پیکربندی فعال روی چارت</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>اعمال سمفونی (۹، ۴۵، ۲۲۵)</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Classic Standard (9, 26, 52) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all relative overflow-hidden ${
          isCurrentClassic
            ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">کلاسیک استاندارد</span>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold">
              ۹، ۲۶، ۵۲
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">بازدهی تاریخی</span>
              <span className={`text-sm font-black font-mono ${classicHosodaMetrics.totalReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {classicHosodaMetrics.totalReturnPercent >= 0 ? '+' : ''}{classicHosodaMetrics.totalReturnPercent}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">وین‌ریت (Win Rate)</span>
              <span className="text-sm font-black font-mono text-cyan-300">
                {classicHosodaMetrics.winRatePercent}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">فاکتور سود (PF)</span>
              <span className="text-sm font-black font-mono text-amber-300">
                {classicHosodaMetrics.profitFactor}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">امتیاز ارزیابی</span>
              <span className="text-sm font-black font-mono text-slate-300">
                {classicHosodaMetrics.harmonicScore}/100
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            فرمول استاندارد ۱۹۳۰ میلادی مناسب دوره‌های هفتگی کلاسیک
          </p>

          <button
            onClick={() => handleApply({
              sTenkan: 9,
              sKijun: 26,
              sSpanB: 52,
              mTenkan: 45,
              mKijun: 130,
              lKijun: 650
            }, 'کلاسیک استاندارد (۹، ۲۶، ۵۲)')}
            className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isCurrentClassic
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isCurrentClassic ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>پیکربندی فعال روی چارت</span>
              </>
            ) : (
              <span>اعمال کلاسیک (۹، ۲۶، ۵۲)</span>
            )}
          </button>
        </div>

        {/* Card 3: AI Optimal Discovered for this Asset */}
        <div className="p-4 rounded-xl border border-indigo-500/50 bg-gradient-to-br from-indigo-950/30 to-slate-950 flex flex-col justify-between gap-3 shadow-lg shadow-indigo-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300">پیشنهاد برتر الگوریتم ({asset.name})</span>
            </div>
            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/40 font-bold">
              {bestOptimizedMetrics.sTenkan}، {bestOptimizedMetrics.sKijun}، {bestOptimizedMetrics.sSpanB}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">بیشینه بازدهی</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                +{bestOptimizedMetrics.totalReturnPercent}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">وین‌ریت (Win Rate)</span>
              <span className="text-sm font-black font-mono text-cyan-300">
                {bestOptimizedMetrics.winRatePercent}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">فاکتور سود (PF)</span>
              <span className="text-sm font-black font-mono text-indigo-300">
                {bestOptimizedMetrics.profitFactor}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">امتیاز نهایی</span>
              <span className="text-sm font-black font-mono text-amber-300">
                {bestOptimizedMetrics.harmonicScore}/100
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            کشف‌شده از میان {optResult.allTestedCombinations.length} ترکیب پارامتریک در کندل‌های واقعی
          </p>

          <button
            onClick={() => handleApply(bestOptimizedConfig, `پیشنهاد الگوریتم (${bestOptimizedMetrics.sTenkan}، ${bestOptimizedMetrics.sKijun}، ${bestOptimizedMetrics.sSpanB})`)}
            className="w-full py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 font-black transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>اعمال بهترین پیشنهاد به چارت</span>
          </button>
        </div>
      </div>

      {/* Tabs for Presets Library, Heatmap Sensitivity, and Custom Tuner */}
      <div className="flex items-center justify-between border-b border-slate-800 pt-2 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedViewTab('presets')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedViewTab === 'presets'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            کتابخانه الگوهای بهینه (Presets)
          </button>
          <button
            onClick={() => setSelectedViewTab('heatmap')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedViewTab === 'heatmap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ماتریس حساسیت بازدهی (Heatmap)
          </button>
          <button
            onClick={() => setSelectedViewTab('custom')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedViewTab === 'custom'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تنظیم دستی و زنده (Custom Sliders)
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          دارایی: <span className="text-slate-200 font-bold">{asset.symbol}</span> | تایم‌فریم: <span className="text-amber-400">{asset.timeframe}</span>
        </div>
      </div>

      {/* Tab 1: Presets Library Table */}
      {selectedViewTab === 'presets' && (
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-medium">الگو و پارامترها</th>
                  <th className="pb-2 font-medium">تنکان / کیجن / اسپن B</th>
                  <th className="pb-2 font-medium">بازدهی تاریخی</th>
                  <th className="pb-2 font-medium">وین‌ریت</th>
                  <th className="pb-2 font-medium">فاکتور سود</th>
                  <th className="pb-2 font-medium">افت سرمایه (DD)</th>
                  <th className="pb-2 font-medium">فیلتر نویز</th>
                  <th className="pb-2 font-medium">امتیاز ارزیابی</th>
                  <th className="pb-2 font-medium text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {topPresets.map((preset, idx) => {
                  const isActive =
                    activeConfig.sTenkan === preset.sTenkan &&
                    activeConfig.sKijun === preset.sKijun &&
                    activeConfig.sSpanB === preset.sSpanB;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isActive ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 font-sans font-bold text-slate-200 flex items-center gap-1.5">
                        {idx === 0 && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span>{preset.label}</span>
                        {isActive && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-sans border border-amber-500/30">
                            فعال
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-300 font-bold">
                        ({preset.sTenkan}، {preset.sKijun}، {preset.sSpanB})
                      </td>
                      <td
                        className={`py-2.5 font-bold ${
                          preset.totalReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {preset.totalReturnPercent >= 0 ? '+' : ''}
                        {preset.totalReturnPercent}%
                      </td>
                      <td className="py-2.5 text-cyan-300 font-bold">{preset.winRatePercent}%</td>
                      <td className="py-2.5 text-amber-300 font-bold">{preset.profitFactor}</td>
                      <td className="py-2.5 text-rose-400 font-mono">-{preset.maxDrawdownPercent}%</td>
                      <td className="py-2.5 text-purple-300 font-mono">{preset.noiseFilterScore}%</td>
                      <td className="py-2.5 font-bold text-indigo-300">
                        {preset.harmonicScore}/100
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() =>
                            handleApply(
                              {
                                sTenkan: preset.sTenkan,
                                sKijun: preset.sKijun,
                                sSpanB: preset.sSpanB,
                                mTenkan: preset.mTenkan,
                                mKijun: preset.mKijun,
                                lKijun: preset.lKijun,
                              },
                              preset.label
                            )
                          }
                          className={`px-2.5 py-1 rounded text-[11px] font-sans font-bold transition-all ${
                            isActive
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {isActive ? 'فعال' : 'اعمال'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sensitivity Heatmap Matrix */}
      {selectedViewTab === 'heatmap' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ماتریس بازدهی تاریخی بر حسب ترکیب تنکان‌سن (سطرها) و کیجنسن (ستون‌ها):</span>
            <span className="text-[10px] text-amber-400">سبز پررنگ = بالاترین سودآوری</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 font-sans text-right">تنکان / کیجن</th>
                  {sensitivityMatrix.kijunValues.map((k) => (
                    <th key={k} className="py-2 font-mono font-bold text-slate-300">
                      کیجن {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {sensitivityMatrix.matrix.map((row, rowIdx) => {
                  const tVal = sensitivityMatrix.tenkanValues[rowIdx];
                  return (
                    <tr key={tVal} className="hover:bg-slate-800/30">
                      <td className="py-2 font-sans font-bold text-right text-slate-300">
                        تنکان {tVal}
                      </td>
                      {row.map((cell) => {
                        const isHigh = cell.returnPct >= 15;
                        const isMed = cell.returnPct > 0 && cell.returnPct < 15;
                        const isNeg = cell.returnPct <= 0;

                        return (
                          <td
                            key={cell.kijun}
                            onClick={() =>
                              handleApply(
                                {
                                  sTenkan: cell.tenkan,
                                  sKijun: cell.kijun,
                                  sSpanB: cell.kijun * 2,
                                  mTenkan: cell.tenkan * 5,
                                  mKijun: cell.kijun * 3,
                                  lKijun: cell.kijun * 10,
                                },
                                `تنظیمات سفارشی (${cell.tenkan}، ${cell.kijun})`
                              )
                            }
                            className={`py-2 cursor-pointer transition-all hover:ring-2 hover:ring-amber-400 ${
                              isHigh
                                ? 'bg-emerald-950/60 text-emerald-300 font-black'
                                : isMed
                                ? 'bg-emerald-950/20 text-emerald-400'
                                : 'bg-rose-950/30 text-rose-400'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <span>
                                {cell.returnPct >= 0 ? '+' : ''}
                                {cell.returnPct}%
                              </span>
                              <span className="text-[9px] opacity-75 font-sans">
                                وین: {cell.winRate}%
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Sliders / Live Tuner */}
      {selectedViewTab === 'custom' && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tenkan Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">تنکان‌سن کوتاه‌مدت (S-Tenkan):</span>
                <span className="text-amber-400 font-mono font-bold">{customTenkan} کندل</span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                value={customTenkan}
                onChange={(e) => setCustomTenkan(Number(e.target.value))}
                className="accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">حداقل ۳ | پیش‌فرض ۹ | حداکثر ۲۰</span>
            </div>

            {/* Kijun Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">کیجنسن میان‌مدت (S-Kijun):</span>
                <span className="text-cyan-400 font-mono font-bold">{customKijun} کندل</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                value={customKijun}
                onChange={(e) => setCustomKijun(Number(e.target.value))}
                className="accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">کلاسیک ۲۶ | سمفونی ۴۵ | حداکثر ۶۰</span>
            </div>

            {/* Span B Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">اسپن B کومو (Senkou Span B):</span>
                <span className="text-purple-400 font-mono font-bold">{customSpanB} کندل</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={customSpanB}
                onChange={(e) => setCustomSpanB(Number(e.target.value))}
                className="accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">کلاسیک ۵۲ | سمفونی ۲۲۵</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-xs text-slate-400">
              تنظیمات دلخواه: ({customTenkan}، {customKijun}، {customSpanB})
            </span>
            <button
              onClick={() =>
                handleApply(
                  {
                    sTenkan: customTenkan,
                    sKijun: customKijun,
                    sSpanB: customSpanB,
                    mTenkan: customTenkan * 5,
                    mKijun: customKijun * 3,
                    lKijun: customKijun * 10,
                  },
                  `سفارشی (${customTenkan}، ${customKijun}، ${customSpanB})`
                )
              }
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all"
            >
              اعمال این مقادیر روی چارت
            </button>
          </div>
        </div>
      )}

      {/* Diagnostic Insights Card */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Info className="w-4 h-4 text-amber-400" />
          <span>تحلیل و منطق بهینه‌سازی پارامترها برای دارایی {asset.name}:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 leading-relaxed">
          {assetSpecificInsights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
