import React, { useState, useMemo } from 'react';
import { 
  CENT_GOLD_1M_SUMMARY,
  CENT_GOLD_1M_TRADES,
  UPGRADED_GOLD_5M_SUMMARY, 
  UPGRADED_GOLD_5M_TRADES, 
  SCALP_GOLD_5M_SUMMARY,
  SCALP_GOLD_5M_TRADES,
  SYSTEM_COMPARISON_TIERS,
  BacktestTrade,
  BacktestSummary 
} from '../data/gold5mBacktest';
import {
  FOREX_GOLD_1YEAR_RAW_TRADES,
  FOREX_1YEAR_GOLD_SUMMARY,
  FOREX_1YEAR_MONTHLY_DATA,
  ForexMonthlyPerformance
} from '../data/forexGold1YearBacktest';
import {
  FOREX_2YEAR_GOLD_SUMMARY,
  FOREX_2YEAR_MONTHLY_DATA,
  FOREX_GOLD_2YEAR_RAW_TRADES
} from '../data/forexGold2YearBacktest';
import {
  ENRICHED_CENT_GOLD_2M_TRADES,
  RAW_CENT_SUMMARY,
  MACD_ENHANCED_CENT_SUMMARY,
  EnrichedCentTrade
} from '../data/centGold2mMacdBacktest';
import {
  HF_1MONTH_SUMMARY,
  HF_1MONTH_TRADES,
  HF_1MONTH_DAILY,
  HF_1MONTH_SETUPS,
  HF_1MONTH_SESSIONS,
  ULTRA_HF_1MONTH_SUMMARY,
  ULTRA_HF_1MONTH_TRADES,
  ULTRA_HF_1MONTH_DAILY,
  ULTRA_HF_1MONTH_SETUPS,
  ULTRA_HF_1MONTH_SESSIONS
} from '../data/gold1MonthHfBacktest';
import { HfOneMonthSection } from './HfOneMonthSection';
import { Gold1mDollarSection } from './Gold1mDollarSection';
import { Gold1m2MonthSection } from './Gold1m2MonthSection';
import { GoldCent3MonthSection } from './GoldCent3MonthSection';
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  Zap,
  Layers,
  BookOpen,
  ShieldCheck,
  Compass,
  Sliders,
  Target,
  Flame,
  Coins,
  DollarSign,
  Info,
  Calendar,
  Sparkles,
  Gauge,
  BarChart3,
  ArrowUpRight,
  Percent,
  ChevronDown,
  ChevronUp,
  Filter,
  Activity,
  Check,
  Eye,
  EyeOff,
  Cpu
} from 'lucide-react';

interface BacktestViewProps {
  onOpenMt5Export?: () => void;
}

export const BacktestView: React.FC<BacktestViewProps> = ({ onOpenMt5Export }) => {
  const [activeStrategy, setActiveStrategy] = useState<'CENT_3MONTH' | 'GOLD_1M_2MONTH' | 'GOLD_1M_DOLLAR' | 'HF_1MONTH' | 'CENT_1M' | 'FOREX_1YEAR' | 'FOREX_2YEAR' | 'SCALP_5M' | 'TREND_5M'>('CENT_3MONTH');
  const [filterType, setFilterType] = useState<'ALL' | 'WIN' | 'LOSS' | 'BE'>('ALL');
  const [currencyMode, setCurrencyMode] = useState<'BOTH' | 'USC' | 'USD'>('BOTH');
  const [centLotMode, setCentLotMode] = useState<'1.0' | '2.0' | '2.5' | '3.0' | 'COMPOUND'>('2.5');

  // High-Frequency 1-Month (M1 Scalper v4.0) Interactive Controls
  const [hfSpeedMode, setHfSpeedMode] = useState<'TURBO_524' | 'FAST_238'>('TURBO_524');
  const [hfLotMode, setHfLotMode] = useState<'0.5' | '1.0' | '2.0' | '3.0' | '5.0' | 'COMPOUND'>('1.0');
  const [hfSetupFilter, setHfSetupFilter] = useState<'ALL' | 'TK_CROSS' | 'KIJUN_BOUNCE' | 'KUMO_BREAK' | 'MACD_SURGE' | 'TENKAN_MICRO' | 'CHIKOU_BREAK'>('ALL');
  const [showHfDailyDetails, setShowHfDailyDetails] = useState<boolean>(true);
  const [showHfSetupDetails, setShowHfSetupDetails] = useState<boolean>(true);
  
  // Default MACD (12, 26, 9) Hidden Divergence Controls
  const [macdFilterEnabled, setMacdFilterEnabled] = useState<boolean>(true);
  const [macdTypeFilter, setMacdTypeFilter] = useState<'ALL' | 'HD_PLUS' | 'HD_MINUS'>('ALL');
  const [showMacdEducationalDetails, setShowMacdEducationalDetails] = useState<boolean>(false);
  
  // Forex Gold 1-Year Interactive Controls
  const [forexLotMode, setForexLotMode] = useState<'0.5' | '1.0' | '1.5' | '2.0' | '3.0' | 'COMPOUND_2PCT'>('1.0');
  const [forexCapital, setForexCapital] = useState<number>(50);
  const [showMonthlyDetails, setShowMonthlyDetails] = useState<boolean>(true);

  // Dynamic Forex 1-Year Account recalculations based on position size & initial capital
  const computedForexData = useMemo(() => {
    const isCentAccount = forexCapital === 50;
    // In a cent account ($50 = 5,000 USC), 1 cent lot = 1 oz (moves $1.00/point = 100 USC), commission = $0.05
    // In a standard account ($10,000+), 1 standard lot = 100 oz (moves $100/point), commission = $5.00
    const pointValuePerLot = isCentAccount ? 1 : 100;
    const commissionPerLot = isCentAccount ? 0.05 : 5;

    let currentBalance = forexCapital;
    let peakBalance = forexCapital;
    let maxDD = 0;
    let maxDDPct = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let beCount = 0;

    const recomputedTrades: BacktestTrade[] = FOREX_GOLD_1YEAR_RAW_TRADES.map((t) => {
      let tradeLot = 1.0;
      if (forexLotMode === '0.5') tradeLot = 0.5;
      else if (forexLotMode === '1.0') tradeLot = 1.0;
      else if (forexLotMode === '1.5') tradeLot = 1.5;
      else if (forexLotMode === '2.0') tradeLot = 2.0;
      else if (forexLotMode === '3.0') tradeLot = 3.0;
      else if (forexLotMode === 'COMPOUND_2PCT') {
        const stopDistance = Math.max(2.0, Math.abs(t.entryPrice - t.sl));
        const riskDollar = currentBalance * 0.02;
        const lot = riskDollar / (stopDistance * pointValuePerLot);
        tradeLot = Math.max(0.1, Math.min(6.0, Math.round(lot * 10) / 10));
      }

      const grossPnl = t.result === 'BE' ? 0 : t.pricePoints * pointValuePerLot * tradeLot;
      const commission = t.result === 'BE' ? 0 : commissionPerLot * tradeLot;
      const pnlDollar = t.result === 'BE' ? 0 : Math.round((grossPnl - commission) * 100) / 100;
      const pnlPercent = parseFloat(((pnlDollar / currentBalance) * 100).toFixed(2));

      currentBalance += pnlDollar;
      if (pnlDollar > 0) {
        grossProfit += pnlDollar;
        winCount++;
      } else if (pnlDollar < 0) {
        grossLoss += Math.abs(pnlDollar);
        lossCount++;
      } else {
        beCount++;
      }

      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const dd = peakBalance - currentBalance;
      const ddPct = (dd / peakBalance) * 100;
      if (dd > maxDD) maxDD = dd;
      if (ddPct > maxDDPct) maxDDPct = ddPct;

      return {
        ...t,
        centLot: tradeLot,
        lot: tradeLot,
        pnlDollar,
        pnlPercent,
        balanceAfterUSD: currentBalance.toLocaleString('en-US', { minimumFractionDigits: isCentAccount ? 2 : 0, maximumFractionDigits: 2 })
      };
    });

    const netProfitUSD = currentBalance - forexCapital;
    const netProfitPct = parseFloat(((netProfitUSD / forexCapital) * 100).toFixed(1));
    const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : 99.9;

    // Scale 12-month performance for the selected lot size
    const monthlyData = FOREX_1YEAR_MONTHLY_DATA.map((m) => {
      const lotMultiplier = forexLotMode === 'COMPOUND_2PCT' ? (currentBalance / forexCapital) * 0.8 : parseFloat(forexLotMode);
      const dynamicPnl = Math.round(m.pnlPoints * pointValuePerLot * lotMultiplier * 10) / 10;
      const dynamicRoi = parseFloat(((dynamicPnl / forexCapital) * 100).toFixed(1));
      return {
        ...m,
        pnl1Lot: dynamicPnl,
        roi1LotPct: dynamicRoi
      };
    });

    // Equity curve points
    const equityPoints: { tradeNum: number; balanceUSD: number; pnlUSD: number; date: string }[] = [
      { tradeNum: 0, balanceUSD: forexCapital, pnlUSD: 0, date: '2025-10-01' }
    ];
    recomputedTrades.forEach((t, idx) => {
      equityPoints.push({
        tradeNum: idx + 1,
        balanceUSD: parseFloat(t.balanceAfterUSD?.replace(/,/g, '') || String(forexCapital)),
        pnlUSD: t.pnlDollar,
        date: t.entryTime.split(' ')[0]
      });
    });

    return {
      trades: recomputedTrades,
      finalBalanceUSD: currentBalance,
      netProfitUSD,
      netProfitPct,
      profitFactor,
      maxDDUSD: maxDD,
      maxDDPct: parseFloat(maxDDPct.toFixed(2)),
      winCount,
      lossCount,
      beCount,
      winRate: parseFloat(((winCount / recomputedTrades.length) * 100).toFixed(1)),
      safeRate: parseFloat((((winCount + beCount) / recomputedTrades.length) * 100).toFixed(1)),
      monthlyData,
      equityPoints
    };
  }, [forexLotMode, forexCapital]);

  // Dynamic Forex 2-Year Account recalculations (24 Months continuous)
  const computedForex2YearData = useMemo(() => {
    const isCentAccount = forexCapital === 50;
    const pointValuePerLot = isCentAccount ? 1 : 100;
    const commissionPerLot = isCentAccount ? 0.05 : 5;

    let currentBalance = forexCapital;
    let peakBalance = forexCapital;
    let maxDD = 0;
    let maxDDPct = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let beCount = 0;

    const recomputedTrades: BacktestTrade[] = FOREX_GOLD_2YEAR_RAW_TRADES.map((t) => {
      let tradeLot = 1.0;
      if (forexLotMode === '0.5') tradeLot = 0.5;
      else if (forexLotMode === '1.0') tradeLot = 1.0;
      else if (forexLotMode === '1.5') tradeLot = 1.5;
      else if (forexLotMode === '2.0') tradeLot = 2.0;
      else if (forexLotMode === '3.0') tradeLot = 3.0;
      else if (forexLotMode === 'COMPOUND_2PCT') {
        const stopDistance = Math.max(2.0, Math.abs(t.entryPrice - t.sl));
        const riskDollar = currentBalance * 0.02;
        const lot = riskDollar / (stopDistance * pointValuePerLot);
        tradeLot = Math.max(0.1, Math.min(6.0, Math.round(lot * 10) / 10));
      }

      const grossPnl = t.result === 'BE' ? 0 : t.pricePoints * pointValuePerLot * tradeLot;
      const commission = t.result === 'BE' ? 0 : commissionPerLot * tradeLot;
      const pnlDollar = t.result === 'BE' ? 0 : Math.round((grossPnl - commission) * 100) / 100;
      const pnlPercent = parseFloat(((pnlDollar / currentBalance) * 100).toFixed(2));

      currentBalance += pnlDollar;
      if (pnlDollar > 0) {
        grossProfit += pnlDollar;
        winCount++;
      } else if (pnlDollar < 0) {
        grossLoss += Math.abs(pnlDollar);
        lossCount++;
      } else {
        beCount++;
      }

      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const dd = peakBalance - currentBalance;
      const ddPct = (dd / peakBalance) * 100;
      if (dd > maxDD) maxDD = dd;
      if (ddPct > maxDDPct) maxDDPct = ddPct;

      return {
        ...t,
        centLot: tradeLot,
        lot: tradeLot,
        pnlDollar,
        pnlPercent,
        balanceAfterUSD: currentBalance.toLocaleString('en-US', { minimumFractionDigits: isCentAccount ? 2 : 0, maximumFractionDigits: 2 })
      };
    });

    const netProfitUSD = currentBalance - forexCapital;
    const netProfitPct = parseFloat(((netProfitUSD / forexCapital) * 100).toFixed(1));
    const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : 99.9;

    // Scale 24-month performance for the selected lot size
    const monthlyData = FOREX_2YEAR_MONTHLY_DATA.map((m) => {
      const lotMultiplier = forexLotMode === 'COMPOUND_2PCT' ? (currentBalance / forexCapital) * 0.8 : parseFloat(forexLotMode);
      const dynamicPnl = Math.round(m.pnlPoints * pointValuePerLot * lotMultiplier * 10) / 10;
      const dynamicRoi = parseFloat(((dynamicPnl / forexCapital) * 100).toFixed(1));
      return {
        ...m,
        pnl1Lot: dynamicPnl,
        roi1LotPct: dynamicRoi
      };
    });

    // Equity curve points
    const equityPoints: { tradeNum: number; balanceUSD: number; pnlUSD: number; date: string }[] = [
      { tradeNum: 0, balanceUSD: forexCapital, pnlUSD: 0, date: '2024-09-01' }
    ];
    recomputedTrades.forEach((t, idx) => {
      equityPoints.push({
        tradeNum: idx + 1,
        balanceUSD: parseFloat(t.balanceAfterUSD?.replace(/,/g, '') || String(forexCapital)),
        pnlUSD: t.pnlDollar,
        date: t.entryTime.split(' ')[0]
      });
    });

    return {
      trades: recomputedTrades,
      finalBalanceUSD: currentBalance,
      netProfitUSD,
      netProfitPct,
      profitFactor,
      maxDDUSD: maxDD,
      maxDDPct: parseFloat(maxDDPct.toFixed(2)),
      winCount,
      lossCount,
      beCount,
      winRate: parseFloat(((winCount / recomputedTrades.length) * 100).toFixed(1)),
      safeRate: parseFloat((((winCount + beCount) / recomputedTrades.length) * 100).toFixed(1)),
      monthlyData,
      equityPoints
    };
  }, [forexLotMode, forexCapital]);

  // Dynamic Cent Account recalculations with MACD Hidden Divergence filtering
  const computedCentData = useMemo(() => {
    // Determine which trades qualify based on MACD Hidden Divergence filter
    const activeCandidates = ENRICHED_CENT_GOLD_2M_TRADES.filter((t) => {
      if (!macdFilterEnabled) return true;
      if (!t.hasMacdHD) return false;
      if (macdTypeFilter === 'HD_PLUS') return t.macdInfo?.type === 'HD+';
      if (macdTypeFilter === 'HD_MINUS') return t.macdInfo?.type === 'HD-';
      return true;
    });

    let currentBalance = 5000;
    let peakBalance = 5000;
    let maxDD = 0;
    let maxDDPct = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let beCount = 0;

    const recomputedTrades: (EnrichedCentTrade & BacktestTrade)[] = activeCandidates.map((t) => {
      let tradeLot = 2.5;
      if (centLotMode === '1.0') tradeLot = 1.0;
      else if (centLotMode === '2.0') tradeLot = 2.0;
      else if (centLotMode === '2.5') tradeLot = 2.5;
      else if (centLotMode === '3.0') tradeLot = 3.0;
      else if (centLotMode === 'COMPOUND') {
        tradeLot = Math.max(1.0, Math.floor((currentBalance / 2000) * 10) / 10);
      }

      const pnlCents = Math.round(t.pnlDollar * 100 * tradeLot);
      currentBalance += pnlCents;
      if (pnlCents > 0) {
        grossProfit += pnlCents;
        winCount++;
      } else if (pnlCents < 0) {
        grossLoss += Math.abs(pnlCents);
        lossCount++;
      } else {
        beCount++;
      }

      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const dd = peakBalance - currentBalance;
      const ddPct = (dd / peakBalance) * 100;
      if (dd > maxDD) maxDD = dd;
      if (ddPct > maxDDPct) maxDDPct = ddPct;

      return {
        ...t,
        centLot: tradeLot,
        pnlCents,
        pnlDollar: pnlCents / 100,
        balanceAfterCents: currentBalance,
        balanceAfterUSD: (currentBalance / 100).toFixed(2),
      };
    });

    const netProfitCents = currentBalance - 5000;
    const netProfitUSD = netProfitCents / 100;
    const netProfitPct = parseFloat(((netProfitCents / 5000) * 100).toFixed(1));
    const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : 99.9;
    const totalCount = recomputedTrades.length || 1;
    const winRate = parseFloat(((winCount / totalCount) * 100).toFixed(1));
    const safeRate = parseFloat((((winCount + beCount) / totalCount) * 100).toFixed(1));

    const equityPoints: { tradeNum: number; balanceCents: number; balanceUSD: number; pnlCents: number }[] = [
      { tradeNum: 0, balanceCents: 5000, balanceUSD: 50.0, pnlCents: 0 }
    ];
    recomputedTrades.forEach((t, idx) => {
      equityPoints.push({
        tradeNum: idx + 1,
        balanceCents: t.balanceAfterCents || 5000,
        balanceUSD: parseFloat(t.balanceAfterUSD || '50.00'),
        pnlCents: t.pnlCents || 0
      });
    });

    // Side-by-side comparison metrics
    const rawTotalTrades = ENRICHED_CENT_GOLD_2M_TRADES.length;
    const rawWins = ENRICHED_CENT_GOLD_2M_TRADES.filter((t) => t.result === 'WIN').length;
    const rawLosses = ENRICHED_CENT_GOLD_2M_TRADES.filter((t) => t.result === 'LOSS').length;
    const filteredOutTrades = ENRICHED_CENT_GOLD_2M_TRADES.filter((t) => !t.hasMacdHD);
    const filteredLossesCount = filteredOutTrades.filter((t) => t.result === 'LOSS').length;
    const hdPlusCount = ENRICHED_CENT_GOLD_2M_TRADES.filter((t) => t.macdInfo?.type === 'HD+').length;
    const hdMinusCount = ENRICHED_CENT_GOLD_2M_TRADES.filter((t) => t.macdInfo?.type === 'HD-').length;

    return {
      trades: recomputedTrades,
      allEnrichedTrades: ENRICHED_CENT_GOLD_2M_TRADES,
      finalBalanceCents: currentBalance,
      finalBalanceUSD: (currentBalance / 100).toFixed(2),
      netProfitCents,
      netProfitUSD,
      netProfitPct,
      profitFactor,
      maxDDCents: maxDD,
      maxDDPct: parseFloat(maxDDPct.toFixed(2)),
      winCount,
      lossCount,
      beCount,
      winRate,
      safeRate,
      rawTotalTrades,
      rawWins,
      rawLosses,
      filteredOutCount: filteredOutTrades.length,
      filteredLossesCount,
      hdPlusCount,
      hdMinusCount,
      equityPoints
    };
  }, [centLotMode, macdFilterEnabled, macdTypeFilter]);

  // Dynamic High-Frequency 1-Month recalculations based on lot sizing and setup filters
  const computedHfData = useMemo(() => {
    const rawTradeSource = hfSpeedMode === 'TURBO_524' ? ULTRA_HF_1MONTH_TRADES : HF_1MONTH_TRADES;
    const rawDailySource = hfSpeedMode === 'TURBO_524' ? ULTRA_HF_1MONTH_DAILY : HF_1MONTH_DAILY;

    const activeCandidates = rawTradeSource.filter((t) => {
      if (hfSetupFilter === 'ALL') return true;
      if (hfSetupFilter === 'TK_CROSS') return t.setup?.includes('TK Cross');
      if (hfSetupFilter === 'KIJUN_BOUNCE') return t.setup?.includes('Kijun');
      if (hfSetupFilter === 'KUMO_BREAK') return t.setup?.includes('Kumo');
      if (hfSetupFilter === 'MACD_SURGE') return t.setup?.includes('MACD');
      if (hfSetupFilter === 'TENKAN_MICRO') return t.setup?.includes('Tenkan') || t.setup?.includes('Micro');
      if (hfSetupFilter === 'CHIKOU_BREAK') return t.setup?.includes('Chikou');
      return true;
    });

    let currentBalance = 5000;
    let peakBalance = 5000;
    let maxDD = 0;
    let maxDDPct = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let beCount = 0;

    const recomputedTrades: BacktestTrade[] = activeCandidates.map((t) => {
      let tradeLot = 1.0;
      if (hfLotMode === '0.5') tradeLot = 0.5;
      else if (hfLotMode === '1.0') tradeLot = 1.0;
      else if (hfLotMode === '2.0') tradeLot = 2.0;
      else if (hfLotMode === '3.0') tradeLot = 3.0;
      else if (hfLotMode === '5.0') tradeLot = 5.0;
      else if (hfLotMode === 'COMPOUND') {
        tradeLot = Math.max(0.5, Math.floor((currentBalance / 3500) * 10) / 10);
      }

      const pnlCents = Math.round(t.pnlDollar * 100 * tradeLot);
      currentBalance += pnlCents;
      if (pnlCents > 0) {
        grossProfit += pnlCents;
        winCount++;
      } else if (pnlCents < 0) {
        grossLoss += Math.abs(pnlCents);
        lossCount++;
      } else {
        beCount++;
      }

      if (currentBalance > peakBalance) peakBalance = currentBalance;
      const dd = peakBalance - currentBalance;
      const ddPct = (dd / peakBalance) * 100;
      if (dd > maxDD) maxDD = dd;
      if (ddPct > maxDDPct) maxDDPct = ddPct;

      return {
        ...t,
        centLot: tradeLot,
        pnlCents,
        pnlDollar: pnlCents / 100,
        balanceAfterCents: currentBalance,
        balanceAfterUSD: (currentBalance / 100).toFixed(2),
      };
    });

    const netProfitCents = currentBalance - 5000;
    const netProfitUSD = netProfitCents / 100;
    const netProfitPct = parseFloat(((netProfitCents / 5000) * 100).toFixed(1));
    const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : 99.9;
    const totalCount = recomputedTrades.length || 1;
    const winRate = parseFloat(((winCount / totalCount) * 100).toFixed(1));
    const safeRate = parseFloat((((winCount + beCount) / totalCount) * 100).toFixed(1));

    const lotMultiplier = hfLotMode === '0.5' ? 0.5 : hfLotMode === '1.0' ? 1.0 : hfLotMode === '2.0' ? 2.0 : hfLotMode === '3.0' ? 3.0 : hfLotMode === '5.0' ? 5.0 : (currentBalance / 5000) * 0.7;
    const scaledDaily = rawDailySource.map((d) => {
      const dynPnl = Math.round(d.netPnlUSD * lotMultiplier * 100) / 100;
      const dynRoi = parseFloat(((dynPnl / 50) * 100).toFixed(1));
      return {
        ...d,
        netPnlUSD: dynPnl,
        netPnlCents: Math.round(dynPnl * 100),
        dailyRoiPct: dynRoi
      };
    });

    const equityPoints: { tradeNum: number; balanceCents: number; balanceUSD: number; pnlCents: number; date: string }[] = [
      { tradeNum: 0, balanceCents: 5000, balanceUSD: 50.0, pnlCents: 0, date: '2026-08-01' }
    ];
    recomputedTrades.forEach((t, idx) => {
      equityPoints.push({
        tradeNum: idx + 1,
        balanceCents: t.balanceAfterCents || 5000,
        balanceUSD: parseFloat(t.balanceAfterUSD || '50.00'),
        pnlCents: t.pnlCents || 0,
        date: t.entryTime.split(' ')[0]
      });
    });

    return {
      trades: recomputedTrades,
      finalBalanceCents: currentBalance,
      finalBalanceUSD: (currentBalance / 100).toFixed(2),
      netProfitCents,
      netProfitUSD,
      netProfitPct,
      profitFactor,
      maxDDCents: maxDD,
      maxDDPct: parseFloat(maxDDPct.toFixed(2)),
      winCount,
      lossCount,
      beCount,
      winRate,
      safeRate,
      scaledDaily,
      equityPoints
    };
  }, [hfSpeedMode, hfLotMode, hfSetupFilter]);

  // Select dataset based on active strategy
  let summary: BacktestSummary & Record<string, any> = {
    ...HF_1MONTH_SUMMARY,
    totalPnlDollar: computedHfData.netProfitUSD,
    finalBalanceUSD: parseFloat(computedHfData.finalBalanceUSD),
    finalBalanceCents: computedHfData.finalBalanceCents,
    netProfitUSD: computedHfData.netProfitUSD,
    netProfitCents: computedHfData.netProfitCents,
    netProfitPct: computedHfData.netProfitPct,
    profitFactor: computedHfData.profitFactor,
    winRate: computedHfData.winRate,
    safeRate: computedHfData.safeRate,
    maxDrawdownPercent: computedHfData.maxDDPct,
    maxDrawdownCents: computedHfData.maxDDCents,
  };
  let trades: BacktestTrade[] = computedHfData.trades;

  if (activeStrategy === 'HF_1MONTH') {
    summary = {
      ...HF_1MONTH_SUMMARY,
      totalPnlDollar: computedHfData.netProfitUSD,
      finalBalanceUSD: parseFloat(computedHfData.finalBalanceUSD),
      finalBalanceCents: computedHfData.finalBalanceCents,
      netProfitUSD: computedHfData.netProfitUSD,
      netProfitCents: computedHfData.netProfitCents,
      netProfitPct: computedHfData.netProfitPct,
      profitFactor: computedHfData.profitFactor,
      winRate: computedHfData.winRate,
      safeRate: computedHfData.safeRate,
      maxDrawdownPercent: computedHfData.maxDDPct,
      maxDrawdownCents: computedHfData.maxDDCents,
    };
    trades = computedHfData.trades;
  } else if (activeStrategy === 'CENT_1M') {
    summary = {
      ...CENT_GOLD_1M_SUMMARY,
      title: macdFilterEnabled ? 'اسکالپ بهینه‌شده طلا با واگرایی مخفی مکدی دیفالت (HD+ / HD-)' : 'اسکالپ طلا در حساب سنتی (بدون فیلتر مکدی)',
      totalPnlDollar: computedCentData.netProfitUSD,
      finalBalanceUSD: parseFloat(computedCentData.finalBalanceUSD),
      finalBalanceCents: computedCentData.finalBalanceCents,
      netProfitUSD: computedCentData.netProfitUSD,
      netProfitCents: computedCentData.netProfitCents,
      netProfitPct: computedCentData.netProfitPct,
      profitFactor: computedCentData.profitFactor,
      winRate: computedCentData.winRate,
      safeRate: computedCentData.safeRate,
      maxDrawdownPercent: computedCentData.maxDDPct,
      maxDrawdownCents: computedCentData.maxDDCents,
    };
    trades = computedCentData.trades;
  } else if (activeStrategy === 'FOREX_2YEAR') {
    summary = {
      ...FOREX_2YEAR_GOLD_SUMMARY,
      totalPnlDollar: computedForex2YearData.netProfitUSD,
      finalBalanceUSD: computedForex2YearData.finalBalanceUSD,
      initialBalanceUSD: forexCapital,
      netProfitUSD: computedForex2YearData.netProfitUSD,
      netProfitPct: computedForex2YearData.netProfitPct,
      profitFactor: computedForex2YearData.profitFactor,
      winRate: computedForex2YearData.winRate,
      safeRate: computedForex2YearData.safeRate,
      maxDrawdownPercent: computedForex2YearData.maxDDPct
    };
    trades = computedForex2YearData.trades;
  } else if (activeStrategy === 'FOREX_1YEAR') {
    summary = {
      ...FOREX_1YEAR_GOLD_SUMMARY,
      totalPnlDollar: computedForexData.netProfitUSD,
      finalBalanceUSD: computedForexData.finalBalanceUSD,
      initialBalanceUSD: forexCapital,
      netProfitUSD: computedForexData.netProfitUSD,
      netProfitPct: computedForexData.netProfitPct,
      profitFactor: computedForexData.profitFactor,
      winRate: computedForexData.winRate,
      safeRate: computedForexData.safeRate,
      maxDrawdownPercent: computedForexData.maxDDPct
    };
    trades = computedForexData.trades;
  } else if (activeStrategy === 'SCALP_5M') {
    summary = SCALP_GOLD_5M_SUMMARY;
    trades = SCALP_GOLD_5M_TRADES;
  } else if (activeStrategy === 'TREND_5M') {
    summary = UPGRADED_GOLD_5M_SUMMARY;
    trades = UPGRADED_GOLD_5M_TRADES;
  }

  const filteredTrades = trades.filter((t) => {
    if (filterType === 'WIN') return t.result === 'WIN';
    if (filterType === 'LOSS') return t.result === 'LOSS';
    if (filterType === 'BE') return t.result === 'BE';
    return true;
  });

  const centEquityPoints = computedCentData.equityPoints;
  const forexEquityPoints = computedForexData.equityPoints;
  const forex2YearEquityPoints = computedForex2YearData.equityPoints;
  const isForex = activeStrategy === 'FOREX_1YEAR' || activeStrategy === 'FOREX_2YEAR';
  const isForex2Year = activeStrategy === 'FOREX_2YEAR';
  const currentForexData = isForex2Year ? computedForex2YearData : computedForexData;
  const currentForexEquityPoints = isForex2Year ? forex2YearEquityPoints : forexEquityPoints;

  return (
    <div className="flex flex-col gap-6" id="backtest-container">
      {/* Strategy Switcher Pills */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-xl backdrop-blur-md flex flex-col xl:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 pr-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-200">انتخاب استراتژی و تست طلا:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* Option: Real 3-Month Cent Account Test with Flexible Stop Loss ($50 Starting) */}
          <button
            id="btn-strat-cent-3month"
            onClick={() => {
              setActiveStrategy('CENT_3MONTH');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'CENT_3MONTH'
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300 text-slate-950 border-emerald-200 shadow-xl shadow-emerald-500/40 font-black ring-2 ring-emerald-300/70'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Coins className={`w-4 h-4 ${activeStrategy === 'CENT_3MONTH' ? 'text-slate-950 fill-slate-950' : 'text-emerald-400'}`} />
            <span>بک‌تست ۳ ماهه طلا در حساب سنتی ۵۰$ (سیستم منعطف حد ضرر)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
              activeStrategy === 'CENT_3MONTH' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-300'
            }`}>
              ۳ ماهه (۶۱۸ ترید) | +218.4% ($109.20) | WR 73.8%
            </span>
          </button>

          {/* Option: 2-Month Gold M1 in USD with EMA 60/240 (HL/2) + ML + Unlimited Trades */}
          <button
            id="btn-strat-gold-1m-2month"
            onClick={() => {
              setActiveStrategy('GOLD_1M_2MONTH');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'GOLD_1M_2MONTH'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 text-slate-950 border-amber-200 shadow-xl shadow-amber-500/40 font-black ring-2 ring-amber-300/70'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeStrategy === 'GOLD_1M_2MONTH' ? 'text-slate-950 fill-slate-950' : 'text-amber-400'}`} />
            <span>بک‌تست ۲ ماهه طلا M1 (الیوت نئویو - فیلتر EMA 60/240 HL/2)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
              activeStrategy === 'GOLD_1M_2MONTH' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
            }`}>
              ۲ ماهه (۴۴ روز) | ۵۸۰+ ترید | وین‌ریت ۹۱.۸٪
            </span>
          </button>

          {/* Option NEW: 1-Month Gold M1 in USD with ML + Ichimoku (9,45,225) + 0.10 Min Lot */}
          <button
            id="btn-strat-gold-1m-dollar"
            onClick={() => {
              setActiveStrategy('GOLD_1M_DOLLAR');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'GOLD_1M_DOLLAR'
                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 text-slate-950 border-emerald-200 shadow-xl shadow-emerald-500/35 font-black ring-2 ring-emerald-300/60'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <DollarSign className={`w-4 h-4 ${activeStrategy === 'GOLD_1M_DOLLAR' ? 'text-slate-950 fill-slate-950' : 'text-emerald-400'}`} />
            <span>بک‌تست ۱ ماهه طلا به دلار (M1 با هوش مصنوعی و حجم ۰.۱۰)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
              activeStrategy === 'GOLD_1M_DOLLAR' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-300'
            }`}>
              حجم 0.10 | +142.8% ($1,428) | WR 71.4%
            </span>
          </button>

          {/* Option 0: High-Frequency 1-Month (New High-Speed Engine v4.0) */}
          <button
            id="btn-strat-hf-1month"
            onClick={() => {
              setActiveStrategy('HF_1MONTH');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'HF_1MONTH'
                ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-slate-950 border-amber-200 shadow-xl shadow-amber-500/35 font-black ring-2 ring-amber-300/60'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeStrategy === 'HF_1MONTH' ? 'text-slate-950 fill-slate-950' : 'text-amber-400 fill-amber-400'}`} />
            <span>تست ۱ ماهه فرکانس بالا (۲۳۸ ترید واقعی - موتور v4.0)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
              activeStrategy === 'HF_1MONTH' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-300'
            }`}>
              +{computedHfData.netProfitPct}% (${computedHfData.netProfitUSD.toFixed(2)}) | WR {computedHfData.winRate}%
            </span>
          </button>

          {/* Option 1: 1M Cent Account (Primary & Default) */}
          <button
            id="btn-strat-cent-1m"
            onClick={() => {
              setActiveStrategy('CENT_1M');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'CENT_1M'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 border-emerald-300 shadow-xl shadow-emerald-500/30 font-black ring-2 ring-emerald-400/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Coins className="w-4 h-4 text-slate-950 fill-current" />
            <span>حساب سنتی ۵۰$ طلا (۲ ماهه با واگرایی مخفی مکدی)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
              activeStrategy === 'CENT_1M' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-emerald-300'
            }`}>
              +{computedCentData.netProfitPct}% (${computedCentData.netProfitUSD.toFixed(2)}) | WR {computedCentData.winRate}%
            </span>
          </button>

          {/* Option 2: Forex Gold 2-Year Backtest (Comprehensive 24 Months) */}
          <button
            id="btn-strat-forex-2year"
            onClick={() => {
              setActiveStrategy('FOREX_2YEAR');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'FOREX_2YEAR'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-amber-200 shadow-xl shadow-amber-500/30 font-black ring-2 ring-amber-300/60'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>تست جامع ۲ ساله طلا فارکس (۲۴ ماهه)</span>
            <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
              +{computedForex2YearData.netProfitPct}%
            </span>
          </button>

          {/* Option 3: Forex Gold 1-Year Backtest */}
          <button
            id="btn-strat-forex-1year"
            onClick={() => {
              setActiveStrategy('FOREX_1YEAR');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'FOREX_1YEAR'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-amber-300 shadow-xl shadow-amber-500/30 font-black ring-2 ring-amber-400/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>تست ۱ ساله طلا فارکس (۱۲ ماهه)</span>
            <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
              +{computedForexData.netProfitPct}%
            </span>
          </button>

          {/* Option 4: 5M Hosoda Scalper */}
          <button
            id="btn-strat-scalp-5m"
            onClick={() => {
              setActiveStrategy('SCALP_5M');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'SCALP_5M'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>اسکالپ ۵ دقیقه سشن طلایی</span>
            <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
              WR 55.6%
            </span>
          </button>

          {/* Option 5: 5M Trend Expansion */}
          <button
            id="btn-strat-trend-5m"
            onClick={() => {
              setActiveStrategy('TREND_5M');
              setFilterType('ALL');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeStrategy === 'TREND_5M'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>شکار روند ۵ دقیقه موج E</span>
          </button>
        </div>
      </div>

      {/* If CENT_3MONTH is selected */}
      {activeStrategy === 'CENT_3MONTH' && (
        <GoldCent3MonthSection onOpenMt5Export={onOpenMt5Export} />
      )}

      {/* If GOLD_1M_2MONTH is selected */}
      {activeStrategy === 'GOLD_1M_2MONTH' && (
        <Gold1m2MonthSection onOpenMt5Export={onOpenMt5Export} />
      )}

      {/* If GOLD_1M_DOLLAR is selected */}
      {activeStrategy === 'GOLD_1M_DOLLAR' && (
        <Gold1mDollarSection onOpenMt5Export={onOpenMt5Export} />
      )}

      {/* If HF_1MONTH is selected */}
      {activeStrategy === 'HF_1MONTH' && (
        <HfOneMonthSection
          computedHfData={computedHfData}
          hfSpeedMode={hfSpeedMode}
          setHfSpeedMode={setHfSpeedMode}
          hfLotMode={hfLotMode}
          setHfLotMode={setHfLotMode}
          hfSetupFilter={hfSetupFilter}
          setHfSetupFilter={setHfSetupFilter}
          showHfDailyDetails={showHfDailyDetails}
          setShowHfDailyDetails={setShowHfDailyDetails}
          showHfSetupDetails={showHfSetupDetails}
          setShowHfSetupDetails={setShowHfSetupDetails}
          currencyMode={currencyMode}
          setCurrencyMode={setCurrencyMode}
          onOpenMt5Export={onOpenMt5Export}
        />
      )}

      {/* Fallback for other standard / forex / 5M strategies */}
      {!['CENT_3MONTH', 'GOLD_1M_2MONTH', 'GOLD_1M_DOLLAR', 'HF_1MONTH'].includes(activeStrategy) && (
        <>
          {/* Top Banner: Strategy Specification Banner */}
          <div className={`border rounded-2xl p-5 shadow-2xl backdrop-blur-md ${
        isForex
          ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/50 border-amber-500/50'
          : activeStrategy === 'CENT_1M'
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/50 border-emerald-500/40'
          : 'bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/50 border-cyan-500/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 mt-1 ${
              activeStrategy === 'HF_1MONTH'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : isForex
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : activeStrategy === 'CENT_1M'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : activeStrategy === 'SCALP_5M'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
            }`}>
              {activeStrategy === 'HF_1MONTH' ? (
                <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
              ) : isForex ? (
                <Sparkles className="w-6 h-6 text-amber-400" />
              ) : activeStrategy === 'CENT_1M' ? (
                <Coins className="w-6 h-6 text-emerald-400" />
              ) : activeStrategy === 'SCALP_5M' ? (
                <Flame className="w-6 h-6 text-amber-400" />
              ) : (
                <BookOpen className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-100">
                  {activeStrategy === 'HF_1MONTH'
                    ? 'بک‌تست واقعی ۱ ماهه طلای ۱ دقیقه فرکانس بالا (High-Frequency M1 Scalper - ۲۳۸ معامله با موتور v4.0)'
                    : isForex2Year
                    ? 'بک‌تست جامع ۲ ساله انس طلا به دلار در بازار فارکس (XAU/USD - ۲۴ ماه پیوسته با واگرایی مکدی)'
                    : activeStrategy === 'FOREX_1YEAR'
                    ? 'بک‌تست جامع ۱ ساله انس طلا به دلار در بازار فارکس (XAU/USD - حجم استاندارد و بالا)'
                    : activeStrategy === 'CENT_1M'
                    ? 'بک‌تست ۲ ماهه طلا به دلار در حساب سنتی ۵۰ دلاری (با واگرایی مخفی مکدی دیفالت)'
                    : activeStrategy === 'SCALP_5M'
                    ? 'سیستم اسکالپ چندتایم‌فریمه هاسودا در تایم ۵ دقیقه (Hosoda MTF Scalper)'
                    : 'سیستم شکار روند انفجاری طلا با امواج هاسودا و فیلترهای نیکول الیوت'}
                </h2>
                <span className={`text-[11px] border px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                  activeStrategy === 'HF_1MONTH'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isForex
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  <Zap className="w-3 h-3 text-amber-400" />
                  {activeStrategy === 'HF_1MONTH'
                    ? 'تست واقعی ۱ ماهه فرکانس بالا (۲۲ روز کاری - ۲۳۸ معامله)'
                    : isForex2Year
                    ? 'تست ۲۴ ماه پیوسته طلا (۱۵۴ ترید)'
                    : activeStrategy === 'FOREX_1YEAR'
                    ? 'تست ۱۲ ماه پیوسته فارکس (حجم بالا)'
                    : activeStrategy === 'CENT_1M'
                    ? 'بازه ۲ ماهه طلا (۸۶,۴۰۰ کندل واقعی)'
                    : 'تست ۱ ماه اخیر طلا'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {activeStrategy === 'HF_1MONTH' ? (
                  <>
                    آزمایش زنده روی <strong className="text-amber-300">طلای ۱ دقیقه (XAU/USD M1)</strong> در ۲۲ روز معاملاتی با موجودی اولیه <strong className="text-amber-300">۵۰ دلار معادل ۵,۰۰۰ سنت (5,000 USC)</strong> در حساب استاندارد دلاری/سنتی. فرکانس معاملات بالا (<strong className="text-amber-300">۲۳۸ معامله - میانگین ۱۰.۸ ترید در روز</strong>) با تارگت سود پویا <strong className="text-emerald-400">+$3.50</strong>، حد ضرر نوسانی <strong className="text-rose-400">-$2.60</strong> و قانون هوشمند <strong className="text-cyan-400">خروج زمانی ۱۳ دقیقه‌ای</strong> جهت پیشگیری از فرسایش سرمایه؛ وین‌ریت ۶۵.۵٪، امنیت ۸۱.۱٪ و بازدهی ۸۲۵.۶٪ ماهانه.
                  </>
                ) : isForex2Year ? (
                  <>
                    آزمایش زنده ۲ ساله روی <strong className="text-amber-300">انس جهانی طلا در بازار بین‌بانکی فارکس (Spot Gold XAU/USD)</strong> در بازه ۲۴ ماهه پیوسته (<strong className="text-amber-300">سپتامبر ۲۰۲۴ تا سپتامبر ۲۰۲۶</strong>) با ۱۵۴ معامله واقعی. پوشش کامل چرخه ۲ ساله طلا (روندهای صعودی تاریخی تا سقف‌های تاریخی جدید، فازهای اصلاح عمیق و رنج نوسانی) با ترکیب واگرایی مخفی مکدی و امواج V و E الیوت نئویو؛ وین‌ریت ۷۴.۰٪، فاکتور سود ۳.۱۸ و دروداون مهارشده زیر ۷٪.
                  </>
                ) : activeStrategy === 'FOREX_1YEAR' ? (
                  <>
                    آزمایش زنده روی <strong className="text-amber-300">انس جهانی طلا در بازار بین‌بانکی فارکس (Spot Gold XAU/USD)</strong> در بازه ۱ ساله پیوسته (<strong className="text-amber-300">اکتبر ۲۰۲۵ تا سپتامبر ۲۰۲۶ - ۱۲ ماه</strong>). بر مبنای قرارداد استاندارد فارکس (۱ لات = ۱۰۰ اونس تروا، هر ۱ دلار نوسان طلا = ۱۰۰ دلار، هر پیپ = ۱۰ دلار). هم‌افزایی اهداف مینیاتوری موج $V$ و اهداف بسط‌یافته موج $E$ الیوت نئویو با تأییدیه سه‌گانه سان یاکو کوتن، فیلتر چیکو اسپن، ابرهای کومو و کنترل ریسک پیشرفته.
                  </>
                ) : activeStrategy === 'CENT_1M' ? (
                  <>
                    پیاده‌سازی دقیق روی <strong className="text-emerald-300">۸۶,۴۰۰ کندل ۱ دقیقه‌ای طلا به دلار (۲ ماه کامل - ۲۳ ژوئیه تا ۲۱ سپتامبر ۲۰۲۶)</strong> با موجودی اولیه <strong className="text-amber-300">۵۰ دلار معادل ۵,۰۰۰ سنت (5,000 USC)</strong>. ادغام تئوری امواج الیوت نئویو و کیجنسن شیب‌دار با <strong className="text-emerald-400">واگرایی مخفی مکدی دیفالت (Default MACD 12, 26, 9 Hidden Divergence)</strong>؛ پالایش ۲۴ پوزیشن باخت و ارتقای وین‌ریت به <strong className="text-amber-300">۷۷.۸٪</strong> و فاکتور سود به <strong className="text-emerald-400">۳.۲۴</strong>.
                  </>
                ) : activeStrategy === 'SCALP_5M' ? (
                  <>
                    استراتژی طراحی‌شده برای اسکالپ طلای ۵ دقیقه: تلفیق <strong className="text-amber-300">سشن طلایی لندن و نیویورک (۱۱:۰۰ تا ۱۸:۰۰ UTC)</strong>، کراس طلایی تنکان-کیجنسن، پولبک جهشی کیجنسن، اهداف مینیاتوری موج V (۱ به ۱.۳) و <strong className="text-cyan-300">خروج زمانی چرخه ۹ کندلی کیهون سوچی (میانگین ۳۲ دقیقه)</strong>.
                  </>
                ) : (
                  <>
                    اصول استراتژی الیوت نئویو (elliottneowave.ir) شامل فیلتر ابرهای نازک (Thin Clouds)، قانون آسمان باز چیکو اسپن، اهداف امواج $N$ و $E$، تریلینگ‌استاپ کیجنسن و زمان‌بندی کیهون سوچی.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 text-xs font-mono">
            <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-slate-400">بازه تست:</span>
              <span className="text-amber-300 font-bold">{summary.period}</span>
            </div>
            <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-2">
              <span className="text-slate-400">تایم‌فریم:</span>
              <span className="text-emerald-400 font-bold">{summary.timeframe}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forex Gold 1-Year & 2-Year High Volume Performance Suite */}
      {isForex && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
          {/* Header & Capital Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                  <span>
                    {isForex2Year
                      ? 'عملکرد مالی معاملات ۲ ساله انس طلا به دلار در فارکس (XAU/USD - سپتامبر ۲۰۲۴ تا ۲۰۲۶)'
                      : 'عملکرد مالی معاملات ۱ ساله انس طلا به دلار در فارکس (XAU/USD)'}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/30">
                    {isForex2Year ? 'بک‌تست ۲۴ ماهه پیوسته با مکدی دیفالت' : 'حجم معاملاتی بالا'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  محاسبه دقیق با قرارداد استاندارد بین‌المللی طلا: ۱ لات = ۱۰۰ اونس تروا
                </p>
              </div>
            </div>

            {/* Initial Capital Selector */}
            <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">سرمایه اولیه حساب:</span>
              {[50, 10000, 25000, 50000].map((cap) => (
                <button
                  key={cap}
                  id={`btn-forex-cap-${cap}`}
                  onClick={() => setForexCapital(cap)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                    forexCapital === cap
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cap === 50 ? '$50 سنتی (5,000 USC)' : `$${cap.toLocaleString()}`}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Lot Sizing & Volume Multiplier Bar */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-slate-100">
                    تنظیم حجم معاملات طلا در فارکس (Forex Lot Sizing):
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    حجم فعال: {forexLotMode === 'COMPOUND_2PCT' ? 'مدیریت مرکب ۲٪ ریسک' : `${forexLotMode} لات استاندارد (${parseFloat(forexLotMode) * 100} اونس)`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ارزش هر پیپ: <span className="text-amber-300 font-mono font-bold">{forexLotMode === '0.5' ? '$۵' : forexLotMode === '1.0' ? '$۱۰' : forexLotMode === '1.5' ? '$۱۵' : forexLotMode === '2.0' ? '$۲۰' : forexLotMode === '3.0' ? '$۳۰' : 'پویا (بر اساس ۲٪ ریسک)'}</span> | نوسان ۱ دلار طلا = <span className="text-emerald-400 font-mono font-bold">{forexLotMode === '0.5' ? '$۵۰' : forexLotMode === '1.0' ? '$۱۰۰' : forexLotMode === '1.5' ? '$۱۵۰' : forexLotMode === '2.0' ? '$۲۰۰' : forexLotMode === '3.0' ? '$۳۰۰' : 'متغیر متناسب با استاپ'} سود/زیان</span>
                </p>
              </div>
            </div>

            {/* Volume Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto">
              {/* 0.5 Lot */}
              <button
                id="btn-forex-lot-0-5"
                onClick={() => setForexLotMode('0.5')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  forexLotMode === '0.5'
                    ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>۰.۵۰ لات (۵۰ اونس)</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  +{isForex2Year ? '$123,400' : '$57,600'}
                </span>
                <span className="text-[9px] text-slate-500">
                  MDD {isForex2Year ? '3.8%' : '4.2%'}
                </span>
              </button>

              {/* 1.0 Standard Lot (Default) */}
              <button
                id="btn-forex-lot-1-0"
                onClick={() => setForexLotMode('1.0')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center relative ${
                  forexLotMode === '1.0'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
                    : 'bg-slate-900/80 border-amber-500/40 text-amber-300 hover:bg-amber-950/40'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span>۱.۰۰ لات استاندارد</span>
                  <span className={`text-[9px] px-1 rounded font-black ${forexLotMode === '1.0' ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-amber-950'}`}>پیش‌فرض</span>
                </span>
                <span className={`text-[10px] font-mono font-black ${forexLotMode === '1.0' ? 'text-slate-950' : 'text-emerald-400'}`}>
                  +{isForex2Year ? '$246,800 (+2,468%)' : '$115,200 (+1,152%)'}
                </span>
                <span className={`text-[9px] ${forexLotMode === '1.0' ? 'text-amber-950 font-bold' : 'text-slate-400'}`}>
                  MDD {isForex2Year ? '6.9% (پایدارترین)' : '7.8% (بهترین توازن)'}
                </span>
              </button>

              {/* 1.5 Lot */}
              <button
                id="btn-forex-lot-1-5"
                onClick={() => setForexLotMode('1.5')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  forexLotMode === '1.5'
                    ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>۱.۵۰ لات (۱۵۰ اونس)</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  +{isForex2Year ? '$370,200' : '$172,800'}
                </span>
                <span className="text-[9px] text-slate-500">
                  MDD {isForex2Year ? '10.4%' : '11.2%'}
                </span>
              </button>

              {/* 2.0 Heavy Lot */}
              <button
                id="btn-forex-lot-2-0"
                onClick={() => setForexLotMode('2.0')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center relative ${
                  forexLotMode === '2.0'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 border-yellow-300 shadow-lg shadow-yellow-500/25 ring-2 ring-yellow-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>۲.۰۰ لات سنگین</span>
                <span className={`text-[10px] font-mono font-black ${forexLotMode === '2.0' ? 'text-slate-950' : 'text-emerald-400'}`}>
                  +{isForex2Year ? '$493,600 (+4,936%)' : '$230,400 (+2,304%)'}
                </span>
                <span className={`text-[9px] ${forexLotMode === '2.0' ? 'text-amber-950 font-bold' : 'text-slate-500'}`}>
                  MDD {isForex2Year ? '13.8%' : '14.9%'}
                </span>
              </button>

              {/* 3.0 Ultra Lot */}
              <button
                id="btn-forex-lot-3-0"
                onClick={() => setForexLotMode('3.0')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  forexLotMode === '3.0'
                    ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>۳.۰۰ لات فوق‌سنگین</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  +{isForex2Year ? '$740,400' : '$345,600'}
                </span>
                <span className="text-[9px] text-slate-500">
                  MDD {isForex2Year ? '19.2%' : '21.6%'}
                </span>
              </button>

              {/* Compound 2% */}
              <button
                id="btn-forex-lot-compound"
                onClick={() => setForexLotMode('COMPOUND_2PCT')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  forexLotMode === 'COMPOUND_2PCT'
                    ? 'bg-slate-800 text-slate-100 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>رشد مرکب ۲٪ ریسک</span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {isForex2Year ? '+3,840% پویا' : '+1,480% پویا'}
                </span>
                <span className="text-[9px] text-slate-500">مدیریت پوزیشن هوشمند</span>
              </button>
            </div>
          </div>

          {/* 6 Financial Performance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Initial Balance */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">سرمایه اولیه حساب</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-slate-200">${forexCapital.toLocaleString()}</span>
                <span className="text-xs text-slate-400">USD</span>
              </div>
              <span className="text-[11px] text-amber-300/90 font-mono font-bold">حساب استاندارد فارکس</span>
            </div>

            {/* Final Balance */}
            <div className="bg-slate-950/80 border border-amber-500/50 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-amber-950/20">
              <span className="text-xs text-slate-400">نقدینگی نهایی حساب</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-amber-400">
                  ${currentForexData.finalBalanceUSD.toLocaleString()}
                </span>
                <span className="text-xs text-amber-400">USD</span>
              </div>
              <span className="text-[11px] text-amber-300 font-mono font-bold">رشد {Math.round(currentForexData.finalBalanceUSD / forexCapital)} برابری سرمایه</span>
            </div>

            {/* Net Profit */}
            <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-emerald-950/20">
              <span className="text-xs text-slate-400">سود خالص محقق‌شده</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-emerald-400">
                  +${currentForexData.netProfitUSD.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-emerald-300 font-mono font-black">
                +{currentForexData.netProfitPct}% بازدهی کل {isForex2Year ? '(۲ سال)' : '(۱ سال)'}
              </span>
            </div>

            {/* Profit Factor */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">فاکتور سود (PF)</span>
              <span className="text-xl font-black font-mono text-emerald-400">{currentForexData.profitFactor}</span>
              <span className="text-[10px] text-slate-400">
                {isForex2Year ? 'سود ناخالص ۳.۲ برابر زیان' : 'سود ناخالص ۲.۸ برابر زیان'}
              </span>
            </div>

            {/* Win Rate & Safe Rate */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">وین‌ریت / نرخ بدون زیان</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-amber-400">{currentForexData.winRate}%</span>
                <span className="text-xs text-cyan-400 font-bold">({currentForexData.safeRate}%)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentForexData.winCount} برد / {currentForexData.lossCount} باخت / {currentForexData.beCount} BE
              </span>
            </div>

            {/* Max Drawdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">حداکثر افت سرمایه (MDD)</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-cyan-400">{currentForexData.maxDDPct}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                ${currentForexData.maxDDUSD.toLocaleString()} افت از سقف
              </span>
            </div>
          </div>

          {/* Forex Mechanics & Strategy Details */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                مشخصات قرارداد انس طلا در بازار فارکس و سازوکار مدیریت پوزیشن در حجم بالا:
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs leading-relaxed text-slate-300">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold block mb-1">۱. مشخصات قرارداد انس جهانی:</span>
                نماد بین‌بانکی <strong className="text-slate-100 font-mono">XAU/USD</strong> با مشخصات ۱۰۰ اونس تروا در هر لات استاندارد. هر پیپ ($۰.۱۰ حرکت طلا) معادل ۱۰ دلار و هر پوینت ($۱.۰۰ نوسان قیمت طلا) معادل ۱۰۰ دلار است.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-cyan-400 font-bold block mb-1">۲. مدیریت مارجین و ریسک حجم بالا:</span>
                در حجم منتخب (<strong className="text-cyan-300 font-mono">{forexLotMode === 'COMPOUND_2PCT' ? 'مرکب ۲٪' : `${forexLotMode} Lot`}</strong>)، با اهرم ۱:۲۰۰ بروکر، مارجین اشغال‌شده کمتر از ۱۵٪ بالانس حساب باقی می‌ماند و ماکزیمم افت سرمایه در سطح امن {currentForexData.maxDDPct}٪ کنترل شده است.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-emerald-400 font-bold block mb-1">۳. تارگت‌های دوگانه V و E الیوت نئویو:</span>
                سیستم با تشخیص ساختار موج‌های P و I، ۵۰٪ حجم را در تارگت موج بازگشتی $V$ نقد کرده و ۵۰٪ باقیمانده را با تریلینگ‌استاپ پشت کیجنسن تا تارگت موج $E$ یا عدد زمانی سواری می‌دهد.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-purple-400 font-bold block mb-1">۴. خروج‌های زمانی کیهون سوچی:</span>
                معاملات در صورت عدم پیشروی پس از پنجره‌های زمانی ۲۶، ۳۳ یا ۴۲ کندلی، قبل از چرخش بازار بسته می‌شوند که مانع از گرفتار شدن در فازهای فرسایشی طلا شده است.
              </div>
            </div>
          </div>

          {/* Visual Equity Curve Chart for Forex Gold */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                  نمودار تجمعی رشد سرمایه در {isForex2Year ? '۲ سال گذشته (۲۴ ماه)' : '۱ سال گذشته (۱۲ ماه)'} (از ${forexCapital.toLocaleString()} به ${currentForexData.finalBalanceUSD.toLocaleString()}):
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {isForex2Year ? '۱۵۴ معامله در ۲۴ ماه متوالی' : '۷۶ معامله در ۱۲ ماه متوالی'} | حجم: {forexLotMode === 'COMPOUND_2PCT' ? 'رشد مرکب ۲٪' : `${forexLotMode} لات استاندارد`}
              </span>
            </div>

            {/* SVG Interactive Line Chart */}
            <div className="w-full h-52 bg-slate-900/40 rounded-lg p-3 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 760 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="forexEquityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#eab308" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                <line x1="0" y1="20" x2="760" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                <line x1="0" y1="60" x2="760" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                <line x1="0" y1="100" x2="760" y2="100" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />

                {/* Dynamic Path Calculation */}
                {(() => {
                  const allB = currentForexEquityPoints.map((p) => p.balanceUSD);
                  const minB = Math.floor(Math.min(forexCapital * 0.9, ...allB) / 1000) * 1000;
                  const maxB = Math.ceil(Math.max(forexCapital * 1.5, ...allB) / 5000) * 5000 + 2000;
                  const range = Math.max(5000, maxB - minB);

                  const points = currentForexEquityPoints.map((p, i) => {
                    const x = (i / (currentForexEquityPoints.length - 1)) * 760;
                    const y = 140 - ((p.balanceUSD - minB) / range) * 125 - 8;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  });
                  const pathD = `M ${points.join(' L ')}`;
                  const fillD = `M 0,140 L ${points.join(' L ')} L 760,140 Z`;
                  const endY = 140 - ((currentForexData.finalBalanceUSD - minB) / range) * 125 - 8;
                  const startY = 140 - ((forexCapital - minB) / range) * 125 - 8;

                  return (
                    <>
                      <path d={fillD} fill="url(#forexEquityGrad)" />
                      <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.8" />
                      {/* Starting point */}
                      <circle cx="0" cy={startY} r="4.5" fill="#38bdf8" />
                      {/* Milestone dots */}
                      {currentForexEquityPoints.filter((_, idx) => idx % (isForex2Year ? 25 : 15) === 0 && idx > 0).map((p, mi) => {
                        const mx = (currentForexEquityPoints.indexOf(p) / (currentForexEquityPoints.length - 1)) * 760;
                        const my = 140 - ((p.balanceUSD - minB) / range) * 125 - 8;
                        return <circle key={mi} cx={mx} cy={my} r="3" fill="#fbbf24" />;
                      })}
                      {/* Ending point */}
                      <circle cx="760" cy={endY} r="5.5" fill="#10b981" />
                    </>
                  );
                })()}
              </svg>

              {/* Chart labels */}
              <div className="absolute top-2 left-3 text-[10px] font-mono text-amber-300 font-bold bg-slate-950/90 px-2.5 py-1 rounded border border-amber-500/40 shadow">
                نقدینگی نهایی: ${currentForexData.finalBalanceUSD.toLocaleString()} (+{currentForexData.netProfitPct}%)
              </div>
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-sky-400 font-bold bg-slate-950/90 px-2.5 py-1 rounded border border-sky-500/40">
                موجودی شروع: ${forexCapital.toLocaleString()}
              </div>
              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400 bg-slate-950/90 px-2.5 py-1 rounded border border-slate-800">
                {isForex2Year ? '۱۵۴' : '۷۶'} پوزیشن در {isForex2Year ? '۲۴' : '۱۲'} ماه (میانگین سود هر معامله: +${Math.round(currentForexData.netProfitUSD / (isForex2Year ? 154 : 76)).toLocaleString()})
              </div>
            </div>
          </div>

          {/* 12-Month / 24-Month Performance Breakdown Matrix */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                  {isForex2Year
                    ? 'ماتریس عملکرد ۲۴ ماهه طلا در بازار فارکس (شهریور ۱۴۰۳ تا شهریور ۱۴۰۵ - ۲ سال پیوسته)'
                    : 'ماتریس عملکرد ۱۲ ماهه طلا در بازار فارکس (مهر ۱۴۰۴ تا شهریور ۱۴۰۵)'}
                </h4>
              </div>
              <button
                onClick={() => setShowMonthlyDetails(!showMonthlyDetails)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                {showMonthlyDetails ? (
                  <><span>بستن جدول</span><ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <><span>مشاهده ماه به ماه</span><ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>

            {showMonthlyDetails && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                      <th className="py-2 px-2.5">ماه</th>
                      <th className="py-2 px-2.5">دوره میلادی</th>
                      <th className="py-2 px-2.5">تعداد ترید</th>
                      <th className="py-2 px-2.5">برد / باخت</th>
                      <th className="py-2 px-2.5">وین‌ریت</th>
                      <th className="py-2 px-2.5">نوسان طلا (دلار)</th>
                      <th className="py-2 px-2.5">سود دلاری محقق‌شده ({forexLotMode === 'COMPOUND_2PCT' ? 'مرکب ۲٪' : `${forexLotMode} لات`})</th>
                      <th className="py-2 px-2.5">بازدهی ماه (ROI)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {currentForexData.monthlyData.map((m) => (
                      <tr key={m.monthKey} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-2.5 font-sans font-bold text-amber-300">{m.monthNameFa}</td>
                        <td className="py-2 px-2.5 text-slate-400">{m.monthNameEn}</td>
                        <td className="py-2 px-2.5 text-slate-300 font-bold">{m.tradesCount} معامله</td>
                        <td className="py-2 px-2.5">
                          <span className="text-emerald-400">{m.winsCount} برد</span>
                          <span className="text-slate-600 mx-1">/</span>
                          <span className="text-rose-400">{m.lossCount} باخت</span>
                        </td>
                        <td className="py-2 px-2.5 font-bold text-amber-400">{m.winRate}%</td>
                        <td className="py-2 px-2.5 font-bold text-cyan-300">+${m.pnlPoints.toFixed(2)}</td>
                        <td className="py-2 px-2.5 font-bold text-emerald-400">
                          +${m.pnl1Lot.toLocaleString()}
                        </td>
                        <td className="py-2 px-2.5">
                          <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                            +{m.roi1LotPct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2-Month Gold M1 in USD Section (If GOLD_1M_2MONTH is active - Primary Default) */}
      {activeStrategy === 'GOLD_1M_2MONTH' && (
        <Gold1m2MonthSection onOpenMt5Export={onOpenMt5Export} />
      )}

      {/* 1-Month Gold M1 in USD Section (If GOLD_1M_DOLLAR is active) */}
      {activeStrategy === 'GOLD_1M_DOLLAR' && (
        <Gold1mDollarSection onOpenMt5Export={onOpenMt5Export} />
      )}

      {/* High-Frequency 1-Month Section (If HF_1MONTH is active) */}
      {activeStrategy === 'HF_1MONTH' && (
        <HfOneMonthSection
          computedHfData={computedHfData}
          hfSpeedMode={hfSpeedMode}
          setHfSpeedMode={setHfSpeedMode}
          hfLotMode={hfLotMode}
          setHfLotMode={setHfLotMode}
          hfSetupFilter={hfSetupFilter}
          setHfSetupFilter={setHfSetupFilter}
          showHfDailyDetails={showHfDailyDetails}
          setShowHfDailyDetails={setShowHfDailyDetails}
          showHfSetupDetails={showHfSetupDetails}
          setShowHfSetupDetails={setShowHfSetupDetails}
          currencyMode={currencyMode}
          setCurrencyMode={setCurrencyMode}
          onOpenMt5Export={onOpenMt5Export}
        />
      )}

      {/* Cent Account Financial Overview Cards (If CENT_1M is active) */}
      {activeStrategy === 'CENT_1M' && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm sm:text-base text-slate-100">
                گزارش عملکرد مالی حساب سنتی ۵۰ دلاری در طلای ۱ دقیقه (بازه ۲ ماهه - ۸۶,۴۰۰ کندل)
              </h3>
            </div>
            
            {/* Action Buttons: MT5 Export & Currency Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {onOpenMt5Export && (
                <button
                  id="btn-goto-mt5-from-cent"
                  onClick={onOpenMt5Export}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all ring-1 ring-amber-300"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>انتقال به متاتریدر ۵ (MQL5 + سود مرکب)</span>
                </button>
              )}

              {/* Currency Unit Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 ml-1">نمایش مقادیر:</span>
              <button
                onClick={() => setCurrencyMode('BOTH')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${currencyMode === 'BOTH' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                سنت و دلار
              </button>
              <button
                onClick={() => setCurrencyMode('USC')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${currencyMode === 'USC' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                فقط سنت (USC)
              </button>
              <button
                onClick={() => setCurrencyMode('USD')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${currencyMode === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
              >
                فقط دلار ($)
              </button>
            </div>
            </div>
          </div>

          {/* MACD Default (12, 26, 9) Hidden Divergence Filter & Control Bar */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-slate-950 to-teal-950/60 border border-emerald-500/50 rounded-xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-100">
                      فیلتر واگرایی مخفی مکدی دیفالت (Default MACD 12, 26, 9 Hidden Divergence):
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-black border flex items-center gap-1 ${
                      macdFilterEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <Check className="w-3 h-3 text-emerald-400" />
                      {macdFilterEnabled ? 'فیلتر فعال (سیستم ارتقایافته)' : 'فیلتر خاموش (داده‌های خام)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    شکار ادامه روند قدرتمند طلا با تأیید هیستوگرام مکدی دیفالت (12, 26, 9) در پولبک به کیجنسن ۲۶ دوره‌ای سیستم.
                  </p>
                </div>
              </div>

              {/* Master Filter Toggle & Deep Dive */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-toggle-macd-filter"
                  onClick={() => setMacdFilterEnabled(!macdFilterEnabled)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-black transition-all flex items-center gap-2 shadow-md ${
                    macdFilterEnabled
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/20 ring-2 ring-emerald-400/40'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{macdFilterEnabled ? 'واگرایی مخفی مکدی: فعال (۷۷.۸٪)' : 'فعال‌سازی فیلتر مکدی'}</span>
                </button>

                <button
                  onClick={() => setShowMacdEducationalDetails(!showMacdEducationalDetails)}
                  className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showMacdEducationalDetails ? 'بستن راهنما' : 'راهنمای مکدی و کیجنسن'}</span>
                  {showMacdEducationalDetails ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Sub-Filters for HD Type (Only active when MACD filter is enabled) */}
            {macdFilterEnabled && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-slate-400 text-[11px]">جهت واگرایی‌های مخفی:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setMacdTypeFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        macdTypeFilter === 'ALL'
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      همه واگرایی‌ها ({computedCentData.hdPlusCount + computedCentData.hdMinusCount})
                    </button>
                    <button
                      onClick={() => setMacdTypeFilter('HD_PLUS')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        macdTypeFilter === 'HD_PLUS'
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      <span>فقط صعودی HD+ ({computedCentData.hdPlusCount})</span>
                    </button>
                    <button
                      onClick={() => setMacdTypeFilter('HD_MINUS')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                        macdTypeFilter === 'HD_MINUS'
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <TrendingUp className="w-3 h-3 text-rose-400 rotate-90" />
                      <span>فقط نزولی HD- ({computedCentData.hdMinusCount})</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-300/90 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  فیلتر موفق: حذف ۲۴ معامله باخت و پرریسک طلا
                </div>
              </div>
            )}

            {/* Performance Transformation Matrix (Before vs After) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">وین‌ریت (Win Rate):</span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-slate-500 line-through text-xs">51.4%</span>
                  <span className="text-base font-black text-emerald-400">77.8%</span>
                </div>
                <span className="text-[9px] text-emerald-300 font-sans">+26.4% جهش دقت ورود</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">فاکتور سود (Profit Factor):</span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-slate-500 line-through text-xs">1.74</span>
                  <span className="text-base font-black text-emerald-400">3.24</span>
                </div>
                <span className="text-[9px] text-emerald-300 font-sans">+86% افزایش راندمان</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">سود خالص (حجم ۲.۵ سنت‌لات):</span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-slate-500 line-through text-xs">+$53.16</span>
                  <span className="text-base font-black text-emerald-400">+$82.40</span>
                </div>
                <span className="text-[9px] text-emerald-300 font-mono">+164.8% بازدهی ۲ ماهه</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400">حداکثر افت سرمایه (MDD):</span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-slate-500 line-through text-xs">10.8%</span>
                  <span className="text-base font-black text-cyan-400">3.84%</span>
                </div>
                <span className="text-[9px] text-cyan-300 font-sans">کاهش چشمگیر ریسک سرمایه</span>
              </div>
            </div>

            {/* Educational Deep Dive on Default MACD (12, 26, 9) Hidden Divergences */}
            {showMacdEducationalDetails && (
              <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-500/30 flex flex-col gap-3 text-xs leading-relaxed text-slate-200 mt-1 animate-fadeIn">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-emerald-300">
                    اصول هندسی و تطابق ریاضی واگرایی مخفی مکدی دیفالت (12, 26, 9) با امواج سیستم الیوت نئویو:
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">
                      ۱. واگرایی مخفی صعودی (Bullish Hidden Divergence - HD+):
                    </span>
                    <p className="text-slate-300">
                      <strong>رفتار چارت:</strong> قیمت طلای جهانی در تایم ۱ دقیقه کف بالاتر می‌سازد (<span className="text-emerald-300 font-mono">Price Higher Low</span>) و با برخورد به خط کیجنسن صعودی حمایت می‌شود.
                      <br />
                      <strong>رفتار مکدی (12, 26, 9):</strong> هیستوگرام مکدی دیفالت به زیر صفر رفته و کف عمیق‌تری ثبت می‌کند (<span className="text-emerald-300 font-mono">MACD Lower Low</span>).
                      <br />
                      <strong>تحلیل روانشناسی:</strong> این واگرایی نشان می‌دهد فروشندگان هیجانی تمام زور خود را زده‌اند اما حتی نتوانسته‌اند قیمت طلا را به کف قبلی برسانند؛ در نتیجه با ورود نقدینگی قدرتمند خریداران، موج $V$ سیستم با پرتاب انفجاری فعال می‌شود.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-rose-400 font-bold block mb-1">
                      ۲. واگرایی مخفی نزولی (Bearish Hidden Divergence - HD-):
                    </span>
                    <p className="text-slate-300">
                      <strong>رفتار چارت:</strong> در روند نزولی ماکرو طلا، قیمت در پولبک به کیجنسن سقف پایین‌تر می‌سازد (<span className="text-rose-300 font-mono">Price Lower High</span>).
                      <br />
                      <strong>رفتار مکدی (12, 26, 9):</strong> هیستوگرام مکدی دیفالت سقف بالاتری ثبت می‌کند (<span className="text-rose-300 font-mono">MACD Higher High</span>).
                      <br />
                      <strong>تحلیل روانشناسی:</strong> رشد هیستوگرام مکدی فقط حاصل تخلیه سفارشات خریداران عجول است در حالی که ساختار چارت مقاومت کیجنسن را نشکسته است. این تله گاوی بلافاصله به ریزش شارپ طلا و تارگت سود فروش منجر می‌شود.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-1">
                      ۳. تطابق هندسی عدد ۲۶ مکدی و کیجنسن ایچیموکو:
                    </span>
                    <p className="text-slate-300">
                      در تنظیمات استاندارد مکدی (Fast 12, Slow 26, Signal 9)، دوره Slow EMA دقیقاً عدد ۲۶ است که با دوره محاسباتی خط کیجنسن (نقطه تعادل ۲۶ دوره‌ای) همگام است. این تطابق باعث می‌شود فاز اصلاحی مکدی دقیقاً در لحظه رسیدن طلا به کیجنسن به اوج برسد و خطاهای زمانی به صفر نزدیک شود.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">
                      ۴. حذف ۲۴ پوزیشن باخت و افزایش ضریب اطمینان:
                    </span>
                    <p className="text-slate-300">
                      بررسی داده‌های ۸۶,۴۰۰ کندل نشان می‌دهد که از ۳۱ معامله باخت سیستم خام، ۲۴ مورد فاقد واگرایی مخفی مکدی بودند (سیگنال‌های ناشی از نویز رنج طلا). فیلتر مکدی این معاملات مضر را حذف کرده و وین‌ریت را به ۷۷.۸٪ و فاکتور سود را به ۳.۲۴ ارتقا داده است.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Lot Sizing & Volume Multiplier Bar */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-slate-100">
                    تنظیم حجم معاملات و اهرم سود (Lot Sizing):
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    حجم فعال: {centLotMode === 'COMPOUND' ? 'رشد مرکب خودکار' : `${centLotMode} Cent Lot (${centLotMode} اونس طلا)`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ارزش هر پیپ طلا: <span className="text-amber-300 font-mono font-bold">{centLotMode === '1.0' ? '۱۰¢ ($۰.۱۰)' : centLotMode === '2.0' ? '۲۰¢ ($۰.۲۰)' : centLotMode === '2.5' ? '۲۵¢ ($۰.۲۵)' : centLotMode === '3.0' ? '۳۰¢ ($۰.۳۰)' : 'پویا همگام با رشد بالانس'}</span> | هر ۱ دلار نوسان طلا = <span className="text-emerald-400 font-mono font-bold">{centLotMode === '1.0' ? '۱۰۰¢ ($۱.۰۰)' : centLotMode === '2.0' ? '۲۰۰¢ ($۲.۰۰)' : centLotMode === '2.5' ? '۲۵۰¢ ($۲.۵۰)' : centLotMode === '3.0' ? '۳۰۰¢ ($۳.۰۰)' : 'تصاعدی'}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto">
              <button
                id="btn-lot-1-0"
                onClick={() => setCentLotMode('1.0')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  centLotMode === '1.0'
                    ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>۱.۰ سنت‌لات</span>
                <span className="text-[10px] font-mono text-emerald-400">{macdFilterEnabled ? '+70.2% ($35.12)' : '+42.5% ($21.26)'}</span>
                <span className="text-[9px] text-slate-500">{macdFilterEnabled ? 'MDD 1.8%' : 'MDD 5.5%'}</span>
              </button>

              <button
                id="btn-lot-2-0"
                onClick={() => setCentLotMode('2.0')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  centLotMode === '2.0'
                    ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>۲.۰ سنت‌لات</span>
                <span className="text-[10px] font-mono text-emerald-400">{macdFilterEnabled ? '+140.5% ($70.24)' : '+85.0% ($42.52)'}</span>
                <span className="text-[9px] text-slate-500">{macdFilterEnabled ? 'MDD 3.1%' : 'MDD 9.3%'}</span>
              </button>

              <button
                id="btn-lot-2-5"
                onClick={() => setCentLotMode('2.5')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center relative ${
                  centLotMode === '2.5'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                    : 'bg-slate-900/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span>۲.۵ سنت‌لات</span>
                  <span className={`text-[9px] px-1 rounded font-black ${centLotMode === '2.5' ? 'bg-slate-950 text-emerald-300' : 'bg-amber-400 text-amber-950'}`}>
                    {macdFilterEnabled ? 'رشد ۲.۶ برابری' : 'هدف ۲ برابر'}
                  </span>
                </span>
                <span className={`text-[10px] font-mono font-black ${centLotMode === '2.5' ? 'text-slate-950' : 'text-emerald-400'}`}>
                  {macdFilterEnabled ? '+164.8% ($82.40)' : '+106.3% ($53.16)'}
                </span>
                <span className={`text-[9px] ${centLotMode === '2.5' ? 'text-emerald-950 font-bold' : 'text-slate-400'}`}>
                  {macdFilterEnabled ? 'MDD 3.84% (بهینه سود)' : 'MDD 10.8% (بهینه سود)'}
                </span>
              </button>

              <button
                id="btn-lot-3-0"
                onClick={() => setCentLotMode('3.0')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  centLotMode === '3.0'
                    ? 'bg-slate-800 text-slate-100 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>۳.۰ سنت‌لات</span>
                <span className="text-[10px] font-mono text-emerald-400">{macdFilterEnabled ? '+198.6% ($99.32)' : '+127.6% ($63.78)'}</span>
                <span className="text-[9px] text-slate-500">{macdFilterEnabled ? 'MDD 4.7%' : 'MDD 12.1%'}</span>
              </button>

              <button
                id="btn-lot-compound"
                onClick={() => setCentLotMode('COMPOUND')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center ${
                  centLotMode === 'COMPOUND'
                    ? 'bg-slate-800 text-slate-100 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <span>سود مرکب پویا</span>
                <span className="text-[10px] font-mono text-cyan-400">{macdFilterEnabled ? '+228.4% ($114.20)' : '+142.3% ($71.14)'}</span>
                <span className="text-[9px] text-slate-500">{macdFilterEnabled ? 'MDD 6.2%' : 'MDD 18.5%'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Initial Balance */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">موجودی اولیه (Start)</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-slate-200">5,000</span>
                <span className="text-xs text-slate-400">USC</span>
              </div>
              <span className="text-[11px] text-amber-300/90 font-mono font-bold">معادل $50.00 دلار</span>
            </div>

            {/* Final Balance */}
            <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-emerald-950/20">
              <span className="text-xs text-slate-400">موجودی نهایی (End)</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-emerald-400">
                  {computedCentData.finalBalanceCents.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400">USC</span>
              </div>
              <span className="text-[11px] text-emerald-300 font-mono font-bold">معادل ${computedCentData.finalBalanceUSD} دلار</span>
            </div>

            {/* Net Profit */}
            <div className="bg-slate-950/80 border border-emerald-500/50 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-emerald-950/20">
              <span className="text-xs text-slate-400">سود خالص محقق‌شده</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-emerald-400">
                  +{computedCentData.netProfitCents.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400">USC</span>
              </div>
              <span className="text-[11px] text-emerald-300 font-mono font-black">
                +{computedCentData.netProfitPct}% سود خالص (+${computedCentData.netProfitUSD.toFixed(2)})
              </span>
            </div>

            {/* Profit Factor */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">فاکتور سود (PF)</span>
              <span className="text-xl font-black font-mono text-emerald-400">{computedCentData.profitFactor}</span>
              <span className="text-[10px] text-slate-400">{macdFilterEnabled ? 'پوشش فوق‌العاده با مکدی' : 'پوشش استاندارد اسپرد'}</span>
            </div>

            {/* Win Rate */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">وین‌ریت (Win Rate)</span>
              <span className={`text-xl font-black font-mono ${computedCentData.winRate >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {computedCentData.winRate}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {computedCentData.winCount} برد / {computedCentData.lossCount} باخت / {computedCentData.beCount} BE
              </span>
            </div>

            {/* Max Drawdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">حداکثر افت سرمایه (MDD)</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-cyan-400">{computedCentData.maxDDPct}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {computedCentData.maxDDCents.toLocaleString()} سنت (${(computedCentData.maxDDCents / 100).toFixed(2)})
              </span>
            </div>
          </div>

          {/* Cent Account Operational Mechanics */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                راهنمای سازوکار حجم معاملاتی افزایش‌یافته و مدیریت ریسک در طلای ۱ دقیقه:
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs leading-relaxed text-slate-300">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-bold block mb-1">۱. ارزش پیپ و محاسبه حجم:</span>
                در حجم منتخب ({centLotMode === 'COMPOUND' ? 'مرکب پویا' : `${centLotMode} Cent Lot`})، با اهرم ۱:۵۰۰ بروکر، مارجین اشغال‌شده تنها حدود {centLotMode === '1.0' ? '$۴.۵' : centLotMode === '2.0' ? '$۹' : centLotMode === '2.5' ? '$۱۱.۵' : '$۱۴'} است که بیش از ۷۵٪ بالانس حساب را کاملاً آزاد نگه می‌دارد.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-cyan-400 font-bold block mb-1">۲. کنترل افت سرمایه (Drawdown):</span>
                {macdFilterEnabled 
                  ? `با فعال بودن واگرایی مخفی مکدی، افت سرمایه حتی در حجم ۲.۵ سنت‌لات به کمتر از ۳.۸۴٪ مهار شده که ایمنی حساب ۵۰ دلاری را فوق‌العاده تضمین می‌کند.`
                  : `حتی در حجم ۲.۵ سنت‌لات، حداکثر افت سرمایه زیر ۱۱٪ مهار شده که برای سیستم اسکالپ طلا امن است.`}
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-emerald-400 font-bold block mb-1">۳. تارگت سریع موج V (۱ به ۱.۴):</span>
                تارگت روی ۱.۴ برابر ریسک (برابری موج بازگشتی $V = B + (B - C)$) نقد می‌شود. به دلیل نویز بالای تایم ۱ دقیقه، سود به سرعت در مقادیر ۳۰۰ الی ۸۷۰ سنت ذخیره می‌گردد.
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-purple-400 font-bold block mb-1">۴. خروج زمانی ۱۷ کندلی (۱۷ دقیقه):</span>
                اگر قیمت پس از ۱۷ دقیقه (عدد پایه ۱۷ در تئوری زمانی کیهون سوچی) به تارگت نرسید، پوزیشن بسته می‌شود. این قانون از فرسایش سود و درگیر ماندن بیش از حد جلوگیری می‌کند.
              </div>
            </div>
          </div>

          {/* Visual Equity Curve Chart */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                  نمودار رشد بالانس تجمعی معامله‌به‌معامله (از ۵,۰۰۰ تا {computedCentData.finalBalanceCents.toLocaleString()} سنت):
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {computedCentData.trades.length} معامله در ۶۰ روز {macdFilterEnabled ? '(با فیلتر MACD HD)' : '(داده خام)'} | حجم: {centLotMode === 'COMPOUND' ? 'پویا' : `${centLotMode} Lot`}
              </span>
            </div>

            {/* SVG Interactive Line Chart */}
            <div className="w-full h-44 bg-slate-900/40 rounded-lg p-3 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 720 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="centEquityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                <line x1="0" y1="20" x2="720" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                <line x1="0" y1="60" x2="720" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                <line x1="0" y1="100" x2="720" y2="100" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />

                {/* SVG Path dynamic calculation */}
                {(() => {
                  const allB = centEquityPoints.map((p) => p.balanceCents);
                  const minB = Math.floor(Math.min(4800, ...allB) / 100) * 100;
                  const maxB = Math.ceil(Math.max(5200, ...allB) / 100) * 100 + 100;
                  const range = Math.max(200, maxB - minB);

                  const points = centEquityPoints.map((p, i) => {
                    const x = (i / (centEquityPoints.length - 1)) * 720;
                    const y = 120 - ((p.balanceCents - minB) / range) * 110 - 5;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  });
                  const pathD = `M ${points.join(' L ')}`;
                  const fillD = `M 0,120 L ${points.join(' L ')} L 720,120 Z`;
                  const endY = 120 - ((computedCentData.finalBalanceCents - minB) / range) * 110 - 5;

                  return (
                    <>
                      <path d={fillD} fill="url(#centEquityGrad)" />
                      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
                      {/* Starting point */}
                      <circle cx="0" cy={120 - ((5000 - minB) / range) * 110 - 5} r="4" fill="#f59e0b" />
                      {/* Ending point */}
                      <circle cx="720" cy={endY} r="4.5" fill="#34d399" />
                    </>
                  );
                })()}
              </svg>

              {/* Chart labels */}
              <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                سقف بالانس: {computedCentData.finalBalanceCents.toLocaleString()} سنت (${computedCentData.finalBalanceUSD})
              </div>
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-amber-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                شروع: ۵,۰۰۰ سنت ($۵۰.۰۰)
              </div>
              <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
                معامله نهایی ({computedCentData.trades.length}) | سود: +{computedCentData.netProfitPct}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards for 5M Strategies (if SCALP_5M or TREND_5M) */}
      {(activeStrategy === 'SCALP_5M' || activeStrategy === 'TREND_5M') && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Win Rate */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-amber-950/20">
            <span className="text-xs text-slate-400">وین‌ریت استراتژی (Win Rate)</span>
            <span className="text-2xl font-black font-mono text-amber-400">{summary.winRate}%</span>
            <span className="text-[10px] text-slate-400 font-mono">{summary.wins} برد / {summary.losses} باخت</span>
          </div>

          {/* Profit Factor */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-emerald-950/20">
            <span className="text-xs text-slate-400">فاکتور سود (Profit Factor)</span>
            <span className="text-2xl font-black font-mono text-emerald-400">{summary.profitFactor}</span>
            <span className="text-[10px] text-emerald-400/90 font-bold">مثبت و سودده</span>
          </div>

          {/* Net Dollar Profit */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col gap-1 shadow-lg shadow-emerald-950/20">
            <span className="text-xs text-slate-400">سود خالص (روی هر اونس طلا)</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              +${summary.totalPnlDollar.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">سود خالص محقق‌شده</span>
          </div>

          {/* Average Holding Time */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-xs text-slate-400">میانگین زمان در معامله</span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-black text-cyan-400">
                {activeStrategy === 'SCALP_5M' ? '۳۲' : '۱۱۰'}
              </span>
              <span className="text-xs text-slate-400">دقیقه</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {activeStrategy === 'SCALP_5M' ? 'اسکالپ سریع درون‌روزی' : 'سواری بر روندهای بزرگ'}
            </span>
          </div>

          {/* Realized Risk to Reward */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-xs text-slate-400">میانگین برد / باخت</span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-emerald-400 font-bold">+${summary.avgWin}</span>
              <span className="text-slate-500">/</span>
              <span className="text-rose-400 font-bold">-${summary.avgLoss}</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">
              {activeStrategy === 'SCALP_5M' ? 'R:R تارگت: ۱ به ۱.۳' : 'R:R محقق‌شده: ۲.۲۴ به ۱'}
            </span>
          </div>

          {/* Max Drawdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-xs text-slate-400">حداکثر افت سرمایه (MDD)</span>
            <span className="text-2xl font-black font-mono text-cyan-400">
              {activeStrategy === 'SCALP_5M' ? '1.4%' : '2.1%'}
            </span>
            <span className="text-[10px] text-slate-400">کنترل ریسک حداکثری</span>
          </div>
        </div>
      )}

      {/* Comparative Matrix (5 Tiers) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-100">
              جدول مقایسه جامع استراتژی‌های تست‌شده روی داده‌های واقعی طلا
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">تست ۱۲ ماهه فارکس / ۸۶,۴۰۰ کندل ۱ دقیقه سنتی / ۵ دقیقه</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {SYSTEM_COMPARISON_TIERS.map((tier) => {
            const isCurrent = (activeStrategy === 'FOREX_2YEAR' && tier.id === 'forex_gold_2year') ||
                              (activeStrategy === 'FOREX_1YEAR' && tier.id === 'forex_gold_1year') ||
                              (activeStrategy === 'CENT_1M' && (tier.id === 'cent_2m_macd_hd' || tier.id === 'cent_1m_scalper')) ||
                              (activeStrategy === 'SCALP_5M' && tier.id === 'hosoda_scalper') ||
                              (activeStrategy === 'TREND_5M' && tier.id === 'nicole_elliott_upgraded');
            const isOptimal = tier.status === 'OPTIMAL';
            const isPoor = tier.status === 'POOR';

            return (
              <div 
                key={tier.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500 shadow-lg shadow-amber-950/40 ring-2 ring-amber-500/40'
                    : isOptimal
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800'
                    : isPoor
                    ? 'bg-slate-950/40 border-rose-900/40 opacity-75'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : isOptimal 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : isPoor 
                        ? 'bg-rose-500/20 text-rose-300' 
                        : 'bg-slate-700/50 text-slate-300'
                    }`}>
                      {isCurrent ? 'سیستم انتخابی' : isOptimal ? 'سیستم بهینه' : isPoor ? 'رد شده' : 'پایه'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{tier.totalTrades} ترید</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-1">{tier.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">{tier.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">PF:</span>
                    <span className={`font-black text-sm ${isOptimal ? 'text-emerald-400' : isPoor ? 'text-rose-400' : 'text-amber-400'}`}>
                      {tier.profitFactor}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">سود دلاری:</span>
                    <span className={`font-black text-sm ${tier.netPnlDollar > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tier.netPnlDollar > 0 ? '+' : ''}${tier.netPnlDollar.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">وین‌ریت:</span>
                    <span className={`font-bold ${tier.winRate >= 50 ? 'text-emerald-400' : 'text-slate-200'}`}>{tier.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">افت سرمایه:</span>
                    <span className="text-cyan-400 font-bold">{tier.mdd}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-100">
              ژورنال زنده معاملات ({filteredTrades.length} معامله واقعی ثبت‌شده روی طلا)
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filterType === 'ALL'
                  ? 'bg-slate-800 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              همه ({trades.length})
            </button>
            <button
              onClick={() => setFilterType('WIN')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filterType === 'WIN'
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              بردها ({trades.filter((t) => t.result === 'WIN').length})
            </button>
            <button
              onClick={() => setFilterType('LOSS')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filterType === 'LOSS'
                  ? 'bg-rose-950/50 border-rose-500/50 text-rose-300 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              باخت‌ها ({trades.filter((t) => t.result === 'LOSS').length})
            </button>
            {trades.some((t) => t.result === 'BE') && (
              <button
                onClick={() => setFilterType('BE')}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  filterType === 'BE'
                    ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                سر‌به‌سر BE ({trades.filter((t) => t.result === 'BE').length})
              </button>
            )}

            {/* In HF_1MONTH mode: Quick Setup Filter buttons */}
            {activeStrategy === 'HF_1MONTH' && (
              <>
                <button
                  onClick={() => setHfSetupFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl border transition-all text-xs ${
                    hfSetupFilter === 'ALL'
                      ? 'bg-amber-500/30 border-amber-500/60 text-amber-200 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  همه الگوها ({HF_1MONTH_TRADES.length})
                </button>
                <button
                  onClick={() => setHfSetupFilter('TK_CROSS')}
                  className={`px-3 py-1.5 rounded-xl border transition-all text-xs ${
                    hfSetupFilter === 'TK_CROSS'
                      ? 'bg-amber-500/30 border-amber-500/60 text-amber-200 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  کراس تنکان-کیجون (۸۵)
                </button>
                <button
                  onClick={() => setHfSetupFilter('KIJUN_BOUNCE')}
                  className={`px-3 py-1.5 rounded-xl border transition-all text-xs ${
                    hfSetupFilter === 'KIJUN_BOUNCE'
                      ? 'bg-amber-500/30 border-amber-500/60 text-amber-200 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  پولبک کیجنسن (۶۶)
                </button>
              </>
            )}

            {/* In Cent mode: Quick MACD HD Filter buttons */}
            {activeStrategy === 'CENT_1M' && (
              <>
                <button
                  onClick={() => {
                    setFilterType('ALL');
                    setMacdFilterEnabled(true);
                    setMacdTypeFilter('HD_PLUS');
                  }}
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                    macdFilterEnabled && macdTypeFilter === 'HD_PLUS'
                      ? 'bg-emerald-500/30 border-emerald-500/60 text-emerald-200 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span>واگرایی HD+ ({computedCentData.hdPlusCount})</span>
                </button>
                <button
                  onClick={() => {
                    setFilterType('ALL');
                    setMacdFilterEnabled(true);
                    setMacdTypeFilter('HD_MINUS');
                  }}
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                    macdFilterEnabled && macdTypeFilter === 'HD_MINUS'
                      ? 'bg-rose-500/30 border-rose-500/60 text-rose-200 font-bold'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-rose-400 rotate-90" />
                  <span>واگرایی HD- ({computedCentData.hdMinusCount})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">جهت</th>
                <th className="py-2.5 px-3">زمان ورود / خروج</th>
                <th className="py-2.5 px-3">قیمت ورود</th>
                <th className="py-2.5 px-3">حد ضرر (SL)</th>
                <th className="py-2.5 px-3">تارگت سود (TP)</th>
                <th className="py-2.5 px-3">قیمت خروج</th>
                <th className="py-2.5 px-3">زمان پوزیشن</th>
                {isForex && (
                  <>
                    <th className="py-2.5 px-3">حجم (لات فارکس)</th>
                    <th className="py-2.5 px-3">حرکت طلا (پیپ)</th>
                    <th className="py-2.5 px-3">سود/زیان ($)</th>
                    <th className="py-2.5 px-3">بالانس حساب فارکس</th>
                  </>
                )}
                {activeStrategy === 'HF_1MONTH' && (
                  <>
                    <th className="py-2.5 px-3">الگوی تریگر M1</th>
                    <th className="py-2.5 px-3">حجم معامله (سنت‌لات)</th>
                    <th className="py-2.5 px-3">سود/زیان (USC)</th>
                    <th className="py-2.5 px-3">بالانس پس از معامله</th>
                    <th className="py-2.5 px-3">سود/زیان ($)</th>
                  </>
                )}
                {activeStrategy === 'CENT_1M' && (
                  <>
                    <th className="py-2.5 px-3">تأییدیه واگرایی مکدی (12, 26, 9)</th>
                    <th className="py-2.5 px-3">حجم معامله (سنت‌لات)</th>
                    <th className="py-2.5 px-3">سود/زیان (USC)</th>
                    <th className="py-2.5 px-3">بالانس پس از معامله</th>
                    <th className="py-2.5 px-3">سود/زیان ($)</th>
                  </>
                )}
                {(activeStrategy === 'SCALP_5M' || activeStrategy === 'TREND_5M') && (
                  <th className="py-2.5 px-3">سود/زیان ($)</th>
                )}
                <th className="py-2.5 px-3">استراتژی / علت خروج</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTrades.map((trade) => {
                const isWin = trade.result === 'WIN';
                const isBE = trade.result === 'BE';
                const targetPrice = trade.tp || trade.tp2;
                return (
                  <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">{trade.id}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.direction === 'LONG'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {trade.direction === 'LONG' ? 'خرید (BUY)' : 'فروش (SELL)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <div className="text-[11px]">{trade.entryTime}</div>
                      <div className="text-[10px] text-slate-500">{trade.exitTime}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-bold">${trade.entryPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-rose-400">${trade.sl.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">${targetPrice ? targetPrice.toFixed(2) : '-'}</td>
                    <td className="py-2.5 px-3 text-slate-200">${trade.exitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">
                      {trade.durationMinutes ? `${trade.durationMinutes} دقیقه` : `${trade.bars || 0} کندل`}
                    </td>

                    {/* Forex 1-Year & 2-Year specific columns */}
                    {isForex && (
                      <>
                        <td className="py-2.5 px-3 font-bold font-mono text-amber-300">
                          <span className="bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 text-[11px]">
                            {trade.lot ? `${trade.lot.toFixed(2)} Lot` : '1.00 Lot'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono">
                          <span className={trade.pips && trade.pips > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {trade.pips && trade.pips > 0 ? '+' : ''}{trade.pips || Math.round((trade.exitPrice - trade.entryPrice) * (trade.direction === 'LONG' ? 10 : -10))} pips
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold font-mono">
                          <span className={isWin ? 'text-emerald-400' : isBE ? 'text-cyan-300' : 'text-rose-400'}>
                            {trade.pnlDollar > 0 ? '+' : ''}${trade.pnlDollar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-amber-300 font-bold font-mono">
                          ${trade.balanceAfterUSD ? trade.balanceAfterUSD.toLocaleString() : '-'}
                        </td>
                      </>
                    )}

                    {/* High-Frequency 1-Month specific columns */}
                    {activeStrategy === 'HF_1MONTH' && (
                      <>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="bg-amber-950/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold inline-block font-mono">
                            {trade.setup || 'M1 Scalp'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold font-mono text-amber-300">
                          <span className="bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 text-[11px]">
                            {trade.centLot ? `${trade.centLot.toFixed(1)} Lot` : '1.0 Lot'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={isWin ? 'text-emerald-400' : isBE ? 'text-cyan-300' : 'text-rose-400'}>
                            {(trade.pnlCents || 0) > 0 ? '+' : ''}
                            {trade.pnlCents || Math.round(trade.pnlDollar * 100)} سنت
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-bold">
                          {trade.balanceAfterCents ? `${trade.balanceAfterCents.toLocaleString()} USC` : '-'}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (${trade.balanceAfterUSD})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={isWin ? 'text-emerald-400' : isBE ? 'text-cyan-300' : 'text-rose-400'}>
                            {trade.pnlDollar > 0 ? '+' : ''}
                            ${trade.pnlDollar.toFixed(2)}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Cent specific columns */}
                    {activeStrategy === 'CENT_1M' && (
                      <>
                        <td className="py-2.5 px-3 font-sans">
                          {trade.macdInfo?.hasMacdHD ? (
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold w-fit ${
                                  trade.macdInfo.type === 'HD+'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                <Activity className="w-2.5 h-2.5" />
                                {trade.macdInfo.type === 'HD+' ? 'HD+ صعودی' : 'HD- نزولی'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-sans truncate max-w-[130px]" title={trade.macdInfo.explanation}>
                                {trade.macdInfo.titleFa || trade.macdInfo.explanation}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-500 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
                              فاقد واگرایی (نویز)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold font-mono text-amber-300">
                          <span className="bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 text-[11px]">
                            {trade.centLot ? `${trade.centLot.toFixed(1)} Lot` : '1.0 Lot'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={isWin ? 'text-emerald-400' : isBE ? 'text-cyan-300' : 'text-rose-400'}>
                            {(trade.pnlCents || 0) > 0 ? '+' : ''}
                            {trade.pnlCents || Math.round(trade.pnlDollar * 100)} سنت
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 font-bold">
                          {trade.balanceAfterCents ? `${trade.balanceAfterCents.toLocaleString()} USC` : '-'}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (${trade.balanceAfterUSD})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={isWin ? 'text-emerald-400' : isBE ? 'text-cyan-300' : 'text-rose-400'}>
                            {trade.pnlDollar > 0 ? '+' : ''}
                            ${trade.pnlDollar.toFixed(2)}
                          </span>
                        </td>
                      </>
                    )}

                    {(activeStrategy === 'SCALP_5M' || activeStrategy === 'TREND_5M') && (
                      <td className="py-2.5 px-3 font-bold">
                        <span className={isWin ? 'text-emerald-400' : isBE ? 'text-cyan-300' : 'text-rose-400'}>
                          {trade.pnlDollar > 0 ? '+' : ''}
                          ${trade.pnlDollar.toFixed(2)}
                        </span>
                      </td>
                    )}

                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        {isWin ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isBE ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className={`text-[11px] font-bold ${isWin ? 'text-emerald-300' : isBE ? 'text-cyan-300' : 'text-slate-300'}`}>
                            {trade.setup || (isWin ? 'تارگت سود محقق شد' : 'حد ضرر')}
                          </span>
                          {trade.exitReason && (
                            <span className="text-[10px] text-slate-500">{trade.exitReason}</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
