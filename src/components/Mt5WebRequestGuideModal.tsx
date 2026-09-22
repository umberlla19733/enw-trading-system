import React, { useState } from 'react';
import {
  Globe,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  X,
  AlertTriangle,
  Zap,
  Server,
  Activity,
  Cpu,
  HelpCircle,
  ChevronLeft,
  KeyRound
} from 'lucide-react';

interface Mt5WebRequestGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubdomain?: string;
}

export const Mt5WebRequestGuideModal: React.FC<Mt5WebRequestGuideModalProps> = ({
  isOpen,
  onClose,
  defaultSubdomain = 'https://ea.elliottneowave.ir',
}) => {
  const [subdomainUrl, setSubdomainUrl] = useState(defaultSubdomain);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [healthStatus, setHealthStatus] = useState<'IDLE' | 'CHECKING' | 'ONLINE' | 'ERROR'>('IDLE');
  const [healthResponse, setHealthResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanSubdomain = subdomainUrl.trim().replace(/\/+$/, '');
  const heartbeatUrl = `${cleanSubdomain}/api/ea/heartbeat`;
  const healthCheckUrl = `${cleanSubdomain}/api/health`;
  const apiKeyToken = 'ELLIOTT-NEOWAVE-SECRET-KEY';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const testServerHealth = async () => {
    setHealthStatus('CHECKING');
    setHealthResponse(null);
    try {
      const res = await fetch(healthCheckUrl, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        setHealthStatus('ONLINE');
        setHealthResponse(JSON.stringify(json, null, 2));
      } else {
        setHealthStatus('ERROR');
        setHealthResponse(`خطای HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setHealthStatus('ERROR');
      setHealthResponse(err.message || 'عدم امکان اتصال به سرور بک‌اند (CORS یا سرور خاموش است)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-950 border-2 border-amber-500/60 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative my-auto">
        {/* Glow Header */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Topbar */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                <span>راهنمای گام‌به‌گام فعال‌سازی WebRequest متاتریدر ۵</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MT5 Web Bridge
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظیم دسترسی اتصال آنلاین اکسپرت به سابدامین اختصاصی <strong className="text-cyan-300 font-mono">ea.elliottneowave.ir</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subdomain Input Selector Banner */}
        <div className="bg-slate-900/50 border-b border-slate-800/80 p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Server className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">آدرس سابدامین پلتفرم شما:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              dir="ltr"
              value={subdomainUrl}
              onChange={(e) => setSubdomainUrl(e.target.value)}
              placeholder="https://ea.elliottneowave.ir"
              className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 w-full sm:w-72 outline-none"
            />
            <button
              onClick={() => handleCopy(cleanSubdomain, 'subdomain_input')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 font-bold"
            >
              {copiedKey === 'subdomain_input' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>کپی URL</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Steps Wizard */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-200 text-xs sm:text-sm leading-relaxed">
          {/* Steps Breadcrumb Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 1, title: '۱. تنظیمات Options', subtitle: 'منوی Tools متاتریدر' },
              { id: 2, title: '۲. تیک WebRequest', subtitle: 'افزودن URL سابدامین' },
              { id: 3, title: '۳. تنظیمات اکسپرت', subtitle: 'ورودی‌های Inputs چارت' },
              { id: 4, title: '۴. عیب‌یابی و تست', subtitle: 'بررسی آنلاین و لاگ‌ها' },
            ].map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  activeStep === step.id
                    ? 'bg-amber-500/10 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-black text-xs sm:text-sm flex items-center justify-between">
                  <span>{step.title}</span>
                  {activeStep === step.id && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{step.subtitle}</span>
              </button>
            ))}
          </div>

          {/* STEP 1 & 2: MetaTrader 5 Tools -> Options Window */}
          {(activeStep === 1 || activeStep === 2) && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-slate-900 to-amber-950/30 border border-amber-500/40 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-amber-300 font-black text-sm sm:text-base mb-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>مرحله ۱ و ۲: فعال‌سازی Allow WebRequest در نرم‌افزار متاتریدر ۵</span>
                </div>

                <ol className="space-y-3.5 text-xs text-slate-300 pr-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      ۱
                    </span>
                    <div>
                      در نرم‌افزار متاتریدر ۵، کلیدهای میانبر <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono text-amber-300">Ctrl + O</kbd> را بفشارید (یا از نوار منوی بالا به مسیر <strong>Tools ⬅️ Options</strong> بروید).
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      ۲
                    </span>
                    <div>
                      در پنجره باز شده، به تب <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">Expert Advisors</strong> بروید.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      ۳
                    </span>
                    <div>
                      تیک گزینه‌های زیر را <strong>حتماً فعال (✅)</strong> کنید:
                      <ul className="mt-1.5 space-y-1.5 text-[11px] text-slate-200">
                        <li className="flex items-center gap-2 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Allow Algo Trading</span>
                        </li>
                        <li className="flex items-center gap-2 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Allow WebRequest for listed URL:</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      ۴
                    </span>
                    <div className="w-full">
                      روی دکمه سبز رنگ <strong className="text-emerald-400 font-bold">«+» (Add new URL)</strong> دابل کلیک کرده و آدرس زیر را اضافه نمایید:
                      <div className="mt-2 bg-black border-2 border-emerald-500/60 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xl">
                        <code className="text-emerald-300 font-mono font-bold text-xs sm:text-sm select-all">
                          {cleanSubdomain}
                        </code>
                        <button
                          onClick={() => handleCopy(cleanSubdomain, 'modal_url')}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all shadow-lg"
                        >
                          {copiedKey === 'modal_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>کپی آدرس</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        💡 نکته: آدرس باید با <code className="text-cyan-300">https://</code> شروع شود و اسلش اضافی در انتها نداشته باشد.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      ۵
                    </span>
                    <div>
                      در پایان روی دکمه <strong className="text-amber-300">OK</strong> کلیک کنید تا تنظیمات ذخیره شود.
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* STEP 3: EA Inputs Setup on Chart */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-slate-900 to-cyan-950/30 border border-cyan-500/40 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-sm sm:text-base mb-3">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <span>مرحله ۳: تنظیم مقادیر ورودی اکسپرت (EA Inputs) در چارت طلا</span>
                </div>

                <p className="text-xs text-slate-300 mb-3">
                  اکسپرت <code className="text-amber-300 font-mono">ElliottNeowave_Gold_Scalper_EA.ex5</code> را روی چارت طلای <strong>XAUUSD (تایم M1)</strong> درگ کرده و در تب <strong>Inputs</strong> مقادیر زیر را بررسی و وارد کنید:
                </p>

                <div className="space-y-3">
                  {/* Parameter 1 */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-mono">InpEnableWebCommander</span>
                      <span className="text-xs text-slate-200">فعال‌سازی ماژول هدایت و فرماندهی راه دور</span>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-mono font-bold text-xs self-start sm:self-auto">
                      true
                    </span>
                  </div>

                  {/* Parameter 2 */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-full sm:w-auto">
                      <span className="text-xs text-slate-400 block font-mono">InpCommanderServerUrl</span>
                      <span className="text-xs text-slate-200">آدرس اندپوینت تله‌متری و دریافت فرامین زنده</span>
                      <code className="text-cyan-300 font-mono text-xs block mt-1 break-all">
                        {heartbeatUrl}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(heartbeatUrl, 'ea_heartbeat_url')}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all self-start sm:self-auto"
                    >
                      {copiedKey === 'ea_heartbeat_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>کپی آدرس Heartbeat</span>
                    </button>
                  </div>

                  {/* Parameter 3 */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-mono">InpCommanderApiKey</span>
                      <span className="text-xs text-slate-200">کلید رمزنگاری و احراز هویت اختصاصی</span>
                      <code className="text-amber-300 font-mono text-xs block mt-1">
                        {apiKeyToken}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(apiKeyToken, 'ea_api_key')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all self-start sm:self-auto"
                    >
                      {copiedKey === 'ea_api_key' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>کپی API Key</span>
                    </button>
                  </div>

                  {/* Parameter 4 */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-mono">InpHeartbeatIntervalSec</span>
                      <span className="text-xs text-slate-200">فاصله زمانی ارسال تله‌متری و پینگ</span>
                    </div>
                    <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg font-mono font-bold text-xs self-start sm:self-auto">
                      3 ثانیه
                    </span>
                  </div>
                </div>

                <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>تذکر:</strong> در نوار ابزار بالای نرم‌افزار متاتریدر ۵، دکمه بزرگ <strong>Algo Trading</strong> باید به رنگ <strong>سبز (روشن)</strong> باشد تا اکسپرت بتواند تریدها را هدایت کند.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Troubleshooting & Live Backend Test */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Server Health Diagnostic Box */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>تست زنده بودن بک‌اند سرور سابدامین</span>
                  </div>

                  <button
                    onClick={testServerHealth}
                    disabled={healthStatus === 'CHECKING'}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Activity className={`w-3.5 h-3.5 ${healthStatus === 'CHECKING' ? 'animate-spin' : ''}`} />
                    <span>{healthStatus === 'CHECKING' ? 'در حال بررسی...' : 'بررسی اتصال سرور'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Endpoint:</span>
                  <a
                    href={healthCheckUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <span>{healthCheckUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {healthStatus === 'ONLINE' && (
                  <div className="mt-3 bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-xl text-emerald-300 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>سرور بک‌اند فعال و پاسخگو است (200 OK)!</span>
                    </div>
                    <pre className="bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-300 overflow-x-auto mt-1">
                      {healthResponse}
                    </pre>
                  </div>
                )}

                {healthStatus === 'ERROR' && (
                  <div className="mt-3 bg-rose-950/40 border border-rose-500/50 p-3 rounded-xl text-rose-300 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>عدم دریافت پاسخ موفق از سرور بک‌اند!</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {healthResponse}
                    </p>
                    <p className="text-[10px] text-rose-300/80 mt-2">
                      💡 اگر هاست اشتراکی دارید، وارد cPanel ➔ Setup Node.js App شوید و مطمئن شوید برنامه استارت خورده است.
                    </p>
                  </div>
                )}
              </div>

              {/* MT5 Errors Troubleshooting Guide Table */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>راهنمای پیام‌ها و خطاهای تب Experts در متاتریدر ۵</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-400">Error 4060 (WebRequest is not allowed)</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">عدم مجوز URL</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      <strong>راه‌حل:</strong> آدرس <code className="text-cyan-300">{cleanSubdomain}</code> در منوی Tools ➔ Options ➔ Expert Advisors ➔ Allow WebRequest اضافه نشده است.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">Error 5203 / 4014 (Cannot connect to host)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">خطای شبکه/SSL</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      <strong>راه‌حل:</strong> گواهی SSL سابدامین فعال نیست یا اینترنت متاتریدر مسدود است. مطمئن شوید آدرس با https باز می‌شود.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400">200 OK (Connection Successful)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">اتصال موفق</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      ارتباط بدون نقص برقرار شده و اطلاعات حساب و معاملات زنده در پنل وب نمایش می‌یابند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
              >
                مرحله قبل
              </button>
            )}
            {activeStep < 4 && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <span>مرحله بعد</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-700"
          >
            بستن راهنما
          </button>
        </div>
      </div>
    </div>
  );
};
