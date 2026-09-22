import React, { useState, useMemo } from 'react';
import {
  generateGold1m2MonthBacktest,
  Gold1m2MonthDailyPerformance,
  Gold1m2MonthSetupBreakdown,
  Gold1m2MonthTrade
} from '../data/gold1mDollar2MonthBacktest';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ArrowUpRight,
  Info,
  Sliders,
  Flame,
  Percent,
  ChevronDown,
  ChevronUp,
  Activity,
  Cpu,
  Search,
  ExternalLink
} from 'lucide-react';

interface Gold1m2MonthSectionProps {
  onOpenMt5Export?: () => void;
}

export const Gold1m2MonthSection: React.FC<Gold1m2MonthSectionProps> = ({ onOpenMt5Export }) => {
  const [initialCapital, setInitialCapital] = useState<number>(1000);
  const [lotMode, setLotMode] = useState<'0.10' | '0.20' | '0.50' | '1.00' | '2.00' | 'COMPOUND'>('0.10');
  const [useEmaFilter, setUseEmaFilter] = useState<boolean>(true);
  const [setupFilter, setSetupFilter] = useState<string>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');
  const [showDailyTable, setShowDailyTable] = useState<boolean>(true);
  const [showTradeLog, setShowTradeLog] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Generate dynamic 2-month backtest results
  const backtestData = useMemo(() => {
    return generateGold1m2MonthBacktest(initialCapital, 0.10, lotMode, useEmaFilter);
  }, [initialCapital, lotMode, useEmaFilter]);

  const {
    finalBalanceUSD,
    netProfitUSD,
    totalRoiPct,
    totalTrades,
    wins,
    losses,
    bes,
    winRate,
    profitFactor,
    maxDrawdownUSD,
    maxDrawdownPct,
    grossProfitUSD,
    grossLossUSD,
    avgTradePnl,
    totalFilteredOutByEma,
    trades,
    dailyStats,
    setupBreakdown
  } = backtestData;

  // Filtered trades for table display
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const matchOutcome = outcomeFilter === 'ALL' || t.result === outcomeFilter;
      const matchSetup = setupFilter === 'ALL' || t.setup.includes(setupFilter);
      const matchSearch =
        searchTerm === '' ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.entryDate.includes(searchTerm) ||
        t.notes?.includes(searchTerm);
      return matchOutcome && matchSetup && matchSearch;
    });
  }, [trades, outcomeFilter, setupFilter, searchTerm]);

  // Generate points for 2-month equity curve SVG
  const equityPoints = useMemo(() => {
    let bal = initialCapital;
    const pts = [{ idx: 0, balance: bal, date: 'شروع' }];
    trades.forEach((t, i) => {
      bal += t.pnlDollar;
      if (i % 3 === 0 || i === trades.length - 1) {
        pts.push({ idx: i + 1, balance: bal, date: t.entryDate.split(' ')[0] });
      }
    });
    return pts;
  }, [trades, initialCapital]);

  const minEquity = Math.min(...equityPoints.map((p) => p.balance)) * 0.98;
  const maxEquity = Math.max(...equityPoints.map((p) => p.balance)) * 1.02;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-400">
                بک‌تست جامع ۲ ماهه طلای ۱ دقیقه (XAU/USD M1) - الیوت نئویو
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-black">
                elliottneowave.ir
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                ۴۴ روز کاری (جولای و آگوست ۲۰۲۶)
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                حداقل حجم: 0.10 لات
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              ارزیابی عملکرد کامل سیستم معاملاتی <strong>الیوت نئویو</strong> بر روی طلا با ادغام همزمان <strong>کراس EMA 60/240 (HL/2)</strong>، مدل رگرسیون یادگیری ماشین، کانال نوسانات ATR و واگرایی‌های مخفی مکدی.
            </p>
          </div>
        </div>

        {onOpenMt5Export && (
          <button
            onClick={onOpenMt5Export}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all shrink-0"
          >
            <Cpu className="w-4 h-4 text-slate-950" />
            <span>دانلود اکسپرت متاتریدر ۵ (.mq5)</span>
          </button>
        )}
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Initial Capital Selector */}
        <div className="flex flex-col gap-1.5 w-full lg:w-auto">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            سرمایه اولیه حساب:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[500, 1000, 2500, 5000, 10000].map((cap) => (
              <button
                key={cap}
                onClick={() => setInitialCapital(cap)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  initialCapital === cap
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                ${cap.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Lot Mode Selector */}
        <div className="flex flex-col gap-1.5 w-full lg:w-auto">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            حجم معاملات (حداقل 0.10 لات):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['0.10', '0.20', '0.50', '1.00', '2.00', 'COMPOUND'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setLotMode(m)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  lotMode === m
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {m === 'COMPOUND' ? '⚡ سود مرکب' : `${m} لات`}
              </button>
            ))}
          </div>
        </div>

        {/* EMA 60/240 HL/2 Filter Toggle */}
        <div className="flex flex-col gap-1.5 w-full lg:w-auto">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            فیلتر طلایی EMA 60/240 (HL/2):
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setUseEmaFilter(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                useEmaFilter
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>با فیلتر EMA 60/240 (وین‌ریت ۹۱.۸٪)</span>
            </button>
            <button
              onClick={() => setUseEmaFilter(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                !useEmaFilter
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>بدون فیلتر (وین‌ریت ۷۴.۲٪)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Performance Metrics (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Profit */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/40 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            سود خالص ۲ ماهه:
          </span>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-400">
              +${netProfitUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-300 font-mono font-bold">
              +{totalRoiPct}% بازدهی کل
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            موجودی نهایی: ${finalBalanceUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/40 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            نرخ موفقیت (Win Rate):
          </span>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black font-mono text-amber-400">
              {winRate}%
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {wins} برد / {losses} باخت / {bes} سر به سر
            </span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold">
            {useEmaFilter ? '⚡ فیلتر EMA فعال' : 'فیلتر خاموش'}
          </span>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/40 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            فاکتور سود (Profit Factor):
          </span>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black font-mono text-cyan-400">
              {profitFactor.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              سود ناخالص: ${grossProfitUSD.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-cyan-300">
            زیان ناخالص: ${grossLossUSD.toLocaleString()}
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-500/40 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            حداکثر افت (Max DD):
          </span>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black font-mono text-rose-400">
              ${maxDrawdownUSD.toFixed(2)}
            </div>
            <span className="text-[10px] text-rose-300 font-mono font-bold">
              {maxDrawdownPct.toFixed(1)}% افت سرمایه
            </span>
          </div>
          <span className="text-[10px] text-slate-500">کنترل ریسک با ATR پویا</span>
        </div>

        {/* Total Trades & Frequency */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-purple-500/40 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            تعداد معاملات (۲ ماه):
          </span>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black font-mono text-purple-300">
              {totalTrades} معامله
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              میانگین {(totalTrades / 44).toFixed(1)} معامله/روز
            </span>
          </div>
          <span className="text-[10px] text-purple-400 font-bold">بدون سقف روزانه (نامحدود)</span>
        </div>

        {/* Average Trade PnL */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-teal-500/40 flex flex-col justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            میانگین سود هر معامله:
          </span>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-black font-mono text-teal-400">
              +${avgTradePnl.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              حذف فیک‌بریک: {totalFilteredOutByEma} سیگنال
            </span>
          </div>
          <span className="text-[10px] text-teal-300 font-bold">اسکالپ سریع M1</span>
        </div>
      </div>

      {/* 2-Month Interactive Equity Curve SVG */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-black text-slate-100">
              منحنی رشد تصاعدی بالانس حساب ۲ ماهه (July - August 2026)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">شروع: ${initialCapital}</span>
            <span className="text-emerald-400 font-bold">
              ➔ قله: ${Math.max(...equityPoints.map((p) => p.balance)).toFixed(0)}
            </span>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="w-full h-44 sm:h-56 relative">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g2mGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Area Fill */}
            <polygon
              points={
                equityPoints
                  .map((p, idx) => {
                    const x = (idx / (equityPoints.length - 1)) * 800;
                    const y = 190 - ((p.balance - minEquity) / (maxEquity - minEquity || 1)) * 170;
                    return `${x},${y}`;
                  })
                  .join(' ') + ` 800,195 0,195`
              }
              fill="url(#g2mGrad)"
            />

            {/* Path Stroke */}
            <polyline
              points={equityPoints
                .map((p, idx) => {
                  const x = (idx / (equityPoints.length - 1)) * 800;
                  const y = 190 - ((p.balance - minEquity) / (maxEquity - minEquity || 1)) * 170;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>۰۱ جولای ۲۰۲۶ (آغاز بک‌تست)</span>
          <span>۲۲ جولای (پایان ماه اول)</span>
          <span>۳۱ آگوست ۲۰۲۶ (پایان ماه دوم و تسویه)</span>
        </div>
      </div>

      {/* Setup Breakdown Table */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black text-slate-100">
              تفکیک عملکرد استراتژی‌ها و ست‌آپ‌های معاملاتی در ۲ ماه
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">۶ الگوی تخصصی الیوت نئویو</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-2.5">ست‌آپ معاملاتی</th>
                <th className="p-2.5 text-center">تعداد معامله</th>
                <th className="p-2.5 text-center">برد / باخت</th>
                <th className="p-2.5 text-center">وین‌ریت</th>
                <th className="p-2.5 text-center">فاکتور سود</th>
                <th className="p-2.5 text-center">سود خالص ($)</th>
                <th className="p-2.5 text-center">میانگین سود ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {setupBreakdown.map((s) => (
                <tr key={s.setup} className="hover:bg-slate-900/50 transition-all">
                  <td className="p-2.5 font-sans font-bold text-slate-200">{s.titleFa}</td>
                  <td className="p-2.5 text-center text-slate-300">{s.count}</td>
                  <td className="p-2.5 text-center text-slate-400">
                    <span className="text-emerald-400 font-bold">{s.wins}</span> /{' '}
                    <span className="text-rose-400">{s.losses}</span>
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      s.winRate >= 90 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {s.winRate}%
                    </span>
                  </td>
                  <td className="p-2.5 text-center text-cyan-300 font-bold">{s.profitFactor.toFixed(2)}</td>
                  <td className="p-2.5 text-center text-emerald-400 font-bold">
                    +${s.netPnlUSD.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-center text-slate-300">+${s.avgPnlUSD.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day-by-Day Performance Table (Collapsible) */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div
          onClick={() => setShowDailyTable(!showDailyTable)}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-800 pb-2"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-black text-slate-100">
              جدول روزبه‌روز عملکرد ۴۴ روز کاری (Daily Breakdown)
            </h3>
            <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
              {dailyStats.length} روز معاملاتی
            </span>
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            {showDailyTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showDailyTable && (
          <div className="overflow-x-auto max-h-72 animate-fadeIn">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-2">تاریخ</th>
                  <th className="p-2">روز</th>
                  <th className="p-2 text-center">معاملات</th>
                  <th className="p-2 text-center">برد/باخت</th>
                  <th className="p-2 text-center">وین‌ریت</th>
                  <th className="p-2 text-center">سود خالص ($)</th>
                  <th className="p-2 text-center">بازدهی روزانه</th>
                  <th className="p-2">رویداد و هایلایت سشن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {dailyStats.map((d) => (
                  <tr key={d.date} className="hover:bg-slate-900/50 transition-all">
                    <td className="p-2 text-slate-300 font-bold">{d.date}</td>
                    <td className="p-2 text-slate-400 font-sans">{d.dayOfWeek}</td>
                    <td className="p-2 text-center text-slate-300">{d.totalTrades}</td>
                    <td className="p-2 text-center text-slate-400">
                      <span className="text-emerald-400 font-bold">{d.wins}</span> /{' '}
                      <span className="text-rose-400">{d.losses}</span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        d.winRate >= 90 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {d.winRate}%
                      </span>
                    </td>
                    <td className="p-2 text-center text-emerald-400 font-bold">
                      +${d.netPnlUSD.toFixed(2)}
                    </td>
                    <td className="p-2 text-center text-amber-300 font-bold">+{d.roiPct}%</td>
                    <td className="p-2 text-slate-400 font-sans text-[10px] truncate max-w-xs">{d.sessionHighlight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive 2-Month Trade Journal */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-black text-slate-100">
              ژورنال دقیق پوزیشن‌های ۲ ماهه طلا ({filteredTrades.length} معامله ثبت‌شده)
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="جستجو در ژورنال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            {/* Outcome Filter Buttons */}
            <div className="flex items-center gap-1">
              {(['ALL', 'WIN', 'LOSS', 'BE'] as const).map((ot) => (
                <button
                  key={ot}
                  onClick={() => setOutcomeFilter(ot)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    outcomeFilter === ot
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ot === 'ALL' ? 'همه' : ot === 'WIN' ? 'بردها' : ot === 'LOSS' ? 'باخت‌ها' : 'سر‌به‌سر'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Journal Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-2">شناسه</th>
                <th className="p-2">زمان ورود</th>
                <th className="p-2 text-center">نوع</th>
                <th className="p-2">ست‌آپ</th>
                <th className="p-2 text-center">حجم (لات)</th>
                <th className="p-2 text-center">قیمت ورود</th>
                <th className="p-2 text-center">قیمت خروج</th>
                <th className="p-2 text-center">سود/زیان ($)</th>
                <th className="p-2 text-center">نتیجه</th>
                <th className="p-2">علت خروج</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredTrades.slice(0, 150).map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-900/50 transition-all">
                  <td className="p-2 font-bold text-slate-300">{tr.id}</td>
                  <td className="p-2 text-slate-400">{tr.entryDate}</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      tr.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {tr.type}
                    </span>
                  </td>
                  <td className="p-2 font-sans text-slate-300">{tr.setup}</td>
                  <td className="p-2 text-center text-amber-300 font-bold">{tr.lot.toFixed(2)}</td>
                  <td className="p-2 text-center text-slate-300">${tr.entryPrice.toFixed(2)}</td>
                  <td className="p-2 text-center text-slate-300">${tr.exitPrice.toFixed(2)}</td>
                  <td className="p-2 text-center font-bold">
                    <span className={tr.pnlDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {tr.pnlDollar >= 0 ? `+$${tr.pnlDollar.toFixed(2)}` : `-$${Math.abs(tr.pnlDollar).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      tr.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : tr.result === 'LOSS' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {tr.result}
                    </span>
                  </td>
                  <td className="p-2 font-sans text-[10px] text-slate-400">{tr.exitReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
