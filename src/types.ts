export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IchimokuLines {
  tenkan: number | null;
  kijun: number | null;
  senkouA: number | null;
  senkouB: number | null;
  chikou: number | null;
}

export interface CalculatedDataPoint extends Candle {
  index: number;
  // S-Ichi (9, 26, 52)
  sTenkan: number | null;
  sKijun: number | null;
  sSenkouA: number | null;
  sSenkouB: number | null;
  sChikou: number | null;
  
  // M-Ichi (45, 130, 260)
  mTenkan: number | null;
  mKijun: number | null;
  mSenkouA: number | null;
  mSenkouB: number | null;
  
  // L-Ichi (225, 650, 1300)
  lTenkan: number | null;
  lKijun: number | null;
  lSenkouA: number | null;
  lSenkouB: number | null;

  // FLDs (Projected)
  sFld: number | null;
  mFld: number | null;
  lFld: number | null;

  // Elliott Neowave Custom Filter: EMA 60 & EMA 240 on Median Price (HL/2)
  ema60_hl2: number | null;
  ema240_hl2: number | null;
  emaCrossSignal: 'BULLISH_CROSS' | 'BEARISH_CROSS' | null;
  emaRegime: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface SystemEvent {
  index: number;
  price: number;
  type: 'esz_start' | 'esz_end' | 'breakout' | 'target_1' | 'target_2' | 'sl';
  title: string;
  description: string;
}

export interface WavePivot {
  index: number;
  price: number;
  label: string;
  type: 'high' | 'low' | 'breakout';
  description: string;
}

export interface WavePatternTargets {
  vTarget: number;
  nTarget: number;
  eTarget: number;
  ntTarget: number;
}
export type HosodaPatternTargets = WavePatternTargets;

export interface HarmonicCycles {
  baseIndex: number;
  kihonNumbers: { value: number; label: string; name: string }[];
  taitouWindow: { startIdx: number; endIdx: number; label: string };
  nextTurningIndex: number;
}
export type HosodaCycles = HarmonicCycles;

export interface PositionConfig {
  entryPrice: number;
  stopLossPrice: number;
  targetPrice1?: number;
  targetPrice2?: number;
  target1Price?: number;
  target2Price?: number;
  breakevenPrice: number;
  riskPips: number;
  reward1Pips: number;
  reward2Pips: number;
  riskReward1: number;
  riskReward2: number;
  trailingKijunActive: boolean;
}

export interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  description: string;
  eszRange: [number, number]; // candle index start and end
  breakoutIndex: number;
  upperBoundary: number;
  lowerBoundary: number;
  stopLossPrice: number;
  targetPrice1: number;
  targetPrice2: number;
  candles: Candle[];
  wavePivots?: WavePivot[];
  waveTargets?: WavePatternTargets;
  harmonicCycles?: HarmonicCycles;
  hosodaTargets?: WavePatternTargets;
  hosodaCycles?: HarmonicCycles;
  positionConfig?: PositionConfig;
}
