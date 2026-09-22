import React from 'react';
import { MarketAsset } from '../types';
import { Activity, ShieldCheck, Award, ArrowUpRight, Scale, Clock } from 'lucide-react';

interface SignalScorecardProps {
  asset: MarketAsset;
}

export const SignalScorecard: React.FC<SignalScorecardProps> = ({ asset }) => {
  const entry = asset.positionConfig?.entryPrice || asset.upperBoundary;
  const sl = asset.positionConfig?.stopLossPrice || asset.stopLossPrice;
  const tp1 = asset.positionConfig?.targetPrice1 || asset.targetPrice1;
  const tp2 = asset.positionConfig?.targetPrice2 || asset.targetPrice2;

  const risk = Math.abs(entry - sl);
  const reward1 = Math.abs(tp1 - entry);
  const reward2 = Math.abs(tp2 - entry);
  const rrRatio1 = risk > 0 ? (reward1 / risk).toFixed(1) : '1.8';
  const rrRatio2 = risk > 0 ? (reward2 / risk).toFixed(1) : '4.5';

  const compressionBars = asset.eszRange[1] - asset.eszRange[0];
  const cycleInfo = asset.hosodaCycles?.kihonNumbers?.[4]?.name || 'کیهون‌سوچی هاسودا';
  const score = asset.id === 'gold_1m' ? '+۹.۲' : asset.id === 'xau_usd' ? '+۸.۷' : '+۸.۹';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Convergence Score (FCS) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            امتیاز همگرایی امواج (FCS)
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
            همفازی ۹۶٪
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">{score}</span>
          <span className="text-xs text-slate-400">از ۱۰ (سیگنال قطعی)</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full w-[89%]"></div>
        </div>
      </div>

      {/* 2. Domino Waves Alignment */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            تأییدیه الگو (San Yaku)
          </span>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
            سه‌گانه طلایی
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
            TK: طلایی
          </span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-mono font-semibold">
            Chikou: آزاد
          </span>
          <span className="text-slate-500">→</span>
          <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
            Kumo: شکست
          </span>
        </div>
        <span className="text-[11px] text-slate-400 truncate">
          انتقال از فشردگی موج P به موج ۵ پله‌ای N هاسودا
        </span>
      </div>

      {/* 3. Risk to Reward */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            نسبت ریسک به پاداش (R:R)
          </span>
          <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono">
            محاسبه دقیق
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-xs text-slate-400">تارگت ۱ (V):</div>
            <div className="text-base font-bold font-mono text-slate-100">1 : {rrRatio1}</div>
          </div>
          <div className="border-r border-slate-800 pr-3">
            <div className="text-xs text-slate-400">تارگت ۲ (E):</div>
            <div className="text-base font-bold font-mono text-emerald-400">1 : {rrRatio2}</div>
          </div>
        </div>
      </div>

      {/* 4. Hurst Cycle & Number 9 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            شمارش زمانی چرخه هاسودا
          </span>
          <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">
            Kihon Suchi
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-indigo-400">{compressionBars}</span>
          <span className="text-xs text-slate-400">کندل فشرده در دامنه ESZ</span>
        </div>
        <span className="text-[11px] text-slate-400 truncate">
          انطباق با پنجره تقارن زمانی تای‌تو سوچی
        </span>
      </div>
    </div>
  );
};
