import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Radio,
  Power,
  ShieldAlert,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Sliders,
  DollarSign,
  Coins,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Zap,
  Globe,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Terminal,
  Server,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  ShieldCheck,
  Flame,
  Settings2,
  HelpCircle
} from 'lucide-react';
import { Mt5WebRequestGuideModal } from './Mt5WebRequestGuideModal';

interface RemoteConfig {
  isTradingEnabled: boolean;
  emergencyCloseRequested: boolean;
  strategyMode: 'HIGH_SPEED' | 'BALANCED' | 'SNIPER';
  baseLot: number;
  riskPercent: number;
  slMode: 'DYNAMIC_ATR' | 'SWING_STRUCTURE' | 'KIJUN_EQUILIBRIUM' | 'CUSTOM_FIXED' | 'AI_ADAPTIVE';
  customSlUSD: number;
  customTpUSD: number;
  trailingStopActive: boolean;
  newsFilterActive: boolean;
  maxConcurrentTrades: number;
  apiKeyToken: string;
  lastCommandTimestamp: number;
  lastCommandAction: string;
  lastUpdated: string;
}

interface OpenPosition {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profit: number;
  openTime?: string;
  comment?: string;
}

interface TerminalInfo {
  accountNumber: string;
  accountName?: string;
  broker: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  floatingProfit: number;
  openPositions: OpenPosition[];
  symbol: string;
  currentSpread: number;
  goldBid: number;
  goldAsk: number;
  isAutoTradingAllowedInTerminal: boolean;
  eaVersion: string;
  magicNumber: number;
  lastPingTimestamp: number;
  latencyMs: number;
  status: 'ONLINE' | 'IDLE' | 'OFFLINE';
}

interface CommandLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  sender: 'WEB_DASHBOARD' | 'MT5_TERMINAL' | 'AI_GUARD';
  status: 'SENT' | 'ACKNOWLEDGED' | 'EXECUTED' | 'FAILED';
}

interface LiveEaCommanderViewProps {
  onOpenMt5Export?: () => void;
}

export const LiveEaCommanderView: React.FC<LiveEaCommanderViewProps> = ({ onOpenMt5Export }) => {
  const [config, setConfig] = useState<RemoteConfig>({
    isTradingEnabled: true,
    emergencyCloseRequested: false,
    strategyMode: 'HIGH_SPEED',
    baseLot: 0.10,
    riskPercent: 2.0,
    slMode: 'DYNAMIC_ATR',
    customSlUSD: 3.20,
    customTpUSD: 5.00,
    trailingStopActive: true,
    newsFilterActive: true,
    maxConcurrentTrades: 2,
    apiKeyToken: 'ELLIOTT-NEOWAVE-SECRET-KEY',
    lastCommandTimestamp: Date.now(),
    lastCommandAction: 'SYSTEM_READY',
    lastUpdated: new Date().toISOString(),
  });

  const [terminals, setTerminals] = useState<TerminalInfo[]>([]);
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(3); // seconds
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmCloseAllModal, setConfirmCloseAllModal] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // VIP / Personal Area Authentication for elliottneowave.ir
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('en_vip_panel_auth') === 'true' || localStorage.getItem('en_vip_panel_auth') === 'true';
    }
    return true;
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showEmbedGuideModal, setShowEmbedGuideModal] = useState(false);
  const [showWebRequestGuide, setShowWebRequestGuide] = useState(false);
  const [selectedDomainEndpoint, setSelectedDomainEndpoint] = useState<'AUTO' | 'ELLIOTT_IR' | 'SUBDOMAIN'>('SUBDOMAIN');

  // Form edit states
  const [editMode, setEditMode] = useState<'HIGH_SPEED' | 'BALANCED' | 'SNIPER'>('HIGH_SPEED');
  const [editLot, setEditLot] = useState<number>(0.10);
  const [editSlMode, setEditSlMode] = useState<'DYNAMIC_ATR' | 'SWING_STRUCTURE' | 'KIJUN_EQUILIBRIUM' | 'CUSTOM_FIXED' | 'AI_ADAPTIVE'>('DYNAMIC_ATR');
  const [editCustomSl, setEditCustomSl] = useState<number>(3.20);
  const [editCustomTp, setEditCustomTp] = useState<number>(5.00);
  const [editTrailing, setEditTrailing] = useState<boolean>(true);
  const [editNewsFilter, setEditNewsFilter] = useState<boolean>(true);
  const [editMaxTrades, setEditMaxTrades] = useState<number>(2);

  // Derive current server origin URL for WebRequest
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://elliottneowave.ir';
  
  const computedEndpointUrl = useMemo(() => {
    if (selectedDomainEndpoint === 'ELLIOTT_IR') {
      return 'https://elliottneowave.ir/api/ea/heartbeat';
    }
    if (selectedDomainEndpoint === 'SUBDOMAIN') {
      return 'https://ea.elliottneowave.ir/api/ea/heartbeat';
    }
    return `${currentOrigin}/api/ea/heartbeat`;
  }, [selectedDomainEndpoint, currentOrigin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '142536.j.Blunt%') {
      setIsAuthenticated(true);
      setPinError(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('en_vip_panel_auth', 'true');
        localStorage.setItem('en_vip_panel_auth', 'true');
      }
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('en_vip_panel_auth');
      localStorage.removeItem('en_vip_panel_auth');
    }
  };

  // Fetch telemetry and status from server
  const fetchTelemetry = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/ea/telemetry');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          setEditMode(data.config.strategyMode);
          setEditLot(data.config.baseLot);
          setEditSlMode(data.config.slMode);
          setEditCustomSl(data.config.customSlUSD);
          setEditCustomTp(data.config.customTpUSD);
          setEditTrailing(data.config.trailingStopActive);
          setEditNewsFilter(data.config.newsFilterActive);
          setEditMaxTrades(data.config.maxConcurrentTrades);
        }
        if (data.terminals) {
          setTerminals(data.terminals);
        }
        if (data.logs) {
          setLogs(data.logs);
        }
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Telemetry fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Poll server periodically
  useEffect(() => {
    fetchTelemetry();
    if (autoRefreshInterval > 0) {
      const timer = setInterval(() => {
        fetchTelemetry();
      }, autoRefreshInterval * 1000);
      return () => clearInterval(timer);
    }
  }, [autoRefreshInterval, fetchTelemetry]);

  // Send Command Helper
  const sendCommand = async (action: string, payload?: any) => {
    try {
      setIsSendingCommand(true);
      const res = await fetch('/api/ea/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessToast(result.message || 'دستور با موفقیت ارسال شد.');
        setTimeout(() => setSuccessToast(null), 4000);
        await fetchTelemetry();
      }
    } catch (err: any) {
      console.error('Command failed:', err);
    } finally {
      setIsSendingCommand(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const primaryTerminal = terminals.length > 0 ? terminals[0] : null;
  const isOnline = primaryTerminal && primaryTerminal.status === 'ONLINE';

  return (
    <div className="flex flex-col gap-6" id="live-ea-commander-container">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl shadow-2xl font-black text-sm flex items-center gap-2 border border-emerald-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{successToast}</span>
        </div>
      )}

      {/* MetaTrader 5 WebRequest Step-by-Step Interactive Guide Modal */}
      <Mt5WebRequestGuideModal
        isOpen={showWebRequestGuide}
        onClose={() => setShowWebRequestGuide(false)}
        defaultSubdomain="https://ea.elliottneowave.ir"
      />

      {/* Embed & Integration Guide Modal for elliottneowave.ir */}
      {showEmbedGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 flex flex-col gap-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3 text-indigo-400">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">راهنمای ادغام پنل فرماندهی در بخش شخصی elliottneowave.ir</h3>
                  <p className="text-xs text-indigo-300">نحوه قرار دادن کنترل پنل اکسپرت در برگه مخفی یا پنل کاربری سایت شما</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmbedGuideModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* Method 1 */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    روش ۱: قرار دادن مستقیم در برگه خصوصی سایت با کد آماده iframe
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`<iframe src="${currentOrigin}" style="width: 100%; height: 95vh; border: none; border-radius: 16px;" allow="fullscreen"></iframe>`, 'iframe_code')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1"
                  >
                    {copiedField === 'iframe_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'iframe_code' ? 'کپی شد!' : 'کپی کد iframe'}</span>
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  در وردپرس یا مدیریت محتوای سایت <code className="text-amber-300 font-mono">elliottneowave.ir</code>، یک برگه جدید با عنوان <strong className="text-white">«پنل فرماندهی اکسپرت»</strong> بسازید (با سطح دسترسی خصوصی/فقط مدیر) و کد زیر را به صورت HTML قرار دهید:
                </p>
                <div className="font-mono text-xs text-cyan-300 bg-slate-900 p-3 rounded-xl border border-slate-800 overflow-x-auto select-all">
                  {`<iframe src="${currentOrigin}" style="width: 100%; height: 95vh; border: none; border-radius: 16px;" allow="fullscreen"></iframe>`}
                </div>
              </div>

              {/* Method 2 */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-cyan-400" />
                  روش ۲: راه‌اندازی روی ساب‌دامین اختصاصی (مثل ea.elliottneowave.ir)
                </span>
                <p className="text-slate-400 text-[11px]">
                  می‌توانید در پنل دامنه یا هاستینگ خود یک رکورد CNAME یا A با نام <code className="text-cyan-300 font-mono">ea</code> ایجاد کرده و آن را به این سرور متصل کنید تا مستقیماً با آدرس اختصاصی <code className="text-cyan-300 font-mono">https://ea.elliottneowave.ir</code> در دسترس باشد.
                </p>
              </div>

              {/* Method 3 */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  امنیت و محافظت از راه دور:
                </span>
                <p className="text-slate-400 text-[11px]">
                  تمام درخواست‌های متاتریدر ۵ با توکن امنیتی اختصاصی <code className="text-amber-300 font-mono">{config.apiKeyToken}</code> رمزنگاری و احراز هویت می‌شوند و از ورود افراد ناشناس جلوگیری می‌گردد.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowEmbedGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                متوجه شدم و بستن راهنما
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Emergency Close All */}
      {confirmCloseAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-rose-950/50 flex flex-col gap-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">بستن فوری کلیه پوزیشن‌های باز طلا</h3>
                <p className="text-xs text-rose-300">دستور اضطراری Kill-Switch متاتریدر ۵</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              آیا مطمئن هستید؟ با تایید این فرمان، اکسپرت الیوت نئویو در متاتریدر ۵ بلافاصله تمام پوزیشن‌های باز جاری طلا را به قیمت لحظه‌ای بازار (Market Close) می‌بندد و سفارش‌های در حال تعلیق را لغو می‌کند.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCloseAllModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                انصراف و برگشت
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmCloseAllModal(false);
                  sendCommand('EMERGENCY_CLOSE_ALL');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-black hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                <span>تایید بستن تمام معاملات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top VIP Personal Area Ribbon */}
      <div className="fintech-card rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <Lock className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">کنترل پنل ابری اختصاصی اکسپرت</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                سطح دسترسی: مدیر سیستم
              </span>
            </div>
            <span className="text-[11px] text-slate-400">اتصال زنده و هدایت از راه دور اکسپرت متاتریدر ۵</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWebRequestGuide(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 text-amber-300 border border-amber-500/40 text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>راهنمای اتصال متاتریدر ۵ (WebRequest)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmbedGuideModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>راهنمای ساب‌دامین و وب‌سایت</span>
          </button>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>قفل کردن پنل</span>
            </button>
          ) : (
            <span className="text-[11px] text-amber-300 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/30 font-bold">
              جهت صدور فرامین احراز هویت نمایید
            </span>
          )}
        </div>
      </div>

      {/* Discreet Authentication Gate */}
      {!isAuthenticated && (
        <div className="fintech-card rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center text-center gap-4 border-indigo-500/30">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/25 to-purple-500/10 border border-indigo-500/40 flex items-center justify-center shadow-xl shadow-indigo-500/15 text-indigo-300">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-white">ورود امن به کنترل پنل ابری اکسپرت</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              جهت ارسال مستقیم فرامین و تغییر پارامترهای اکسپرت متاتریدر ۵، رمز عبور یا پین امنیتی را وارد فرمایید.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-sm">
            <input
              type="password"
              placeholder="رمز عبور / پین امنیتی"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              className={`w-full bg-slate-950/90 border px-4 py-2.5 rounded-xl text-xs font-mono text-center tracking-widest text-white focus:outline-none transition-colors shadow-inner ${
                pinError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-400'
              }`}
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs shrink-0 shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              ورود به سیستم
            </button>
          </form>

          {pinError && (
            <span className="text-xs text-rose-400 font-bold">رمز عبور وارد شده نادرست است.</span>
          )}
        </div>
      )}

      {/* Top Main Banner: Live Connection & Master Status */}
      <div className="fintech-card rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg transition-all ${
              !config.isTradingEnabled
                ? 'bg-gradient-to-br from-amber-500/20 to-amber-950/40 border-amber-500/50 text-amber-400 shadow-amber-500/20'
                : isOnline
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20'
                : 'bg-gradient-to-br from-cyan-500/20 to-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-cyan-500/20'
            }`}>
              <Radio className="w-7 h-7 animate-pulse" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  مرکز هدایت و فرماندهی زنده اکسپرت (Live EA Remote Commander)
                </h2>
                <span className={`text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border shadow-sm ${
                  !config.isTradingEnabled
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                    : isOnline
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-800/90 border-slate-700 text-slate-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    !config.isTradingEnabled
                      ? 'bg-amber-400 animate-ping'
                      : isOnline
                      ? 'bg-emerald-400 animate-ping'
                      : 'bg-slate-400'
                  }`} />
                  {!config.isTradingEnabled
                    ? 'معامله‌گری متوقف است (Paused)'
                    : isOnline
                    ? 'پل ارتباطی متصل و آنلاین (Live Bridge Connected)'
                    : 'آماده اتصال متاتریدر ۵ (Standby)'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                فرماندهی مستقیم اکسپرت الیوت نئویو از طریق وب‌سایت: توقف اضطراری، تغییر مود استراتژی، تنظیم آنی حجم و حد ضرر، و دریافت لحظه‌ای تله‌متری پوزیشن‌های باز طلا.
              </p>
            </div>
          </div>

          {/* Quick Refresh & Telemetry Info */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 font-medium">آخرین همگام‌سازی:</span>
              <span className="font-mono text-cyan-300 font-bold">{lastSyncTime.toLocaleTimeString('fa-IR')}</span>
            </div>

            <button
              type="button"
              id="btn-sync-telemetry"
              onClick={fetchTelemetry}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>بروزرسانی زنده</span>
            </button>
          </div>
        </div>
      </div>

      {/* EMERGENCY MASTER CONTROL BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Button 1: Emergency Close All Positions */}
        <button
          type="button"
          id="btn-emergency-close-all"
          disabled={isSendingCommand}
          onClick={() => setConfirmCloseAllModal(true)}
          className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-rose-950/90 via-slate-900 to-red-950/60 border border-rose-500/40 hover:border-rose-400/80 shadow-xl shadow-rose-950/30 transition-all hover:scale-[1.01] active:scale-[0.99] text-right flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all text-rose-400 shadow-lg shadow-rose-950/50">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-rose-200 group-hover:text-white">بستن فوری تمام پوزیشن‌ها</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Emergency Close All Gold Positions</div>
            </div>
          </div>
          <Power className="w-5 h-5 text-rose-400/80 group-hover:text-rose-300" />
        </button>

        {/* Button 2: Pause / Resume Trading Toggle */}
        {config.isTradingEnabled ? (
          <button
            type="button"
            id="btn-pause-trading"
            disabled={isSendingCommand}
            onClick={() => sendCommand('PAUSE_TRADING')}
            className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-yellow-950/60 border border-amber-500/40 hover:border-amber-400/80 shadow-xl shadow-amber-950/30 transition-all hover:scale-[1.01] active:scale-[0.99] text-right flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all text-amber-400 shadow-lg shadow-amber-950/50">
                <Pause className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-amber-200 group-hover:text-white">توقف موقت معاملات (Pause)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">عدم ورود به معاملات جدید تا اطلاع ثانوی</div>
              </div>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-xl font-bold border border-amber-500/40">فعال</span>
          </button>
        ) : (
          <button
            type="button"
            id="btn-resume-trading"
            disabled={isSendingCommand}
            onClick={() => sendCommand('RESUME_TRADING')}
            className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-teal-950/60 border-2 border-emerald-500/60 hover:border-emerald-400 shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.01] active:scale-[0.99] text-right flex items-center justify-between animate-pulse"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all text-emerald-400 shadow-lg shadow-emerald-950/50">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="text-sm font-black text-emerald-200 group-hover:text-white">صدور مجوز شروع معاملات (Resume)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">شروع مجدد معامله‌گری خودکار اکسپرت</div>
              </div>
            </div>
            <span className="text-xs bg-emerald-500 text-slate-950 px-3 py-1 rounded-xl font-black shadow-lg shadow-emerald-500/30">کلیک برای شروع</span>
          </button>
        )}

        {/* Button 3: Download / Export Updated EA Code */}
        <button
          type="button"
          id="btn-export-mql5-bridge"
          onClick={onOpenMt5Export}
          className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/60 border border-cyan-500/40 hover:border-cyan-400/80 shadow-xl shadow-cyan-950/20 transition-all hover:scale-[1.01] active:scale-[0.99] text-right flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all text-cyan-400 shadow-lg shadow-cyan-950/50">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-cyan-200 group-hover:text-white">کد MQL5 اکسپرت نسل ۶</div>
              <div className="text-[11px] text-slate-400 mt-0.5">دانلود اکسپرت متصل به وب برای متاتریدر ۵</div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-cyan-400/80 group-hover:text-cyan-300" />
        </button>
      </div>

      {/* WEB COMMANDER SETUP & CONNECTION PARAMETERS */}
      <div className="fintech-card rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white">مشخصات اتصال و آدرس پل ارتباطی (WebRequest API Endpoint)</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-slate-400 px-2">دامنه هدف:</span>
            <button
              type="button"
              onClick={() => setSelectedDomainEndpoint('ELLIOTT_IR')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedDomainEndpoint === 'ELLIOTT_IR'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              elliottneowave.ir
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomainEndpoint('SUBDOMAIN')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedDomainEndpoint === 'SUBDOMAIN'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ea.elliottneowave.ir
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomainEndpoint('AUTO')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedDomainEndpoint === 'AUTO'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              سرور ابری فعال
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Field 1: WebRequest URL */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">آدرس پل ارتباطی وب (InpCommanderServerUrl):</span>
              <button
                type="button"
                onClick={() => handleCopy(computedEndpointUrl, 'url')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-cyan-300 flex items-center gap-1 transition-colors"
              >
                {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'url' ? 'کپی شد!' : 'کپی آدرس'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-cyan-300 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 break-all select-all font-bold">
              {computedEndpointUrl}
            </div>
          </div>

          {/* Field 2: API Security Token */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">کلید امنیتی احراز هویت (InpCommanderApiKey):</span>
              <button
                type="button"
                onClick={() => handleCopy(config.apiKeyToken, 'token')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition-colors"
              >
                {copiedField === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'token' ? 'کپی شد!' : 'کپی توکن'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-amber-300 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 break-all select-all">
              {config.apiKeyToken}
            </div>
          </div>
        </div>

        {/* 3-Step Guide */}
        <div className="bg-gradient-to-r from-cyan-950/20 via-slate-950/60 to-slate-950/40 border border-cyan-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 font-black text-sm">
              ۳ گام
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300">راهنمای اتصال متاتریدر ۵:</strong> در متاتریدر ۵ به مسیر <span className="text-amber-300 font-mono">Tools → Options → Expert Advisors</span> بروید، تیک <span className="text-emerald-300 font-mono">Allow WebRequest for listed URL</span> را فعال کرده و آدرس بالا را اضافه کنید.
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMt5Export}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black shrink-0 transition-colors flex items-center gap-1.5"
          >
            <span>دانلود اکسپرت متصل به وب</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LIVE REMOTE PARAMETERS TUNER & CONTROLLER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">تنظیمات و پارامترهای زنده ارسالی به متاتریدر ۵</h3>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
            بدون نیاز به ریستارت متاتریدر ۵ (On-the-Fly Overrides)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Strategy Mode & Frequency */}
          <div className="flex flex-col gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              مود فرکانس معاملاتی (Strategy Mode):
            </span>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setEditMode('HIGH_SPEED')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  editMode === 'HIGH_SPEED'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-amber-300">اسکلپر فرکانس بالا (High-Speed Scalper)</div>
                  <div className="text-[11px] text-slate-400">معاملات پرتعداد روی M1 با خروج زمانی سریع</div>
                </div>
                {editMode === 'HIGH_SPEED' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setEditMode('BALANCED')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  editMode === 'BALANCED'
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-cyan-300">تعادلی و سووینگ روزانه (Balanced Day-Trader)</div>
                  <div className="text-[11px] text-slate-400">تاییدیه‌های متوازن روندی و استراکچر قیمت</div>
                </div>
                {editMode === 'BALANCED' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => setEditMode('SNIPER')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  editMode === 'SNIPER'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-emerald-300">تک‌تیرانداز با دقت بالا (Sniper HD)</div>
                  <div className="text-[11px] text-slate-400">حداکثر سخت‌گیری در تاییدیه هوش مصنوعی و MTF</div>
                </div>
                {editMode === 'SNIPER' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Column 2: Lot Size & Max Positions */}
          <div className="flex flex-col gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              حجم ورودی و تعداد پوزیشن‌ها:
            </span>

            {/* Lot Size Slider / Presets */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">حجم پایه هر پوزیشن (Base Lot):</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{editLot.toFixed(2)} Lot</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0.05, 0.10, 0.20, 0.50, 1.00].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setEditLot(val)}
                    className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      editLot === val
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {val.toFixed(2)}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0.01"
                max="2.00"
                step="0.01"
                value={editLot}
                onChange={(e) => setEditLot(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer mt-1"
              />
            </div>

            {/* Max Concurrent Open Trades */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">حداکثر پوزیشن همزمان (Max Concurrent):</span>
                <span className="font-mono text-cyan-400 font-bold text-sm">{editMaxTrades} پوزیشن</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setEditMaxTrades(val)}
                    className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      editMaxTrades === val
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Stop-Loss Architecture & Shields */}
          <div className="flex flex-col gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              مدل حد ضرر منعطف و محافظ‌ها:
            </span>

            {/* SL Mode Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-400">معماری حد ضرر (SL Architecture):</label>
              <select
                value={editSlMode}
                onChange={(e: any) => setEditSlMode(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="DYNAMIC_ATR">۱. داینامیک ATR نوسان طلا (پیش‌فرض)</option>
                <option value="SWING_STRUCTURE">۲. سویینگ استراکچر کف/سقف</option>
                <option value="KIJUN_EQUILIBRIUM">۳. نقطه تعادل خط کیجنسن</option>
                <option value="AI_ADAPTIVE">۴. مخروط رگرسیون هوش مصنوعی</option>
                <option value="CUSTOM_FIXED">۵. حد ضرر و تارگت دلاری دستی</option>
              </select>
            </div>

            {/* Toggles for Trailing & News */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                <span className="text-xs text-slate-300">سپر محافظت اخبار (News Shield):</span>
                <input
                  type="checkbox"
                  checked={editNewsFilter}
                  onChange={(e) => setEditNewsFilter(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                <span className="text-xs text-slate-300">تریلینگ استاپ پویا (Trailing Stop):</span>
                <input
                  type="checkbox"
                  checked={editTrailing}
                  onChange={(e) => setEditTrailing(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Button: Push updates to server & MT5 */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            id="btn-apply-remote-settings"
            disabled={isSendingCommand}
            onClick={() =>
              sendCommand('UPDATE_SETTINGS', {
                strategyMode: editMode,
                baseLot: editLot,
                slMode: editSlMode,
                customSlUSD: editCustomSl,
                customTpUSD: editCustomTp,
                trailingStopActive: editTrailing,
                newsFilterActive: editNewsFilter,
                maxConcurrentTrades: editMaxTrades,
              })
            }
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>ارسال و اعمال آنی تغییرات به اکسپرت متاتریدر ۵</span>
          </button>
        </div>
      </div>

      {/* CONNECTED MT5 TERMINALS & LIVE OPEN POSITIONS MONITOR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">وضعیت تله‌متری زنده متاتریدر ۵ و پوزیشن‌های باز</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">ترمینال‌های متصل:</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {terminals.length} ترمینال فعال
            </span>
          </div>
        </div>

        {/* Terminal Telemetry Cards */}
        {terminals.map((term, idx) => (
          <div key={idx} className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 flex flex-col gap-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-amber-400 text-sm">
                  MT5
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white font-mono">حساب #{term.accountNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-sans">
                      {term.broker}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                      {term.currency}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{term.accountName} | نسخه اکسپرت: {term.eaVersion}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px]">نرخ اسپرد طلا:</span>
                  <span className="text-amber-300 font-bold">{term.currentSpread} pt ({((term.currentSpread || 15) / 10).toFixed(1)} pip)</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px]">قیمت لحظه‌ای طلا:</span>
                  <span className="text-cyan-300 font-bold">${term.goldBid ? term.goldBid.toFixed(2) : '2649.08'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px]">تاخیر پینگ (Latency):</span>
                  <span className="text-emerald-400 font-bold">{term.latencyMs || 35}ms</span>
                </div>
              </div>
            </div>

            {/* Financial Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-slate-900/95 to-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold">موجودی (Balance)</span>
                  <div className="w-2 h-2 rounded-full bg-amber-400/80 shadow-sm shadow-amber-400" />
                </div>
                <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
                  {term.currency === 'USC' ? `${term.balance.toLocaleString()} USC` : `$${term.balance.toLocaleString()}`}
                </span>
                {term.currency === 'USC' ? (
                  <span className="text-[10px] text-amber-400 font-mono font-bold">≈ ${(term.balance / 100).toFixed(2)} USD</span>
                ) : (
                  <span className="text-[10px] text-slate-400">حساب معاملاتی اصلی</span>
                )}
              </div>

              {/* Equity Card */}
              <div className="bg-gradient-to-br from-slate-900/95 to-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg shadow-emerald-950/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-300 font-bold">اکوئیتی (Equity)</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                </div>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tracking-tight">
                  {term.currency === 'USC' ? `${term.equity.toLocaleString()} USC` : `$${term.equity.toLocaleString()}`}
                </span>
                {term.currency === 'USC' ? (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">≈ ${(term.equity / 100).toFixed(2)} USD</span>
                ) : (
                  <span className="text-[10px] text-emerald-400/80 font-mono">سرمایه خالص زنده</span>
                )}
              </div>

              {/* Free Margin Card */}
              <div className="bg-gradient-to-br from-slate-900/95 to-cyan-950/30 border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg shadow-cyan-950/20 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-cyan-300 font-bold">مارجین آزاد (Margin)</span>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                </div>
                <span className="text-base sm:text-lg font-black text-cyan-300 font-mono tracking-tight">
                  {term.currency === 'USC' ? `${term.freeMargin.toLocaleString()} USC` : `$${term.freeMargin.toLocaleString()}`}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">سطح مارجین: {term.marginLevel ? term.marginLevel.toFixed(0) : '14000'}%</span>
              </div>

              {/* Floating P/L Card */}
              <div className={`bg-gradient-to-br from-slate-900/95 ${term.floatingProfit >= 0 ? 'to-emerald-950/40 border-emerald-500/40' : 'to-rose-950/40 border-rose-500/40'} border rounded-2xl p-4 flex flex-col gap-1.5 shadow-lg transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300 font-bold">سود شناور (Floating P/L)</span>
                  <div className={`w-2 h-2 rounded-full ${term.floatingProfit >= 0 ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping`} />
                </div>
                <span className={`text-base sm:text-lg font-black font-mono tracking-tight flex items-center gap-1 ${
                  term.floatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {term.floatingProfit >= 0 ? '+' : ''}
                  {term.currency === 'USC' ? `${term.floatingProfit.toFixed(2)} USC` : `$${term.floatingProfit.toFixed(2)}`}
                </span>
                <span className="text-[10px] text-slate-400">{term.openPositions ? term.openPositions.length : 0} پوزیشن فعال طلا</span>
              </div>
            </div>

            {/* Open Positions - Responsive Table on Desktop + Responsive Cards on Mobile */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">پوزیشن‌های باز جاری طلا در متاتریدر ۵:</span>
                <span className="text-[11px] text-slate-400 font-mono sm:hidden">نمایش کارتی بهینه‌شده موبایل</span>
              </div>

              {term.openPositions && term.openPositions.length > 0 ? (
                <>
                  {/* Desktop Table (hidden on mobile) */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">تیکت (Ticket)</th>
                          <th className="py-2.5 px-3">نماد</th>
                          <th className="py-2.5 px-3">نوع</th>
                          <th className="py-2.5 px-3">حجم (Lot)</th>
                          <th className="py-2.5 px-3">قیمت ورود</th>
                          <th className="py-2.5 px-3">قیمت جاری</th>
                          <th className="py-2.5 px-3">حد ضرر (SL)</th>
                          <th className="py-2.5 px-3">تارگت (TP)</th>
                          <th className="py-2.5 px-3">سود لحظه‌ای</th>
                          <th className="py-2.5 px-3">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {term.openPositions.map((pos, pIdx) => {
                          const isBuy = pos.type === 'BUY';
                          const isProfit = pos.profit >= 0;
                          return (
                            <tr key={pIdx} className="hover:bg-slate-900/50 transition-colors">
                              <td className="py-2.5 px-3 text-amber-300 font-bold">#{pos.ticket}</td>
                              <td className="py-2.5 px-3 font-sans font-bold text-slate-200">{pos.symbol}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  isBuy ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                }`}>
                                  {pos.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-cyan-300 font-bold">{pos.volume.toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-slate-300">${pos.openPrice.toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-white font-bold">${pos.currentPrice.toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-rose-400">${pos.sl ? pos.sl.toFixed(2) : '-'}</td>
                              <td className="py-2.5 px-3 text-emerald-400">${pos.tp ? pos.tp.toFixed(2) : '-'}</td>
                              <td className={`py-2.5 px-3 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isProfit ? '+' : ''}{pos.profit.toFixed(2)} {term.currency}
                              </td>
                              <td className="py-2.5 px-3 font-sans">
                                <button
                                  type="button"
                                  onClick={() => setConfirmCloseAllModal(true)}
                                  className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/40 text-[10px] font-bold transition-colors"
                                >
                                  بستن پوزیشن
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards (visible only on mobile) */}
                  <div className="grid grid-cols-1 gap-3 sm:hidden">
                    {term.openPositions.map((pos, pIdx) => {
                      const isBuy = pos.type === 'BUY';
                      const isProfit = pos.profit >= 0;
                      return (
                        <div key={pIdx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-amber-300 font-bold text-xs">#{pos.ticket}</span>
                              <span className="font-sans font-black text-white text-xs">{pos.symbol}</span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] font-mono ${
                              isBuy ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            }`}>
                              {pos.type} {pos.volume.toFixed(2)} Lot
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                              <span className="text-slate-400 block text-[10px] font-sans">قیمت ورود:</span>
                              <span className="text-slate-200 font-bold">${pos.openPrice.toFixed(2)}</span>
                            </div>
                            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                              <span className="text-slate-400 block text-[10px] font-sans">قیمت جاری:</span>
                              <span className="text-white font-black">${pos.currentPrice.toFixed(2)}</span>
                            </div>
                            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                              <span className="text-slate-400 block text-[10px] font-sans">حد ضرر (SL):</span>
                              <span className="text-rose-400 font-bold">${pos.sl ? pos.sl.toFixed(2) : '-'}</span>
                            </div>
                            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                              <span className="text-slate-400 block text-[10px] font-sans">تارگت (TP):</span>
                              <span className="text-emerald-400 font-bold">${pos.tp ? pos.tp.toFixed(2) : '-'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans">سود شناور معامله:</span>
                              <span className={`text-sm font-black font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isProfit ? '+' : ''}{pos.profit.toFixed(2)} {term.currency}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setConfirmCloseAllModal(true)}
                              className="px-4 py-2 rounded-xl bg-rose-900/70 active:bg-rose-800 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all min-h-[40px] flex items-center gap-1.5"
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>بستن معامله</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>در حال حاضر هیچ پوزیشن بازی روی طلا وجود ندارد. اکسپرت در حالت استندبای و جستجوی سیگنال قرار دارد.</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVITY & COMMAND AUDIT LOG */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white">لاگ رویدادها و فرامین ارسالی (Command & Telemetry Audit Stream)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">آخرین ۵۰ رویداد</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="py-2.5 px-3">زمان</th>
                <th className="py-2.5 px-3">عنوان اقدام</th>
                <th className="py-2.5 px-3">جزئیات و پیام</th>
                <th className="py-2.5 px-3">مبدا فرمان</th>
                <th className="py-2.5 px-3">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log, lIdx) => (
                <tr key={lIdx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('fa-IR')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{log.details}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.sender === 'WEB_DASHBOARD'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}>
                      {log.sender === 'WEB_DASHBOARD' ? 'داشبورد وب' : 'ترمینال متاتریدر ۵'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{log.status === 'SENT' ? 'ارسال شد' : 'اجرا شد'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
