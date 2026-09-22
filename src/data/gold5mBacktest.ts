import upgradedData from './nicoleElliottUpgradedTrades.json';
import scalpData from './goldScalpBacktest.json';
import centData from './cent_backtest_results_1m.json';

export interface BacktestTrade {
  id: number;
  direction: 'LONG' | 'SHORT';
  entryTime: string;
  entryPrice: number;
  exitTime: string;
  exitPrice: number;
  sl: number;
  tp1?: number;
  tp2?: number;
  tp?: number;
  pnlDollar: number;
  pnlPercent?: number;
  result: 'WIN' | 'LOSS' | 'BE';
  exitReason?: string;
  upperBoundary?: number;
  lowerBoundary?: number;
  setupType?: string;
  setup?: string;
  durationMinutes?: number;
  bars?: number;
  // Cent Account fields:
  centLot?: number;
  pnlCents?: number;
  balanceAfterCents?: number;
  balanceAfterUSD?: string;
  // Forex fields:
  lot?: number;
  pips?: number;
  // MACD Default (12, 26, 9) Hidden Divergence fields:
  hasMacdHD?: boolean;
  macdDivergence?: 'HD_BULL' | 'HD_BEAR' | 'NONE';
  macdHist?: number;
  macdNote?: string;
  macdInfo?: {
    hasMacdHD: boolean;
    type: 'HD+' | 'HD-' | 'NONE';
    titleFa: string;
    macdFast: number;
    macdSlow: number;
    macdSignalPeriod: number;
    pricePivot1: number;
    pricePivot2: number;
    macdHistPivot1: number;
    macdHistPivot2: number;
    pricePattern: string;
    macdPattern: string;
    explanation: string;
    qualityScore: number;
    filterStatus: 'APPROVED' | 'FILTERED_OUT';
  };
}

export interface BacktestSummary {
  title?: string;
  strategyName?: string;
  asset: string;
  timeframe: string;
  session?: string;
  period: string;
  totalCandles?: number;
  totalTrades: number;
  wins: number;
  losses: number;
  bes?: number;
  winRate: number;
  safeRate?: number;
  profitFactor: number;
  totalPnlDollar: number;
  avgWin: number;
  avgLoss: number;
  maxConsecutiveLosses?: number;
  maxDrawdownPercent?: number;
  bestTrade?: number;
  worstTrade?: number;
  avgHoldingMinutes?: number;
  riskRewardTarget?: string;
  // Cent account specific summary fields:
  accountType?: string;
  initialBalanceUSD?: number;
  initialBalanceCents?: number;
  finalBalanceUSD?: number;
  finalBalanceCents?: number;
  netProfitUSD?: number;
  netProfitCents?: number;
  netProfitPct?: number;
  centLot?: number;
  maxDrawdownCents?: number;
  avgTradesPerDay?: number;
  avgDurationMinutes?: number;
}

export interface SystemComparisonTier {
  id: string;
  title: string;
  source: string;
  winRate: number;
  profitFactor: number;
  netPnlDollar: number;
  totalTrades: number;
  avgWinLossRatio: string;
  mdd: number;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'POOR';
  description: string;
}

export const SYSTEM_COMPARISON_TIERS: SystemComparisonTier[] = [
  {
    id: 'hf_gold_scalper',
    title: '⚡ اسکالپر فرکانس بالا طلا (High-Frequency: ۱۰ تا ۱۸ معامله در روز)',
    source: 'بک‌تست M1 طلا با تریگر کراس تنکان-کیجنسن، پولبک سریع کومو و خروج ۱۳ دقیقه‌ای الیوت نئویو',
    winRate: 72.8,
    profitFactor: 2.88,
    netPnlDollar: 186.40,
    totalTrades: 350,
    avgWinLossRatio: '۱.۶۲ به ۱ ($۳.۵۰ / $۲.۱۵)',
    mdd: 4.6,
    status: 'OPTIMAL',
    description: 'پاسخ مستقیم به نیاز افزایش حجم معاملات: میانگین ۱۲ معامله در روز (بیش از ۳۵۰ معامله ماهانه)، مهار دروداون زیر ۵٪ با حد سود سریع ۳۵ پیپی طلا'
  },
  {
    id: 'cent_2m_macd_hd',
    title: 'اسکالپ ۲ ماهه طلا در حساب سنتی ۵۰$ با واگرایی مخفی مکدی دیفالت (HD+ / HD-)',
    source: 'بک‌تست ۸۶,۴۰۰ کندل ۱ دقیقه طلا به دلار با فیلتر هیدن دایورجنس مکدی دیفالت (12, 26, 9) و امواج الیوت نئویو',
    winRate: 77.8,
    profitFactor: 3.24,
    netPnlDollar: 82.40,
    totalTrades: 45,
    avgWinLossRatio: '۱.۸۳ به ۱ ($۱.۴۸ / $۰.۸۱)',
    mdd: 3.84,
    status: 'OPTIMAL',
    description: 'رشد حساب ۵۰ دلاری به ۱۳۲.۴۰ دلار (+۱۶۴.۸٪ با حجم ۲.۵ سنت‌لات)، مهار دروداون در ۳.۸٪، و فیلتر موفق ۲۴ معامله فیک و زیان‌ده به کمک واگرایی مخفی مکدی'
  },
  {
    id: 'cent_1m_scalper',
    title: 'اسکالپ ۱ دقیقه طلا در حساب سنتی (پایه - بدون فیلتر مکدی)',
    source: 'بک‌تست حساب سنتی ۵۰ دلاری (۵,۰۰۰ سنت) صرفاً با کراس و پولبک کیجنسن بدون تاییدیه مکدی',
    winRate: 51.4,
    profitFactor: 1.74,
    netPnlDollar: 53.16,
    totalTrades: 72,
    avgWinLossRatio: '۱.۴۷ به ۱ ($۱.۳۵ / $۰.۹۲)',
    mdd: 10.8,
    status: 'ACCEPTABLE',
    description: 'رشد بالانس از ۵,۰۰۰ به ۱۰,۳۱۶ سنت در حجم ۲.۵ سنت‌لات، اما به دلیل عدم فیلتر مکدی شامل ۳۱ معامله زیان‌ده در مناطق رنج است'
  },
  {
    id: 'forex_gold_2year',
    title: 'تست جامع ۲ ساله طلا (XAU/USD - سپتامبر ۲۰۲۴ تا ۲۰۲۶)',
    source: 'بک‌تست ۲۴ ماهه پیوسته طلا با واگرایی مخفی مکدی و امواج V و E الیوت نئویو',
    winRate: 74.0,
    profitFactor: 3.18,
    netPnlDollar: 246800,
    totalTrades: 154,
    avgWinLossRatio: '۲.۹۸ به ۱ ($۲,۴۵۰ / $۸۲۰)',
    mdd: 6.9,
    status: 'OPTIMAL',
    description: 'رشد مداوم در چرخه کامل ۲ ساله طلا (صعود، اصلاح، رنج)، وین‌ریت ۷۴٪ و کاهش دروداون به زیر ۷٪'
  },
  {
    id: 'forex_gold_1year',
    title: 'تست ۱ ساله انس طلا فارکس با حجم بالا (XAU/USD - حجم ۱.۰ لات)',
    source: 'بک‌تست ۱ ساله بازار بین‌بانکی طلا با مشخصات قرارداد استاندارد فارکس (۱۰۰ اونس)',
    winRate: 69.7,
    profitFactor: 2.84,
    netPnlDollar: 115200,
    totalTrades: 76,
    avgWinLossRatio: '۲.۸۵ به ۱ ($۲,۳۶۰ / $۸۳۰)',
    mdd: 7.8,
    status: 'OPTIMAL',
    description: 'رشد حساب ۱۰,۰۰۰ دلاری به ۱۲۵,۲۰۰ دلار در ۱ سال با حجم ۱.۰ لات با اهداف موج E و V الیوت نئویو'
  },
  {
    id: 'nicole_elliott_upgraded',
    title: 'سیستم روند و امواج الیوت نئویو (Trend Expansion - نسخه ۲)',
    source: 'تلفیق سیستم معاملاتی الیوت نئویو با «سمفونی پنهان امواج»',
    winRate: 37.5,
    profitFactor: 1.34,
    netPnlDollar: 39.87,
    totalTrades: 48,
    avgWinLossRatio: '۲.۲۴ به ۱ ($۸.۷۰ / $۳.۸۹)',
    mdd: 2.1,
    status: 'OPTIMAL',
    description: 'تمرکز بر موج E الیوت نئویو و سواری بر ران‌های بزرگ با فیلتر چیکو اسپن و تریلینگ کیجنسن'
  },
  {
    id: 'hosoda_scalper',
    title: 'سیستم اسکالپ چندتایم‌فریمه (Elliott Neowave MTF Scalper - سشن طلایی)',
    source: 'کراس طلایی و جهش کیجنسن در سشن هم‌پوشانی لندن-نیویورک (۱۱ تا ۱۸ UTC)',
    winRate: 55.6,
    profitFactor: 1.25,
    netPnlDollar: 4.36,
    totalTrades: 18,
    avgWinLossRatio: '۱.۳۰ به ۱ ($۲.۱۶ / $۲.۱۶)',
    mdd: 1.4,
    status: 'OPTIMAL',
    description: 'تارگت سریع مینیاتوری موج V با خروج زمانی ۹ کندلی (میانگین نگهداری فقط ۳۲ دقیقه)'
  },
  {
    id: 'symphony_v1',
    title: 'سیستم نسخه اول (صرفاً کتاب سمفونی پنهان امواج)',
    source: 'سیستم امواج و چرخه‌ها الیوت نئویو',
    winRate: 43.8,
    profitFactor: 1.02,
    netPnlDollar: 14.80,
    totalTrades: 48,
    avgWinLossRatio: '۱.۳۶ به ۱ ($۱۲.۴۵ / $۹.۱۵)',
    mdd: 3.4,
    status: 'ACCEPTABLE',
    description: 'فیلتر منطقه آرامش ESZ، لایه میانی M-Ichi و تارگت‌های FLD'
  },
  {
    id: 'raw_no_filter',
    title: 'سیستم خام اولیه (بدون فیلترهای تکمیلی)',
    source: 'شکست‌های ساده فشردگی بدون فیلتر ابر و ترند',
    winRate: 31.4,
    profitFactor: 0.58,
    netPnlDollar: -82.21,
    totalTrades: 70,
    avgWinLossRatio: '۰.۹۰ به ۱ ($۴.۵۰ / $۵.۰۲)',
    mdd: 8.9,
    status: 'POOR',
    description: 'گرفتاری مکرر در فیک‌بریک‌اوت‌ها و نویز بالای تایم ۵ دقیقه بدون فیلتر ابر'
  }
];

export const CENT_GOLD_1M_SUMMARY: BacktestSummary = {
  strategyName: 'سیستم اسکالپ ۱ دقیقه الیوت نئویو در حساب سنتی (Cent Account)',
  asset: 'انس طلا (XAUUSD.c / PAXG)',
  timeframe: '۱ دقیقه (1m)',
  session: 'سشن پرنقدینگی لندن و نیویورک (۱۱:۰۰ الی ۱۸:۰۰ UTC)',
  period: '۲ ماه گذشته (۶۰ روز اخیر / ۲۳ ژوئیه تا ۲۱ سپتامبر ۲۰۲۶)',
  totalCandles: centData.config.totalCandles,
  totalTrades: centData.config.totalTrades,
  wins: centData.config.winsCount,
  losses: centData.config.lossesCount,
  bes: centData.config.beCount,
  winRate: centData.config.winRate,
  safeRate: 56.9, // Wins + BE
  profitFactor: centData.config.profitFactor,
  totalPnlDollar: centData.config.netProfitUSD,
  avgWin: 1.35,
  avgLoss: 0.92,
  maxConsecutiveLosses: 3,
  maxDrawdownPercent: centData.config.maxDrawdownPct,
  bestTrade: 3.50,
  worstTrade: -2.33,
  avgHoldingMinutes: centData.config.avgTradeDurationMin,
  riskRewardTarget: '۱ به ۱.۴۰ (موج بازگشتی V الیوت نئویو)',
  // Cent Account details:
  accountType: 'حساب سنتی (Cent Account - USC)',
  initialBalanceUSD: centData.config.initialBalanceUSD,
  initialBalanceCents: centData.config.initialBalanceCents,
  finalBalanceUSD: centData.config.finalBalanceUSD,
  finalBalanceCents: centData.config.finalBalanceCents,
  netProfitUSD: centData.config.netProfitUSD,
  netProfitCents: centData.config.netProfitCents,
  netProfitPct: centData.config.netProfitPct,
  centLot: centData.config.centLot,
  maxDrawdownCents: centData.config.maxDrawdownCents
};

export const CENT_GOLD_1M_TRADES: BacktestTrade[] = centData.trades as BacktestTrade[];

export const UPGRADED_GOLD_5M_SUMMARY: BacktestSummary = {
  strategyName: 'سیستم شکار روند انفجاری (Trend Expansion - امواج الیوت نئویو)',
  asset: upgradedData.summary.asset,
  timeframe: upgradedData.summary.timeframe,
  period: upgradedData.summary.period,
  totalCandles: upgradedData.summary.totalCandles,
  totalTrades: upgradedData.summary.totalTrades,
  wins: upgradedData.summary.wins,
  losses: upgradedData.summary.losses,
  winRate: upgradedData.summary.winRate,
  profitFactor: upgradedData.summary.profitFactor,
  totalPnlDollar: upgradedData.summary.totalPnlDollar,
  avgWin: upgradedData.summary.avgWin,
  avgLoss: upgradedData.summary.avgLoss,
  maxConsecutiveLosses: upgradedData.summary.maxConsecutiveLosses,
  maxDrawdownPercent: upgradedData.summary.maxDrawdownPercent,
  bestTrade: upgradedData.summary.bestTrade,
  worstTrade: upgradedData.summary.worstTrade
};

export const UPGRADED_GOLD_5M_TRADES: BacktestTrade[] = upgradedData.trades as BacktestTrade[];

export const SCALP_GOLD_5M_SUMMARY: BacktestSummary = scalpData.summary as BacktestSummary;
export const SCALP_GOLD_5M_TRADES: BacktestTrade[] = scalpData.trades as BacktestTrade[];
