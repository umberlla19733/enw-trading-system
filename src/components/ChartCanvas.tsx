import React, { useState, useRef, useMemo } from 'react';
import { MarketAsset, CalculatedDataPoint } from '../types';
import { LayerState } from './LayerControls';
import { Sparkles, Eye, ShieldAlert, Target, Zap } from 'lucide-react';

interface ChartCanvasProps {
  asset: MarketAsset;
  data: CalculatedDataPoint[];
  visibleLayers: LayerState;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  asset,
  data,
  visibleLayers,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Layout parameters
  const chartWidth = 1000;
  const chartHeight = 520;
  const padding = { top: 35, right: 75, bottom: 65, left: 25 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const volumeHeight = 70;
  const pricePlotHeight = plotHeight - volumeHeight - 15;

  // Compute min/max price
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    data.forEach((d) => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
      if (d.volume > maxVol) maxVol = d.volume;

      // also check indicator lines for proper framing
      [d.sTenkan, d.sKijun, d.mKijun, d.lKijun, d.sFld, d.mFld, d.lFld].forEach((val) => {
        if (val !== null) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });

    // Add 6% margin
    const margin = (max - min) * 0.06;
    return {
      minPrice: min - margin,
      maxPrice: max + margin,
      maxVolume: maxVol * 1.15,
    };
  }, [data]);

  // Coordinate mappers
  const n = data.length;
  const candleStep = plotWidth / Math.max(1, n);

  const getX = (index: number) => padding.left + index * candleStep + candleStep / 2;
  const getY = (price: number) =>
    padding.top + (1 - (price - minPrice) / (maxPrice - minPrice)) * pricePlotHeight;
  const getVolY = (vol: number) =>
    padding.top + plotHeight - (vol / maxVolume) * volumeHeight;

  // Path generators for indicator lines
  const generatePath = (accessor: (d: CalculatedDataPoint) => number | null) => {
    let path = '';
    let started = false;

    data.forEach((d, i) => {
      const val = accessor(d);
      if (val !== null) {
        const x = getX(i);
        const y = getY(val);
        if (!started) {
          path += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
          started = true;
        } else {
          path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      } else {
        started = false;
      }
    });

    return path;
  };

  // Kumo Cloud Area Generator
  const generateCloudPath = (
    spanAAcc: (d: CalculatedDataPoint) => number | null,
    spanBAcc: (d: CalculatedDataPoint) => number | null
  ) => {
    const validPoints: { x: number; yA: number; yB: number }[] = [];

    data.forEach((d, i) => {
      const a = spanAAcc(d);
      const b = spanBAcc(d);
      if (a !== null && b !== null) {
        validPoints.push({
          x: getX(i),
          yA: getY(a),
          yB: getY(b),
        });
      }
    });

    if (validPoints.length < 2) return '';

    let forward = `M ${validPoints[0].x.toFixed(1)} ${validPoints[0].yA.toFixed(1)}`;
    for (let i = 1; i < validPoints.length; i++) {
      forward += ` L ${validPoints[i].x.toFixed(1)} ${validPoints[i].yA.toFixed(1)}`;
    }

    let backward = '';
    for (let i = validPoints.length - 1; i >= 0; i--) {
      backward += ` L ${validPoints[i].x.toFixed(1)} ${validPoints[i].yB.toFixed(1)}`;
    }

    return forward + backward + ' Z';
  };

  const hoveredCandle = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];

  // Calculations for ESZ box
  const eszStartX = getX(asset.eszRange[0]);
  const eszEndX = getX(asset.eszRange[1]);
  const eszTopY = getY(asset.upperBoundary);
  const eszBottomY = getY(asset.lowerBoundary);

  const breakoutPoint = data[asset.breakoutIndex] || data[asset.eszRange[1] + 2];
  const breakoutX = getX(asset.breakoutIndex);
  const breakoutY = getY(breakoutPoint.high);

  return (
    <div className="relative w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md overflow-hidden" ref={containerRef}>
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3 text-xs md:text-sm">
        <div className="flex items-center gap-3">
          <span className="font-bold text-base text-amber-400 font-mono tracking-wide">{asset.symbol}</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">{asset.timeframe}</span>
          <span className="text-slate-400 hidden sm:inline">{asset.name}</span>
        </div>

        {/* Dynamic Candle Stats */}
        {hoveredCandle && (
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">تاریخ: <strong className="text-slate-200">{hoveredCandle.time}</strong></span>
            <span>O: <strong className="text-slate-300">${hoveredCandle.open.toLocaleString()}</strong></span>
            <span>H: <strong className="text-emerald-400">${hoveredCandle.high.toLocaleString()}</strong></span>
            <span>L: <strong className="text-rose-400">${hoveredCandle.low.toLocaleString()}</strong></span>
            <span>C: <strong className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>${hoveredCandle.close.toLocaleString()}</strong></span>
            <span className="text-slate-400">Vol: <strong className="text-amber-300">{hoveredCandle.volume.toLocaleString()}</strong></span>
          </div>
        )}
      </div>

      {/* Main SVG Chart Container */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[750px] font-sans"
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * chartWidth;
            const index = Math.floor((svgX - padding.left) / candleStep);
            if (index >= 0 && index < n) {
              setHoveredIndex(index);
            }
          }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="eszGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.04" />
            </linearGradient>

            <linearGradient id="sCloudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id="mCloudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="posProfitGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.28" />
            </linearGradient>

            <linearGradient id="posLossGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.28" />
            </linearGradient>

            <linearGradient id="taitouGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.06" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.06" />
            </linearGradient>

            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 3" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="url(#gridPattern)"
          />

          {/* Price grid lines & labels */}
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((ratio) => {
            const price = minPrice + (maxPrice - minPrice) * ratio;
            const y = getY(price);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth - padding.right + 8}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${Math.round(price).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* 1. ESZ Zone Box (منطقه آرامش قبل از طوفان) */}
          {visibleLayers.eszZone && (
            <g id="esz-zone-layer">
              <rect
                x={eszStartX}
                y={eszTopY}
                width={eszEndX - eszStartX}
                height={Math.max(20, eszBottomY - eszTopY)}
                fill="url(#eszGradient)"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                rx="6"
              />
              {/* ESZ Badge Label */}
              <rect
                x={eszStartX + 8}
                y={eszTopY - 24}
                width={195}
                height={20}
                fill="#1e293b"
                stroke="#f59e0b"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={eszStartX + 14}
                y={eszTopY - 10}
                fill="#fcd34d"
                fontSize="10"
                fontWeight="bold"
              >
                منطقه آرامش قبل از طوفان (ESZ)
              </text>
            </g>
          )}

          {/* 2. Explosion Boundaries (مرزهای انفجار بالا و پایین) */}
          {visibleLayers.boundaries && (
            <g id="boundaries-layer">
              {/* Upper Boundary Line */}
              <line
                x1={eszStartX}
                y1={eszTopY}
                x2={chartWidth - padding.right}
                y2={eszTopY}
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeDasharray="6 3"
              />
              <rect
                x={chartWidth - padding.right - 145}
                y={eszTopY - 18}
                width={140}
                height={16}
                fill="#450a0a"
                stroke="#ef4444"
                strokeWidth="0.8"
                rx="3"
              />
              <text
                x={chartWidth - padding.right - 138}
                y={eszTopY - 6}
                fill="#fca5a5"
                fontSize="9.5"
                fontWeight="bold"
              >
                مرز بالایی انفجار: ${asset.upperBoundary.toLocaleString()}
              </text>

              {/* Lower Boundary Line */}
              <line
                x1={eszStartX}
                y1={eszBottomY}
                x2={chartWidth - padding.right}
                y2={eszBottomY}
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeDasharray="6 3"
              />
              <rect
                x={chartWidth - padding.right - 145}
                y={eszBottomY + 4}
                width={140}
                height={16}
                fill="#450a0a"
                stroke="#ef4444"
                strokeWidth="0.8"
                rx="3"
              />
              <text
                x={chartWidth - padding.right - 138}
                y={eszBottomY + 16}
                fill="#fca5a5"
                fontSize="9.5"
                fontWeight="bold"
              >
                مرز پایینی انفجار: ${asset.lowerBoundary.toLocaleString()}
              </text>
            </g>
          )}

          {/* 3. Stop Loss & Target Lines */}
          {visibleLayers.targets && (
            <g id="targets-layer">
              {/* Stop Loss Line */}
              <line
                x1={breakoutX}
                y1={getY(asset.stopLossPrice)}
                x2={chartWidth - padding.right}
                y2={getY(asset.stopLossPrice)}
                stroke="#e11d48"
                strokeWidth="1.5"
              />
              <rect
                x={breakoutX + 10}
                y={getY(asset.stopLossPrice) + 4}
                width={125}
                height={16}
                fill="#881337"
                stroke="#e11d48"
                strokeWidth="0.8"
                rx="3"
              />
              <text
                x={breakoutX + 16}
                y={getY(asset.stopLossPrice) + 16}
                fill="#ffe4e6"
                fontSize="9"
                fontWeight="bold"
              >
                حد ضرر (SL): ${asset.stopLossPrice.toLocaleString()}
              </text>

              {/* TP 1 Line (FLD Target) */}
              <line
                x1={breakoutX}
                y1={getY(asset.targetPrice1)}
                x2={chartWidth - padding.right}
                y2={getY(asset.targetPrice1)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <rect
                x={breakoutX + 10}
                y={getY(asset.targetPrice1) - 18}
                width={135}
                height={16}
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="0.8"
                rx="3"
              />
              <text
                x={breakoutX + 16}
                y={getY(asset.targetPrice1) - 6}
                fill="#a7f3d0"
                fontSize="9"
                fontWeight="bold"
              >
                تارگت ۱ (FLD): ${asset.targetPrice1.toLocaleString()}
              </text>

              {/* TP 2 Line (HPFP Target) */}
              <line
                x1={breakoutX}
                y1={getY(asset.targetPrice2)}
                x2={chartWidth - padding.right}
                y2={getY(asset.targetPrice2)}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <rect
                x={breakoutX + 10}
                y={getY(asset.targetPrice2) - 18}
                width={145}
                height={16}
                fill="#0c4a6e"
                stroke="#38bdf8"
                strokeWidth="0.8"
                rx="3"
              />
              <text
                x={breakoutX + 16}
                y={getY(asset.targetPrice2) - 6}
                fill="#bae6fd"
                fontSize="9"
                fontWeight="bold"
              >
                تارگت ۲ (HPFP): ${asset.targetPrice2.toLocaleString()}
              </text>
            </g>
          )}

          {/* 3.1 TradingView-style Long Position Tool */}
          {(visibleLayers.positionTool ?? true) && (
            <g id="position-tool-layer">
              {(() => {
                const entryPrice = asset.positionConfig?.entryPrice || asset.upperBoundary;
                const slPrice = asset.positionConfig?.stopLossPrice || asset.stopLossPrice;
                const tp1Price = asset.positionConfig?.targetPrice1 || asset.targetPrice1;
                const posStartX = breakoutX;
                const posEndX = Math.min(chartWidth - padding.right, breakoutX + 260);
                const posWidth = posEndX - posStartX;

                const entryY = getY(entryPrice);
                const slY = getY(slPrice);
                const tp1Y = getY(tp1Price);

                const riskPercent = ((Math.abs(entryPrice - slPrice) / entryPrice) * 100).toFixed(2);
                const rewardPercent = ((Math.abs(tp1Price - entryPrice) / entryPrice) * 100).toFixed(2);
                const rr = (Math.abs(tp1Price - entryPrice) / Math.abs(entryPrice - slPrice)).toFixed(2);

                return (
                  <g>
                    {/* Profit Box (Green) */}
                    <rect
                      x={posStartX}
                      y={tp1Y}
                      width={posWidth}
                      height={Math.max(4, entryY - tp1Y)}
                      fill="url(#posProfitGrad)"
                      stroke="#10b981"
                      strokeWidth="1.2"
                    />

                    {/* Loss Box (Red) */}
                    <rect
                      x={posStartX}
                      y={entryY}
                      width={posWidth}
                      height={Math.max(4, slY - entryY)}
                      fill="url(#posLossGrad)"
                      stroke="#ef4444"
                      strokeWidth="1.2"
                    />

                    {/* Entry Line */}
                    <line
                      x1={posStartX}
                      y1={entryY}
                      x2={posEndX}
                      y2={entryY}
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />

                    {/* Entry Badge */}
                    <rect
                      x={posStartX + 8}
                      y={entryY - 10}
                      width={120}
                      height={18}
                      fill="#0369a1"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      rx="3"
                    />
                    <text
                      x={posStartX + 14}
                      y={entryY + 3}
                      fill="#f0f9ff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ورود دقیق: ${entryPrice.toLocaleString()}
                    </text>

                    {/* Profit Callout Badge */}
                    <rect
                      x={posEndX - 130}
                      y={tp1Y + 6}
                      width={124}
                      height={20}
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="0.8"
                      rx="4"
                    />
                    <text
                      x={posEndX - 68}
                      y={tp1Y + 19}
                      textAnchor="middle"
                      fill="#6ee7b7"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      سود: +{rewardPercent}% (R:R {rr})
                    </text>

                    {/* Loss Callout Badge */}
                    <rect
                      x={posEndX - 120}
                      y={slY - 24}
                      width={114}
                      height={18}
                      fill="#7f1d1d"
                      stroke="#ef4444"
                      strokeWidth="0.8"
                      rx="4"
                    />
                    <text
                      x={posEndX - 63}
                      y={slY - 12}
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ریسک حد ضرر: -{riskPercent}%
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* 3.2 Hosoda Wave Structures & Pivots */}
          {(visibleLayers.hosodaWaves ?? true) && (
            <g id="hosoda-waves-layer">
              {/* P-Wave Converging Compression Trendlines in ESZ */}
              {(() => {
                const startX = getX(asset.eszRange[0]);
                const endX = getX(asset.eszRange[1]);
                const upperStartY = getY(asset.upperBoundary);
                const upperEndY = getY(asset.upperBoundary - (asset.upperBoundary - asset.lowerBoundary) * 0.25);
                const lowerStartY = getY(asset.lowerBoundary);
                const lowerEndY = getY(asset.lowerBoundary + (asset.upperBoundary - asset.lowerBoundary) * 0.25);

                return (
                  <g>
                    {/* Converging Trendlines */}
                    <line
                      x1={startX}
                      y1={upperStartY}
                      x2={endX}
                      y2={upperEndY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <line
                      x1={startX}
                      y1={lowerStartY}
                      x2={endX}
                      y2={lowerEndY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    {/* P-Wave Label Badge */}
                    <rect
                      x={(startX + endX) / 2 - 55}
                      y={upperStartY + 8}
                      width={110}
                      height={18}
                      fill="#451a03"
                      stroke="#f59e0b"
                      strokeWidth="0.8"
                      rx="4"
                    />
                    <text
                      x={(startX + endX) / 2}
                      y={upperStartY + 20}
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      فشردگی مثلث موج P هاسودا
                    </text>
                  </g>
                );
              })()}

              {/* Hosoda Value Target Lines */}
              {asset.hosodaTargets && (
                <g id="hosoda-targets">
                  {/* V Target */}
                  <line
                    x1={breakoutX}
                    y1={getY(asset.hosodaTargets.vTarget)}
                    x2={chartWidth - padding.right}
                    y2={getY(asset.hosodaTargets.vTarget)}
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={chartWidth - padding.right - 120}
                    y={getY(asset.hosodaTargets.vTarget) - 4}
                    fill="#fde047"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    هدف V هاسودا: ${asset.hosodaTargets.vTarget.toLocaleString()}
                  </text>

                  {/* N Target */}
                  <line
                    x1={breakoutX}
                    y1={getY(asset.hosodaTargets.nTarget)}
                    x2={chartWidth - padding.right}
                    y2={getY(asset.hosodaTargets.nTarget)}
                    stroke="#06b6d4"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={chartWidth - padding.right - 120}
                    y={getY(asset.hosodaTargets.nTarget) - 4}
                    fill="#67e8f9"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    هدف N هاسودا: ${asset.hosodaTargets.nTarget.toLocaleString()}
                  </text>

                  {/* E Target */}
                  <line
                    x1={breakoutX}
                    y1={getY(asset.hosodaTargets.eTarget)}
                    x2={chartWidth - padding.right}
                    y2={getY(asset.hosodaTargets.eTarget)}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={chartWidth - padding.right - 120}
                    y={getY(asset.hosodaTargets.eTarget) - 4}
                    fill="#6ee7b7"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    هدف E هاسودا: ${asset.hosodaTargets.eTarget.toLocaleString()}
                  </text>
                </g>
              )}

              {/* Wave Pivots and Zig-Zag Polyline */}
              {asset.wavePivots && asset.wavePivots.length > 1 && (
                <g id="wave-pivots">
                  {/* Connecting Wave Line */}
                  <polyline
                    points={asset.wavePivots
                      .map((p) => `${getX(p.index)},${getY(p.price)}`)
                      .join(' ')}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />

                  {/* Pivot Points and Badges */}
                  {asset.wavePivots.map((p, idx) => {
                    const px = getX(p.index);
                    const py = getY(p.price);
                    const isHigh = p.type === 'high';
                    const badgeY = isHigh ? py - 18 : py + 8;

                    return (
                      <g key={idx}>
                        {/* Glow Circle */}
                        <circle
                          cx={px}
                          cy={py}
                          r="5"
                          fill="#f59e0b"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        {/* Badge */}
                        <rect
                          x={px - 14}
                          y={badgeY}
                          width={28}
                          height={16}
                          fill="#1e1b4b"
                          stroke="#fbbf24"
                          strokeWidth="0.8"
                          rx="4"
                        />
                        <text
                          x={px}
                          y={badgeY + 11}
                          textAnchor="middle"
                          fill="#fef08a"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {p.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </g>
          )}

          {/* 4. Clouds (Kumo) */}
          {visibleLayers.mCloud && (
            <path
              d={generateCloudPath((d) => d.mSenkouA, (d) => d.mSenkouB)}
              fill="url(#mCloudGradient)"
              opacity="0.75"
            />
          )}

          {visibleLayers.sCloud && (
            <path
              d={generateCloudPath((d) => d.sSenkouA, (d) => d.sSenkouB)}
              fill="url(#sCloudGradient)"
              opacity="0.85"
            />
          )}

          {/* 5. FLD Lines (Projected Future Wave Lines) */}
          {visibleLayers.lFld && (
            <path
              d={generatePath((d) => d.lFld)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="5 4"
              opacity="0.85"
            />
          )}
          {visibleLayers.mFld && (
            <path
              d={generatePath((d) => d.mFld)}
              fill="none"
              stroke="#eab308"
              strokeWidth="2.2"
              strokeDasharray="4 3"
              opacity="0.9"
            />
          )}
          {visibleLayers.sFld && (
            <path
              d={generatePath((d) => d.sFld)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="3 2"
              opacity="0.9"
            />
          )}

          {/* 6. Ichimoku Lines */}
          {/* L-Ichi Kijun */}
          {visibleLayers.lIchi && (
            <path
              d={generatePath((d) => d.lKijun)}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.4"
            />
          )}

          {/* M-Ichi Kijun & Tenkan */}
          {visibleLayers.mIchi && (
            <>
              <path
                d={generatePath((d) => d.mKijun)}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.2"
              />
              <path
                d={generatePath((d) => d.mTenkan)}
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.4"
                strokeDasharray="4 2"
              />
            </>
          )}

          {/* S-Ichi Kijun & Tenkan */}
          {visibleLayers.sIchi && (
            <>
              <path
                d={generatePath((d) => d.sKijun)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <path
                d={generatePath((d) => d.sTenkan)}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
            </>
          )}

          {/* 7. Volume Bars */}
          <g id="volume-layer">
            <line
              x1={padding.left}
              y1={padding.top + plotHeight - volumeHeight}
              x2={chartWidth - padding.right}
              y2={padding.top + plotHeight - volumeHeight}
              stroke="#334155"
              strokeWidth="0.8"
            />
            <text
              x={padding.left + 5}
              y={padding.top + plotHeight - volumeHeight + 14}
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              حجم معاملات (Volume)
            </text>

            {data.map((d, i) => {
              const x = getX(i);
              const barY = getVolY(d.volume);
              const barHeight = padding.top + plotHeight - barY;
              const isUp = d.close >= d.open;
              const isBreakout = i === asset.breakoutIndex;

              return (
                <rect
                  key={i}
                  x={x - candleStep * 0.4}
                  y={barY}
                  width={Math.max(1.8, candleStep * 0.8)}
                  height={Math.max(1, barHeight)}
                  fill={
                    isBreakout
                      ? '#f59e0b'
                      : isUp
                      ? '#10b981'
                      : '#f43f5e'
                  }
                  opacity={isBreakout ? 1 : 0.65}
                />
              );
            })}
          </g>

          {/* 8. Candlesticks */}
          <g id="candlestick-layer">
            {data.map((d, i) => {
              const x = getX(i);
              const isUp = d.close >= d.open;
              const candleColor = isUp ? '#10b981' : '#ef4444';
              const highY = getY(d.high);
              const lowY = getY(d.low);
              const openY = getY(d.open);
              const closeY = getY(d.close);
              const bodyY = Math.min(openY, closeY);
              const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));
              const isBreakout = i === asset.breakoutIndex;

              return (
                <g key={i}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isBreakout ? '#fbbf24' : candleColor}
                    strokeWidth={isBreakout ? 2.5 : 1.2}
                  />
                  {/* Body */}
                  <rect
                    x={x - candleStep * 0.35}
                    y={bodyY}
                    width={Math.max(2, candleStep * 0.7)}
                    height={bodyHeight}
                    fill={isBreakout ? '#f59e0b' : candleColor}
                    stroke={isBreakout ? '#fef08a' : candleColor}
                    strokeWidth={isBreakout ? 1.5 : 0.8}
                    rx="1"
                  />

                  {/* Highlight Breakout Candle */}
                  {isBreakout && (
                    <g>
                      {/* Pulse Circle */}
                      <circle
                        cx={x}
                        cy={highY - 18}
                        r="12"
                        fill="#f59e0b"
                        fillOpacity="0.2"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                      {/* Arrow / Marker */}
                      <polygon
                        points={`${x},${highY - 5} ${x - 5},${highY - 14} ${x + 5},${highY - 14}`}
                        fill="#f59e0b"
                      />
                      {/* Callout box */}
                      <rect
                        x={x - 85}
                        y={highY - 45}
                        width={170}
                        height={24}
                        fill="#78350f"
                        stroke="#f59e0b"
                        strokeWidth="1.2"
                        rx="5"
                      />
                      <text
                        x={x}
                        y={highY - 29}
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        ⚡️ شکست معتبر + جهش حجم (ورود)
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 9. Cycle Markers & Taitou Suchi Time Windows */}
          {(visibleLayers.cycleMarks || (visibleLayers.timeWindows ?? true)) && (
            <g id="cycles-layer">
              {/* Taitou Suchi Window (Equal Time Reversal Window) */}
              {asset.hosodaCycles?.taitouWindow && (visibleLayers.timeWindows ?? true) && (() => {
                const tw = asset.hosodaCycles.taitouWindow;
                const sx = getX(tw.startIdx);
                const ex = getX(Math.min(data.length - 1, tw.endIdx));
                const width = Math.max(16, ex - sx);

                return (
                  <g id="taitou-window">
                    <rect
                      x={sx}
                      y={padding.top}
                      width={width}
                      height={pricePlotHeight}
                      fill="url(#taitouGrad)"
                      stroke="#06b6d4"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                    {/* Badge */}
                    <rect
                      x={sx + width / 2 - 80}
                      y={padding.top + 4}
                      width={160}
                      height={20}
                      fill="#083344"
                      stroke="#06b6d4"
                      strokeWidth="0.8"
                      rx="4"
                    />
                    <text
                      x={sx + width / 2}
                      y={padding.top + 18}
                      textAnchor="middle"
                      fill="#67e8f9"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ⚡️ {tw.label}
                    </text>
                  </g>
                );
              })()}

              {/* Next Turning Point Marker */}
              {asset.hosodaCycles?.nextTurningIndex && asset.hosodaCycles.nextTurningIndex < data.length && (
                <g id="next-turn-marker">
                  {(() => {
                    const nx = getX(asset.hosodaCycles.nextTurningIndex);
                    return (
                      <g>
                        <line
                          x1={nx}
                          y1={padding.top}
                          x2={nx}
                          y2={padding.top + pricePlotHeight}
                          stroke="#a855f7"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <rect
                          x={nx - 55}
                          y={padding.top + 28}
                          width={110}
                          height={18}
                          fill="#3b0764"
                          stroke="#a855f7"
                          strokeWidth="0.8"
                          rx="4"
                        />
                        <text
                          x={nx}
                          y={padding.top + 40}
                          textAnchor="middle"
                          fill="#f3e8ff"
                          fontSize="8.5"
                          fontWeight="bold"
                        >
                          نقطه چرخش زمانی هاسودا
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* Kihon Suchi Cycle Lines */}
              {(asset.hosodaCycles?.kihonNumbers || [
                { value: 9, label: '۹', name: 'اینکان' },
                { value: 17, label: '۱۷', name: 'دو اینکان' },
                { value: 26, label: '۲۶', name: 'ایچی‌کی' },
                { value: 33, label: '۳۳', name: 'کیهون ۳۳' },
                { value: 42, label: '۴۲', name: 'انقباض ESZ' },
                { value: 52, label: '۵۲', name: 'دو ایچی‌کی' },
                { value: 65, label: '۶۵', name: 'میانی' },
                { value: 76, label: '۷۶', name: 'سان‌کی' }
              ]).map((cycleItem) => {
                const base = asset.hosodaCycles?.baseIndex || asset.eszRange[0];
                const targetIdx = base + cycleItem.value;
                if (targetIdx >= data.length) return null;
                const cx = getX(targetIdx);

                return (
                  <g key={cycleItem.value}>
                    <line
                      x1={cx}
                      y1={padding.top}
                      x2={cx}
                      y2={padding.top + pricePlotHeight}
                      stroke="#818cf8"
                      strokeWidth="0.8"
                      strokeDasharray="2 4"
                    />
                    <circle cx={cx} cy={padding.top + 10} r="7.5" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
                    <text
                      x={cx}
                      y={padding.top + 13}
                      textAnchor="middle"
                      fill="#e0e7ff"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {cycleItem.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Crosshair on Hover */}
          {hoveredIndex !== null && (
            <g id="crosshair-layer" pointerEvents="none">
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + plotHeight}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1={padding.left}
                y1={getY(data[hoveredIndex].close)}
                x2={chartWidth - padding.right}
                y2={getY(data[hoveredIndex].close)}
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Color Codes */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-medium">راهنمای خطوط چارت:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300">تنکان‌سن کوتاه (۹)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">کیجنسن کوتاه (۲۶)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-slate-300">کیجنسن میان‌مدت (۱۳۰)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">کیجنسن کلان (۶۵۰)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400"></span>
            <span className="text-slate-300">خط S-FLD</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-yellow-400"></span>
            <span className="text-slate-300">خط M-FLD</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-amber-400 font-mono text-[11px] bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>همنوایی TWIO و چرخه‌های FLD هرست</span>
        </div>
      </div>
    </div>
  );
};
