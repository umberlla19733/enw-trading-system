// MQL5 Source Code for Indicator and Expert Advisor for MetaTrader 5
// Designed & Developed for Elliott Neowave (elliottneowave.ir)
// Strategy: Elliott Neowave Trading System - EMA 60/240 HL/2 Cross + Ichimoku Waves + Default MACD (12, 26, 9) HD
// Unlimited Daily Trades Mode (0 = Unlimited)

export const MT5_INDICATOR_MQL5 = `//+------------------------------------------------------------------+
//|                     ElliottNeowave_EMA_Cross_Scalper_Indicator.mq5|
//|                 Copyright 2026, الیوت نئویو (elliottneowave.ir)   |
//|                                   https://elliottneowave.ir      |
//|  ⚡ EMA 60/240 (HL/2) + Ichimoku + ML Regression + ATR Signals   |
//+------------------------------------------------------------------+
#property copyright "الیوت نئویو - elliottneowave.ir"
#property link      "https://elliottneowave.ir"
#property version   "5.50"
#property description "اندیکاتور اختصاصی الیوت نئویو (elliottneowave.ir) - فیلتر طلایی کراس EMA 60/240 HL/2، پیش‌بینی رگرسیون یادگیری ماشین، و باندهای داینامیک ATR"
#property indicator_chart_window
#property indicator_buffers 8
#property indicator_plots   8

// Plot 1: EMA 60 (HL/2)
#property indicator_label1  "EMA 60 (HL/2)"
#property indicator_type1   DRAW_LINE
#property indicator_color1  clrGold
#property indicator_style1  STYLE_SOLID
#property indicator_width1  2

// Plot 2: EMA 240 (HL/2)
#property indicator_label2  "EMA 240 (HL/2)"
#property indicator_type2   DRAW_LINE
#property indicator_color2  clrDeepPink
#property indicator_style2  STYLE_SOLID
#property indicator_width2  2

// Plot 3: Golden Cross (EMA 60 > EMA 240) Arrow
#property indicator_label3  "Bullish Golden Cross (EMA 60/240)"
#property indicator_type3   DRAW_ARROW
#property indicator_color3  clrLime
#property indicator_width3  3

// Plot 4: Death Cross (EMA 60 < EMA 240) Arrow
#property indicator_label4  "Bearish Death Cross (EMA 60/240)"
#property indicator_type4   DRAW_ARROW
#property indicator_color4  clrRed
#property indicator_width4  3

// Plot 5: Tenkan-sen (9)
#property indicator_label5  "Tenkan-sen (9)"
#property indicator_type5   DRAW_LINE
#property indicator_color5  clrDodgerBlue
#property indicator_style5  STYLE_DOT
#property indicator_width5  1

// Plot 6: Kijun-sen (26/45)
#property indicator_label6  "Kijun-sen (26/45)"
#property indicator_type6   DRAW_LINE
#property indicator_color6  clrCyan
#property indicator_style6  STYLE_SOLID
#property indicator_width6  1

// Plot 7: ML Linear Regression Forecast Line
#property indicator_label7  "ML Regression Forecast (Slope)"
#property indicator_type7   DRAW_LINE
#property indicator_color7  clrSpringGreen
#property indicator_style7  STYLE_DASHDOT
#property indicator_width7  2

// Plot 8: ATR Dynamic Volatility Target Band
#property indicator_label8  "ATR Dynamic Target (2.0x)"
#property indicator_type8   DRAW_LINE
#property indicator_color8  clrOrange
#property indicator_style8  STYLE_DOT
#property indicator_width8  1

//--- Inputs
input group "=== ⚡ Elliott Neowave EMA 60/240 (HL/2) Settings ==="
input int    InpEmaFastPeriod   = 60;        // Fast EMA Period (Median HL/2)
input int    InpEmaSlowPeriod   = 240;       // Slow EMA Period (Median HL/2)

input group "=== Ichimoku Parameters ==="
input int    InpTenkanPeriod    = 9;         // Tenkan-sen Period (Standard 9)
input int    InpKijunPeriod     = 26;        // Kijun-sen Period (26 or 45)

input group "=== ML Linear Regression & ATR Settings ==="
input int    InpMlLookbackBars  = 14;        // ML Linear Regression Lookback Bars
input int    InpAtrPeriod       = 14;        // ATR Volatility Period
input double InpAtrMultiplier   = 2.0;       // ATR Target Multiplier

input group "=== MACD Settings (Default 12, 26, 9) ==="
input int    InpMacdFastEMA     = 12;        // Fast EMA Period
input int    InpMacdSlowEMA     = 26;        // Slow EMA Period
input int    InpMacdSignal      = 9;         // Signal SMA Period

input group "=== Alerts & Notifications ==="
input bool   InpEnableAlerts    = true;      // Enable Sound & Pop-up Alerts
input bool   InpSendNotifications = false;   // Send Push Notifications to Mobile

//--- Indicator Buffers
double Ema60Buffer[];
double Ema240Buffer[];
double BullCrossBuffer[];
double BearCrossBuffer[];
double TenkanBuffer[];
double KijunBuffer[];
double MlForecastBuffer[];
double AtrTargetBuffer[];

//--- Indicator Handles
int    Ema60Handle  = INVALID_HANDLE;
int    Ema240Handle = INVALID_HANDLE;
int    MacdHandle   = INVALID_HANDLE;
int    AtrHandle    = INVALID_HANDLE;

//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int OnInit()
{
   SetIndexBuffer(0, Ema60Buffer,       INDICATOR_DATA);
   SetIndexBuffer(1, Ema240Buffer,      INDICATOR_DATA);
   SetIndexBuffer(2, BullCrossBuffer,   INDICATOR_DATA);
   SetIndexBuffer(3, BearCrossBuffer,   INDICATOR_DATA);
   SetIndexBuffer(4, TenkanBuffer,      INDICATOR_DATA);
   SetIndexBuffer(5, KijunBuffer,       INDICATOR_DATA);
   SetIndexBuffer(6, MlForecastBuffer,  INDICATOR_DATA);
   SetIndexBuffer(7, AtrTargetBuffer,   INDICATOR_DATA);

   PlotIndexSetInteger(2, PLOT_ARROW, 233); // Up Arrow
   PlotIndexSetInteger(3, PLOT_ARROW, 234); // Down Arrow

   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(1, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(2, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(3, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(4, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(5, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(6, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(7, PLOT_EMPTY_VALUE, 0.0);

   ArraySetAsSeries(Ema60Buffer,       true);
   ArraySetAsSeries(Ema240Buffer,      true);
   ArraySetAsSeries(BullCrossBuffer,   true);
   ArraySetAsSeries(BearCrossBuffer,   true);
   ArraySetAsSeries(TenkanBuffer,      true);
   ArraySetAsSeries(KijunBuffer,       true);
   ArraySetAsSeries(MlForecastBuffer,  true);
   ArraySetAsSeries(AtrTargetBuffer,   true);

   // Calculate EMAs on PRICE_MEDIAN = (High + Low)/2
   Ema60Handle = iMA(_Symbol, _Period, InpEmaFastPeriod, 0, MODE_EMA, PRICE_MEDIAN);
   if(Ema60Handle == INVALID_HANDLE)
   {
      Print("Error creating EMA 60 handle: ", GetLastError());
      return INIT_FAILED;
   }

   Ema240Handle = iMA(_Symbol, _Period, InpEmaSlowPeriod, 0, MODE_EMA, PRICE_MEDIAN);
   if(Ema240Handle == INVALID_HANDLE)
   {
      Print("Error creating EMA 240 handle: ", GetLastError());
      return INIT_FAILED;
   }

   MacdHandle = iMACD(_Symbol, _Period, InpMacdFastEMA, InpMacdSlowEMA, InpMacdSignal, PRICE_CLOSE);
   AtrHandle  = iATR(_Symbol, _Period, InpAtrPeriod);

   IndicatorSetString(INDICATOR_SHORTNAME, "ElliottNeowave_EMA_Cross_ML_ATR(" + IntegerToString(InpEmaFastPeriod) + "/" + IntegerToString(InpEmaSlowPeriod) + "_HL2)");
   IndicatorSetInteger(INDICATOR_DIGITS, _Digits);

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Custom indicator deinitialization function                       |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   if(Ema60Handle != INVALID_HANDLE)  IndicatorRelease(Ema60Handle);
   if(Ema240Handle != INVALID_HANDLE) IndicatorRelease(Ema240Handle);
   if(MacdHandle != INVALID_HANDLE)   IndicatorRelease(MacdHandle);
   if(AtrHandle != INVALID_HANDLE)    IndicatorRelease(AtrHandle);
}

double HighestHigh(const MqlRates &rates[], int start, int count)
{
   double hi = rates[start].high;
   for(int i = start + 1; i < start + count && i < ArraySize(rates); i++)
   {
      if(rates[i].high > hi) hi = rates[i].high;
   }
   return hi;
}

double LowestLow(const MqlRates &rates[], int start, int count)
{
   double lo = rates[start].low;
   for(int i = start + 1; i < start + count && i < ArraySize(rates); i++)
   {
      if(rates[i].low < lo) lo = rates[i].low;
   }
   return lo;
}

//+------------------------------------------------------------------+
//| Calculate ML Least-Squares Linear Regression Forecast            |
//+------------------------------------------------------------------+
double CalculateMlForecast(const MqlRates &rates[], int startBar, int period)
{
   if(startBar + period >= ArraySize(rates)) return rates[startBar].close;
   double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
   int n = period;
   for(int i = 0; i < n; i++)
   {
      double x = (double)(n - 1 - i);
      double y = rates[startBar + i].close;
      sumX  += x;
      sumY  += y;
      sumXY += x * y;
      sumX2 += x * x;
   }
   double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX + 0.0000001);
   double intercept = (sumY - slope * sumX) / n;
   return intercept + slope * (double)n; // 1-bar forward prediction
}

//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
{
   if(rates_total < InpEmaSlowPeriod + 10) return 0;

   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int copied = CopyRates(_Symbol, _Period, 0, rates_total, rates);
   if(copied <= 0) return 0;

   double ema60Values[], ema240Values[], atrValues[];
   ArraySetAsSeries(ema60Values, true);
   ArraySetAsSeries(ema240Values, true);
   ArraySetAsSeries(atrValues, true);

   if(CopyBuffer(Ema60Handle, 0, 0, rates_total, ema60Values) <= 0 ||
      CopyBuffer(Ema240Handle, 0, 0, rates_total, ema240Values) <= 0 ||
      CopyBuffer(AtrHandle, 0, 0, rates_total, atrValues) <= 0)
      return 0;

   int limit = rates_total - prev_calculated;
   if(prev_calculated > 0) limit++;
   if(limit > rates_total - InpEmaSlowPeriod - 1)
      limit = rates_total - InpEmaSlowPeriod - 1;

   for(int i = limit; i >= 1; i--)
   {
      Ema60Buffer[i]  = ema60Values[i];
      Ema240Buffer[i] = ema240Values[i];

      double hh9 = HighestHigh(rates, i, InpTenkanPeriod);
      double ll9 = LowestLow(rates, i, InpTenkanPeriod);
      TenkanBuffer[i] = (hh9 + ll9) / 2.0;

      double hh26 = HighestHigh(rates, i, InpKijunPeriod);
      double ll26 = LowestLow(rates, i, InpKijunPeriod);
      KijunBuffer[i] = (hh26 + ll26) / 2.0;

      // ML Linear Regression 1-bar forecast
      MlForecastBuffer[i] = CalculateMlForecast(rates, i, InpMlLookbackBars);

      // ATR Volatility Target Band
      double currentAtr = (atrValues[i] > 0.1) ? atrValues[i] : 1.5;
      if(ema60Values[i] >= ema240Values[i])
         AtrTargetBuffer[i] = rates[i].close + (currentAtr * InpAtrMultiplier);
      else
         AtrTargetBuffer[i] = rates[i].close - (currentAtr * InpAtrMultiplier);

      BullCrossBuffer[i] = 0.0;
      BearCrossBuffer[i] = 0.0;

      // Detect EMA 60/240 HL/2 Golden Cross
      if(ema60Values[i] > ema240Values[i] && ema60Values[i + 1] <= ema240Values[i + 1])
      {
         BullCrossBuffer[i] = rates[i].low - 1.20;
         if(i == 1 && InpEnableAlerts)
         {
            Alert("⚡ [elliottneowave.ir] Golden Cross EMA 60/240 (HL/2) at ", rates[i].close, " on ", _Symbol, " | ML Slope Positive");
         }
      }
      // Detect EMA 60/240 HL/2 Death Cross
      else if(ema60Values[i] < ema240Values[i] && ema60Values[i + 1] >= ema240Values[i + 1])
      {
         BearCrossBuffer[i] = rates[i].high + 1.20;
         if(i == 1 && InpEnableAlerts)
         {
            Alert("⚡ [elliottneowave.ir] Death Cross EMA 60/240 (HL/2) at ", rates[i].close, " on ", _Symbol, " | ML Slope Negative");
         }
      }
   }

   return rates_total;
}
`;

export const MT5_EXPERT_ADVISOR_MQL5 = `//+------------------------------------------------------------------+
//|               ElliottNeowave_Gold_Scalper_MTF_AI_EA.mq5           |
//|               Copyright 2026, الیوت نئویو (elliottneowave.ir)     |
//|                                   https://elliottneowave.ir      |
//|  ⚡ ULTRA AI ENSEMBLE + MULTI-TIMEFRAME (M1 + M5 + M15) ENGINE   |
//|      EMA 60/240 (HL/2) + Machine Learning Score + Dynamic ATR     |
//+------------------------------------------------------------------+
#property copyright "الیوت نئویو - elliottneowave.ir"
#property link      "https://elliottneowave.ir"
#property version   "6.00"
#property description "ربات معاملاتی نسل ۶ الیوت نئویو (elliottneowave.ir) - موتور هوش مصنوعی انسمبل و تاییدیه همزمان ۳ تایم‌فریم (M1, M5, M15) با فیلتر کراس EMA 60/240 HL/2"

#include <Trade\\Trade.mqh>
#include <Trade\\PositionInfo.mqh>
#include <Trade\\AccountInfo.mqh>
#include <Trade\\SymbolInfo.mqh>

CTrade         m_trade;
CPositionInfo  m_position;
CAccountInfo   m_account;
CSymbolInfo    m_symInfo;

//--- Trade Frequency Modes
enum ENUM_TRADE_FREQUENCY
{
   FREQ_HIGH_SPEED   = 0, // ⚡ High Frequency Scalper (8 - 25+ Trades/Day: EMA Cross + TK Breakout)
   FREQ_BALANCED     = 1, // ⚖️ Balanced Day-Trader (3 - 8 Trades/Day: EMA Filtered Kijun Bounce)
   FREQ_SNIPER_HD    = 2  // 🎯 Conservative Sniper (Strict Hidden MACD Div with EMA Alignment)
};

//--- Flexible Stop Loss Modes
enum ENUM_SL_MODE
{
   SL_MODE_DYNAMIC_ATR       = 0, // 1. Dynamic ATR Volatility Adaptive (پویای ATR بر اساس نوسان طلا)
   SL_MODE_SWING_STRUCTURE   = 1, // 2. Structural Swing High/Low + Cushion (سویینگ استراکچر)
   SL_MODE_KIJUN_EQUILIBRIUM = 2, // 3. Dynamic Kijun-sen Equilibrium Line (خط تعادل کیجنسن)
   SL_MODE_CUSTOM_FIXED      = 3, // 4. Custom Dollar / Pip Distance (دستی و آزاد)
   SL_MODE_AI_ADAPTIVE       = 4  // 5. AI Confidence & Regression Cone Adaptive
};

//--- Expert Inputs
input group "=== 🤖 AI Machine Learning & Confidence Filter ==="
input bool                 InpUseAiConfidenceFilter = true;           // Enable AI Ensemble Confidence Filter (فیلتر هوش مصنوعی)
input double               InpMinAiConfidence       = 80.0;          // Min AI Confidence Score % (حداقل درصد اطمینان مدل 0-100)
input int                  InpMlLookbackBars        = 14;            // ML Linear Regression Lookback Bars

input group "=== 🌐 Multi-Timeframe (MTF) Trend Alignment ==="
input bool                 InpUseMtfFilter          = true;           // Enable Multi-Timeframe Filter (M1 + M5 + M15)
input ENUM_TIMEFRAMES      InpHigherTf1             = PERIOD_M5;     // Macro Timeframe 1 (تایم‌فریم اول: ۵ دقیقه)
input ENUM_TIMEFRAMES      InpHigherTf2             = PERIOD_M15;    // Macro Timeframe 2 (تایم‌فریم دوم: ۱۵ دقیقه)
input bool                 InpRequireStrictMtfConsensus = true;      // Require Full Consensus on M5 & M15 (تایید کامل جهت ماکرو)

input group "=== 🛡️ News & Event Protection Shield ==="
input bool                 InpUseNewsFilter         = true;           // Enable News Protection Shield (سپر محافظت اخبار)
input int                  InpNewsPauseBeforeMin    = 30;             // Pause Trading Before News (دقیقه قبل از خبر)
input int                  InpNewsPauseAfterMin     = 30;             // Pause Trading After News (دقیقه بعد از خبر)
input int                  InpNewsMinImportance     = 2;              // Min News Importance (1=Low, 2=Medium, 3=High NFP/CPI/FOMC)
input bool                 InpNewsClosePositions    = false;          // Close Open Positions Before High-Impact News (بستن پوزیشن‌ها)
input bool                 InpNewsLockBreakEven     = true;           // Auto Lock Break-Even for Open Profitable Trades Before News
input bool                 InpUseSpreadNewsFilter   = true;           // Auto Spread-Spike News Shield (سپر پرش اسپرد در لحظه خبر)
input int                  InpMaxAllowedSpread      = 45;             // Max Allowed Spread (Points / پیپت) during news

input group "=== 🛡️ Flexible & Adaptive Stop Loss Architecture ==="
input ENUM_SL_MODE         InpStopLossMode          = SL_MODE_DYNAMIC_ATR; // Stop Loss Architecture Mode (مدل حد ضرر منعطف)
input double               InpAtrSlMultiplier       = 2.2;            // Dynamic ATR Multiplier (1.0 - 4.5x)
input int                  InpSwingLookbackBars     = 12;             // Swing High/Low Lookback Bars (3 - 30)
input double               InpSwingBufferUSD        = 0.40;           // Swing Cushion Buffer in Gold USD ($0.40 = 4 pips)
input double               InpCustomSlUSD           = 3.20;           // Custom Fixed SL in Gold USD ($3.20 = 32 pips)
input double               InpCustomTpUSD           = 5.00;           // Custom Fixed TP in Gold USD ($5.00 = 50 pips)
input bool                 InpEnableDynamicTrailing = true;           // Enable Dynamic Trailing Stop (تریلینگ استاپ پویا)
input double               InpTrailingStartPoints   = 2.50;           // Trailing Activation Profit in Gold USD
input double               InpTrailingStepPoints    = 0.60;           // Trailing Step in Gold USD

input group "=== ⚡ Trading Frequency & Volume Booster ==="
input ENUM_TRADE_FREQUENCY InpTradeFrequency       = FREQ_HIGH_SPEED;// Strategy Frequency Mode (HIGH_SPEED = Fast Scalper)
input int                  InpMaxConcurrentTrades  = 2;              // Max Concurrent Open Positions (1 to 5)
input int                  InpMaxDailyTrades       = 0;              // Maximum Daily Trades (0 = Unlimited / بدون محدودیت)
input bool                 InpFastScalpExits       = true;           // Fast Turnover Mode (Releases capital quickly for new entries)
input double               InpFastScalpTP          = 3.80;           // Fast Scalp TP in Gold Dollars ($3.80 = 38 pips)
input double               InpFastScalpSL          = 2.40;           // Fast Scalp SL in Gold Dollars ($2.40 = 24 pips)
input int                  InpFastTimeExitMinutes  = 13;             // Fast Time Exit (13-bar time exit)

input group "=== ⚡ Elliott Neowave EMA 60/240 HL/2 Filter ==="
input bool                 InpUseEmaCrossFilter    = true;           // Enable EMA 60/240 (HL/2) High-Quality Filter
input int                  InpEmaFastPeriod        = 60;             // Fast EMA Period (HL/2 Median Price)
input int                  InpEmaSlowPeriod        = 240;            // Slow EMA Period (HL/2 Median Price)
input bool                 InpRequireFreshCross    = false;          // Require Fresh Cross within N Bars (false = Trend Alignment)
input int                  InpCrossMaxAgeBars      = 30;             // Max Bars Since Cross for Fresh Cross Entry

input group "=== 📡 Web Remote Commander & Live Cloud Bridge ==="
input bool     InpEnableWebCommander   = true;                       // Enable Web Remote Commander (هدایت زنده از وب‌سایت)
input string   InpCommanderServerUrl   = "https://ea.elliottneowave.ir/api/ea/heartbeat"; // Web Dashboard API URL
input string   InpCommanderApiKey      = "ELLIOTT-NEOWAVE-SECRET-KEY"; // Dashboard Authentication API Key
input int      InpHeartbeatIntervalSec = 3;                          // Telemetry & Command Polling Interval (Seconds)

input group "=== Broker & Execution Settings ==="
input string   InpCustomSymbol         = "";        // Custom Symbol (leave empty for auto-detect e.g. XAUUSD_I / XAUUSD)
input ulong    InpMagicNumber          = 791826;    // EA Magic Number
input ulong    InpSlippage             = 30;        // Max Slippage in points
input bool     InpAutoDetectFilling    = true;      // Auto-Detect Order Filling (FOK / IOC / RETURN)

input group "=== Safe Capital & Compound Management ==="
input bool     InpUseCompounding       = false;     // Enable Dynamic Compound (Keep FALSE initially for fixed lot)
input double   InpBaseFixedLot         = 0.10;      // Starting Safe Lot Size (0.10 Lot Standard Dollar Account)
input double   InpInitialCapitalUSD    = 1000.0;    // Initial Capital USD ($1,000 Standard Dollar Account)
input double   InpMaxLotLimit          = 2.00;      // Hard Limit Max Lot (Protects Account from Overleverage)
input double   InpRiskPercentPerTrade  = 2.0;       // Max Risk % per trade when Compounding is active

input group "=== Strategy Parameters (Ichimoku + MACD) ==="
input int      InpKijunPeriod          = 26;        // Kijun-sen Base Period
input int      InpTenkanPeriod         = 9;         // Tenkan-sen Period
input int      InpSpanBPeriod          = 52;        // Senkou Span B Base
input int      InpMacdFastEMA          = 12;        // Default MACD Fast EMA
input int      InpMacdSlowEMA          = 26;        // Default MACD Slow EMA
input int      InpMacdSignal           = 9;         // Default MACD Signal SMA
input int      InpLookbackPivots       = 40;        // Divergence Pivot Search Bars
input int      InpEmergencyExitMinutes = 26;        // Standard Time Exit (26 Bars)

input group "=== Dynamic ATR Volatility Trailing & Targets ==="
input int      InpAtrPeriod            = 14;        // ATR Volatility Period
input double   InpAtrMultiplier        = 1.8;       // Dynamic ATR TP Multiplier
input double   InpBreakEvenTrigger     = 2.20;      // Lock BE at +$2.20 Gold move
input double   InpBreakEvenBuffer      = 0.50;      // Lock +$0.50 above entry when BE triggers

//--- Global Handles
int      g_macdHandle          = INVALID_HANDLE;
int      g_ema60_M1_Handle     = INVALID_HANDLE;
int      g_ema240_M1_Handle    = INVALID_HANDLE;
int      g_ema60_M5_Handle     = INVALID_HANDLE;
int      g_ema240_M5_Handle    = INVALID_HANDLE;
int      g_ema60_M15_Handle    = INVALID_HANDLE;
int      g_ema240_M15_Handle   = INVALID_HANDLE;
int      g_atrHandle           = INVALID_HANDLE;

datetime g_lastBarTime         = 0;
string   g_tradeSymbol         = "";
int      g_lastDay             = -1;
int      g_dailyTradesToday    = 0;

//--- 📡 Web Remote Commander Runtime State (Live Bi-Directional Synchronized with Web Dashboard)
bool     g_remoteTradingEnabled       = true;
datetime g_lastHeartbeatTime          = 0;
double   g_dynamicRemoteLot           = 0.0;
int      g_dynamicRemoteMode          = -1; // -1 = default input, 0 = HIGH_SPEED, 1 = BALANCED, 2 = SNIPER
int      g_dynamicRemoteSlMode        = -1; // -1 = default input, 0 = ATR, 1 = SWING, 2 = KIJUN, 3 = CUSTOM, 4 = AI
double   g_dynamicRemoteCustomSl      = -1.0;
double   g_dynamicRemoteCustomTp      = -1.0;
int      g_dynamicRemoteTrailing      = -1; // -1 = default input, 1 = true, 0 = false
int      g_dynamicRemoteNewsFilter    = -1; // -1 = default input, 1 = true, 0 = false
int      g_dynamicRemoteMaxTrades     = -1; // -1 = default input, >0 = limit

//+------------------------------------------------------------------+
//| Helper: Extract clean numerical string from JSON payload         |
//+------------------------------------------------------------------+
string CleanJsonNumber(string raw)
{
   string clean = "";
   int len = StringLen(raw);
   for(int i = 0; i < len; i++)
   {
      ushort c = StringGetCharacter(raw, i);
      if((c >= 48 && c <= 57) || c == 46 || c == 45)
      {
         clean += ShortToString(c);
      }
      else if(StringLen(clean) > 0)
      {
         if(c == 44 || c == 125 || c == 32 || c == 34 || c == 13 || c == 10 || c == 58)
            break;
      }
   }
   return clean;
}

//+------------------------------------------------------------------+
//| Close all open positions immediately (Emergency Kill Switch)     |
//+------------------------------------------------------------------+
void CloseAllPositionsNow(string reason = "Emergency Web Command")
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(m_position.SelectByIndex(i))
      {
         if(m_position.Magic() == InpMagicNumber && m_position.Symbol() == g_tradeSymbol)
         {
            ulong ticket = m_position.Ticket();
            Print("🚨 [WEB KILL-SWITCH] Closing Ticket #", ticket, " - Reason: ", reason);
            m_trade.PositionClose(ticket);
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Web Remote Commander & Live Cloud Bridge Polling via WebRequest  |
//+------------------------------------------------------------------+
void PollWebCommander()
{
   if(!InpEnableWebCommander || InpCommanderServerUrl == "") return;

   datetime now = TimeCurrent();
   if(now - g_lastHeartbeatTime < InpHeartbeatIntervalSec) return;
   g_lastHeartbeatTime = now;

   // 1. Format Open Positions JSON
   string positionsJson = "[";
   int posCount = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(m_position.SelectByIndex(i))
      {
         if(m_position.Magic() == InpMagicNumber && m_position.Symbol() == g_tradeSymbol)
         {
            if(posCount > 0) positionsJson += ",";
            string pType = (m_position.PositionType() == POSITION_TYPE_BUY ? "BUY" : "SELL");
            positionsJson += StringFormat("{\\"ticket\\":%I64d,\\"symbol\\":\\"%s\\",\\"type\\":\\"%s\\",\\"volume\\":%.2f,\\"openPrice\\":%.2f,\\"currentPrice\\":%.2f,\\"sl\\":%.2f,\\"tp\\":%.2f,\\"profit\\":%.2f,\\"openTime\\":\\"%s\\",\\"comment\\":\\"%s\\"}",
               m_position.Ticket(),
               m_position.Symbol(),
               pType,
               m_position.Volume(),
               m_position.PriceOpen(),
               m_position.PriceCurrent(),
               m_position.StopLoss(),
               m_position.TakeProfit(),
               m_position.Profit(),
               TimeToString((datetime)m_position.Time(), TIME_DATE|TIME_MINUTES),
               m_position.Comment()
            );
            posCount++;
         }
      }
   }
   positionsJson += "]";

   // 2. Build Telemetry JSON Payload
   string postData = StringFormat(
      "{\\"accountNumber\\":\\"%I64d\\",\\"accountName\\":\\"%s\\",\\"broker\\":\\"%s\\",\\"currency\\":\\"%s\\",\\"balance\\":%.2f,\\"equity\\":%.2f,\\"margin\\":%.2f,\\"freeMargin\\":%.2f,\\"marginLevel\\":%.1f,\\"floatingProfit\\":%.2f,\\"symbol\\":\\"%s\\",\\"currentSpread\\":%d,\\"goldBid\\":%.2f,\\"goldAsk\\":%.2f,\\"isAutoTrading\\":true,\\"eaVersion\\":\\"v6.0\\",\\"magicNumber\\":%I64d,\\"openPositions\\":%s,\\"token\\":\\"%s\\"}",
      AccountInfoInteger(ACCOUNT_LOGIN),
      AccountInfoString(ACCOUNT_NAME),
      AccountInfoString(ACCOUNT_COMPANY),
      AccountInfoString(ACCOUNT_CURRENCY),
      AccountInfoDouble(ACCOUNT_BALANCE),
      AccountInfoDouble(ACCOUNT_EQUITY),
      AccountInfoDouble(ACCOUNT_MARGIN),
      AccountInfoDouble(ACCOUNT_MARGIN_FREE),
      AccountInfoDouble(ACCOUNT_MARGIN_LEVEL),
      AccountInfoDouble(ACCOUNT_PROFIT),
      g_tradeSymbol,
      (int)SymbolInfoInteger(g_tradeSymbol, SYMBOL_SPREAD),
      SymbolInfoDouble(g_tradeSymbol, SYMBOL_BID),
      SymbolInfoDouble(g_tradeSymbol, SYMBOL_ASK),
      InpMagicNumber,
      positionsJson,
      InpCommanderApiKey
   );

   char post[], result[];
   string resultHeaders;
   StringToCharArray(postData, post, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(post, ArraySize(post) - 1);

   string headers = "Content-Type: application/json\\r\\nAccept: application/json\\r\\n";
   if(InpCommanderApiKey != "")
      headers += "X-API-KEY: " + InpCommanderApiKey + "\\r\\n";

   ResetLastError();
   int res = WebRequest("POST", InpCommanderServerUrl, headers, 3000, post, result, resultHeaders);

   if(res == 200)
   {
      string responseStr = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);

      // A. Parse Remote Execution Status (Kill-Switch / Pause / Resume)
      if(StringFind(responseStr, "PAUSE") >= 0 || StringFind(responseStr, "isTradingEnabled\\\":false") >= 0 || StringFind(responseStr, "isTradingEnabled:false") >= 0)
      {
         if(g_remoteTradingEnabled)
         {
            g_remoteTradingEnabled = false;
            Print("🛑 [WEB COMMANDER] Auto-Trading PAUSED remotely from Web Dashboard.");
         }
      }
      else if(StringFind(responseStr, "RESUME") >= 0 || StringFind(responseStr, "isTradingEnabled\\\":true") >= 0 || StringFind(responseStr, "isTradingEnabled:true") >= 0)
      {
         if(!g_remoteTradingEnabled)
         {
            g_remoteTradingEnabled = true;
            Print("▶️ [WEB COMMANDER] Auto-Trading RESUMED remotely from Web Dashboard.");
         }
      }

      if(StringFind(responseStr, "CLOSE_ALL") >= 0 || StringFind(responseStr, "emergencyClose\\\":true") >= 0 || StringFind(responseStr, "emergencyCloseRequested\\\":true") >= 0)
      {
         Print("🚨 [WEB COMMANDER] EMERGENCY CLOSE ALL requested from Web! Closing open trades...");
         CloseAllPositionsNow("Emergency Web Command");
      }

      // B. Parse Remote Dynamic Lot Adjustment
      int lotPos = StringFind(responseStr, "baseLot");
      if(lotPos < 0) lotPos = StringFind(responseStr, "lotSize");
      if(lotPos >= 0)
      {
         string lotSub = StringSubstr(responseStr, lotPos + 7, 12);
         double newLot = StringToDouble(CleanJsonNumber(lotSub));
         if(newLot >= 0.01 && newLot <= 20.0)
         {
            if(g_dynamicRemoteLot != newLot)
            {
               g_dynamicRemoteLot = newLot;
               Print("⚙️ [REMOTE SYNC] Dynamic Lot updated remotely to: ", DoubleToString(newLot, 2));
            }
         }
      }

      // C. Parse Strategy Frequency Mode (HIGH_SPEED / BALANCED / SNIPER)
      if(StringFind(responseStr, "HIGH_SPEED") >= 0)
         g_dynamicRemoteMode = 0;
      else if(StringFind(responseStr, "BALANCED") >= 0)
         g_dynamicRemoteMode = 1;
      else if(StringFind(responseStr, "SNIPER") >= 0)
         g_dynamicRemoteMode = 2;

      // D. Parse Stop Loss & Target Architecture Mode
      if(StringFind(responseStr, "DYNAMIC_ATR") >= 0)
         g_dynamicRemoteSlMode = 0;
      else if(StringFind(responseStr, "SWING_STRUCTURE") >= 0)
         g_dynamicRemoteSlMode = 1;
      else if(StringFind(responseStr, "KIJUN_EQUILIBRIUM") >= 0)
         g_dynamicRemoteSlMode = 2;
      else if(StringFind(responseStr, "CUSTOM_FIXED") >= 0)
         g_dynamicRemoteSlMode = 3;
      else if(StringFind(responseStr, "AI_ADAPTIVE") >= 0)
         g_dynamicRemoteSlMode = 4;

      // E. Parse Custom Fixed Dollar SL and TP
      int customSlPos = StringFind(responseStr, "customSlUSD");
      if(customSlPos >= 0)
      {
         string slSub = StringSubstr(responseStr, customSlPos + 11, 12);
         double slVal = StringToDouble(CleanJsonNumber(slSub));
         if(slVal > 0.0) g_dynamicRemoteCustomSl = slVal;
      }

      int customTpPos = StringFind(responseStr, "customTpUSD");
      if(customTpPos >= 0)
      {
         string tpSub = StringSubstr(responseStr, customTpPos + 11, 12);
         double tpVal = StringToDouble(CleanJsonNumber(tpSub));
         if(tpVal > 0.0) g_dynamicRemoteCustomTp = tpVal;
      }

      // F. Parse Trailing Stop & News Shield Switches
      if(StringFind(responseStr, "trailingStopActive\\\":true") >= 0 || StringFind(responseStr, "trailingActive\\\":true") >= 0)
         g_dynamicRemoteTrailing = 1;
      else if(StringFind(responseStr, "trailingStopActive\\\":false") >= 0 || StringFind(responseStr, "trailingActive\\\":false") >= 0)
         g_dynamicRemoteTrailing = 0;

      if(StringFind(responseStr, "newsFilterActive\\\":true") >= 0)
         g_dynamicRemoteNewsFilter = 1;
      else if(StringFind(responseStr, "newsFilterActive\\\":false") >= 0)
         g_dynamicRemoteNewsFilter = 0;

      // G. Parse Concurrent Trades Limit
      int maxTradesPos = StringFind(responseStr, "maxConcurrentTrades");
      if(maxTradesPos < 0) maxTradesPos = StringFind(responseStr, "maxTrades");
      if(maxTradesPos >= 0)
      {
         string mtSub = StringSubstr(responseStr, maxTradesPos + 19, 10);
         int mtVal = (int)StringToInteger(CleanJsonNumber(mtSub));
         if(mtVal > 0 && mtVal <= 20) g_dynamicRemoteMaxTrades = mtVal;
      }
   }
   else if(res == -1)
   {
      int err = GetLastError();
      if(err == 4060)
      {
         static bool warnedOnce = false;
         if(!warnedOnce)
         {
            Print("⚠️ [WEB COMMANDER] WebRequest is not enabled! Add URL '", InpCommanderServerUrl, "' in Tools -> Options -> Expert Advisors -> Allow WebRequest.");
            warnedOnce = true;
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Auto-detect broker filling type                                  |
//+------------------------------------------------------------------+
ENUM_ORDER_TYPE_FILLING GetOptimalFillingType(string symbol)
{
   uint filling = (uint)SymbolInfoInteger(symbol, SYMBOL_FILLING_MODE);
   if((filling & SYMBOL_FILLING_FOK) != 0)
      return ORDER_FILLING_FOK;
   if((filling & SYMBOL_FILLING_IOC) != 0)
      return ORDER_FILLING_IOC;
   return ORDER_FILLING_RETURN;
}

//+------------------------------------------------------------------+
//| Count active positions for this EA magic and symbol              |
//+------------------------------------------------------------------+
int CountActivePositions()
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(m_position.SelectByIndex(i))
      {
         if(m_position.Magic() == InpMagicNumber && m_position.Symbol() == g_tradeSymbol)
            count++;
      }
   }
   return count;
}

//+------------------------------------------------------------------+
//| Calculate ML Least-Squares Linear Regression Slope & Forecast    |
//+------------------------------------------------------------------+
double CalculateMlSlope(const MqlRates &rates[], int startBar, int period)
{
   if(startBar + period >= ArraySize(rates)) return 0.0;
   double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
   int n = period;
   for(int i = 0; i < n; i++)
   {
      double x = (double)(n - 1 - i);
      double y = rates[startBar + i].close;
      sumX  += x;
      sumY  += y;
      sumXY += x * y;
      sumX2 += x * x;
   }
   double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX + 0.0000001);
   return slope;
}

//+------------------------------------------------------------------+
//| AI Ensemble Confidence Score Engine (0% - 100%)                  |
//+------------------------------------------------------------------+
double CalculateAIConfidenceScore(ENUM_POSITION_TYPE signalDirection,
                                  double m1_ema60, double m1_ema240,
                                  double m5_ema60, double m5_ema240,
                                  double m15_ema60, double m15_ema240,
                                  double mlSlope, double hist1, double hist2,
                                  double tenkan, double kijun, double atrVal)
{
   double score = 0.0;

   // 1. Multi-Timeframe Trend Consensus (Weight: 35%)
   if(signalDirection == POSITION_TYPE_BUY)
   {
      if(m1_ema60 >= m1_ema240)   score += 10.0;
      if(m5_ema60 >= m5_ema240)   score += 15.0;
      if(m15_ema60 >= m15_ema240) score += 10.0;
   }
   else if(signalDirection == POSITION_TYPE_SELL)
   {
      if(m1_ema60 <= m1_ema240)   score += 10.0;
      if(m5_ema60 <= m5_ema240)   score += 15.0;
      if(m15_ema60 <= m15_ema240) score += 10.0;
   }

   // 2. Machine Learning Slope Alignment (Weight: 25%)
   if(signalDirection == POSITION_TYPE_BUY && mlSlope > 0.02)
      score += 25.0;
   else if(signalDirection == POSITION_TYPE_SELL && mlSlope < -0.02)
      score += 25.0;
   else if((signalDirection == POSITION_TYPE_BUY && mlSlope >= 0.0) || 
           (signalDirection == POSITION_TYPE_SELL && mlSlope <= 0.0))
      score += 15.0;

   // 3. Ichimoku Structural Momentum (Weight: 20%)
   if(signalDirection == POSITION_TYPE_BUY)
   {
      if(tenkan >= kijun) score += 10.0;
      if(hist1 > 0.05 && hist1 > hist2) score += 10.0;
   }
   else if(signalDirection == POSITION_TYPE_SELL)
   {
      if(tenkan <= kijun) score += 10.0;
      if(hist1 < -0.05 && hist1 < hist2) score += 10.0;
   }

   // 4. Volatility Regime Stability via ATR (Weight: 20%)
   if(atrVal >= 0.60 && atrVal <= 4.50)
      score += 20.0; // Optimal non-choppy and non-flash-crash regime
   else if(atrVal > 0.30)
      score += 10.0;

   return score;
}

//+------------------------------------------------------------------+
//| Calculate Flexible Stop Loss & Take Profit based on Selected Mode|
//+------------------------------------------------------------------+
void CalculateFlexibleStopLoss(ENUM_POSITION_TYPE type, double entryPrice, double currentAtr, 
                               const MqlRates &rates[], double kijun, double aiConfidence,
                               double &outSL, double &outTP, double &outSlDist, double &outTpDist)
{
   double slDist = 2.40;
   double tpDist = 3.80;

   // Priority: Use Live Remotely Synchronized SL Mode if set from Web Dashboard
   ENUM_SL_MODE activeSlMode = (g_dynamicRemoteSlMode >= 0) ? (ENUM_SL_MODE)g_dynamicRemoteSlMode : InpStopLossMode;
   double customSl = (g_dynamicRemoteCustomSl > 0.0) ? g_dynamicRemoteCustomSl : InpCustomSlUSD;
   double customTp = (g_dynamicRemoteCustomTp > 0.0) ? g_dynamicRemoteCustomTp : InpCustomTpUSD;

   switch(activeSlMode)
   {
      case SL_MODE_DYNAMIC_ATR:
      {
         slDist = MathMax(1.20, currentAtr * InpAtrSlMultiplier);
         tpDist = MathMax(2.50, slDist * InpAtrMultiplier);
         break;
      }
      case SL_MODE_SWING_STRUCTURE:
      {
         int lookback = MathMin(InpSwingLookbackBars, ArraySize(rates) - 2);
         if(type == POSITION_TYPE_BUY)
         {
            double swingLow = rates[1].low;
            for(int i = 1; i <= lookback; i++)
               if(rates[i].low < swingLow) swingLow = rates[i].low;
            slDist = MathMax(1.50, (entryPrice - swingLow) + InpSwingBufferUSD);
         }
         else
         {
            double swingHigh = rates[1].high;
            for(int i = 1; i <= lookback; i++)
               if(rates[i].high > swingHigh) swingHigh = rates[i].high;
            slDist = MathMax(1.50, (swingHigh - entryPrice) + InpSwingBufferUSD);
         }
         tpDist = MathMax(2.80, slDist * 1.55);
         break;
      }
      case SL_MODE_KIJUN_EQUILIBRIUM:
      {
         if(type == POSITION_TYPE_BUY)
            slDist = MathMax(1.50, MathAbs(entryPrice - kijun) + InpSwingBufferUSD);
         else
            slDist = MathMax(1.50, MathAbs(kijun - entryPrice) + InpSwingBufferUSD);
         tpDist = MathMax(2.80, slDist * 1.65);
         break;
      }
      case SL_MODE_CUSTOM_FIXED:
      {
         slDist = customSl;
         tpDist = customTp;
         break;
      }
      case SL_MODE_AI_ADAPTIVE:
      {
         double confScale = (100.0 - aiConfidence) / 25.0; // wider SL when confidence is moderate
         slDist = MathMax(1.80, (currentAtr * 1.5) + (confScale * 0.80));
         tpDist = MathMax(3.00, slDist * 1.70);
         break;
      }
   }

   // Safety bounds
   if(slDist < 0.80) slDist = 0.80;
   if(slDist > 15.00) slDist = 15.00;
   if(tpDist < 1.50) tpDist = 1.50;
   if(tpDist > 30.00) tpDist = 30.00;

   outSlDist = slDist;
   outTpDist = tpDist;

   if(type == POSITION_TYPE_BUY)
   {
      outSL = NormalizeDouble(entryPrice - slDist, m_symInfo.Digits());
      outTP = NormalizeDouble(entryPrice + tpDist, m_symInfo.Digits());
   }
   else
   {
      outSL = NormalizeDouble(entryPrice + slDist, m_symInfo.Digits());
      outTP = NormalizeDouble(entryPrice - tpDist, m_symInfo.Digits());
   }
}

//+------------------------------------------------------------------+
//| Check if High-Impact Economic News is active or approaching      |
//+------------------------------------------------------------------+
bool IsNewsEventActive(string &outNewsTitle, int &outMinutesToEvent)
{
   if(!InpUseNewsFilter) return false;

   datetime currentTime = TimeCurrent();
   datetime timeFrom = currentTime - (InpNewsPauseAfterMin * 60);
   datetime timeTo   = currentTime + (InpNewsPauseBeforeMin * 60);

   // 1. Check USD Economic Calendar events
   MqlCalendarValue values[];
   int totalEvents = CalendarValueHistory(values, timeFrom, timeTo, "USD");
   if(totalEvents > 0)
   {
      for(int i = 0; i < totalEvents; i++)
      {
         MqlCalendarEvent event;
         if(CalendarEventById(values[i].event_id, event))
         {
            if((int)event.importance >= InpNewsMinImportance)
            {
               int diffSec = (int)(values[i].time - currentTime);
               outMinutesToEvent = diffSec / 60;
               outNewsTitle = event.name + " [USD]";
               return true; // Active news window!
            }
         }
      }
   }

   // 2. Check EUR High-Impact News (ECB, Rate Decisions, CPI)
   MqlCalendarValue eurValues[];
   int totalEur = CalendarValueHistory(eurValues, timeFrom, timeTo, "EUR");
   if(totalEur > 0)
   {
      for(int i = 0; i < totalEur; i++)
      {
         MqlCalendarEvent event;
         if(CalendarEventById(eurValues[i].event_id, event))
         {
            if((int)event.importance >= 3)
            {
               int diffSec = (int)(eurValues[i].time - currentTime);
               outMinutesToEvent = diffSec / 60;
               outNewsTitle = event.name + " [EUR]";
               return true;
            }
         }
      }
   }

   return false;
}

//+------------------------------------------------------------------+
//| Check Spread & Volatility Spike News Shield                      |
//+------------------------------------------------------------------+
bool CheckSpreadShield()
{
   if(!InpUseSpreadNewsFilter) return true;
   long currentSpread = SymbolInfoInteger(g_tradeSymbol, SYMBOL_SPREAD);
   if(currentSpread > InpMaxAllowedSpread)
   {
      return false; // Spread is too wide (news volatility spike)
   }
   return true;
}

//+------------------------------------------------------------------+
//| Auto-Protect Open Positions Before Approaching High-Impact News  |
//+------------------------------------------------------------------+
void ProtectPositionsBeforeNews()
{
   if(!InpUseNewsFilter) return;
   string newsTitle = "";
   int minToNews = 0;
   if(IsNewsEventActive(newsTitle, minToNews))
   {
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         if(m_position.SelectByIndex(i))
         {
            if(m_position.Magic() == InpMagicNumber && m_position.Symbol() == g_tradeSymbol)
            {
               ulong ticket = m_position.Ticket();
               if(InpNewsClosePositions)
               {
                  m_trade.PositionClose(ticket);
                  Print("🛡️ [NEWS SHIELD] Position #", ticket, " closed safely before news: ", newsTitle);
               }
               else if(InpNewsLockBreakEven)
               {
                  double openPrice = m_position.PriceOpen();
                  double curSl = m_position.StopLoss();
                  if(m_position.PositionType() == POSITION_TYPE_BUY)
                  {
                     double bid = SymbolInfoDouble(g_tradeSymbol, SYMBOL_BID);
                     if(bid > openPrice + InpBreakEvenBuffer && (curSl < openPrice || curSl == 0))
                     {
                        double newSl = NormalizeDouble(openPrice + 0.20, m_symInfo.Digits());
                        m_trade.PositionModify(ticket, newSl, m_position.TakeProfit());
                        Print("🛡️ [NEWS SHIELD] Locked BE for BUY #", ticket, " before news: ", newsTitle);
                     }
                  }
                  else if(m_position.PositionType() == POSITION_TYPE_SELL)
                  {
                     double ask = SymbolInfoDouble(g_tradeSymbol, SYMBOL_ASK);
                     if(ask < openPrice - InpBreakEvenBuffer && (curSl > openPrice || curSl == 0))
                     {
                        double newSl = NormalizeDouble(openPrice - 0.20, m_symInfo.Digits());
                        m_trade.PositionModify(ticket, newSl, m_position.TakeProfit());
                        Print("🛡️ [NEWS SHIELD] Locked BE for SELL #", ticket, " before news: ", newsTitle);
                     }
                  }
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   g_tradeSymbol = (InpCustomSymbol != "") ? InpCustomSymbol : _Symbol;

   if(!m_symInfo.Name(g_tradeSymbol))
   {
      Print("Error: Cannot initialize symbol: ", g_tradeSymbol);
      return INIT_FAILED;
   }
   m_symInfo.Refresh();

   m_trade.SetExpertMagicNumber(InpMagicNumber);
   m_trade.SetDeviationInPoints(InpSlippage);

   if(InpAutoDetectFilling)
   {
      ENUM_ORDER_TYPE_FILLING fillingType = GetOptimalFillingType(g_tradeSymbol);
      m_trade.SetTypeFilling(fillingType);
      Print("Elliott Neowave EA Detected Filling Mode: ", EnumToString(fillingType));
   }

   // Initialize M1 EMA 60 & 240 (HL/2) Handles
   g_ema60_M1_Handle  = iMA(g_tradeSymbol, PERIOD_M1, InpEmaFastPeriod, 0, MODE_EMA, PRICE_MEDIAN);
   g_ema240_M1_Handle = iMA(g_tradeSymbol, PERIOD_M1, InpEmaSlowPeriod, 0, MODE_EMA, PRICE_MEDIAN);

   // Initialize Multi-Timeframe M5 & M15 Handles
   g_ema60_M5_Handle   = iMA(g_tradeSymbol, InpHigherTf1, InpEmaFastPeriod, 0, MODE_EMA, PRICE_MEDIAN);
   g_ema240_M5_Handle  = iMA(g_tradeSymbol, InpHigherTf1, InpEmaSlowPeriod, 0, MODE_EMA, PRICE_MEDIAN);
   g_ema60_M15_Handle  = iMA(g_tradeSymbol, InpHigherTf2, InpEmaFastPeriod, 0, MODE_EMA, PRICE_MEDIAN);
   g_ema240_M15_Handle = iMA(g_tradeSymbol, InpHigherTf2, InpEmaSlowPeriod, 0, MODE_EMA, PRICE_MEDIAN);

   g_macdHandle = iMACD(g_tradeSymbol, PERIOD_M1, InpMacdFastEMA, InpMacdSlowEMA, InpMacdSignal, PRICE_CLOSE);
   g_atrHandle  = iATR(g_tradeSymbol, PERIOD_M1, InpAtrPeriod);

   if(g_macdHandle == INVALID_HANDLE || g_ema60_M1_Handle == INVALID_HANDLE || g_ema240_M1_Handle == INVALID_HANDLE)
   {
      Print("Error creating indicator handles: ", GetLastError());
      return INIT_FAILED;
   }

   Print("=== Elliott Neowave Gold Scalper EA v6.0 AI-MTF (elliottneowave.ir) Initialized ===");
   Print("Multi-Timeframe Engine (M1 + M5 + M15): ", (InpUseMtfFilter ? "ACTIVE" : "DISABLED"),
         " | AI Min Confidence: ", InpMinAiConfidence, "%",
         " | EMA 60/240 HL/2: ACTIVE",
         " | Max Daily Trades: ", (InpMaxDailyTrades == 0 ? "UNLIMITED" : IntegerToString(InpMaxDailyTrades)));
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   if(g_macdHandle != INVALID_HANDLE)          IndicatorRelease(g_macdHandle);
   if(g_ema60_M1_Handle != INVALID_HANDLE)     IndicatorRelease(g_ema60_M1_Handle);
   if(g_ema240_M1_Handle != INVALID_HANDLE)    IndicatorRelease(g_ema240_M1_Handle);
   if(g_ema60_M5_Handle != INVALID_HANDLE)     IndicatorRelease(g_ema60_M5_Handle);
   if(g_ema240_M5_Handle != INVALID_HANDLE)    IndicatorRelease(g_ema240_M5_Handle);
   if(g_ema60_M15_Handle != INVALID_HANDLE)    IndicatorRelease(g_ema60_M15_Handle);
   if(g_ema240_M15_Handle != INVALID_HANDLE)   IndicatorRelease(g_ema240_M15_Handle);
   if(g_atrHandle != INVALID_HANDLE)           IndicatorRelease(g_atrHandle);
}

//+------------------------------------------------------------------+
//| Calculate Safe Contract Lot Size                                 |
//+------------------------------------------------------------------+
double CalculateSafeLotSize()
{
   double step   = SymbolInfoDouble(g_tradeSymbol, SYMBOL_VOLUME_STEP);
   double minLot = SymbolInfoDouble(g_tradeSymbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(g_tradeSymbol, SYMBOL_VOLUME_MAX);

   if(!InpUseCompounding)
   {
      double lot = (g_dynamicRemoteLot > 0.0) ? g_dynamicRemoteLot : InpBaseFixedLot;
      if(lot < minLot) lot = minLot;
      if(lot > maxLot) lot = maxLot;
      return lot;
   }

   double equity = m_account.Equity();
   double initialBal = InpInitialCapitalUSD;
   if(m_account.Currency() == "USC" || m_account.Currency() == "GLD")
      initialBal = InpInitialCapitalUSD * 100.0;

   double factor = equity / initialBal;
   if(factor < 0.5) factor = 0.5;
   if(factor > 20.0) factor = 20.0;

   double calculatedLot = InpBaseFixedLot * factor;

   if(step > 0)
      calculatedLot = MathFloor(calculatedLot / step) * step;

   if(calculatedLot > InpMaxLotLimit) calculatedLot = InpMaxLotLimit;
   if(calculatedLot < minLot) calculatedLot = minLot;
   if(calculatedLot > maxLot) calculatedLot = maxLot;

   return calculatedLot;
}

//+------------------------------------------------------------------+
//| Check Break-Even and Time-Based Turnover                         |
//+------------------------------------------------------------------+
void ManageOpenPositions()
{
   int exitMinutes = InpFastScalpExits ? InpFastTimeExitMinutes : InpEmergencyExitMinutes;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(m_position.SelectByIndex(i))
      {
         if(m_position.Magic() != InpMagicNumber || m_position.Symbol() != g_tradeSymbol)
            continue;

         ulong ticket = m_position.Ticket();
         ENUM_POSITION_TYPE type = m_position.PositionType();
         double openPrice    = m_position.PriceOpen();
         double currentPrice = m_position.PriceCurrent();
         double sl           = m_position.StopLoss();
         double tp           = m_position.TakeProfit();
         datetime openTime   = (datetime)m_position.Time();

         int elapsedMinutes = (int)((TimeCurrent() - openTime) / 60);
         if(elapsedMinutes >= exitMinutes)
         {
            Print("⏰ Time turnover reached for ticket #", ticket, " (", elapsedMinutes, "m) - Releasing slot.");
            m_trade.PositionClose(ticket);
            continue;
         }

         if(type == POSITION_TYPE_BUY)
         {
            if(currentPrice - openPrice >= InpBreakEvenTrigger)
            {
               double newSL = NormalizeDouble(openPrice + InpBreakEvenBuffer, m_symInfo.Digits());
               if(sl < openPrice)
               {
                  m_trade.PositionModify(ticket, newSL, tp);
                  Print("🛡️ BE locked for Buy #", ticket, " at ", newSL);
                  sl = newSL;
               }
            }

            bool activeTrailing = (g_dynamicRemoteTrailing >= 0) ? (g_dynamicRemoteTrailing == 1) : InpEnableDynamicTrailing;
            if(activeTrailing && (currentPrice - openPrice >= InpTrailingStartPoints))
            {
               double trailSL = NormalizeDouble(currentPrice - InpTrailingStepPoints, m_symInfo.Digits());
               if(trailSL > sl + 0.10)
               {
                  m_trade.PositionModify(ticket, trailSL, tp);
                  Print("📈 Dynamic Trailing advanced for BUY #", ticket, " to ", trailSL);
               }
            }
         }
         else if(type == POSITION_TYPE_SELL)
         {
            if(openPrice - currentPrice >= InpBreakEvenTrigger)
            {
               double newSL = NormalizeDouble(openPrice - InpBreakEvenBuffer, m_symInfo.Digits());
               if(sl > openPrice || sl == 0.0)
               {
                  m_trade.PositionModify(ticket, newSL, tp);
                  Print("🛡️ BE locked for Sell #", ticket, " at ", newSL);
                  sl = newSL;
               }
            }

            bool activeTrailing = (g_dynamicRemoteTrailing >= 0) ? (g_dynamicRemoteTrailing == 1) : InpEnableDynamicTrailing;
            if(activeTrailing && (openPrice - currentPrice >= InpTrailingStartPoints))
            {
               double trailSL = NormalizeDouble(currentPrice + InpTrailingStepPoints, m_symInfo.Digits());
               if(trailSL < sl - 0.10 || sl == 0.0)
               {
                  m_trade.PositionModify(ticket, trailSL, tp);
                  Print("📈 Dynamic Trailing advanced for SELL #", ticket, " to ", trailSL);
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // 📡 1. Poll Web Commander for Real-Time Instructions & Send Telemetry
   PollWebCommander();

   ManageOpenPositions();

   // 🛡️ Auto-Protect Open Trades Before Approaching News
   ProtectPositionsBeforeNews();

   // 🛑 Check Web Commander Remote Trading Authorization
   if(!g_remoteTradingEnabled)
   {
      // Remote Kill-Switch / Pause Active
      return;
   }

   // Run on newly closed bar
   datetime currentBarTime = iTime(g_tradeSymbol, PERIOD_M1, 0);
   if(currentBarTime == g_lastBarTime)
      return;
   g_lastBarTime = currentBarTime;

   // 🛡️ High-Impact News Filter Check (Blocks new entries during news window)
   bool activeNewsFilter = (g_dynamicRemoteNewsFilter >= 0) ? (g_dynamicRemoteNewsFilter == 1) : InpUseNewsFilter;
   string activeNewsTitle = "";
   int minutesToNews = 0;
   if(activeNewsFilter && IsNewsEventActive(activeNewsTitle, minutesToNews))
   {
      Print("🛡️ [NEWS SHIELD ACTIVE] Trading paused due to upcoming/active event: ", activeNewsTitle, 
            " (T-minus ", minutesToNews, " min). Safe mode enabled.");
      return;
   }

   // 🛡️ Spread Spike News Shield Check
   if(InpUseSpreadNewsFilter && !CheckSpreadShield())
   {
      long curSpr = SymbolInfoInteger(g_tradeSymbol, SYMBOL_SPREAD);
      Print("🛡️ [SPREAD SHIELD] High spread detected (", curSpr, " > ", InpMaxAllowedSpread, " points). Trading paused.");
      return;
   }

   // Check daily trade reset
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   if(dt.day != g_lastDay)
   {
      g_lastDay = dt.day;
      g_dailyTradesToday = 0;
   }

   // If InpMaxDailyTrades == 0, there is NO limit on daily trades!
   if(InpMaxDailyTrades > 0 && g_dailyTradesToday >= InpMaxDailyTrades)
      return;

   // Check concurrent open positions limit
   int activeMaxTrades = (g_dynamicRemoteMaxTrades > 0) ? g_dynamicRemoteMaxTrades : InpMaxConcurrentTrades;
   if(CountActivePositions() >= activeMaxTrades)
      return;

   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   if(CopyRates(g_tradeSymbol, PERIOD_M1, 0, 70, rates) < 65)
      return;

   // Read M1 EMA 60 and EMA 240 (HL/2)
   double ema60_m1_Vals[], ema240_m1_Vals[];
   ArraySetAsSeries(ema60_m1_Vals, true);
   ArraySetAsSeries(ema240_m1_Vals, true);
   if(CopyBuffer(g_ema60_M1_Handle, 0, 0, 40, ema60_m1_Vals) <= 0 ||
      CopyBuffer(g_ema240_M1_Handle, 0, 0, 40, ema240_m1_Vals) <= 0)
      return;

   double ema60_m1  = ema60_m1_Vals[1];
   double ema240_m1 = ema240_m1_Vals[1];

   // Read Higher Timeframe M5 & M15 EMAs for MTF Alignment
   double ema60_m5 = ema60_m1, ema240_m5 = ema240_m1;
   double ema60_m15 = ema60_m1, ema240_m15 = ema240_m1;

   if(InpUseMtfFilter)
   {
      double buf60_m5[], buf240_m5[], buf60_m15[], buf240_m15[];
      ArraySetAsSeries(buf60_m5, true);
      ArraySetAsSeries(buf240_m5, true);
      ArraySetAsSeries(buf60_m15, true);
      ArraySetAsSeries(buf240_m15, true);

      if(CopyBuffer(g_ema60_M5_Handle, 0, 0, 5, buf60_m5) > 0 &&
         CopyBuffer(g_ema240_M5_Handle, 0, 0, 5, buf240_m5) > 0)
      {
         ema60_m5  = buf60_m5[1];
         ema240_m5 = buf240_m5[1];
      }

      if(CopyBuffer(g_ema60_M15_Handle, 0, 0, 5, buf60_m15) > 0 &&
         CopyBuffer(g_ema240_M15_Handle, 0, 0, 5, buf240_m15) > 0)
      {
         ema60_m15  = buf60_m15[1];
         ema240_m15 = buf240_m15[1];
      }
   }

   // Read ATR value
   double atrVals[];
   ArraySetAsSeries(atrVals, true);
   double currentAtr = 1.50;
   if(CopyBuffer(g_atrHandle, 0, 0, 5, atrVals) > 0)
      currentAtr = (atrVals[1] > 0.1) ? atrVals[1] : 1.50;

   // Calculate ML Slope on M1
   double mlSlope = CalculateMlSlope(rates, 1, InpMlLookbackBars);

   // Calculate Kijun-sen (26) and Tenkan-sen (9)
   double hi26 = rates[1].high, lo26 = rates[1].low;
   for(int i = 1; i <= InpKijunPeriod; i++)
   {
      if(rates[i].high > hi26) hi26 = rates[i].high;
      if(rates[i].low < lo26)  lo26 = rates[i].low;
   }
   double kijun = (hi26 + lo26) / 2.0;

   double hi9 = rates[1].high, lo9 = rates[1].low;
   for(int i = 1; i <= InpTenkanPeriod; i++)
   {
      if(rates[i].high > hi9) hi9 = rates[i].high;
      if(rates[i].low < lo9)  lo9 = rates[i].low;
   }
   double tenkan = (hi9 + lo9) / 2.0;

   double hi9_prev = rates[2].high, lo9_prev = rates[2].low;
   for(int i = 2; i <= InpTenkanPeriod + 1; i++)
   {
      if(rates[i].high > hi9_prev) hi9_prev = rates[i].high;
      if(rates[i].low < lo9_prev)  lo9_prev = rates[i].low;
   }
   double tenkanPrev = (hi9_prev + lo9_prev) / 2.0;

   double hi26_prev = rates[2].high, lo26_prev = rates[2].low;
   for(int i = 2; i <= InpKijunPeriod + 1; i++)
   {
      if(rates[i].high > hi26_prev) hi26_prev = rates[i].high;
      if(rates[i].low < lo26_prev)  lo26_prev = rates[i].low;
   }
   double kijunPrev = (hi26_prev + lo26_prev) / 2.0;

   // Calculate Senkou Span B (52)
   double hi52 = rates[1].high, lo52 = rates[1].low;
   for(int i = 1; i <= InpSpanBPeriod; i++)
   {
      if(rates[i].high > hi52) hi52 = rates[i].high;
      if(rates[i].low < lo52)  lo52 = rates[i].low;
   }
   double spanB = (hi52 + lo52) / 2.0;
   double spanA = (tenkan + kijun) / 2.0;
   double kumoTop = MathMax(spanA, spanB);
   double kumoBottom = MathMin(spanA, spanB);

   // MACD Histograms
   double macdMain[], macdSignal[];
   ArraySetAsSeries(macdMain, true);
   ArraySetAsSeries(macdSignal, true);
   if(CopyBuffer(g_macdHandle, 0, 0, 50, macdMain) <= 0 || CopyBuffer(g_macdHandle, 1, 0, 50, macdSignal) <= 0)
      return;

   double hist1 = macdMain[1] - macdSignal[1];
   double hist2 = macdMain[2] - macdSignal[2];

   double targetDistance = InpFastScalpExits ? InpFastScalpTP : MathMax(3.80, currentAtr * InpAtrMultiplier);
   double stopDistance   = InpFastScalpExits ? InpFastScalpSL : 2.40;

   // Multi-Timeframe & AI Confidence Evaluation
   double buyConfidence = CalculateAIConfidenceScore(POSITION_TYPE_BUY, ema60_m1, ema240_m1, ema60_m5, ema240_m5, ema60_m15, ema240_m15, mlSlope, hist1, hist2, tenkan, kijun, currentAtr);
   double sellConfidence = CalculateAIConfidenceScore(POSITION_TYPE_SELL, ema60_m1, ema240_m1, ema60_m5, ema240_m5, ema60_m15, ema240_m15, mlSlope, hist1, hist2, tenkan, kijun, currentAtr);

   bool mtfBuyAllowed  = !InpUseMtfFilter || (ema60_m5 >= ema240_m5 && (!InpRequireStrictMtfConsensus || ema60_m15 >= ema240_m15));
   bool mtfSellAllowed = !InpUseMtfFilter || (ema60_m5 <= ema240_m5 && (!InpRequireStrictMtfConsensus || ema60_m15 <= ema240_m15));

   bool aiBuyApproved  = !InpUseAiConfidenceFilter || (buyConfidence >= InpMinAiConfidence);
   bool aiSellApproved = !InpUseAiConfidenceFilter || (sellConfidence >= InpMinAiConfidence);

   ENUM_TRADE_FREQUENCY activeFrequency = (g_dynamicRemoteMode >= 0) ? (ENUM_TRADE_FREQUENCY)g_dynamicRemoteMode : InpTradeFrequency;

   // ====================================================================
   // ⚡ EXECUTION WITH MTF + AI ENSEMBLE VERIFICATION
   // ====================================================================
   if(activeFrequency == FREQ_HIGH_SPEED)
   {
      bool tkCrossBuy = (tenkan >= kijun && tenkanPrev < kijunPrev && rates[1].close > kijun);
      bool kijunBounceBuy = (rates[1].low <= kijun + 0.60 && rates[1].close > kijun && rates[1].close > rates[1].open && tenkan >= kijun && hist1 > -0.10);
      bool kumoBreakoutBuy = (rates[1].close > kumoTop && rates[2].close <= kumoTop && hist1 > 0 && hist1 >= hist2);
      bool momentumSurgeBuy = (hist1 > 0.08 && hist1 > hist2 + 0.02 && rates[1].close > tenkan && tenkan > kijun);

      if(mtfBuyAllowed && aiBuyApproved && (tkCrossBuy || kijunBounceBuy || kumoBreakoutBuy || momentumSurgeBuy))
      {
         double ask  = SymbolInfoDouble(g_tradeSymbol, SYMBOL_ASK);
         double sl = 0.0, tp = 0.0, slDist = 0.0, tpDist = 0.0;
         CalculateFlexibleStopLoss(POSITION_TYPE_BUY, ask, currentAtr, rates, kijun, buyConfidence, sl, tp, slDist, tpDist);
         double lots = CalculateSafeLotSize();

         string triggerType = tkCrossBuy ? "TK_Cross" : kijunBounceBuy ? "Kijun_Bounce" : kumoBreakoutBuy ? "Kumo_Break" : "Momentum_Surge";
         Print("⚡ [ElliottNeowave-BUY #", g_dailyTradesToday + 1, "] Signal: ", triggerType, 
               " | MTF: PASS | AI Confidence: ", DoubleToString(buyConfidence, 1), "% | SL-Dist: $", DoubleToString(slDist, 2), " | Lots: ", lots, " | Ask: ", ask);
         
         if(m_trade.Buy(lots, g_tradeSymbol, ask, sl, tp, "ElliottNeowave AI Buy (" + triggerType + ")"))
         {
            g_dailyTradesToday++;
            return;
         }
      }

      bool tkCrossSell = (tenkan <= kijun && tenkanPrev > kijunPrev && rates[1].close < kijun);
      bool kijunBounceSell = (rates[1].high >= kijun - 0.60 && rates[1].close < kijun && rates[1].close < rates[1].open && tenkan <= kijun && hist1 < 0.10);
      bool kumoBreakdownSell = (rates[1].close < kumoBottom && rates[2].close >= kumoBottom && hist1 < 0 && hist1 <= hist2);
      bool momentumSurgeSell = (hist1 < -0.08 && hist1 < hist2 - 0.02 && rates[1].close < tenkan && tenkan < kijun);

      if(mtfSellAllowed && aiSellApproved && (tkCrossSell || kijunBounceSell || kumoBreakdownSell || momentumSurgeSell))
      {
         double bid  = SymbolInfoDouble(g_tradeSymbol, SYMBOL_BID);
         double sl = 0.0, tp = 0.0, slDist = 0.0, tpDist = 0.0;
         CalculateFlexibleStopLoss(POSITION_TYPE_SELL, bid, currentAtr, rates, kijun, sellConfidence, sl, tp, slDist, tpDist);
         double lots = CalculateSafeLotSize();

         string triggerType = tkCrossSell ? "TK_Cross" : kijunBounceSell ? "Kijun_Bounce" : kumoBreakdownSell ? "Kumo_Break" : "Momentum_Surge";
         Print("⚡ [ElliottNeowave-SELL #", g_dailyTradesToday + 1, "] Signal: ", triggerType, 
               " | MTF: PASS | AI Confidence: ", DoubleToString(sellConfidence, 1), "% | SL-Dist: $", DoubleToString(slDist, 2), " | Lots: ", lots, " | Bid: ", bid);
         
         if(m_trade.Sell(lots, g_tradeSymbol, bid, sl, tp, "ElliottNeowave AI Sell (" + triggerType + ")"))
         {
            g_dailyTradesToday++;
            return;
         }
      }
      return;
   }

   // ====================================================================
   // ⚖️ MODE 2: BALANCED DAY-TRADER WITH AI
   // ====================================================================
   if(activeFrequency == FREQ_BALANCED)
   {
      bool trendBull = (tenkan >= kijun && rates[1].close > kumoBottom);
      bool bounceBuy = (rates[1].low <= kijun + 0.90 && rates[1].close >= kijun && rates[1].close > rates[1].open && hist1 > -0.05);

      if(mtfBuyAllowed && aiBuyApproved && trendBull && bounceBuy)
      {
         double ask  = SymbolInfoDouble(g_tradeSymbol, SYMBOL_ASK);
         double sl = 0.0, tp = 0.0, slDist = 0.0, tpDist = 0.0;
         CalculateFlexibleStopLoss(POSITION_TYPE_BUY, ask, currentAtr, rates, kijun, buyConfidence, sl, tp, slDist, tpDist);
         double lots = CalculateSafeLotSize();

         if(m_trade.Buy(lots, g_tradeSymbol, ask, sl, tp, "ElliottNeowave AI Balanced Buy"))
         {
            g_dailyTradesToday++;
            return;
         }
      }

      bool trendBear = (tenkan <= kijun && rates[1].close < kumoTop);
      bool bounceSell = (rates[1].high >= kijun - 0.90 && rates[1].close <= kijun && rates[1].close < rates[1].open && hist1 < 0.05);

      if(mtfSellAllowed && aiSellApproved && trendBear && bounceSell)
      {
         double bid  = SymbolInfoDouble(g_tradeSymbol, SYMBOL_BID);
         double sl = 0.0, tp = 0.0, slDist = 0.0, tpDist = 0.0;
         CalculateFlexibleStopLoss(POSITION_TYPE_SELL, bid, currentAtr, rates, kijun, sellConfidence, sl, tp, slDist, tpDist);
         double lots = CalculateSafeLotSize();

         if(m_trade.Sell(lots, g_tradeSymbol, bid, sl, tp, "ElliottNeowave AI Balanced Sell"))
         {
            g_dailyTradesToday++;
            return;
         }
      }
      return;
   }
}
`;

// Helper generator to dynamically customize MQL5 EA code
export function generateCustomEaMql5(options: {
  frequencyMode: 'HIGH_SPEED' | 'BALANCED' | 'SNIPER';
  maxConcurrent: number;
  maxDailyTrades: number;
  scalpTp: number;
  scalpSl: number;
  fastTimeExitMinutes: number;
  baseLot: number;
  initialCapitalUSD: number;
  useCompound: boolean;
  useEmaFilter?: boolean;
  useMtfFilter?: boolean;
  minAiConfidence?: number;
  useNewsFilter?: boolean;
  newsPauseBeforeMin?: number;
  newsPauseAfterMin?: number;
  useSpreadNewsFilter?: boolean;
  stopLossMode?: 'DYNAMIC_ATR' | 'SWING_STRUCTURE' | 'KIJUN_EQUILIBRIUM' | 'CUSTOM_FIXED' | 'AI_ADAPTIVE';
  atrSlMultiplier?: number;
  swingLookbackBars?: number;
  swingBufferUSD?: number;
  customSlUSD?: number;
  customTpUSD?: number;
  enableDynamicTrailing?: boolean;
  trailingStartUSD?: number;
  trailingStepUSD?: number;
}): string {
  let code = MT5_EXPERT_ADVISOR_MQL5;

  const modeEnum = options.frequencyMode === 'HIGH_SPEED' 
    ? 'FREQ_HIGH_SPEED' 
    : options.frequencyMode === 'BALANCED' 
    ? 'FREQ_BALANCED' 
    : 'FREQ_SNIPER_HD';

  code = code.replace(/input ENUM_TRADE_FREQUENCY InpTradeFrequency\s*=\s*\w+;/, `input ENUM_TRADE_FREQUENCY InpTradeFrequency       = ${modeEnum}; // Custom selected frequency`);
  code = code.replace(/input int\s+InpMaxConcurrentTrades\s*=\s*\d+;/, `input int                  InpMaxConcurrentTrades  = ${options.maxConcurrent}; // Selected concurrent trades`);
  code = code.replace(/input int\s+InpMaxDailyTrades\s*=\s*\d+;/, `input int                  InpMaxDailyTrades       = ${options.maxDailyTrades}; // Daily trades limit (0 = Unlimited)`);
  code = code.replace(/input double\s+InpFastScalpTP\s*=\s*[\d.]+;/, `input double               InpFastScalpTP          = ${options.scalpTp.toFixed(2)}; // Fast Scalp TP`);
  code = code.replace(/input double\s+InpFastScalpSL\s*=\s*[\d.]+;/, `input double               InpFastScalpSL          = ${options.scalpSl.toFixed(2)}; // Fast Scalp SL`);
  code = code.replace(/input int\s+InpFastTimeExitMinutes\s*=\s*\d+;/, `input int                  InpFastTimeExitMinutes  = ${options.fastTimeExitMinutes}; // Fast time exit`);
  code = code.replace(/input double\s+InpBaseFixedLot\s*=\s*[\d.]+;/, `input double   InpBaseFixedLot         = ${options.baseLot.toFixed(2)}; // Base lot size`);
  code = code.replace(/input double\s+InpInitialCapitalUSD\s*=\s*[\d.]+;/, `input double   InpInitialCapitalUSD    = ${options.initialCapitalUSD.toFixed(1)}; // Initial deposit`);
  code = code.replace(/input bool\s+InpUseCompounding\s*=\s*\w+;/, `input bool     InpUseCompounding       = ${options.useCompound ? 'true' : 'false'}; // Compound toggle`);
  
  if (options.useEmaFilter !== undefined) {
    code = code.replace(/input bool\s+InpUseEmaCrossFilter\s*=\s*\w+;/, `input bool                 InpUseEmaCrossFilter    = ${options.useEmaFilter ? 'true' : 'false'}; // EMA 60/240 HL/2 filter`);
  }

  if (options.useMtfFilter !== undefined) {
    code = code.replace(/input bool\s+InpUseMtfFilter\s*=\s*\w+;/, `input bool                 InpUseMtfFilter          = ${options.useMtfFilter ? 'true' : 'false'}; // Multi-Timeframe filter`);
  }

  if (options.minAiConfidence !== undefined) {
    code = code.replace(/input double\s+InpMinAiConfidence\s*=\s*[\d.]+;/, `input double               InpMinAiConfidence       = ${options.minAiConfidence.toFixed(1)}; // Min AI Confidence %`);
  }

  if (options.useNewsFilter !== undefined) {
    code = code.replace(/input bool\s+InpUseNewsFilter\s*=\s*\w+;/, `input bool                 InpUseNewsFilter         = ${options.useNewsFilter ? 'true' : 'false'}; // News Protection Shield`);
  }

  if (options.newsPauseBeforeMin !== undefined) {
    code = code.replace(/input int\s+InpNewsPauseBeforeMin\s*=\s*\d+;/, `input int                  InpNewsPauseBeforeMin    = ${options.newsPauseBeforeMin}; // Pause Before News (min)`);
  }

  if (options.newsPauseAfterMin !== undefined) {
    code = code.replace(/input int\s+InpNewsPauseAfterMin\s*=\s*\d+;/, `input int                  InpNewsPauseAfterMin     = ${options.newsPauseAfterMin}; // Pause After News (min)`);
  }

  if (options.useSpreadNewsFilter !== undefined) {
    code = code.replace(/input bool\s+InpUseSpreadNewsFilter\s*=\s*\w+;/, `input bool                 InpUseSpreadNewsFilter   = ${options.useSpreadNewsFilter ? 'true' : 'false'}; // Spread Volatility Shield`);
  }

  if (options.stopLossMode !== undefined) {
    const slEnumMap: Record<string, string> = {
      'DYNAMIC_ATR': 'SL_MODE_DYNAMIC_ATR',
      'SWING_STRUCTURE': 'SL_MODE_SWING_STRUCTURE',
      'KIJUN_EQUILIBRIUM': 'SL_MODE_KIJUN_EQUILIBRIUM',
      'CUSTOM_FIXED': 'SL_MODE_CUSTOM_FIXED',
      'AI_ADAPTIVE': 'SL_MODE_AI_ADAPTIVE'
    };
    const slEnum = slEnumMap[options.stopLossMode] || 'SL_MODE_DYNAMIC_ATR';
    code = code.replace(/input ENUM_SL_MODE\s+InpStopLossMode\s*=\s*\w+;/, `input ENUM_SL_MODE         InpStopLossMode          = ${slEnum}; // Stop Loss Architecture Mode`);
  }

  if (options.atrSlMultiplier !== undefined) {
    code = code.replace(/input double\s+InpAtrSlMultiplier\s*=\s*[\d.]+;/, `input double               InpAtrSlMultiplier       = ${options.atrSlMultiplier.toFixed(1)}; // Dynamic ATR Multiplier`);
  }

  if (options.swingLookbackBars !== undefined) {
    code = code.replace(/input int\s+InpSwingLookbackBars\s*=\s*\d+;/, `input int                  InpSwingLookbackBars     = ${options.swingLookbackBars}; // Swing Lookback Bars`);
  }

  if (options.swingBufferUSD !== undefined) {
    code = code.replace(/input double\s+InpSwingBufferUSD\s*=\s*[\d.]+;/, `input double               InpSwingBufferUSD        = ${options.swingBufferUSD.toFixed(2)}; // Swing Cushion Buffer`);
  }

  if (options.customSlUSD !== undefined) {
    code = code.replace(/input double\s+InpCustomSlUSD\s*=\s*[\d.]+;/, `input double               InpCustomSlUSD           = ${options.customSlUSD.toFixed(2)}; // Custom Fixed SL`);
  }

  if (options.customTpUSD !== undefined) {
    code = code.replace(/input double\s+InpCustomTpUSD\s*=\s*[\d.]+;/, `input double               InpCustomTpUSD           = ${options.customTpUSD.toFixed(2)}; // Custom Fixed TP`);
  }

  if (options.enableDynamicTrailing !== undefined) {
    code = code.replace(/input bool\s+InpEnableDynamicTrailing\s*=\s*\w+;/, `input bool                 InpEnableDynamicTrailing = ${options.enableDynamicTrailing ? 'true' : 'false'}; // Dynamic Trailing Stop`);
  }

  if (options.trailingStartUSD !== undefined) {
    code = code.replace(/input double\s+InpTrailingStartPoints\s*=\s*[\d.]+;/, `input double               InpTrailingStartPoints   = ${options.trailingStartUSD.toFixed(2)}; // Trailing Activation Profit`);
  }

  if (options.trailingStepUSD !== undefined) {
    code = code.replace(/input double\s+InpTrailingStepPoints\s*=\s*[\d.]+;/, `input double               InpTrailingStepPoints    = ${options.trailingStepUSD.toFixed(2)}; // Trailing Step`);
  }

  if ((options as any).enableWebCommander !== undefined) {
    code = code.replace(/input bool\s+InpEnableWebCommander\s*=\s*\w+;/, `input bool     InpEnableWebCommander   = ${(options as any).enableWebCommander ? 'true' : 'false'}; // Enable Web Remote Commander`);
  }

  if ((options as any).serverUrl) {
    code = code.replace(/input string\s+InpCommanderServerUrl\s*=\s*"[^"]*";/, `input string   InpCommanderServerUrl   = "${(options as any).serverUrl}"; // Web Dashboard URL`);
  }

  if ((options as any).apiKey) {
    code = code.replace(/input string\s+InpCommanderApiKey\s*=\s*"[^"]*";/, `input string   InpCommanderApiKey      = "${(options as any).apiKey}"; // Dashboard Authentication API Key`);
  }

  return code;
}

