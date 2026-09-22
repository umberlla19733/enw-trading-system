import { MarketAsset, Candle } from '../types';
import gold1mRecentCandles from './gold1mRecentCandles.json';

// Generate realistic realistic historical price sequence for BTC/USDT Daily (Summer-Fall 2023 accumulation & explosion)
function generateBtcDailyData(): Candle[] {
  const data: Candle[] = [];
  let currentDate = new Date('2023-06-15');
  let currentPrice = 25500;

  // Phase 1: Leading into compression (June - Aug 2023)
  const p1Trend = [
    25800, 26300, 26700, 27500, 28900, 29800, 30500, 31200, 30800, 30400,
    30600, 30200, 30350, 30100, 29900, 30250, 29800, 29500, 29200, 29400,
    29100, 28900, 29300, 29150, 29050, 29400, 29250, 29100, 28700, 26100,
    25900, 26200, 26050, 26150, 25800, 26000, 25950, 25700, 25850, 25900
  ];

  for (let i = 0; i < p1Trend.length; i++) {
    const target = p1Trend[i];
    const open = currentPrice;
    const close = target;
    const high = Math.max(open, close) + Math.random() * 350 + 100;
    const low = Math.min(open, close) - Math.random() * 350 - 100;
    const vol = Math.floor(15000 + Math.random() * 12000);
    currentPrice = close;
    data.push({
      time: currentDate.toISOString().slice(0, 10),
      open, high, low, close, volume: vol
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Phase 2: ESZ Compression (The Eye of the Storm Zone - late August to mid October 2023)
  // Tight consolidation between 26,000 and 28,500. Kijuns flatten completely.
  const p2Compression = [
    26100, 26400, 26250, 26500, 26600, 26350, 26550, 26700, 26650, 26500,
    26400, 26600, 26800, 26750, 26900, 27100, 26950, 26800, 27050, 27200,
    27400, 27150, 26900, 27200, 27600, 27900, 28300, 28100, 27950, 27500,
    27700, 27600, 27450, 27800, 27900, 28150, 28400, 28300, 28200, 28450
  ];

  for (let i = 0; i < p2Compression.length; i++) {
    const target = p2Compression[i];
    const open = currentPrice;
    const close = target;
    const high = Math.max(open, close) + Math.random() * 220 + 80;
    const low = Math.min(open, close) - Math.random() * 220 - 80;
    // Lower volume during compression!
    const vol = Math.floor(7000 + Math.random() * 4000);
    currentPrice = close;
    data.push({
      time: currentDate.toISOString().slice(0, 10),
      open, high, low, close, volume: vol
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Phase 3: The Spark & Valid Breakout (Mid October 2023)
  // Violent breakout candle breaking the 28,600 upper boundary with huge volume surge
  const p3Explosion = [
    28950, 29800, 30500, 33500, 34500, 34100, 34700, 35200, 35100, 35600,
    36400, 37200, 36800, 37500, 37800, 37400, 37900, 38400, 39500, 41200,
    42400, 43800, 44200, 43500, 42800, 43600, 44100, 45200, 46800, 48200
  ];

  for (let i = 0; i < p3Explosion.length; i++) {
    const target = p3Explosion[i];
    const open = currentPrice;
    const close = target;
    const isBreakoutDay = i === 3; // 33500 day
    const high = Math.max(open, close) + (isBreakoutDay ? 900 : Math.random() * 450 + 150);
    const low = Math.min(open, close) - (isBreakoutDay ? 200 : Math.random() * 350 + 100);
    // Massive volume surge on breakout
    const vol = isBreakoutDay 
      ? 58000 
      : Math.floor(25000 + Math.random() * 18000);
    currentPrice = close;
    data.push({
      time: currentDate.toISOString().slice(0, 10),
      open, high, low, close, volume: vol
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

// Generate Gold (XAU/USD) Data (Breakout from 1950 - 2075 zone)
function generateGoldData(): Candle[] {
  const data: Candle[] = [];
  let currentDate = new Date('2023-11-01');
  let currentPrice = 1960;

  const goldPrices = [
    // Pre-compression
    1975, 1982, 1990, 2010, 2035, 2045, 2020, 2010, 1995, 2025,
    2050, 2070, 2040, 2030, 2015, 2025, 2040, 2035, 2020, 2028,
    // ESZ Compression Zone (2010 - 2050)
    2025, 2022, 2030, 2035, 2028, 2032, 2025, 2038, 2040, 2035,
    2030, 2026, 2033, 2039, 2042, 2036, 2038, 2044, 2040, 2045,
    // The Breakout & Storm
    2065, 2085, 2115, 2145, 2160, 2155, 2170, 2185, 2210, 2240,
    2265, 2290, 2330, 2360, 2380, 2370, 2390, 2410, 2425, 2440
  ];

  for (let i = 0; i < goldPrices.length; i++) {
    const target = goldPrices[i];
    const open = currentPrice;
    const close = target;
    const isBreakout = i === 41;
    const high = Math.max(open, close) + (isBreakout ? 25 : Math.random() * 12 + 4);
    const low = Math.min(open, close) - (isBreakout ? 8 : Math.random() * 10 + 3);
    const vol = isBreakout ? 85000 : Math.floor(18000 + Math.random() * 14000);
    currentPrice = close;
    data.push({
      time: currentDate.toISOString().slice(0, 10),
      open, high, low, close, volume: vol
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

export const MARKET_ASSETS: MarketAsset[] = [
  {
    id: 'btc_usdt',
    name: 'بیت‌کوین (BTC/USDT)',
    symbol: 'BTCUSDT',
    timeframe: 'Daily (روزانه)',
    description: 'نمونه کلاسیک کتاب (صفحه ۶۶ و فصل ۲۱): فشردگی چندماهه در محدوده ۲۶ تا ۲۸ هزار دلار و شکست طوفانی به سمت ۴۸ هزار دلار',
    eszRange: [40, 80],
    breakoutIndex: 83,
    upperBoundary: 28600,
    lowerBoundary: 25800,
    stopLossPrice: 25700,
    targetPrice1: 35000,
    targetPrice2: 44000,
    candles: generateBtcDailyData(),
    wavePivots: [
      { index: 0, price: 25500, label: 'A', type: 'low', description: 'کف مبدا موج صعودی (Origin Wave A)' },
      { index: 7, price: 31200, label: 'B', type: 'high', description: 'سقف موج محرک اولیه (Impulse Wave B)' },
      { index: 40, price: 26100, label: 'C', type: 'low', description: 'کف اصلاحی و آغاز فاز فشردگی P-Wave در ESZ' },
      { index: 83, price: 28950, label: 'D/Breakout', type: 'breakout', description: 'شکست معتبر الگوی انقباضی و شروع شتاب N' },
      { index: 94, price: 35200, label: 'TP1 (V)', type: 'high', description: 'تحقق تارگت موج V سیستم الیوت نئویو' },
      { index: 109, price: 48200, label: 'TP2 (E)', type: 'high', description: 'تحقق تارگت نهایی موج E سیستم الیوت نئویو' }
    ],
    hosodaTargets: {
      vTarget: 36300,
      nTarget: 31800,
      eTarget: 36900,
      ntTarget: 26700
    },
    waveTargets: {
      vTarget: 36300,
      nTarget: 31800,
      eTarget: 36900,
      ntTarget: 26700
    },
    hosodaCycles: {
      baseIndex: 40,
      kihonNumbers: [
        { value: 9, label: '۹', name: 'اینکان (دوره کوتاه)' },
        { value: 17, label: '۱۷', name: 'دو اینکان (برگشت اول)' },
        { value: 26, label: '۲۶', name: 'ایچی‌کی (دوره پایه کیجنسن)' },
        { value: 33, label: '۳۳', name: 'کیهون‌سوچی ۳۳' },
        { value: 42, label: '۴۲', name: 'پایان انقباض ESZ' },
        { value: 52, label: '۵۲', name: 'دو ایچی‌کی (تکمیل تثبیت)' },
        { value: 65, label: '۶۵', name: 'تارگت زمانی میانی' },
        { value: 76, label: '۷۶', name: 'سان‌کی (یک فصل کامل)' }
      ],
      taitouWindow: { startIdx: 80, endIdx: 86, label: 'پنجره برابری زمانی (Taitou Suchi)' },
      nextTurningIndex: 92
    },
    positionConfig: {
      entryPrice: 28950,
      stopLossPrice: 25700,
      targetPrice1: 35000,
      targetPrice2: 44000,
      target1Price: 35000,
      target2Price: 44000,
      breakevenPrice: 28950,
      riskPips: 3250,
      reward1Pips: 6050,
      reward2Pips: 15050,
      riskReward1: 1.86,
      riskReward2: 4.63,
      trailingKijunActive: true
    }
  },
  {
    id: 'xau_usd',
    name: 'انس جهانی طلا (XAU/USD)',
    symbol: 'XAUUSD',
    timeframe: 'Daily (روزانه)',
    description: 'فشردگی عمیق کیجنسن‌های سه‌گانه در محدوده ۲۰۲۰-۲۰۴۵ دلار و خروج انفجاری به سقف‌های تاریخی جدید',
    eszRange: [20, 40],
    breakoutIndex: 42,
    upperBoundary: 2055,
    lowerBoundary: 2015,
    stopLossPrice: 2005,
    targetPrice1: 2160,
    targetPrice2: 2380,
    candles: generateGoldData(),
    wavePivots: [
      { index: 0, price: 1960, label: 'A', type: 'low', description: 'کف روند اولیه طلا (Wave A)' },
      { index: 11, price: 2070, label: 'B', type: 'high', description: 'سقف مقاومت تاریخی اولیه (Wave B)' },
      { index: 20, price: 2015, label: 'C', type: 'low', description: 'کف تثبیت و شروع منطقه ESZ' },
      { index: 42, price: 2085, label: 'D/Breakout', type: 'breakout', description: 'شکست تاریخی سقف و ورود تایید شده' },
      { index: 48, price: 2185, label: 'TP1', type: 'high', description: 'تحقق تارگت اول موج بازگشتی' },
      { index: 59, price: 2440, label: 'TP2', type: 'high', description: 'تحقق تارگت کشیده E سیستم الیوت نئویو' }
    ],
    hosodaTargets: {
      vTarget: 2125,
      nTarget: 2125,
      eTarget: 2180,
      ntTarget: 2070
    },
    waveTargets: {
      vTarget: 2125,
      nTarget: 2125,
      eTarget: 2180,
      ntTarget: 2070
    },
    hosodaCycles: {
      baseIndex: 20,
      kihonNumbers: [
        { value: 9, label: '۹', name: 'تک‌دوره' },
        { value: 17, label: '۱۷', name: 'آستانه نوسان' },
        { value: 22, label: '۲۲', name: 'شکست دقیق' },
        { value: 26, label: '۲۶', name: 'ایچی‌کی (۲۶ روز)' },
        { value: 42, label: '۴۲', name: 'موج شتاب' }
      ],
      taitouWindow: { startIdx: 40, endIdx: 44, label: 'پنجره تقارن زمانی سیستم الیوت نئویو' },
      nextTurningIndex: 49
    },
    positionConfig: {
      entryPrice: 2065,
      stopLossPrice: 2005,
      targetPrice1: 2160,
      targetPrice2: 2380,
      target1Price: 2160,
      target2Price: 2380,
      breakevenPrice: 2065,
      riskPips: 60,
      reward1Pips: 95,
      reward2Pips: 315,
      riskReward1: 1.58,
      riskReward2: 5.25,
      trailingKijunActive: true
    }
  },
  {
    id: 'gold_1m',
    name: 'اسکالپ طلای ۱ دقیقه (PAXG/USDT 1m)',
    symbol: 'PAXGUSDT-1M',
    timeframe: '1m (۱ دقیقه)',
    description: 'کندل‌های واقعی ۱ دقیقه‌ای طلا در تایم‌فریم اسکالپ سیستم الیوت نئویو برای بررسی چارت زنده و خطوط ایچیموکو',
    eszRange: [40, 80],
    breakoutIndex: 85,
    upperBoundary: 4372,
    lowerBoundary: 4363,
    stopLossPrice: 4360,
    targetPrice1: 4380,
    targetPrice2: 4395,
    candles: gold1mRecentCandles as Candle[],
    wavePivots: [
      { index: 25, price: 4361, label: 'A', type: 'low', description: 'کف محلی اسکالپ (Wave A)' },
      { index: 38, price: 4371, label: 'B', type: 'high', description: 'سقف فشردگی اولیه (Wave B)' },
      { index: 55, price: 4363.5, label: 'C', type: 'low', description: 'کف انقباض درون ESZ (Wave C)' },
      { index: 85, price: 4373, label: 'D/Breakout', type: 'breakout', description: 'شکست مرز بالایی و ورود سریع' }
    ],
    hosodaTargets: {
      vTarget: 4378.5,
      nTarget: 4373.5,
      eTarget: 4381.0,
      ntTarget: 4366.0
    },
    hosodaCycles: {
      baseIndex: 40,
      kihonNumbers: [
        { value: 9, label: '۹', name: '۹ دقیقه' },
        { value: 17, label: '۱۷', name: '۱۷ دقیقه (خروج زمانی)' },
        { value: 26, label: '۲۶', name: '۲۶ دقیقه' },
        { value: 42, label: '۴۲', name: '۴۲ دقیقه' }
      ],
      taitouWindow: { startIdx: 82, endIdx: 88, label: 'پنجره زمانی شکست ۱ دقیقه' },
      nextTurningIndex: 94
    },
    positionConfig: {
      entryPrice: 4372.5,
      stopLossPrice: 4360.0,
      targetPrice1: 4380.0,
      targetPrice2: 4395.0,
      target1Price: 4380.0,
      target2Price: 4395.0,
      breakevenPrice: 4372.5,
      riskPips: 12.5,
      reward1Pips: 7.5,
      reward2Pips: 22.5,
      riskReward1: 1.4,
      riskReward2: 3.2,
      trailingKijunActive: true
    }
  }
];
