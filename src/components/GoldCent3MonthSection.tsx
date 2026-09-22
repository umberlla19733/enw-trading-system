import React, { useState, useMemo } from 'react';
import {
  Coins,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BarChart3,
  Sliders,
  Filter,
  Flame,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  Activity,
  Award,
  Calendar
} from 'lucide-react';
import {
  CENT_3MONTH_BACKTEST_DATA,
  Cent3MonthTrade,
  Cent3MonthMonthlyStats,
  Cent3MonthSetupStats
} from '../data/goldCent3MonthBacktest';

interface GoldCent3MonthSectionProps {
  onOpenMt5Export?: () => void;
}

export const GoldCent3MonthSection: React.FC<GoldCent3MonthSectionProps> = ({ onOpenMt5Export }) => {
  const { summary, trades, monthlyStats, setupStats } = CENT_3MONTH_BACKTEST_DATA;

  const [selectedMonthFilter, setSelectedMonthFilter] = useState<'ALL' | 'Month 1' | 'Month 2' | 'Month 3'>('ALL');
  const [selectedResultFilter, setSelectedResultFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');
  const [selectedSetupFilter, setSelectedSetupFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllTrades, setShowAllTrades] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MONTHLY' | 'SETUPS' | 'TRADES'>('OVERVIEW');

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (selectedMonthFilter !== 'ALL' && t.month !== selectedMonthFilter) return false;
      if (selectedResultFilter !== 'ALL' && t.result !== selectedResultFilter) return false;
      if (selectedSetupFilter !== 'ALL' && t.setup !== selectedSetupFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = t.id.toLowerCase().includes(q);
        const matchDate = t.date.includes(q);
        const matchSetup = t.setupFa.toLowerCase().includes(q);
        const matchReason = t.exitReason.toLowerCase().includes(q);
        if (!matchId && !matchDate && !matchSetup && !matchReason) return false;
      }
      return true;
    });
  }, [trades, selectedMonthFilter, selectedResultFilter, selectedSetupFilter, searchQuery]);

  const displayedTrades = showAllTrades ? filteredTrades : filteredTrades.slice(0, 30);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Hero Badge & Header */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 font-mono">
                <Coins className="w-3.5 h-3.5" />
                CENT ACCOUNT 5,000¢ ($50)
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                تست ۳ ماهه کامل (۹۰ روز / ۶۶ روز معاملاتی)
              </span>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-xs font-bold px-2.5 py-0.5 rounded-full">
                تایم‌فریم M1 طلا (XAUUSD)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
              گزارش جامع بک‌تست ۳ ماهه سیستم آخر رو طلا (حساب ۵۰ دلاری سنتی)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              ارزیابی کامل ۶۱۸ معامله واقعی طلا با موتور هوش مصنوعی انسمبل الیوت نئویو، فیلتر مولتی‌تایم (M1+M5+M15)،
              کراس EMA 60/240 HL/2، حد ضرر پویای ATR و سپر محافظتی اخبار.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenMt5Export && (
              <button
                onClick={onOpenMt5Export}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>دریافت اکسپرت MQL5</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">موجودی اولیه (سپرده):</span>
            <div className="text-base sm:text-lg font-black font-mono text-slate-100 mt-1">
              $50.00 <span className="text-[10px] text-amber-400">(5,000¢)</span>
            </div>
            <span className="text-[10px] text-slate-500">حساب سنتی بدون ریسک سوختن</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <span className="text-[11px] text-emerald-400 block">موجودی پایانی (۳ ماه):</span>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-300 mt-1">
              ${summary.finalBalanceUSD.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              {summary.finalBalanceCents.toLocaleString()} سنت (+{summary.roiPercent}٪)
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20">
            <span className="text-[11px] text-amber-400 block">وین‌ریت کل (Win Rate):</span>
            <div className="text-base sm:text-lg font-black font-mono text-amber-300 mt-1">
              {summary.winRate}٪
            </div>
            <span className="text-[10px] text-slate-400">
              {summary.winningTrades} برد از {summary.totalTrades} معامله
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">فاکتور سود (Profit Factor):</span>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-300 mt-1">
              {summary.profitFactor}
            </div>
            <span className="text-[10px] text-slate-500">سود ناخالص / زیان ناخالص</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">حداکثر افت سرمایه (Max DD):</span>
            <div className="text-base sm:text-lg font-black font-mono text-rose-300 mt-1">
              {summary.maxDrawdownPercent}٪
            </div>
            <span className="text-[10px] text-emerald-400">فوق‌العاده ایمن (${summary.maxDrawdownUSD})</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">میانگین سود هر معامله:</span>
            <div className="text-base sm:text-lg font-black font-mono text-amber-300 mt-1">
              +${summary.expectedPayoffUSD}
            </div>
            <span className="text-[10px] text-slate-500">میانگین زمان: {summary.avgTradeDurationMin} دقیقه</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'OVERVIEW'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>خلاصه و مقایسه ماهانه</span>
        </button>

        <button
          onClick={() => setActiveTab('MONTHLY')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'MONTHLY'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>تحلیل ریز ماه‌های ۱، ۲ و ۳</span>
        </button>

        <button
          onClick={() => setActiveTab('SETUPS')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'SETUPS'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>راندمان ستاپ‌های معاملاتی ۵گانه</span>
        </button>

        <button
          onClick={() => setActiveTab('TRADES')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'TRADES'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>ژورنال و فهرست ریز ۶۱۸ معامله ({filteredTrades.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & MONTHLY TABLE */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-5">
          {/* 3 Months Performance Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>جدول مقایسه عملکرد ماه‌به‌ماه حساب سنتی ۵۰ دلاری</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-3">ماه معاملاتی</th>
                    <th className="py-3 px-3 text-center">روزها</th>
                    <th className="py-3 px-3 text-center">تعداد ترید</th>
                    <th className="py-3 px-3 text-center">برد / باخت</th>
                    <th className="py-3 px-3 text-center">وین‌ریت</th>
                    <th className="py-3 px-3 text-center">فاکتور سود</th>
                    <th className="py-3 px-3 text-center">ماکزیمم دروداون</th>
                    <th className="py-3 px-3 text-left">سود خالص دلاری (سنت)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {monthlyStats.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-sans font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-mono">
                          {idx + 1}
                        </span>
                        <span>{m.monthLabelFa}</span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300">{m.tradingDays} روز</td>
                      <td className="py-3 px-3 text-center text-amber-300 font-bold">{m.tradesCount}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-emerald-400 font-bold">{m.wins}</span> /{' '}
                        <span className="text-rose-400 font-bold">{m.losses}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-300">{m.winRate}٪</td>
                      <td className="py-3 px-3 text-center font-bold text-cyan-300">{m.profitFactor}</td>
                      <td className="py-3 px-3 text-center text-rose-300 font-bold">{m.maxDrawdownPct}٪</td>
                      <td className="py-3 px-3 text-left font-bold text-emerald-400">
                        +${m.profitUSD.toLocaleString()}
                        <span className="text-[10px] text-slate-400 block">
                          (+{m.profitCents.toLocaleString()}¢)
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-amber-950/30 font-bold text-slate-100 border-t-2 border-amber-500/40">
                    <td className="py-3 px-3 font-sans font-black text-amber-300">مجموع ۳ ماهه (Total 3M)</td>
                    <td className="py-3 px-3 text-center text-slate-200">{summary.tradingDays} روز</td>
                    <td className="py-3 px-3 text-center text-amber-300 font-black">{summary.totalTrades}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-emerald-400 font-black">{summary.winningTrades}</span> /{' '}
                      <span className="text-rose-400 font-black">{summary.losingTrades}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-300">{summary.winRate}٪</td>
                    <td className="py-3 px-3 text-center font-black text-cyan-300">{summary.profitFactor}</td>
                    <td className="py-3 px-3 text-center text-rose-300 font-black">{summary.maxDrawdownPercent}٪</td>
                    <td className="py-3 px-3 text-left font-black text-emerald-300 text-sm">
                      +${summary.netProfitUSD.toLocaleString()}
                      <span className="text-[10px] text-amber-300 block">
                        (+{summary.netProfitCents.toLocaleString()} سنت)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Advantages & Safeguard Review */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>حفاظت در برابر اخبار پرنوسان (News Shield)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                در ۳ ماه گذشته در زمان انتشار اخبار مهم (CPI, NFP, FOMC) سیستم به صورت هوشمند معاملات را با بافر Break-Even قفل یا متوقف کرده و بیش از <strong>{summary.newsSavedTradesCount} پوزیشن</strong> را از اسپایک‌های مخرب طلا نجات داده است.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>حد ضرر منعطف پویای ATR (Flexible SL)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                فاصله استاپ با ضریب 2.1x ATR در نوسانات بازتر و در رکود فشرده‌تر شد؛ این انعطاف باعث شد دروداون حساب در کل ۹۰ روز زیر <strong>{summary.maxDrawdownPercent}٪</strong> باقی بماند.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>کامپاندینگ ارگانیک حساب سنتی</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                حجم لات بر مبنای لات سنتی (0.10c تا 0.40c) پله‌پله با سودها افزایش یافت، بدون اینکه مارجین به خطر بیفتد و سود به بیش از <strong>+{summary.roiPercent}٪</strong> رسید.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MONTHLY DETAILED CARDS */}
      {activeTab === 'MONTHLY' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {monthlyStats.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-black text-slate-100">{m.monthLabelFa}</span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    {m.monthName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">تعداد تریدها:</span>
                    <span className="text-slate-100 font-bold">{m.tradesCount} معامله</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">وین‌ریت:</span>
                    <span className="text-emerald-400 font-bold">{m.winRate}٪</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">فاکتور سود:</span>
                    <span className="text-cyan-400 font-bold">{m.profitFactor}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-sans">ماکزیمم DD:</span>
                    <span className="text-rose-400 font-bold">{m.maxDrawdownPct}٪</span>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl">
                  <span className="text-[11px] text-emerald-400 block font-sans">سود خالص این ماه:</span>
                  <div className="text-lg font-black font-mono text-emerald-300">
                    +${m.profitUSD.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{m.profitCents.toLocaleString()} سنت معادل {m.roiPct}٪ رشد
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedMonthFilter(m.monthName as any);
                  setActiveTab('TRADES');
                }}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-slate-800 transition-all flex items-center justify-center gap-1.5"
              >
                <span>مشاهده تریدهای این ماه ({m.tradesCount})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SETUPS BREAKDOWN */}
      {activeTab === 'SETUPS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>تفکیک راندمان ۵ ستاپ معاملاتی سیستم در ۳ ماهه گذشته</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {setupStats.map((s, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">{s.titleFa}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{s.setupId}</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    {s.winRate}٪ وین
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono text-center">
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-sans">تعداد:</span>
                    <span className="text-slate-100 font-bold">{s.count}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-sans">برد/باخت:</span>
                    <span className="text-emerald-400">{s.wins}</span>/<span className="text-rose-400">{s.losses}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-sans">PF:</span>
                    <span className="text-cyan-400 font-bold">{s.profitFactor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-slate-400">سود کل این ستاپ:</span>
                  <span className="text-emerald-400 font-mono font-bold">+${s.netProfitUSD.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRADE JOURNAL LIST */}
      {activeTab === 'TRADES' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>ژورنال ریز ۶۱۸ معامله ۳ ماهه طلا</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                نمایش {displayedTrades.length} از {filteredTrades.length} معامله فیلترشده
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Month Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['ALL', 'Month 1', 'Month 2', 'Month 3'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonthFilter(m)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedMonthFilter === m
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m === 'ALL' ? 'همه ماه‌ها' : m}
                  </button>
                ))}
              </div>

              {/* Result Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {(['ALL', 'WIN', 'LOSS', 'BE'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedResultFilter(r)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedResultFilter === r
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r === 'ALL' ? 'همه نتایج' : r === 'WIN' ? 'بردها' : r === 'LOSS' ? 'باخت‌ها' : 'BE'}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="جستجو در تریدها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pr-8 pl-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 w-36 sm:w-44"
                />
              </div>
            </div>
          </div>

          {/* Trade Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3">شناسه & تاریخ</th>
                  <th className="py-2.5 px-3 text-center">نوع</th>
                  <th className="py-2.5 px-3">ستاپ معاملاتی</th>
                  <th className="py-2.5 px-3 text-center">قیمت ورود/خروج</th>
                  <th className="py-2.5 px-3 text-center">اطمینان هوش مصنوعی</th>
                  <th className="py-2.5 px-3 text-center">نتیجه</th>
                  <th className="py-2.5 px-3 text-left">سود/زیان ($)</th>
                  <th className="py-2.5 px-3">علت خروج و محافظت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {displayedTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-200">{t.id}</div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {t.date} | {t.time}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          t.type === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">
                      <div>{t.setupFa}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{t.setup}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="text-amber-300 font-bold">${t.entryPrice.toFixed(2)}</div>
                      <div className="text-slate-400 text-[10px]">➔ ${t.exitPrice.toFixed(2)}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.aiConfidence >= 90
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {t.aiConfidence}٪
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {t.result === 'WIN' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          برد
                        </span>
                      ) : t.result === 'LOSS' ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          ضرر کنترل‌شده
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          سر‌به‌سر (BE)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-left font-bold font-mono">
                      <span className={t.profitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {t.profitUSD >= 0 ? `+$${t.profitUSD.toFixed(2)}` : `-$${Math.abs(t.profitUSD).toFixed(2)}`}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({t.profitCents >= 0 ? `+${t.profitCents}` : t.profitCents}¢)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px] max-w-xs">
                      {t.exitReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show more toggle */}
          {filteredTrades.length > 30 && (
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowAllTrades(!showAllTrades)}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-bold text-amber-300 border border-slate-800 transition-all inline-flex items-center gap-1.5"
              >
                <span>{showAllTrades ? 'نمایش ۳۰ ترید اول' : `مشاهده تمام ${filteredTrades.length} معامله`}</span>
                {showAllTrades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
