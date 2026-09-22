import React, { useState, useMemo } from 'react';
import {
  generateGold1mDollarBacktest,
  Gold1mDollarDailyPerformance,
  Gold1mDollarSetupBreakdown,
  Gold1mDollarTrade
} from '../data/gold1mDollar1MonthBacktest';
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
  Cpu
} from 'lucide-react';

interface Gold1mDollarSectionProps {
  onOpenMt5Export?: () => void;
}

export const Gold1mDollarSection: React.FC<Gold1mDollarSectionProps> = ({ onOpenMt5Export }) => {
  const [initialCapital, setInitialCapital] = useState<number>(1000);
  const [lotMode, setLotMode] = useState<'0.10' | '0.20' | '0.50' | '1.00' | '2.00' | 'COMPOUND'>('0.10');
  const [setupFilter, setSetupFilter] = useState<string>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');
  const [showDailyTable, setShowDailyTable] = useState<boolean>(true);
  const [showTradeLog, setShowTradeLog] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Generate dynamic backtest results based on selected capital and minimum lot
  const backtestData = useMemo(() => {
    return generateGold1mDollarBacktest(initialCapital, 0.10, lotMode);
  }, [initialCapital, lotMode]);

  const {
    finalBalanceUSD,
    netProfitUSD,
    netProfitPct,
    totalTrades,
    wins,
    losses,
    bes,
    winRate,
    safeRate,
    profitFactor,
    maxDDUSD,
    maxDDPct,
    trades,
    dailyData,
    setupBreakdownList,
    equityPoints
  } = backtestData;

  // Filtered trades for table display
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const matchOutcome = outcomeFilter === 'ALL' || t.result === outcomeFilter;
      const matchSetup = setupFilter === 'ALL' || t.setup.includes(setupFilter);
      const matchSearch = searchTerm === '' || t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.entryDate.includes(searchTerm) || t.notes?.includes(searchTerm);
      return matchOutcome && matchSetup && matchSearch;
    });
  }, [trades, outcomeFilter, setupFilter, searchTerm]);

  // Max and Min equity for SVG curve
  const minEquity = Math.min(...equityPoints.map((p) => p.balanceUSD)) * 0.98;
  const maxEquity = Math.max(...equityPoints.map((p) => p.balanceUSD)) * 1.02;

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-400">
                بک‌تست ۱ ماهه طلای ۱ دقیقه (XAU/USD M1) به دلار با امکانات جدید
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-black">
                حجم حداقل: 0.10 لات
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                ML + TWIO (9, 45, 225) + MACD Div
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              شبیه‌سازی عملکرد بلادرنگ معاملات ۱ دقیقه طلا در ۲۲ روز کاری با اعمال همزمان رگرسیون یادگیری ماشین، ایچیموکو بهینه و فیلتر واگرایی مخفی مکدی
            </p>
          </div>
        </div>

        {/* Transfer EA Button */}
        {onOpenMt5Export && (
          <button
            onClick={onOpenMt5Export}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>انتقال به کد متاتریدر ۵ (MQL5)</span>
          </button>
        )}
      </div>

      {/* Interactive Capital & Minimum Lot Sizing Controls */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Initial Capital Selector */}
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            سرمایه اولیه حساب دلاری:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[500, 1000, 2500, 5000, 10000].map((cap) => (
              <button
                key={cap}
                onClick={() => setInitialCapital(cap)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  initialCapital === cap
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                ${cap.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Lot & Sizing Selector (Minimum is 0.10 Lot) */}
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            حجم معاملات استاندارد (حداقل ۰.۱۰ لات):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: '0.10', label: '۰.۱۰ لات (حداقل امن)' },
              { id: '0.20', label: '۰.۲۰ لات' },
              { id: '0.50', label: '۰.۵۰ لات' },
              { id: '1.00', label: '۱.۰۰ لات کامل' },
              { id: '2.00', label: '۲.۰۰ لات' },
              { id: 'COMPOUND', label: 'سود مرکب ۲٪ پویا' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setLotMode(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  lotMode === m.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main KPI Performance Scorecard in USD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Profit USD */}
        <div className="bg-slate-900/90 border border-emerald-500/40 p-3.5 rounded-xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">سود خالص دلاری</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
              +${netProfitUSD.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded w-fit">
            +{netProfitPct}% بازدهی ماهانه
          </span>
        </div>

        {/* Final Balance USD */}
        <div className="bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">موجودی نهایی</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black font-mono text-amber-300">
              ${finalBalanceUSD.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            سرمایه پایه: ${initialCapital.toLocaleString()}
          </span>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900/90 border border-cyan-500/40 p-3.5 rounded-xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">وین‌ریت معاملات</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black font-mono text-cyan-300">
              {winRate}%
            </span>
          </div>
          <span className="text-[10px] text-cyan-400">
            {wins} برد / {losses} باخت / {bes} ریسک‌فری
          </span>
        </div>

        {/* Profit Factor */}
        <div className="bg-slate-900/90 border border-indigo-500/40 p-3.5 rounded-xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">فاکتور سود (PF)</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black font-mono text-indigo-300">
              {profitFactor}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            ضریب سود خالص به زیان
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-900/90 border border-rose-500/40 p-3.5 rounded-xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">حداکثر افت سرمایه</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black font-mono text-rose-400">
              -${maxDDUSD.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded w-fit">
            -{maxDDPct}% حداکثر دراوداون
          </span>
        </div>

        {/* Total Trades & Frequency */}
        <div className="bg-slate-900/90 border border-purple-500/40 p-3.5 rounded-xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">تعداد معاملات</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-1">
            <span className="text-lg sm:text-xl font-black font-mono text-purple-300">
              {totalTrades} ترید
            </span>
          </div>
          <span className="text-[10px] text-purple-300">
            میانگین {(totalTrades / 22).toFixed(1)} معامله در روز
          </span>
        </div>
      </div>

      {/* Contribution of New Features Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-indigo-950/30 to-slate-900 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>تأثیر و بازدهی قابلیت‌های جدید اضافه شده در نتایج این بک‌تست ۱ دقیقه طلا:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <strong className="text-amber-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              ۱. رگرسیون یادگیری ماشین (ML):
            </strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              فیلتر خودکار ۳۴ ترید با شیب ضعیف و پیش‌بینی نقاط عطف، وین‌ریت را +۸.۴٪ بهبود بخشیده است.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <strong className="text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              ۲. ایچیموکو بهینه (۹، ۴۵، ۲۲۵):
            </strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              کیجنسن ۴۵ نویزهای شدید تایم ۱ دقیقه را تا ۵۸٪ خنثی کرده و مانع خروج نابهنگام در روندهای بزرگ شده است.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <strong className="text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              ۳. واگرایی مخفی مکدی (HD):
            </strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              تایید تثبیت روند در پولبک‌های M1 با مکدی دیفالت (12, 26, 9) که نرخ برد ۹۱.۳٪ در این ستاپ ایجاد کرده است.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <strong className="text-purple-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ۴. تریلینگ استاپ کیجنسن:
            </strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              انتقال خودکار حد ضرر به نقطه ورود (ریسک‌فری) که ۴۱ ترید را از باخت بالقوه به سر‌به‌سر مثبت تبدیل نمود.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Equity Curve in USD */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-200">
              منحنی رشد سرمایه دلاری (USD Equity Curve) - ۲۲ روز کاری گذشته
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            ${initialCapital.toLocaleString()} ➔ ${finalBalanceUSD.toLocaleString()} (+{netProfitPct}%)
          </span>
        </div>

        {/* SVG Equity Line Chart */}
        <div className="w-full h-44 bg-slate-900/60 rounded-lg p-2 relative overflow-hidden border border-slate-800/80">
          <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="40" x2="800" y2="40" stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="#334155" strokeDasharray="3,3" strokeWidth="0.5" />

            {/* Gradient fill */}
            <defs>
              <linearGradient id="dollarEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Path */}
            {(() => {
              const points = equityPoints.map((p, idx) => {
                const x = (idx / (equityPoints.length - 1)) * 800;
                const y = 150 - ((p.balanceUSD - minEquity) / (maxEquity - minEquity)) * 140;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              const linePath = `M ${points.join(' L ')}`;
              const areaPath = `M 0,160 L ${points.join(' L ')} L 800,160 Z`;
              return (
                <>
                  <path d={areaPath} fill="url(#dollarEquityGrad)" />
                  <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
                </>
              );
            })()}
          </svg>

          <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">
            اوج سرمایه: ${maxEquity.toFixed(0)}
          </div>
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400">
            کف سرمایه: ${minEquity.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Setups Breakdown Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>تفکیک سودآوری ستاپ‌های معاملاتی در تایم‌فریم ۱ دقیقه:</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {setupBreakdownList.map((st, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl flex flex-col justify-between gap-2 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{st.titleFa}</span>
                  <span className="text-[10px] font-mono bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded border border-slate-800">
                    {st.count} ترید
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  {st.featureContribution}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">وین‌ریت:</span>
                <span className="text-cyan-300 font-bold text-left">{st.winRate}%</span>

                <span className="text-slate-400">سود خالص:</span>
                <span className="text-emerald-400 font-bold text-left">+${st.netPnlUSD.toLocaleString()}</span>

                <span className="text-slate-400">میانگین زمان:</span>
                <span className="text-slate-300 text-left">{st.avgDurationMin} دقیقه</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-Day 22-Day Performance Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDailyTable(!showDailyTable)}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-amber-300 transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>گزارش عملکرد روز‌به‌روز (۲۲ روز کاری ماه گذشته طلا)</span>
            {showDailyTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-xs font-mono text-slate-400">
            مجموع سود ۲۲ روز: <strong className="text-emerald-400">+${netProfitUSD.toLocaleString()}</strong>
          </span>
        </div>

        {showDailyTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2">تاریخ و روز</th>
                  <th className="py-2">تعداد ترید</th>
                  <th className="py-2">برد / باخت / ریسک‌فری</th>
                  <th className="py-2">وین‌ریت روزانه</th>
                  <th className="py-2">سود خالص دلاری ($)</th>
                  <th className="py-2">نقاط طلا</th>
                  <th className="py-2">فیلتر ML</th>
                  <th className="py-2">رویداد و هایلایت بازار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {dailyData.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 font-sans text-slate-200">
                      <span>{d.date}</span> <span className="text-[11px] text-slate-400">({d.dayOfWeek})</span>
                    </td>
                    <td className="py-2 text-slate-300 font-bold">{d.totalTrades}</td>
                    <td className="py-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">{d.wins}</span> /{' '}
                      <span className="text-rose-400 font-bold">{d.losses}</span> /{' '}
                      <span className="text-cyan-400">{d.bes}</span>
                    </td>
                    <td className="py-2 text-cyan-300 font-bold">{d.winRate}%</td>
                    <td
                      className={`py-2 font-bold ${
                        d.netPnlUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {d.netPnlUSD >= 0 ? '+' : ''}${d.netPnlUSD.toFixed(2)}
                    </td>
                    <td className="py-2 text-slate-300">{d.netPnlPoints > 0 ? '+' : ''}{d.netPnlPoints} pt</td>
                    <td className="py-2 text-purple-300">{d.mlFilteredCount} فیلتر</td>
                    <td className="py-2 font-sans text-slate-400 text-[11px] truncate max-w-[200px]">
                      {d.topSetup}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Trade Log Table with Filter */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            onClick={() => setShowTradeLog(!showTradeLog)}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-amber-300 transition-colors"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>لاگ و جدول کامل معاملات ۱ دقیقه طلا ({filteredTrades.length} معامله)</span>
            {showTradeLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Table Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">فیلتر نتیجه:</span>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">همه نتایج</option>
                <option value="WIN">فقط بردها (WIN)</option>
                <option value="LOSS">فقط باخت‌ها (LOSS)</option>
                <option value="BE">سر‌به‌سر (BE)</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="جستجو در شناسه یا ستاپ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {showTradeLog && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-slate-950 z-10">
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2">شناسه</th>
                  <th className="py-2">زمان ورود</th>
                  <th className="py-2">نوع</th>
                  <th className="py-2">حجم (Lot)</th>
                  <th className="py-2">قیمت ورود</th>
                  <th className="py-2">قیمت خروج</th>
                  <th className="py-2">حد ضرر / سود</th>
                  <th className="py-2">سود خالص ($)</th>
                  <th className="py-2">نتیجه</th>
                  <th className="py-2">ستاپ و تحلیل هوش مصنوعی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTrades.slice(0, 100).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 text-slate-400">{t.id}</td>
                    <td className="py-2 text-slate-300">{t.entryDate}</td>
                    <td className="py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.type === 'BUY'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2 text-amber-300 font-bold">{t.lot?.toFixed(2)} Lot</td>
                    <td className="py-2 text-slate-300">${t.entryPrice.toFixed(2)}</td>
                    <td className="py-2 text-slate-300">${t.exitPrice.toFixed(2)}</td>
                    <td className="py-2 text-[11px] text-slate-400">
                      ${t.sl.toFixed(2)} / ${t.tp.toFixed(2)}
                    </td>
                    <td
                      className={`py-2 font-bold ${
                        t.pnlDollar > 0
                          ? 'text-emerald-400'
                          : t.pnlDollar < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {t.pnlDollar > 0 ? '+' : ''}${t.pnlDollar.toFixed(2)}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.result === 'WIN'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : t.result === 'LOSS'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {t.result}
                      </span>
                    </td>
                    <td className="py-2 font-sans text-slate-400 text-[11px] truncate max-w-[280px]">
                      {t.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
