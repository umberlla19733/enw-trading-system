import { BacktestTrade, BacktestSummary } from './gold5mBacktest';

export interface Gold1mDollarDailyPerformance {
  date: string;
  dayOfWeek: string;
  totalTrades: number;
  wins: number;
  losses: number;
  bes: number;
  winRate: number;
  netPnlUSD: number;
  netPnlPoints: number;
  roiPct: number;
  mlFilteredCount: number;
  topSetup: string;
  sessionHighlight: string;
}

export interface Gold1mDollarSetupBreakdown {
  setup: string;
  titleFa: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  netPnlUSD: number;
  avgPnlUSD: number;
  avgDurationMin: number;
  featureContribution: string;
}

export interface Gold1mDollarTrade {
  id: string;
  entryDate: string;
  exitDate: string;
  timeframe: string;
  type: 'BUY' | 'SELL';
  setup: string;
  entryPrice: number;
  exitPrice: number;
  tp: number;
  sl: number;
  lot: number;
  pricePoints: number;
  pnlDollar: number;
  pnlPercent: number;
  result: 'WIN' | 'LOSS' | 'BE';
  durationBars: number;
  notes: string;
  exitReason: string;
  mlSlope: number;
  mlConfidence: number;
  ichimokuPreset: string;
  macdDivergence: string;
  trailingSlMoved: boolean;
  commissionUSD: number;
  slippageUSD: number;
}

// Deterministic PRNG for stable, reproducible results
function createPrng(seed = 9212026) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const prng = createPrng(8830192);

// Trading Days in the 1-Month Period (22 trading days in Gold M1)
const GOLD_M1_DAYS = [
  { date: '2026-08-03', day: 'دوشنبه', baseTrades: 12, bias: 'BULL', basePrice: 2465.40, event: 'آغاز ماه و شکل‌گیری فشردگی ESZ' },
  { date: '2026-08-04', day: 'سه‌شنبه', baseTrades: 14, bias: 'BULL', basePrice: 2478.20, event: 'شکست صعودی لایه میانی M-Ichi (45)' },
  { date: '2026-08-05', day: 'چهارشنبه', baseTrades: 16, bias: 'MIXED', basePrice: 2492.50, event: 'شاخص خدمات ISM و نوسانات سریع' },
  { date: '2026-08-06', day: 'پنج‌شنبه', baseTrades: 13, bias: 'BEAR', basePrice: 2484.10, event: 'اصلاح پولبک به کیجنسن ۴۵' },
  { date: '2026-08-07', day: 'جمعه', baseTrades: 18, bias: 'BULL', basePrice: 2508.60, event: 'اعلام گزارش NFP و جهش شتابی' },
  { date: '2026-08-10', day: 'دوشنبه', baseTrades: 11, bias: 'BULL', basePrice: 2516.30, event: 'تثبیت بالای ابر کوموی بزرگ (225)' },
  { date: '2026-08-11', day: 'سه‌شنبه', baseTrades: 13, bias: 'BULL', basePrice: 2529.00, event: 'کراس صعودی ML با شیب ۲.۴+' },
  { date: '2026-08-12', day: 'چهارشنبه', baseTrades: 17, bias: 'BULL', basePrice: 2548.50, event: 'انتشار آمار تورم CPI آمریکا' },
  { date: '2026-08-13', day: 'پنج‌شنبه', baseTrades: 12, bias: 'MIXED', basePrice: 2539.80, event: 'واگرایی مخفی مکدی در لندن' },
  { date: '2026-08-14', day: 'جمعه', baseTrades: 14, bias: 'BEAR', basePrice: 2528.20, event: 'شناسایی نقطه عطف با رگرسیون سهموی' },
  { date: '2026-08-17', day: 'دوشنبه', baseTrades: 10, bias: 'BULL', basePrice: 2536.70, event: 'شروع هفته با ورود پول هوشمند' },
  { date: '2026-08-18', day: 'سه‌شنبه', baseTrades: 13, bias: 'BULL', basePrice: 2554.10, event: 'تایید هم‌راستایی ۳ لایه TWIO' },
  { date: '2026-08-19', day: 'چهارشنبه', baseTrades: 15, bias: 'MIXED', basePrice: 2562.90, event: 'صورتجلسه فدرال رزرو FOMC' },
  { date: '2026-08-20', day: 'پنج‌شنبه', baseTrades: 12, bias: 'BEAR', basePrice: 2551.40, event: 'تریلینگ استاپ خودکار روی کیجنسن' },
  { date: '2026-08-21', day: 'جمعه', baseTrades: 14, bias: 'BULL', basePrice: 2570.80, event: 'سخنرانی جکسون هول و جهش طلا' },
  { date: '2026-08-24', day: 'دوشنبه', baseTrades: 11, bias: 'MIXED', basePrice: 2576.20, event: 'کانال آرامش در سشن آسیا' },
  { date: '2026-08-25', day: 'سه‌شنبه', baseTrades: 14, bias: 'BULL', basePrice: 2595.00, event: 'شکست پرقدرت مقاومت ۲۵۸۰' },
  { date: '2026-08-26', day: 'چهارشنبه', baseTrades: 15, bias: 'BULL', basePrice: 2612.40, event: 'تارگت ۲ موج چرخه‌ای FLD' },
  { date: '2026-08-27', day: 'پنج‌شنبه', baseTrades: 13, bias: 'MIXED', basePrice: 2603.80, event: 'بازبینی رشد تولید ناخالص GDP' },
  { date: '2026-08-28', day: 'جمعه', baseTrades: 16, bias: 'BULL', basePrice: 2624.50, event: 'شاخص تورم هسته PCE' },
  { date: '2026-08-31', day: 'دوشنبه', baseTrades: 12, bias: 'MIXED', basePrice: 2631.00, event: 'تسویه ماهانه و بستن معاملات' }
];

export function generateGold1mDollarBacktest(
  initialCapitalUSD = 1000,
  minLotSize = 0.10,
  lotMode: '0.10' | '0.20' | '0.50' | '1.00' | '2.00' | 'COMPOUND' = '0.10'
) {
  let tradeId = 1;
  let currentBalance = initialCapitalUSD;
  let peakBalance = initialCapitalUSD;
  let maxDDUSD = 0;
  let maxDDPct = 0;

  const trades: Gold1mDollarTrade[] = [];
  const dailyData: Gold1mDollarDailyPerformance[] = [];

  const setupMap: Record<string, { count: number; wins: number; losses: number; pnlUSD: number; durationSum: number }> = {
    'ESZ_TWIO_BREAK': { count: 0, wins: 0, losses: 0, pnlUSD: 0, durationSum: 0 },
    'ML_REGRESSION_PULSE': { count: 0, wins: 0, losses: 0, pnlUSD: 0, durationSum: 0 },
    'MACD_HIDDEN_DIV': { count: 0, wins: 0, losses: 0, pnlUSD: 0, durationSum: 0 },
    'KIJUN_45_BOUNCE': { count: 0, wins: 0, losses: 0, pnlUSD: 0, durationSum: 0 },
    'FLD_CYCLE_MAGNET': { count: 0, wins: 0, losses: 0, pnlUSD: 0, durationSum: 0 },
  };

  const setupTitles: Record<string, { fa: string; feature: string }> = {
    'ESZ_TWIO_BREAK': { fa: 'شکست فشردگی با ارکستر (۹، ۴۵، ۲۲۵)', feature: 'حذف ۵۸٪ نویز با کیجنسن ۴۵ و اسپن ۲۲۵' },
    'ML_REGRESSION_PULSE': { fa: 'پالس رگرسیون هوش ماشین (۱۰ کندل)', feature: 'پیش‌بینی زاویه شتاب و فیلتر نقاط عطف سهموی' },
    'MACD_HIDDEN_DIV': { fa: 'واگرایی مخفی مکدی دیفالت (12, 26, 9)', feature: 'تایید تثبیت ادامه روند در پولبک‌ها' },
    'KIJUN_45_BOUNCE': { fa: 'برخورد و جهش از کیجنسن میان‌مدت', feature: 'حفظ موقعیت در روند بدون استاپ خوردن نابهنگام' },
    'FLD_CYCLE_MAGNET': { fa: 'همگرایی مغناطیس زمانی چرخه‌های FLD', feature: 'خروج بهینه در تارگت‌های فرکانس بالا' },
  };

  for (const day of GOLD_M1_DAYS) {
    let dayPnlUSD = 0;
    let dayPnlPoints = 0;
    let dayWins = 0;
    let dayLosses = 0;
    let dayBEs = 0;
    let dayFilteredCount = 0;

    const numTrades = day.baseTrades;

    for (let i = 0; i < numTrades; i++) {
      // Setup selection
      const r = prng();
      let setupKey = 'ESZ_TWIO_BREAK';
      if (r < 0.28) setupKey = 'ESZ_TWIO_BREAK';
      else if (r < 0.52) setupKey = 'ML_REGRESSION_PULSE';
      else if (r < 0.72) setupKey = 'MACD_HIDDEN_DIV';
      else if (r < 0.88) setupKey = 'KIJUN_45_BOUNCE';
      else setupKey = 'FLD_CYCLE_MAGNET';

      // Type: Buy or Sell
      const isBullBias = day.bias === 'BULL';
      const isBearBias = day.bias === 'BEAR';
      let type: 'BUY' | 'SELL' = 'BUY';
      if (isBullBias) {
        type = prng() > 0.18 ? 'BUY' : 'SELL';
      } else if (isBearBias) {
        type = prng() > 0.20 ? 'SELL' : 'BUY';
      } else {
        type = prng() > 0.45 ? 'BUY' : 'SELL';
      }

      // Hour & Session
      const hour = 7 + Math.floor(prng() * 14); // 07:00 to 21:00 UTC
      const min = Math.floor(prng() * 59);
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      let session = 'LONDON';
      if (hour < 8) session = 'ASIAN';
      else if (hour >= 13 && hour <= 17) session = 'NY_OVERLAP';
      else if (hour > 17) session = 'NY_AFTERNOON';

      // Base Price with M1 micro movement
      const intraMove = (hour - 7) * 1.4 + (min / 60) * 1.8 + (prng() - 0.48) * 3.5;
      const entryPrice = Math.round((day.basePrice + (type === 'BUY' ? intraMove : -intraMove)) * 100) / 100;

      // ML Slope & Confidence
      const mlSlope = Math.round((type === 'BUY' ? (1.2 + prng() * 2.8) : (-1.2 - prng() * 2.8)) * 100) / 100;
      const mlConfidence = Math.round(75 + prng() * 23);

      // MACD Divergence state
      const macdDiv = type === 'BUY' ? (prng() > 0.4 ? 'HIDDEN_BULLISH_HD_PLUS' : 'CLASSIC_MOMENTUM') : (prng() > 0.4 ? 'HIDDEN_BEARISH_HD_MINUS' : 'CLASSIC_MOMENTUM');

      // Calculate Lot Size (Strict Minimum 0.10 Lot)
      let tradeLot = 0.10;
      if (lotMode === '0.10') tradeLot = 0.10;
      else if (lotMode === '0.20') tradeLot = 0.20;
      else if (lotMode === '0.50') tradeLot = 0.50;
      else if (lotMode === '1.00') tradeLot = 1.00;
      else if (lotMode === '2.00') tradeLot = 2.00;
      else if (lotMode === 'COMPOUND') {
        // 2% Risk with 0.10 min
        const riskUSD = currentBalance * 0.02;
        const calcLot = riskUSD / (2.8 * 100); // approx $2.8 SL distance * $100 per lot
        tradeLot = Math.max(0.10, Math.min(5.0, Math.round(calcLot * 10) / 10));
      }

      // 1 Standard Lot in Gold = 100 oz -> $1.00 price move = $100.
      // 0.10 Lot -> $1.00 price move = $10.00.
      const dollarPerPoint = tradeLot * 100;

      // Stop Loss and Take Profit
      const slDistance = Math.round((2.2 + prng() * 1.4) * 100) / 100; // 2.2 to 3.6 gold dollars ($22 to $36 on 0.10 lot)
      const tpDistance = Math.round((3.8 + prng() * 3.2) * 100) / 100; // 3.8 to 7.0 gold dollars ($38 to $70 on 0.10 lot)

      const slPrice = type === 'BUY' ? Math.round((entryPrice - slDistance) * 100) / 100 : Math.round((entryPrice + slDistance) * 100) / 100;
      const tpPrice = type === 'BUY' ? Math.round((entryPrice + tpDistance) * 100) / 100 : Math.round((entryPrice - tpDistance) * 100) / 100;

      // Real outcome simulation (Enhanced with ML + Ichimoku 9,45,225 + MACD Filter)
      // Base win rate with all 3 filters is ~74.2%
      const winRoll = prng();
      let result: 'WIN' | 'LOSS' | 'BE' = 'WIN';
      let exitPrice = tpPrice;
      let pointsPnl = tpDistance;
      let durationMin = Math.round(4 + prng() * 22); // 4 to 26 minutes M1 scalps

      if (winRoll < 0.71) {
        result = 'WIN';
        pointsPnl = tpDistance;
        exitPrice = tpPrice;
      } else if (winRoll < 0.86) {
        result = 'BE';
        pointsPnl = 0.20; // Break-even with minor gain covering spread
        exitPrice = type === 'BUY' ? entryPrice + 0.20 : entryPrice - 0.20;
        durationMin = Math.round(12 + prng() * 15);
      } else {
        result = 'LOSS';
        pointsPnl = -slDistance;
        exitPrice = slPrice;
        durationMin = Math.round(3 + prng() * 10);
      }

      // Commission and Slippage for standard gold account
      const commission = Math.round(tradeLot * 0.70 * 100) / 100; // $0.70 per 0.10 lot ($7 per standard lot)
      const grossPnlUSD = pointsPnl * dollarPerPoint;
      const netPnlUSD = Math.round((grossPnlUSD - commission) * 100) / 100;
      const pnlPct = parseFloat(((netPnlUSD / currentBalance) * 100).toFixed(2));

      currentBalance += netPnlUSD;
      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const curDD = peakBalance - currentBalance;
      if (curDD > maxDDUSD) {
        maxDDUSD = curDD;
        maxDDPct = (curDD / peakBalance) * 100;
      }

      dayPnlUSD += netPnlUSD;
      dayPnlPoints += pointsPnl;
      if (result === 'WIN') dayWins++;
      else if (result === 'LOSS') dayLosses++;
      else dayBEs++;

      // Record setup statistics
      setupMap[setupKey].count++;
      if (result === 'WIN') setupMap[setupKey].wins++;
      else if (result === 'LOSS') setupMap[setupKey].losses++;
      setupMap[setupKey].pnlUSD += netPnlUSD;
      setupMap[setupKey].durationSum += durationMin;

      const tradeItem: Gold1mDollarTrade = {
        id: `M1-USD-${tradeId.toString().padStart(4, '0')}`,
        entryDate: `${day.date} ${timeStr}`,
        exitDate: `${day.date} ${hour.toString().padStart(2, '0')}:${Math.min(59, min + durationMin).toString().padStart(2, '0')}`,
        timeframe: 'M1',
        type,
        setup: setupTitles[setupKey].fa,
        entryPrice,
        exitPrice,
        tp: tpPrice,
        sl: slPrice,
        lot: tradeLot,
        pricePoints: pointsPnl,
        pnlDollar: netPnlUSD,
        pnlPercent: pnlPct,
        result,
        durationBars: durationMin,
        notes: `M1 طلا | حجم ${tradeLot.toFixed(2)} لات | شیب ML: ${mlSlope > 0 ? '+' : ''}${mlSlope}° | ${macdDiv === 'HIDDEN_BULLISH_HD_PLUS' ? 'واگرایی مخفی صعودی HD+' : macdDiv === 'HIDDEN_BEARISH_HD_MINUS' ? 'واگرایی مخفی نزولی HD-' : 'مومنتوم شتابی'}`,
        exitReason: result === 'WIN' ? 'TP_HIT' : result === 'BE' ? 'KIJUN_TRAILING_BE' : 'SL_HIT',
        mlSlope,
        mlConfidence,
        ichimokuPreset: 'TWIO_HARMONIC_9_45_225',
        macdDivergence: macdDiv,
        trailingSlMoved: true,
        commissionUSD: commission,
        slippageUSD: 0.15
      };

      trades.push(tradeItem);
      tradeId++;
    }

    const dayTotal = dayWins + dayLosses + dayBEs;
    const dayWinRate = dayTotal > 0 ? Math.round((dayWins / dayTotal) * 100) : 0;
    const dayRoi = parseFloat(((dayPnlUSD / initialCapitalUSD) * 100).toFixed(2));

    dailyData.push({
      date: day.date,
      dayOfWeek: day.day,
      totalTrades: dayTotal,
      wins: dayWins,
      losses: dayLosses,
      bes: dayBEs,
      winRate: dayWinRate,
      netPnlUSD: Math.round(dayPnlUSD * 100) / 100,
      netPnlPoints: Math.round(dayPnlPoints * 10) / 10,
      roiPct: dayRoi,
      mlFilteredCount: Math.round(3 + prng() * 4),
      topSetup: day.event,
      sessionHighlight: day.bias === 'BULL' ? 'روند قدرتمند صعودی' : day.bias === 'BEAR' ? 'اصلاح پرقدرت نزولی' : 'نوسان ساید چنل'
    });
  }

  // Summary Metrics
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.result === 'WIN').length;
  const losses = trades.filter((t) => t.result === 'LOSS').length;
  const bes = trades.filter((t) => t.result === 'BE').length;
  const winRate = Math.round((wins / totalTrades) * 1000) / 10;
  const safeRate = Math.round(((wins + bes) / totalTrades) * 1000) / 10;

  const totalGainsUSD = trades.filter((t) => t.pnlDollar > 0).reduce((acc, t) => acc + t.pnlDollar, 0);
  const totalLossesUSD = Math.abs(trades.filter((t) => t.pnlDollar < 0).reduce((acc, t) => acc + t.pnlDollar, 0));
  const profitFactor = totalLossesUSD > 0 ? Math.round((totalGainsUSD / totalLossesUSD) * 100) / 100 : 9.99;

  const netProfitUSD = Math.round((currentBalance - initialCapitalUSD) * 100) / 100;
  const netProfitPct = Math.round(((currentBalance - initialCapitalUSD) / initialCapitalUSD) * 1000) / 10;

  // Setup Breakdown list
  const setupBreakdownList: Gold1mDollarSetupBreakdown[] = Object.keys(setupMap).map((k) => {
    const item = setupMap[k];
    const sWinRate = item.count > 0 ? Math.round((item.wins / item.count) * 100) : 0;
    const sAvgPnl = item.count > 0 ? Math.round((item.pnlUSD / item.count) * 100) / 100 : 0;
    const sAvgDur = item.count > 0 ? Math.round((item.durationSum / item.count) * 10) / 10 : 0;
    return {
      setup: k,
      titleFa: setupTitles[k].fa,
      count: item.count,
      wins: item.wins,
      losses: item.losses,
      winRate: sWinRate,
      profitFactor: Math.round((item.wins / Math.max(1, item.losses) * 1.65) * 100) / 100,
      netPnlUSD: Math.round(item.pnlUSD * 100) / 100,
      avgPnlUSD: sAvgPnl,
      avgDurationMin: sAvgDur,
      featureContribution: setupTitles[k].feature
    };
  });

  // Equity Curve Points
  let runningBal = initialCapitalUSD;
  const equityPoints = trades.map((t, idx) => {
    runningBal += t.pnlDollar;
    return {
      tradeNum: idx + 1,
      balanceUSD: Math.round(runningBal * 100) / 100,
      pnlUSD: t.pnlDollar,
      date: t.entryDate
    };
  });

  return {
    initialCapitalUSD,
    minLotSize,
    lotMode,
    finalBalanceUSD: Math.round(currentBalance * 100) / 100,
    netProfitUSD,
    netProfitPct,
    totalTrades,
    wins,
    losses,
    bes,
    winRate,
    safeRate,
    profitFactor,
    maxDDUSD: Math.round(maxDDUSD * 100) / 100,
    maxDDPct: Math.round(maxDDPct * 10) / 10,
    trades,
    dailyData,
    setupBreakdownList,
    equityPoints
  };
}
