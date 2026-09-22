import React, { useState, useMemo } from 'react';
import { MarketAsset } from '../types';
import {
  runMLRegressionPrediction,
  MLModelType,
  MLRegressionResult,
  MLRiskRewardSetup,
} from '../utils/mlRegressionEngine';
import { MLRiskRewardCalculator } from './MLRiskRewardCalculator';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Sliders,
  Cpu,
  Brain,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Activity,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface MLForecastWidgetProps {
  asset: MarketAsset;
}

export const MLForecastWidget: React.FC<MLForecastWidgetProps> = ({ asset }) => {
  const [modelType, setModelType] = useState<MLModelType>('ENSEMBLE');
  const [lookback, setLookback] = useState<number>(26);
  const [showConfidenceCone, setShowConfidenceCone] = useState<boolean>(true);
  const [confidenceLevel, setConfidenceLevel] = useState<'68' | '95'>('68');
  const [showRRLevelsOnChart, setShowRRLevelsOnChart] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeRRSetup, setActiveRRSetup] = useState<MLRiskRewardSetup | null>(null);

  // Compute ML Regression Analysis
  const mlResult: MLRegressionResult = useMemo(() => {
    return runMLRegressionPrediction(asset, {
      modelType,
      lookback,
      horizon: 10,
    });
  }, [asset, modelType, lookback]);

  const currentRR = activeRRSetup || mlResult.riskRewardSetup;

  const {
    currentPrice,
    baseATR,
    rSquared,
    rmse,
    slope,
    curvature,
    directionBias,
    directionalConfidence,
    predictedTurningStep,
    turningPointType,
    targetPriceAtHorizon,
    maxPredictedHigh,
    minPredictedLow,
    historicalPoints,
    forecastPoints,
    equationString,
    insights,
    knnMatchScore
  } = mlResult;

  // Chart dimensions and SVG scaling
  const chartWidth = 720;
  const chartHeight = 310;
  const padding = { top: 25, right: 80, bottom: 35, left: 55 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Combine all points for min/max price scaling
  const allPrices: number[] = [
    ...historicalPoints.map((p) => p.close),
    ...historicalPoints.map((p) => p.fittedPrice),
    ...forecastPoints.map((p) => p.predictedPrice),
    ...forecastPoints.map((p) => (confidenceLevel === '95' ? p.upper95 : p.upper68)),
    ...forecastPoints.map((p) => (confidenceLevel === '95' ? p.lower95 : p.lower68)),
    ...(showRRLevelsOnChart && currentRR ? [currentRR.stopLossPrice, currentRR.entryPrice, currentRR.tp1Price, currentRR.tp2Price, currentRR.tp3Price] : []),
    currentPrice
  ];

  const minPrice = Math.min(...allPrices) * 0.999;
  const maxPrice = Math.max(...allPrices) * 1.001;
  const priceRange = maxPrice - minPrice || 1;

  const totalSteps = historicalPoints.length + forecastPoints.length;

  const getX = (index: number) => {
    return padding.left + (index / (totalSteps - 1)) * innerWidth;
  };

  const getY = (price: number) => {
    return padding.top + innerHeight - ((price - minPrice) / priceRange) * innerHeight;
  };

  // SVG Paths for Historical and Forecast
  const histStartIndex = 0;
  const curPriceIndex = historicalPoints.length - 1;

  // Historical close line path
  const historicalClosePath = historicalPoints.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.close);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Historical fitted regression curve
  const historicalFitPath = historicalPoints.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.fittedPrice);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Forecast path starting from current price
  const forecastPath = forecastPoints.reduce((acc, pt, i) => {
    const x = getX(curPriceIndex + 1 + i);
    const y = getY(pt.predictedPrice);
    return `${acc} L ${x} ${y}`;
  }, `M ${getX(curPriceIndex)} ${getY(currentPrice)}`);

  // Confidence Cone Polygon Path
  const upperConePoints = forecastPoints.map((pt, i) => ({
    x: getX(curPriceIndex + 1 + i),
    y: getY(confidenceLevel === '95' ? pt.upper95 : pt.upper68),
  }));

  const lowerConePoints = [...forecastPoints].reverse().map((pt, i) => {
    const origIdx = forecastPoints.length - 1 - i;
    return {
      x: getX(curPriceIndex + 1 + origIdx),
      y: getY(confidenceLevel === '95' ? pt.lower95 : pt.lower68),
    };
  });

  const conePolygonPath = [
    `M ${getX(curPriceIndex)} ${getY(currentPrice)}`,
    ...upperConePoints.map((p) => `L ${p.x} ${p.y}`),
    ...lowerConePoints.map((p) => `L ${p.x} ${p.y}`),
    'Z'
  ].join(' ');

  const isBullish = directionBias.includes('BULLISH');
  const isBearish = directionBias.includes('BEARISH');
  const biasColor = isBullish ? 'emerald' : isBearish ? 'rose' : 'amber';

  const hoveredPoint = hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < forecastPoints.length
    ? forecastPoints[hoveredIndex]
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Banner */}
      <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-slate-100">
                موتور یادگیری ماشین و رگرسیون پیش‌بین ۱۰ کندل
              </h4>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/40">
                Machine Learning ML v3.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ترکیب رگرسیون چندجمله‌ای پارابولیک، گرادیان خطی کمترین مربعات و تطبیق فرکتالی الگوهای تاریخی (k-NN)
            </p>
          </div>
        </div>

        {/* Model Equation Pill */}
        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-right font-mono text-[11px] flex flex-col">
          <span className="text-[9px] text-indigo-400 font-sans">معادله کالیبره‌شده گرادیان قیمت:</span>
          <span className="text-slate-200 font-bold">{equationString}</span>
        </div>
      </div>

      {/* Control Bar: Model, Lookback, Confidence Cone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Model Selector */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>الگوریتم رگرسیون و مدل</span>
          </label>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as MLModelType)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ENSEMBLE">🌟 مدل ترکیبی اِنسامبل (Ensemble Consensus)</option>
            <option value="POLYNOMIAL_DEG2">📈 چندجمله‌ای درجه ۲ (Momentum Parabola)</option>
            <option value="POLYNOMIAL_DEG3">🌊 چندجمله‌ای درجه ۳ (Inflection Wave)</option>
            <option value="LINEAR_OLS">📐 رگرسیون خطی (Linear OLS Drift)</option>
            <option value="KNN_PATTERN">🧩 تطبیق فرکتالی الگو (KNN Pattern Match)</option>
          </select>
        </div>

        {/* Lookback Window */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>پنجره آموزش و تطبیق (Lookback)</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setLookback(14)}
              className={`py-1 text-[11px] font-bold rounded ${
                lookback === 14
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ۱۴ کندل
            </button>
            <button
              onClick={() => setLookback(26)}
              className={`py-1 text-[11px] font-bold rounded ${
                lookback === 26
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ۲۶ (کیجن)
            </button>
            <button
              onClick={() => setLookback(52)}
              className={`py-1 text-[11px] font-bold rounded ${
                lookback === 52
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ۵۲ (کومو)
            </button>
          </div>
        </div>

        {/* Confidence Cone Range */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
          <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>مخروط اطمینان و نوسان (Confidence Cone)</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfidenceCone(!showConfidenceCone)}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                showConfidenceCone
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {showConfidenceCone ? 'فعال' : 'خاموش'}
            </button>
            <div className="grid grid-cols-2 gap-1 flex-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                disabled={!showConfidenceCone}
                onClick={() => setConfidenceLevel('68')}
                className={`py-1 text-[11px] font-bold rounded ${
                  confidenceLevel === '68' && showConfidenceCone
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ۶۸٪ (۱ سیگما)
              </button>
              <button
                disabled={!showConfidenceCone}
                onClick={() => setConfidenceLevel('95')}
                className={`py-1 text-[11px] font-bold rounded ${
                  confidenceLevel === '95' && showConfidenceCone
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ۹۵٪ (۲ سیگما)
              </button>
            </div>
          </div>
        </div>

        {/* Prediction Target Highlight Card */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-indigo-500/40 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-indigo-300 block font-bold">پیش‌بینی تارگت کندل ۱۰ام</span>
            <div className="flex items-baseline gap-1 font-mono mt-0.5">
              <span className="text-xl font-black text-indigo-300">
                ${targetPriceAtHorizon.toLocaleString()}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                targetPriceAtHorizon >= currentPrice ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {targetPriceAtHorizon >= currentPrice ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {targetPriceAtHorizon >= currentPrice ? '+' : ''}
              {(targetPriceAtHorizon - currentPrice).toFixed(2)} (
              {(((targetPriceAtHorizon - currentPrice) / currentPrice) * 100).toFixed(2)}%)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">احتمال تداوم</span>
            <span className="text-base font-black text-slate-100 font-mono">
              {directionalConfidence}٪
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-2xl">
        {/* Chart Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 rounded-full"></span>
              <span className="text-slate-400">تاریخچه واقعی ({lookback} کندل)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 border-b border-cyan-300"></span>
              <span className="text-cyan-300">منحنی رگرسیون تراز شده</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-400 border-dashed border-b border-indigo-400"></span>
              <span className="text-indigo-300 font-bold">مسیر پیش‌بینی ۱۰ کندل آینده</span>
            </div>
            {showConfidenceCone && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-indigo-500/20 border border-indigo-500/40 rounded-sm"></span>
                <span className="text-indigo-400 text-[11px]">مخروط احتمال {confidenceLevel}٪</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-400">قیمت لحظه‌ای:</span>
            <span className="text-amber-400 font-bold">${currentPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* SVG Canvas Area */}
        <div className="w-full relative overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none"
            style={{ minWidth: '600px' }}
          >
            <defs>
              {/* Grid pattern */}
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>

              {/* Confidence Cone Gradient */}
              <linearGradient id="coneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.08" />
              </linearGradient>

              {/* Forecast Glow */}
              <filter id="forecastGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Grid */}
            <rect
              x={padding.left}
              y={padding.top}
              width={innerWidth}
              height={innerHeight}
              fill="url(#gridPattern)"
              opacity="0.6"
            />

            {/* Boundary Dividers & Shading for Future Window */}
            <rect
              x={getX(curPriceIndex)}
              y={padding.top}
              width={innerWidth - (getX(curPriceIndex) - padding.left)}
              height={innerHeight}
              fill="#1e1b4b"
              fillOpacity="0.25"
            />

            {/* Vertical "Now / Current Candle" separator */}
            <line
              x1={getX(curPriceIndex)}
              y1={padding.top}
              x2={getX(curPriceIndex)}
              y2={padding.top + innerHeight}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={getX(curPriceIndex)}
              y={padding.top - 8}
              fill="#a5b4fc"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              کندل فعلی (NOW)
            </text>

            {/* Horizontal Price Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const p = minPrice + ratio * priceRange;
              const y = getY(p);
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="0.75"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={padding.left - 6}
                    y={y + 3.5}
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="end"
                    className="font-mono"
                  >
                    ${p.toFixed(p > 1000 ? 0 : 2)}
                  </text>
                </g>
              );
            })}

            {/* Confidence Cone Polygon */}
            {showConfidenceCone && (
              <path
                d={conePolygonPath}
                fill="url(#coneGradient)"
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.85"
              />
            )}

            {/* Historical Real Price Line */}
            <path
              d={historicalClosePath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Historical Regression Fitted Line */}
            <path
              d={historicalFitPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeOpacity="0.8"
              strokeDasharray="2 2"
            />

            {/* Future Forecast Trajectory Line */}
            <path
              d={forecastPath}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#forecastGlow)"
            />

            {/* Current Price Marker Node */}
            <circle
              cx={getX(curPriceIndex)}
              cy={getY(currentPrice)}
              r="4.5"
              fill="#fbbf24"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Predicted Horizon Points with Interactive Hover */}
            {forecastPoints.map((pt, i) => {
              const x = getX(curPriceIndex + 1 + i);
              const y = getY(pt.predictedPrice);
              const isApex = predictedTurningStep === pt.step;
              const isSelected = hoveredIndex === i;

              return (
                <g
                  key={pt.step}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Invisible larger hit target */}
                  <circle cx={x} cy={y} r="12" fill="transparent" />

                  {/* Vertical guide line on hover */}
                  {isSelected && (
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="#818cf8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Point Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : isApex ? 5 : 3.5}
                    fill={isApex ? '#f43f5e' : isSelected ? '#a855f7' : '#818cf8'}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />

                  {/* Step Label on X Axis */}
                  <text
                    x={x}
                    y={padding.top + innerHeight + 14}
                    fill={isSelected ? '#c084fc' : '#64748b'}
                    fontSize="9"
                    textAnchor="middle"
                    className="font-mono font-bold"
                  >
                    +{pt.step}
                  </text>
                </g>
              );
            })}

            {/* Target 10th bar flag */}
            {forecastPoints.length > 0 && (
              <g>
                <line
                  x1={getX(totalSteps - 1)}
                  y1={getY(targetPriceAtHorizon)}
                  x2={padding.left + innerWidth + 5}
                  y2={getY(targetPriceAtHorizon)}
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={padding.left + innerWidth + 8}
                  y={getY(targetPriceAtHorizon) + 3.5}
                  fill="#818cf8"
                  fontSize="9.5"
                  fontWeight="bold"
                  className="font-mono"
                >
                  ${targetPriceAtHorizon.toLocaleString()}
                </text>
              </g>
            )}

            {/* Smart Risk-to-Reward (RR) Overlays on SVG Chart */}
            {showRRLevelsOnChart && currentRR && (
              <g className="transition-all duration-300">
                {/* 1. Stop Loss Line (Red) */}
                <line
                  x1={padding.left}
                  y1={getY(currentRR.stopLossPrice)}
                  x2={padding.left + innerWidth + 10}
                  y2={getY(currentRR.stopLossPrice)}
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  strokeOpacity="0.85"
                />
                <rect
                  x={padding.left + innerWidth + 4}
                  y={getY(currentRR.stopLossPrice) - 7}
                  width="65"
                  height="14"
                  rx="3"
                  fill="#881337"
                  stroke="#f43f5e"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left + innerWidth + 36}
                  y={getY(currentRR.stopLossPrice) + 3}
                  fill="#fecdd3"
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-mono"
                >
                  SL: ${currentRR.stopLossPrice.toFixed(1)}
                </text>

                {/* 2. Entry Price Line */}
                <line
                  x1={padding.left}
                  y1={getY(currentRR.entryPrice)}
                  x2={padding.left + innerWidth + 10}
                  y2={getY(currentRR.entryPrice)}
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeOpacity="0.9"
                />
                <rect
                  x={padding.left + innerWidth + 4}
                  y={getY(currentRR.entryPrice) - 7}
                  width="65"
                  height="14"
                  rx="3"
                  fill="#312e81"
                  stroke="#818cf8"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left + innerWidth + 36}
                  y={getY(currentRR.entryPrice) + 3}
                  fill="#e0e7ff"
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-mono"
                >
                  EN: ${currentRR.entryPrice.toFixed(1)}
                </text>

                {/* 3. TP1 Line (Light Green) */}
                <line
                  x1={padding.left}
                  y1={getY(currentRR.tp1Price)}
                  x2={padding.left + innerWidth + 10}
                  y2={getY(currentRR.tp1Price)}
                  stroke="#34d399"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeOpacity="0.8"
                />
                <rect
                  x={padding.left + innerWidth + 4}
                  y={getY(currentRR.tp1Price) - 7}
                  width="65"
                  height="14"
                  rx="3"
                  fill="#064e3b"
                  stroke="#34d399"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left + innerWidth + 36}
                  y={getY(currentRR.tp1Price) + 3}
                  fill="#a7f3d0"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-mono"
                >
                  TP1 ({currentRR.tp1RR})
                </text>

                {/* 4. TP2 Line (Vibrant Emerald) */}
                <line
                  x1={padding.left}
                  y1={getY(currentRR.tp2Price)}
                  x2={padding.left + innerWidth + 10}
                  y2={getY(currentRR.tp2Price)}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeOpacity="0.95"
                />
                <rect
                  x={padding.left + innerWidth + 4}
                  y={getY(currentRR.tp2Price) - 8}
                  width="65"
                  height="16"
                  rx="3"
                  fill="#059669"
                  stroke="#6ee7b7"
                  strokeWidth="1"
                />
                <text
                  x={padding.left + innerWidth + 36}
                  y={getY(currentRR.tp2Price) + 3.5}
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="black"
                  textAnchor="middle"
                  className="font-mono"
                >
                  TP2 (1:{currentRR.tp2RR})
                </text>

                {/* 5. TP3 Line (Purple) */}
                <line
                  x1={padding.left}
                  y1={getY(currentRR.tp3Price)}
                  x2={padding.left + innerWidth + 10}
                  y2={getY(currentRR.tp3Price)}
                  stroke="#c084fc"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                  strokeOpacity="0.8"
                />
                <rect
                  x={padding.left + innerWidth + 4}
                  y={getY(currentRR.tp3Price) - 7}
                  width="65"
                  height="14"
                  rx="3"
                  fill="#581c87"
                  stroke="#c084fc"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left + innerWidth + 36}
                  y={getY(currentRR.tp3Price) + 3}
                  fill="#f3e8ff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-mono"
                >
                  TP3 ({currentRR.tp3RR})
                </text>
              </g>
            )}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPoint && (
            <div
              className="absolute top-4 left-4 bg-slate-900/95 border border-indigo-500/50 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs flex flex-col gap-1 z-20 pointer-events-none"
              style={{ minWidth: '180px' }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-slate-200">
                <span className="text-indigo-400 font-mono">کندل {hoveredPoint.label}</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                  تخمین ML
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300 font-mono">
                <span>قیمت پیش‌بینی:</span>
                <span className="text-amber-400 font-bold">
                  ${hoveredPoint.predictedPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                <span>تغییر از فعلی:</span>
                <span
                  className={
                    hoveredPoint.deltaFromCurrent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  {hoveredPoint.deltaFromCurrent >= 0 ? '+' : ''}
                  {hoveredPoint.deltaFromCurrent.toFixed(2)} ({hoveredPoint.deltaPercent.toFixed(2)}
                  %)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] border-t border-slate-800/80 pt-1 mt-0.5">
                <span>محدوده {confidenceLevel}٪:</span>
                <span className="text-slate-300">
                  ${confidenceLevel === '95' ? hoveredPoint.lower95 : hoveredPoint.lower68} - $
                  {confidenceLevel === '95' ? hoveredPoint.upper95 : hoveredPoint.upper68}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metric Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Directional Bias Gauge */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">سوگیری جهت (Bias)</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isBullish ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : isBearish ? (
              <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span
              className={`text-xs font-bold ${
                isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {directionBias === 'STRONG_BULLISH'
                ? 'صعودی پرقدرت'
                : directionBias === 'MILD_BULLISH'
                ? 'صعودی ملایم'
                : directionBias === 'STRONG_BEARISH'
                ? 'نزولی پرقدرت'
                : directionBias === 'MILD_BEARISH'
                ? 'نزولی ملایم'
                : 'خنثی / رنج'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full ${
                isBullish ? 'bg-emerald-500' : isBearish ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${directionalConfidence}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
            ضریب اطمینان: {directionalConfidence}٪
          </span>
        </div>

        {/* R-Squared (Goodness of Fit) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">ضریب تعیین مدل (R²)</span>
          <div className="flex items-baseline gap-1 font-mono mt-0.5">
            <span className="text-lg font-black text-cyan-400">
              {(rSquared * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-cyan-500 h-full rounded-full"
              style={{ width: `${Math.min(100, rSquared * 100)}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">میزان برازش منحنی تاریخی</span>
        </div>

        {/* Slope / Drift Velocity */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">شیب گرادیان (Slope/Bar)</span>
          <div className="flex items-baseline gap-1 font-mono mt-0.5">
            <span
              className={`text-lg font-black ${
                slope >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {slope >= 0 ? '+' : ''}
              {slope.toFixed(3)}
            </span>
            <span className="text-[10px] text-slate-500">$/کندل</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">نرخ تغییرات بر هر گام زمانی</p>
        </div>

        {/* RMSE / Volatility Band */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-400">خطای رگرسیون (RMSE)</span>
          <div className="flex items-baseline gap-1 font-mono mt-0.5">
            <span className="text-lg font-black text-amber-400">±${rmse.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">انحراف استاندارد مانده‌ها (۱σ)</p>
        </div>

        {/* Turning Point / Apex Analysis */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400">نقطه عطف سهمی (Apex)</span>
          <div className="flex items-baseline gap-1 font-mono mt-0.5">
            {predictedTurningStep ? (
              <>
                <span className="text-lg font-black text-purple-400">
                  کندل +{predictedTurningStep}
                </span>
                <span className="text-[10px] text-purple-300 font-sans">
                  ({turningPointType === 'LOCAL_PEAK' ? 'سقف' : 'کف'})
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-sans mt-1">
                روند خطی پایدار بدون سقف زودهنگام
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">تخمین چرخش منحنی شتاب</p>
        </div>
      </div>

      {/* Machine Learning & ATR Risk-to-Reward Calculator Component */}
      <MLRiskRewardCalculator
        asset={asset}
        mlResult={mlResult}
        isShowingOnChart={showRRLevelsOnChart}
        onToggleShowOnChart={setShowRRLevelsOnChart}
        onUpdateRRSetup={setActiveRRSetup}
      />

      {/* 10-Step Prediction Detailed Data Table */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h5 className="text-xs font-bold text-slate-200">
              جدول برآورد گام‌به‌گام ۱۰ کندل آینده و باندهای تلورانس نوسان
            </h5>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">افق پیش‌بینی: ۱۰ کندل</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2 font-medium">گام زمانی</th>
                <th className="pb-2 font-medium">قیمت تخمینی (ML)</th>
                <th className="pb-2 font-medium">تغییر دلتا ($)</th>
                <th className="pb-2 font-medium">درصد تغییر (%)</th>
                <th className="pb-2 font-medium">باند تلورانس ۶۸٪ (۱σ)</th>
                <th className="pb-2 font-medium">باند ماکزیمم ۹۵٪ (۲σ)</th>
                <th className="pb-2 font-medium">سیگنال گام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 font-mono">
              {forecastPoints.map((pt) => {
                const isStepApex = predictedTurningStep === pt.step;
                return (
                  <tr
                    key={pt.step}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      isStepApex ? 'bg-purple-950/20' : ''
                    }`}
                  >
                    <td className="py-2 text-slate-300 font-bold flex items-center gap-1.5">
                      <span>{pt.label}</span>
                      {isStepApex && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded font-sans">
                          عطف
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-amber-300 font-bold">
                      ${pt.predictedPrice.toLocaleString()}
                    </td>
                    <td
                      className={`py-2 font-bold ${
                        pt.deltaFromCurrent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {pt.deltaFromCurrent >= 0 ? '+' : ''}
                      {pt.deltaFromCurrent.toFixed(2)}
                    </td>
                    <td
                      className={`py-2 font-bold ${
                        pt.deltaPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {pt.deltaPercent >= 0 ? '+' : ''}
                      {pt.deltaPercent.toFixed(2)}%
                    </td>
                    <td className="py-2 text-slate-400 text-[11px]">
                      ${pt.lower68.toLocaleString()} - ${pt.upper68.toLocaleString()}
                    </td>
                    <td className="py-2 text-slate-500 text-[11px]">
                      ${pt.lower95.toLocaleString()} - ${pt.upper95.toLocaleString()}
                    </td>
                    <td className="py-2 font-sans text-[11px]">
                      {pt.deltaPercent > 0.3 ? (
                        <span className="text-emerald-400 font-bold">صعودی</span>
                      ) : pt.deltaPercent < -0.3 ? (
                        <span className="text-rose-400 font-bold">نزولی</span>
                      ) : (
                        <span className="text-amber-400">تثبیت</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Machine Learning Insights & Synthesis */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>تفسیر هوشمند و همگرایی الگوهای امواج با رگرسیون آماری:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
