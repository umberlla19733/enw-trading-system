import { BacktestTrade } from '../data/gold5mBacktest';
import { Gold1m2MonthTrade, GOLD_1M_2MONTH_DEFAULT_BACKTEST } from '../data/gold1mDollar2MonthBacktest';

export type StopLossMode = 
  | 'DYNAMIC_ATR'           // 1. Dynamic ATR Volatility Adaptive (1.2x - 3.5x ATR)
  | 'SWING_STRUCTURE'       // 2. Structural Swing High/Low + Safety Buffer
  | 'KIJUN_EQUILIBRIUM'     // 3. Dynamic Kijun-sen Equilibrium Line
  | 'CUSTOM_FIXED'          // 4. Custom Dollar / Pip Distance (Manual / Free-form)
  | 'AI_ADAPTIVE_CONE';     // 5. AI Confidence & Regression Cone Adaptive SL

export interface StopLossConfig {
  mode: StopLossMode;
  atrMultiplier: number;        // e.g. 1.2 to 4.5
  swingLookbackBars: number;    // e.g. 5 to 25 bars
  swingBufferUSD: number;       // e.g. $0.20 to $1.20
  customSlUSD: number;          // e.g. $1.00 to $10.00
  customTpUSD: number;          // e.g. $2.00 to $20.00
  enableTrailingStop: boolean;  // Dynamic Trailing
  trailingStartUSD: number;     // Start trailing when profit reaches $X.XX
  trailingStepUSD: number;      // Trail by $X.XX steps
  enableBreakEven: boolean;     // Auto Break-Even
  breakEvenTriggerUSD: number;  // Trigger BE at +$X.XX profit
  breakEvenBufferUSD: number;   // Lock +$X.XX profit upon BE
  accountBalanceUSD: number;    // Balance for sizing
  riskPercent: number;          // Risk % per trade
  baseLot: number;              // Fixed lot fallback
}

export interface StopLossTestTradeResult {
  id: string;
  date: string;
  type: 'BUY' | 'SELL';
  setup: string;
  entryPrice: number;
  initialSL: number;
  initialTP: number;
  slDistanceUSD: number;
  tpDistanceUSD: number;
  exitPrice: number;
  exitReason: 'TP_HIT' | 'SL_HIT' | 'TRAILING_STOP' | 'BREAK_EVEN' | 'TIME_EXIT' | 'NEWS_PROTECT';
  result: 'WIN' | 'LOSS' | 'BE';
  pnlUSD: number;
  pnlPoints: number;
  pnlPercent: number;
  lotSize: number;
  maxFavorableExcursionUSD: number; // MFE (Max floating profit reached)
  maxAdverseExcursionUSD: number;   // MAE (Max floating drawdown reached)
  whipsawAvoided: boolean;          // Did flexible SL prevent a false stop-out?
  durationBars: number;
}

export interface StopLossTestSummary {
  mode: StopLossMode;
  config: StopLossConfig;
  totalTrades: number;
  wins: number;
  losses: number;
  bes: number;
  winRate: number;
  profitFactor: number;
  initialBalanceUSD: number;
  finalBalanceUSD: number;
  netProfitUSD: number;
  totalRoiPct: number;
  maxDrawdownUSD: number;
  maxDrawdownPct: number;
  grossProfitUSD: number;
  grossLossUSD: number;
  avgWinUSD: number;
  avgLossUSD: number;
  riskRewardRatio: number;
  whipsawsAvoidedCount: number;      // Number of trades saved by flexible SL
  whipsawAvoidedProfitUSD: number;   // Extra profit generated from saved trades
  avgTradeDurationBars: number;
  trades: StopLossTestTradeResult[];
  equityCurve: { tradeIndex: number; date: string; balance: number; drawdown: number }[];
}

export const DEFAULT_STOP_LOSS_CONFIGS: Record<StopLossMode, StopLossConfig> = {
  DYNAMIC_ATR: {
    mode: 'DYNAMIC_ATR',
    atrMultiplier: 2.2,
    swingLookbackBars: 10,
    swingBufferUSD: 0.40,
    customSlUSD: 3.20,
    customTpUSD: 4.80,
    enableTrailingStop: true,
    trailingStartUSD: 2.50,
    trailingStepUSD: 0.60,
    enableBreakEven: true,
    breakEvenTriggerUSD: 2.20,
    breakEvenBufferUSD: 0.40,
    accountBalanceUSD: 1000,
    riskPercent: 2.0,
    baseLot: 0.10
  },
  SWING_STRUCTURE: {
    mode: 'SWING_STRUCTURE',
    atrMultiplier: 2.0,
    swingLookbackBars: 12,
    swingBufferUSD: 0.50,
    customSlUSD: 3.80,
    customTpUSD: 6.00,
    enableTrailingStop: true,
    trailingStartUSD: 3.00,
    trailingStepUSD: 0.80,
    enableBreakEven: true,
    breakEvenTriggerUSD: 2.60,
    breakEvenBufferUSD: 0.50,
    accountBalanceUSD: 1000,
    riskPercent: 2.0,
    baseLot: 0.10
  },
  KIJUN_EQUILIBRIUM: {
    mode: 'KIJUN_EQUILIBRIUM',
    atrMultiplier: 1.8,
    swingLookbackBars: 26,
    swingBufferUSD: 0.45,
    customSlUSD: 2.90,
    customTpUSD: 4.50,
    enableTrailingStop: true,
    trailingStartUSD: 2.20,
    trailingStepUSD: 0.50,
    enableBreakEven: true,
    breakEvenTriggerUSD: 2.00,
    breakEvenBufferUSD: 0.30,
    accountBalanceUSD: 1000,
    riskPercent: 2.0,
    baseLot: 0.10
  },
  CUSTOM_FIXED: {
    mode: 'CUSTOM_FIXED',
    atrMultiplier: 1.8,
    swingLookbackBars: 10,
    swingBufferUSD: 0.40,
    customSlUSD: 3.50,
    customTpUSD: 5.50,
    enableTrailingStop: true,
    trailingStartUSD: 2.80,
    trailingStepUSD: 0.60,
    enableBreakEven: true,
    breakEvenTriggerUSD: 2.40,
    breakEvenBufferUSD: 0.40,
    accountBalanceUSD: 1000,
    riskPercent: 2.0,
    baseLot: 0.10
  },
  AI_ADAPTIVE_CONE: {
    mode: 'AI_ADAPTIVE_CONE',
    atrMultiplier: 2.4,
    swingLookbackBars: 14,
    swingBufferUSD: 0.60,
    customSlUSD: 3.60,
    customTpUSD: 5.80,
    enableTrailingStop: true,
    trailingStartUSD: 2.60,
    trailingStepUSD: 0.50,
    enableBreakEven: true,
    breakEvenTriggerUSD: 2.30,
    breakEvenBufferUSD: 0.50,
    accountBalanceUSD: 1000,
    riskPercent: 2.0,
    baseLot: 0.10
  }
};

/**
 * Deterministic pseudo-random generator with seed
 */
function createPrng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Run a comprehensive backtest simulation across all trades in the dataset
 * using the specified flexible Stop Loss configuration.
 */
export function runStopLossBacktest(config: StopLossConfig): StopLossTestSummary {
  const baseTrades = GOLD_1M_2MONTH_DEFAULT_BACKTEST.trades;
  const initialBalance = config.accountBalanceUSD || 1000;
  let currentBalance = initialBalance;
  let peakBalance = initialBalance;
  let maxDrawdownUSD = 0;
  let maxDrawdownPct = 0;
  let grossProfitUSD = 0;
  let grossLossUSD = 0;
  let wins = 0;
  let losses = 0;
  let bes = 0;
  let whipsawsAvoidedCount = 0;
  let whipsawAvoidedProfitUSD = 0;
  let totalDurationBars = 0;

  const testTrades: StopLossTestTradeResult[] = [];
  const equityCurve: { tradeIndex: number; date: string; balance: number; drawdown: number }[] = [
    { tradeIndex: 0, date: 'Start', balance: initialBalance, drawdown: 0 }
  ];

  // Base ATR simulation on Gold M1 (typical M1 ATR is $1.20 - $1.80)
  const baseM1ATR = 1.45;

  baseTrades.forEach((rawTrade, idx) => {
    const prng = createPrng(idx * 7919 + 42);
    const isBuy = rawTrade.type === 'BUY';
    const entry = rawTrade.entryPrice;

    // 1. Calculate flexible SL distance based on chosen mode
    let slDistance = 2.40; // baseline tight scalp
    let tpDistance = 3.80; // baseline TP

    switch (config.mode) {
      case 'DYNAMIC_ATR': {
        const volatilityFactor = 0.85 + prng() * 0.4; // simulated market volatility regime
        slDistance = Math.round((baseM1ATR * config.atrMultiplier * volatilityFactor) * 100) / 100;
        tpDistance = Math.round((slDistance * 1.6) * 100) / 100;
        break;
      }
      case 'SWING_STRUCTURE': {
        // Swing low/high lookback distance + buffer
        const structureDepth = 1.80 + (config.swingLookbackBars / 10) * 1.10;
        slDistance = Math.round((structureDepth + config.swingBufferUSD) * 100) / 100;
        tpDistance = Math.round((slDistance * 1.55) * 100) / 100;
        break;
      }
      case 'KIJUN_EQUILIBRIUM': {
        // Distance to 26/45 Kijun equilibrium line + buffer
        const kijunDistance = 2.10 + prng() * 0.90;
        slDistance = Math.round((kijunDistance + config.swingBufferUSD) * 100) / 100;
        tpDistance = Math.round((slDistance * 1.65) * 100) / 100;
        break;
      }
      case 'CUSTOM_FIXED': {
        slDistance = config.customSlUSD;
        tpDistance = config.customTpUSD;
        break;
      }
      case 'AI_ADAPTIVE_CONE': {
        // AI Confidence cone: when confidence is high, tighter SL with larger TP; when low, wider SL
        const confidence = rawTrade.mlConfidence || 85;
        const confidenceScale = (100 - confidence) / 25; // 0.4 to 1.2
        slDistance = Math.round((2.60 + confidenceScale * 1.20) * 100) / 100;
        tpDistance = Math.round((slDistance * 1.75) * 100) / 100;
        break;
      }
    }

    // Bound sanity limits on Gold ($0.80 min to $12.00 max)
    slDistance = Math.max(0.80, Math.min(12.00, slDistance));
    tpDistance = Math.max(1.50, Math.min(25.00, tpDistance));

    const initialSL = isBuy ? entry - slDistance : entry + slDistance;
    const initialTP = isBuy ? entry + tpDistance : entry - tpDistance;

    // 2. Simulate price movement trajectory for this trade
    // Max Favorable Excursion (MFE) and Max Adverse Excursion (MAE)
    const baseMFE = Math.abs(rawTrade.exitPrice - rawTrade.entryPrice) * (rawTrade.result === 'WIN' ? 1.2 : 0.6) + prng() * 1.5;
    const baseMAE = (rawTrade.result === 'LOSS' ? 2.6 : 1.2) + prng() * 1.4;

    const mfeUSD = Math.round(baseMFE * 100) / 100;
    const maeUSD = Math.round(baseMAE * 100) / 100;

    let exitPrice = entry;
    let exitReason: StopLossTestTradeResult['exitReason'] = 'TP_HIT';
    let result: 'WIN' | 'LOSS' | 'BE' = 'WIN';
    let whipsawAvoided = false;
    let durationBars = Math.max(3, rawTrade.durationBars || Math.floor(5 + prng() * 12));

    // Check if the original tight SL (e.g. $2.40) was triggered, but the new flexible SL survived
    const tightSlWhipsaw = maeUSD >= 2.40 && maeUSD < slDistance;

    if (maeUSD >= slDistance) {
      // Adverse price exceeded our flexible SL distance -> True Stop Loss hit
      exitPrice = initialSL;
      exitReason = 'SL_HIT';
      result = 'LOSS';
    } else if (config.enableBreakEven && mfeUSD >= config.breakEvenTriggerUSD) {
      // Break-Even was activated!
      if (mfeUSD >= tpDistance) {
        // Trade reached full Take Profit
        exitPrice = initialTP;
        exitReason = 'TP_HIT';
        result = 'WIN';
      } else if (config.enableTrailingStop && mfeUSD >= config.trailingStartUSD) {
        // Trailing stop locked in profit
        const lockedProfitUSD = Math.max(config.breakEvenBufferUSD, mfeUSD - config.trailingStepUSD);
        exitPrice = isBuy ? entry + lockedProfitUSD : entry - lockedProfitUSD;
        exitReason = 'TRAILING_STOP';
        result = 'WIN';
      } else {
        // Exited around Break-Even buffer
        exitPrice = isBuy ? entry + config.breakEvenBufferUSD : entry - config.breakEvenBufferUSD;
        exitReason = 'BREAK_EVEN';
        result = 'BE';
      }

      if (tightSlWhipsaw) {
        whipsawAvoided = true;
        whipsawsAvoidedCount++;
      }
    } else if (mfeUSD >= tpDistance) {
      // Reached full TP without prior stopout
      exitPrice = initialTP;
      exitReason = 'TP_HIT';
      result = 'WIN';

      if (tightSlWhipsaw) {
        whipsawAvoided = true;
        whipsawsAvoidedCount++;
      }
    } else {
      // Time turnover exit
      const partialMove = (mfeUSD - maeUSD) * 0.6;
      exitPrice = isBuy ? entry + partialMove : entry - partialMove;
      exitReason = 'TIME_EXIT';
      result = partialMove > 0.3 ? 'WIN' : partialMove < -0.3 ? 'LOSS' : 'BE';
    }

    // 3. Position Sizing & PnL calculation
    // Calculate lot size based on fixed risk percentage or fixed base lot
    const pointValuePerLot = 100; // $1.00 move on 1.0 standard lot = $100.00 (or $1.00 on 0.01 lot)
    const riskAmountUSD = currentBalance * (config.riskPercent / 100);
    let calculatedLot = config.baseLot || 0.10;

    // Optional dynamic risk sizing:
    if (config.riskPercent > 0 && slDistance > 0) {
      const riskLot = riskAmountUSD / (slDistance * pointValuePerLot);
      calculatedLot = Math.max(0.01, Math.min(2.0, Math.round(riskLot * 100) / 100));
    }

    const priceDeltaUSD = isBuy ? (exitPrice - entry) : (entry - exitPrice);
    const grossPnl = priceDeltaUSD * pointValuePerLot * calculatedLot;
    const commission = 0.50 * calculatedLot * 2; // broker commission roundtrip
    const pnlUSD = Math.round((grossPnl - commission) * 100) / 100;
    const pnlPoints = Math.round(priceDeltaUSD * 10) / 10;
    const pnlPercent = parseFloat(((pnlUSD / currentBalance) * 100).toFixed(2));

    currentBalance = Math.round((currentBalance + pnlUSD) * 100) / 100;
    if (currentBalance > peakBalance) peakBalance = currentBalance;

    const currentDD = peakBalance - currentBalance;
    const currentDDPct = peakBalance > 0 ? (currentDD / peakBalance) * 100 : 0;
    if (currentDD > maxDrawdownUSD) maxDrawdownUSD = currentDD;
    if (currentDDPct > maxDrawdownPct) maxDrawdownPct = currentDDPct;

    if (result === 'WIN') {
      wins++;
      grossProfitUSD += Math.max(0, pnlUSD);
    } else if (result === 'LOSS') {
      losses++;
      grossLossUSD += Math.abs(pnlUSD);
    } else {
      bes++;
      if (pnlUSD > 0) grossProfitUSD += pnlUSD;
      else grossLossUSD += Math.abs(pnlUSD);
    }

    if (whipsawAvoided) {
      whipsawAvoidedProfitUSD += Math.max(0, pnlUSD);
    }

    totalDurationBars += durationBars;

    testTrades.push({
      id: `SL-TR-${idx + 1}`,
      date: rawTrade.entryDate,
      type: rawTrade.type,
      setup: rawTrade.setup,
      entryPrice: entry,
      initialSL,
      initialTP,
      slDistanceUSD: slDistance,
      tpDistanceUSD: tpDistance,
      exitPrice,
      exitReason,
      result,
      pnlUSD,
      pnlPoints,
      pnlPercent,
      lotSize: calculatedLot,
      maxFavorableExcursionUSD: mfeUSD,
      maxAdverseExcursionUSD: maeUSD,
      whipsawAvoided,
      durationBars
    });

    if ((idx + 1) % 5 === 0 || idx === baseTrades.length - 1) {
      equityCurve.push({
        tradeIndex: idx + 1,
        date: rawTrade.entryDate,
        balance: currentBalance,
        drawdown: Math.round(currentDDPct * 10) / 10
      });
    }
  });

  const totalTrades = testTrades.length;
  const winRate = totalTrades > 0 ? Number(((wins / totalTrades) * 100).toFixed(1)) : 0;
  const profitFactor = grossLossUSD > 0 ? Number((grossProfitUSD / grossLossUSD).toFixed(2)) : 99.0;
  const netProfitUSD = Number((currentBalance - initialBalance).toFixed(2));
  const totalRoiPct = Number(((netProfitUSD / initialBalance) * 100).toFixed(1));
  const avgWinUSD = wins > 0 ? Number((grossProfitUSD / wins).toFixed(2)) : 0;
  const avgLossUSD = losses > 0 ? Number((grossLossUSD / losses).toFixed(2)) : 0;
  const riskRewardRatio = avgLossUSD > 0 ? Number((avgWinUSD / avgLossUSD).toFixed(2)) : 2.0;
  const avgTradeDurationBars = totalTrades > 0 ? Number((totalDurationBars / totalTrades).toFixed(1)) : 10;

  return {
    mode: config.mode,
    config,
    totalTrades,
    wins,
    losses,
    bes,
    winRate,
    profitFactor,
    initialBalanceUSD: initialBalance,
    finalBalanceUSD: currentBalance,
    netProfitUSD,
    totalRoiPct,
    maxDrawdownUSD: Number(maxDrawdownUSD.toFixed(2)),
    maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
    grossProfitUSD: Number(grossProfitUSD.toFixed(2)),
    grossLossUSD: Number(grossLossUSD.toFixed(2)),
    avgWinUSD,
    avgLossUSD,
    riskRewardRatio,
    whipsawsAvoidedCount,
    whipsawAvoidedProfitUSD: Number(whipsawAvoidedProfitUSD.toFixed(2)),
    avgTradeDurationBars,
    trades: testTrades,
    equityCurve
  };
}

/**
 * Compare all 5 Stop Loss modes side-by-side with identical starting conditions
 */
export function generateStopLossComparisonReport(baseConfig?: Partial<StopLossConfig>) {
  const modes: StopLossMode[] = ['DYNAMIC_ATR', 'SWING_STRUCTURE', 'KIJUN_EQUILIBRIUM', 'CUSTOM_FIXED', 'AI_ADAPTIVE_CONE'];
  
  return modes.map(mode => {
    const cfg: StopLossConfig = {
      ...DEFAULT_STOP_LOSS_CONFIGS[mode],
      ...(baseConfig || {})
    };
    return runStopLossBacktest(cfg);
  });
}
