import React, { useState } from 'react';
import { MarketAsset } from '../types';
import { ShieldAlert, Zap, Compass, CheckCircle2, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';

interface StrategyPanelProps {
  asset: MarketAsset;
}

export const StrategyPanel: React.FC<StrategyPanelProps> = ({ asset }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: 'مرحله ۱: منطقه آرامش قبل از طوفان (ESZ)',
      badge: 'انباشت انرژی',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      description: 'فشردگی شدید خطوط کیجنسن در لایه‌های کوتاه‌مدت و میان‌مدت (۲۶ و ۱۳۰). خطوط حالت افقی و چسبیده به هم پیدا می‌کنند و ابرهای کومو به شدت باریک و کمربندی می‌شوند.',
      criteria: [
        'کیجنسن میان‌مدت (۱۳۰) و کوتاه‌مدت (۲۶) در یک محدوده باریک مماس شده‌اند.',
        'ابر کومو نازک و فاقد زاویه حرکتی است (انتروپی بالا و بلاتکلیفی بازار).',
        'حجم معاملات رو به کاهش است (آرامش قبل از طوفان و جمع‌آوری نقدینگی).'
      ],
      bookQuote: '«فشردگی اجزای TWIO مانند جمع شدن یک فنر بسیار قدرتمند است؛ هرچه این دوره طولانی‌تر باشد، انفجار بعدی سهمگین‌تر خواهد بود.» (فصل ۲۱)'
    },
    {
      id: 2,
      title: 'مرحله ۲: تعیین مرزهای انفجار (EB)',
      badge: 'خطوط قرمز',
      color: 'border-red-500/40 bg-red-950/20 text-red-300',
      description: `بالاترین سقف و پایین‌ترین کف در دوره فشردگی شناسایی شده و به صورت دو خط افقی قرمز در قیمت‌های $${asset.upperBoundary.toLocaleString()} و $${asset.lowerBoundary.toLocaleString()} ترسیم می‌گردند.`,
      criteria: [
        `مرز بالایی انفجار (مقاومت کلیدی): $${asset.upperBoundary.toLocaleString()}`,
        `مرز پایینی انفجار (حمایت کلیدی و حد ابطال): $${asset.lowerBoundary.toLocaleString()}`,
        'عدم ورود به معامله در داخل این کانال؛ هرگونه معامله در داخل باکس به دلیل نویز بالا ممنوع است.'
      ],
      bookQuote: '«این دو سطح، خطوط قرمز شما هستند. تا زمانی که قیمت درون این مرزها نفس می‌کشد، معامله‌گر خردمند فقط ناظر است.»'
    },
    {
      id: 3,
      title: 'مرحله ۳: رصد جرقه‌های اولیه (Initial Sparks)',
      badge: 'حرکت لایه کوتاه',
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      description: 'لایه کوتاه‌مدت S-Ichi اولین لرزش‌های برگ درخت را در برابر باد حس می‌کند. تنکان‌سن ۹ روزه با شتاب به سمت بالا متمایل شده و کیجنسن ۲۶ را قطع می‌کند.',
      criteria: [
        'کراس صعودی تنکان‌سن از کیجنسن در لایه کوتاه (S-Ichi).',
        'حمله مکرر قیمت به مرز بالایی انفجار.',
        'آزاد شدن خط چیکو اسپن کوتاه‌مدت از کندل‌های متناظر گذشته.'
      ],
      bookQuote: '«لرزش ابتدا در برگ‌های نازک درخت رخ می‌دهد، سپس به شاخه‌ها و در نهایت به تنه کهنسال سرایت خواهد کرد.» (فصل ۱۹)'
    },
    {
      id: 4,
      title: 'مرحله ۴: شکار شکست معتبر (Valid Breakout)',
      badge: 'سیگنال قطعی ورود',
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      description: 'کندل با بدنه قدرتمند و بدون سایه بلند در بالای مرز انفجار بسته می‌شود (Close) و حجم معاملات جهش پیدا می‌کند.',
      criteria: [
        'بسته شدن بدنه کندل در بالای مرز انفجار (صرف نفوذ سایه مورد قبول نیست).',
        'جهش چشمگیر میله حجم نسبت به میانگین دوره فشردگی (تأیید پول هوشمند).',
        'همسویی تنکان‌سن میان‌مدت (TM) و خروج قیمت از ابر لایه میانی (CloudM).'
      ],
      bookQuote: '«آنگاه که همه موج‌ها همنوا شوند، تداخل سازنده رخ می‌دهد و انرژی نهفته آزاد می‌شود؛ اکنون زمان ورود با اطمینان است.»'
    },
    {
      id: 5,
      title: 'مرحله ۵: مدیریت معامله با FLD و حد ضرر پویا',
      badge: 'تارگت‌ها و خروج',
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      description: `تعیین حد ضرر در $${asset.stopLossPrice.toLocaleString()} و برداشت سود در تارگت‌های چرخه‌ای FLD آینده در $${asset.targetPrice1.toLocaleString()} و $${asset.targetPrice2.toLocaleString()}.`,
      criteria: [
        `حد ضرر اولیه: $${asset.stopLossPrice.toLocaleString()} (کمی پایین‌تر از مرز پایینی انفجار).`,
        `تارگت اول (موج میانی M-FLD): $${asset.targetPrice1.toLocaleString()}`,
        `تارگت دوم (نقطه کانونی HPFP و تلاقی با L-FLD): $${asset.targetPrice2.toLocaleString()}`,
        'انتقال پله‌ای حد ضرر (Trailing Stop) به زیر کیجنسن میان‌مدت با پیشروی روند.'
      ],
      bookQuote: '«FLDها مانند آهنربای زمانی عمل می‌کنند که قیمت را به سمت تعادل آینده خویش جذب می‌نمایند.» (فصل ۲۱)'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-slate-100">راهنمای گام‌به‌گام سیستم معاملاتی «چشم طوفان» (ESZ)</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
          منطبق با فصل‌های ۱۹، ۲۰ و ۲۱ کتاب
        </span>
      </div>

      {/* Step Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-2.5 rounded-xl text-right border transition-all flex flex-col gap-1 ${
                isActive
                  ? 'bg-slate-800 border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isActive ? 'text-amber-400' : 'text-slate-400'}`}>
                  گام {step.id}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {step.badge}
                </span>
              </div>
              <span className={`text-xs truncate font-medium ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                {step.title.split(':')[1] || step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      {(() => {
        const cur = steps.find((s) => s.id === activeStep) || steps[0];
        return (
          <div className={`p-4 rounded-xl border ${cur.color} flex flex-col gap-3 transition-all`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {cur.title}
              </h4>
              <span className="text-xs bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/50 font-mono">
                {cur.badge}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {cur.description}
            </p>

            {/* Checklist */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-300">چک‌لیست اعتبارسنجی این گام:</span>
              <ul className="flex flex-col gap-1.5">
                {cur.criteria.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quote from the book */}
            <div className="text-[11px] text-amber-300/90 italic bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{cur.bookQuote}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
