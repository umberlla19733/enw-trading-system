import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// --- Remote EA Commander Data Structures ---
export interface RemoteEaConfig {
  isTradingEnabled: boolean;
  emergencyCloseRequested: boolean;
  strategyMode: "HIGH_SPEED" | "BALANCED" | "SNIPER";
  baseLot: number;
  riskPercent: number;
  slMode: "DYNAMIC_ATR" | "SWING_STRUCTURE" | "KIJUN_EQUILIBRIUM" | "CUSTOM_FIXED" | "AI_ADAPTIVE";
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

export interface TerminalTelemetry {
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
  openPositions: {
    ticket: number;
    symbol: string;
    type: "BUY" | "SELL";
    volume: number;
    openPrice: number;
    currentPrice: number;
    sl: number;
    tp: number;
    profit: number;
    openTime: string;
    comment: string;
  }[];
  symbol: string;
  currentSpread: number;
  goldBid: number;
  goldAsk: number;
  isAutoTradingAllowedInTerminal: boolean;
  eaVersion: string;
  magicNumber: number;
  lastPingTimestamp: number;
  latencyMs: number;
  status: "ONLINE" | "IDLE" | "OFFLINE";
}

export interface CommandLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  sender: "WEB_DASHBOARD" | "MT5_TERMINAL" | "AI_GUARD";
  status: "SENT" | "ACKNOWLEDGED" | "EXECUTED" | "FAILED";
}

// In-Memory Storage for State
const state = {
  config: <RemoteEaConfig>{
    isTradingEnabled: true,
    emergencyCloseRequested: false,
    strategyMode: "HIGH_SPEED",
    baseLot: 0.10,
    riskPercent: 2.0,
    slMode: "DYNAMIC_ATR",
    customSlUSD: 3.20,
    customTpUSD: 5.00,
    trailingStopActive: true,
    newsFilterActive: true,
    maxConcurrentTrades: 2,
    apiKeyToken: "ELLIOTT-NEOWAVE-SECRET-KEY",
    lastCommandTimestamp: Date.now(),
    lastCommandAction: "SYSTEM_INITIALIZED",
    lastUpdated: new Date().toISOString(),
  },
  terminals: new Map<string, TerminalTelemetry>(),
  commandLogs: <CommandLogEntry[]>[
    {
      id: "CMD-INIT-001",
      timestamp: new Date().toISOString(),
      action: "پل ارتباطی متاتریدر ۵ فعال شد",
      details: "سرور هدایت و فرماندهی راه دور آماده اتصال اکسپرت الیوت نئویو است.",
      sender: "WEB_DASHBOARD",
      status: "EXECUTED",
    },
  ],
  tradeEvents: <any[]>[],
};

// Seed a simulated initial telemetry if no live MT5 has connected yet so the dashboard is immediately interactive
const simulatedAccountId = "8891024 (دمو شبیه‌ساز اتصال)";
state.terminals.set(simulatedAccountId, {
  accountNumber: "8891024",
  accountName: "Elliott Neowave Cent Account",
  broker: "Alpari / RoboForex Cent",
  currency: "USC",
  balance: 15920.0,
  equity: 16140.0,
  margin: 115.0,
  freeMargin: 16025.0,
  marginLevel: 14034.7,
  floatingProfit: +2.20,
  openPositions: [
    {
      ticket: 9812401,
      symbol: "XAUUSD",
      type: "BUY",
      volume: 0.25,
      openPrice: 2648.20,
      currentPrice: 2649.08,
      sl: 2645.80,
      tp: 2652.50,
      profit: +2.20,
      openTime: "2026-09-22 07:14:22",
      comment: "ElliottNeowave_M1_V_Wave",
    },
  ],
  symbol: "XAUUSD (Gold)",
  currentSpread: 18,
  goldBid: 2649.08,
  goldAsk: 2649.26,
  isAutoTradingAllowedInTerminal: true,
  eaVersion: "v6.0 - Web Commander",
  magicNumber: 791826,
  lastPingTimestamp: Date.now(),
  latencyMs: 38,
  status: "ONLINE",
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware for web requests from MT5 and frontend
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-KEY");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ROUTE 1: GET Server Health ---
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Elliott Neowave EA Web Commander Bridge",
    });
  });

  // --- API ROUTE 2: GET Remote Config & State ---
  app.get("/api/ea/config", (req, res) => {
    // Check terminal statuses
    const now = Date.now();
    for (const [key, term] of state.terminals.entries()) {
      if (now - term.lastPingTimestamp > 15000) {
        term.status = "OFFLINE";
      } else if (now - term.lastPingTimestamp > 6000) {
        term.status = "IDLE";
      } else {
        term.status = "ONLINE";
      }
    }

    res.json({
      success: true,
      config: state.config,
      connectedTerminalsCount: Array.from(state.terminals.values()).filter((t) => t.status !== "OFFLINE").length,
      serverTime: new Date().toISOString(),
      serverTimestamp: Math.floor(Date.now() / 1000),
    });
  });

  // --- API ROUTE 3: POST Remote Command from Web Dashboard ---
  app.post("/api/ea/command", (req, res) => {
    try {
      const { action, payload } = req.body;
      const timestamp = new Date().toISOString();
      const logId = `CMD-${Date.now().toString(36).toUpperCase()}`;

      if (action === "PAUSE_TRADING") {
        state.config.isTradingEnabled = false;
        state.config.lastCommandAction = "PAUSE_TRADING";
        state.config.lastCommandTimestamp = Date.now();
        state.config.lastUpdated = timestamp;

        state.commandLogs.unshift({
          id: logId,
          timestamp,
          action: "توقف کامل معاملات (Kill-Switch)",
          details: "معاملات جدید توسط کاربر از طریق داشبورد وب مسدود شد.",
          sender: "WEB_DASHBOARD",
          status: "SENT",
        });
      } else if (action === "RESUME_TRADING") {
        state.config.isTradingEnabled = true;
        state.config.emergencyCloseRequested = false;
        state.config.lastCommandAction = "RESUME_TRADING";
        state.config.lastCommandTimestamp = Date.now();
        state.config.lastUpdated = timestamp;

        state.commandLogs.unshift({
          id: logId,
          timestamp,
          action: "شروع مجدد معاملات خودکار (Resume)",
          details: "مجوز معامله‌گری اکسپرت از طریق داشبورد وب صادر شد.",
          sender: "WEB_DASHBOARD",
          status: "SENT",
        });
      } else if (action === "EMERGENCY_CLOSE_ALL") {
        state.config.emergencyCloseRequested = true;
        state.config.lastCommandAction = "EMERGENCY_CLOSE_ALL";
        state.config.lastCommandTimestamp = Date.now();
        state.config.lastUpdated = timestamp;

        state.commandLogs.unshift({
          id: logId,
          timestamp,
          action: "بستن اضطراری تمام پوزیشن‌ها (Close All)",
          details: "دستور بسته شدن فوری تمام پوزیشن‌های باز طلا به اکسپرت ارسال گردید.",
          sender: "WEB_DASHBOARD",
          status: "SENT",
        });

        // Also update simulated positions
        for (const term of state.terminals.values()) {
          term.openPositions = [];
          term.floatingProfit = 0;
        }
      } else if (action === "UPDATE_SETTINGS") {
        if (payload) {
          if (payload.strategyMode) state.config.strategyMode = payload.strategyMode;
          if (payload.baseLot !== undefined) state.config.baseLot = parseFloat(payload.baseLot);
          if (payload.riskPercent !== undefined) state.config.riskPercent = parseFloat(payload.riskPercent);
          if (payload.slMode) state.config.slMode = payload.slMode;
          if (payload.customSlUSD !== undefined) state.config.customSlUSD = parseFloat(payload.customSlUSD);
          if (payload.customTpUSD !== undefined) state.config.customTpUSD = parseFloat(payload.customTpUSD);
          if (payload.trailingStopActive !== undefined) state.config.trailingStopActive = Boolean(payload.trailingStopActive);
          if (payload.newsFilterActive !== undefined) state.config.newsFilterActive = Boolean(payload.newsFilterActive);
          if (payload.maxConcurrentTrades !== undefined) state.config.maxConcurrentTrades = parseInt(payload.maxConcurrentTrades, 10);
        }

        state.config.lastCommandAction = "UPDATE_SETTINGS";
        state.config.lastCommandTimestamp = Date.now();
        state.config.lastUpdated = timestamp;

        state.commandLogs.unshift({
          id: logId,
          timestamp,
          action: "بروزرسانی پارامترهای معاملاتی",
          details: `مود: ${state.config.strategyMode} | حجم: ${state.config.baseLot} | مدل استاپ: ${state.config.slMode}`,
          sender: "WEB_DASHBOARD",
          status: "SENT",
        });
      } else if (action === "RESET_EMERGENCY_CLOSE") {
        state.config.emergencyCloseRequested = false;
        state.config.lastCommandAction = "RESET_EMERGENCY_CLOSE";
        state.config.lastCommandTimestamp = Date.now();
        state.config.lastUpdated = timestamp;
      }

      // Keep only last 50 logs
      if (state.commandLogs.length > 50) {
        state.commandLogs = state.commandLogs.slice(0, 50);
      }

      res.json({
        success: true,
        message: "دستور با موفقیت ثبت و آماده ارسال به متاتریدر ۵ شد.",
        config: state.config,
        logId,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- API ROUTE 4: Heartbeat & Telemetry Polling (Called by MT5 EA WebRequest) ---
  app.all("/api/ea/heartbeat", (req, res) => {
    try {
      const data = req.method === "POST" ? req.body : req.query;
      const apiKey = req.headers["x-api-key"] || data.apiKey || data.token;

      // Validate Auth Token (if set)
      if (state.config.apiKeyToken && apiKey && apiKey !== state.config.apiKeyToken) {
        return res.status(403).json({ success: false, error: "کلید امنیتی معتبر نیست (Invalid API Key)" });
      }

      const accountNumber = data.accountNumber ? String(data.accountNumber) : "Unknown_MT5";
      const now = Date.now();

      // Update terminal telemetry from MT5 heartbeat payload
      if (data.balance !== undefined || data.accountNumber) {
        const existing = state.terminals.get(accountNumber) || {
          accountNumber,
          accountName: data.accountName || `MT5 Account #${accountNumber}`,
          broker: data.broker || "MetaTrader 5 Broker",
          currency: data.currency || "USD",
          balance: parseFloat(data.balance || "0"),
          equity: parseFloat(data.equity || data.balance || "0"),
          margin: parseFloat(data.margin || "0"),
          freeMargin: parseFloat(data.freeMargin || "0"),
          marginLevel: parseFloat(data.marginLevel || "0"),
          floatingProfit: parseFloat(data.floatingProfit || "0"),
          openPositions: Array.isArray(data.openPositions) ? data.openPositions : [],
          symbol: data.symbol || "XAUUSD",
          currentSpread: parseInt(data.currentSpread || "15", 10),
          goldBid: parseFloat(data.goldBid || "0"),
          goldAsk: parseFloat(data.goldAsk || "0"),
          isAutoTradingAllowedInTerminal: data.isAutoTrading !== undefined ? Boolean(data.isAutoTrading) : true,
          eaVersion: data.eaVersion || "v6.0",
          magicNumber: parseInt(data.magicNumber || "791826", 10),
          lastPingTimestamp: now,
          latencyMs: parseInt(data.latencyMs || "35", 10),
          status: "ONLINE",
        };

        existing.balance = parseFloat(data.balance !== undefined ? data.balance : existing.balance);
        existing.equity = parseFloat(data.equity !== undefined ? data.equity : existing.equity);
        existing.margin = parseFloat(data.margin !== undefined ? data.margin : existing.margin);
        existing.freeMargin = parseFloat(data.freeMargin !== undefined ? data.freeMargin : existing.freeMargin);
        existing.floatingProfit = parseFloat(data.floatingProfit !== undefined ? data.floatingProfit : existing.floatingProfit);
        if (data.openPositions) existing.openPositions = data.openPositions;
        if (data.currentSpread) existing.currentSpread = parseInt(data.currentSpread, 10);
        if (data.goldBid) existing.goldBid = parseFloat(data.goldBid);
        if (data.goldAsk) existing.goldAsk = parseFloat(data.goldAsk);
        existing.lastPingTimestamp = now;
        existing.status = "ONLINE";

        state.terminals.set(accountNumber, existing);
      }

      // Formulate Command Payload for MT5 EA
      let actionToExecute = "NORMAL";
      if (state.config.emergencyCloseRequested) {
        actionToExecute = "CLOSE_ALL";
      } else if (!state.config.isTradingEnabled) {
        actionToExecute = "PAUSE";
      } else {
        actionToExecute = "RESUME";
      }

      const responsePayload = {
        status: "OK",
        serverTimestamp: Math.floor(now / 1000),
        command: {
          action: actionToExecute,
          isTradingEnabled: state.config.isTradingEnabled,
          emergencyClose: state.config.emergencyCloseRequested,
          strategyMode: state.config.strategyMode,
          lotSize: state.config.baseLot,
          riskPercent: state.config.riskPercent,
          slMode: state.config.slMode,
          customSlUSD: state.config.customSlUSD,
          customTpUSD: state.config.customTpUSD,
          trailingActive: state.config.trailingStopActive,
          newsFilterActive: state.config.newsFilterActive,
          maxTrades: state.config.maxConcurrentTrades,
          commandTimestamp: state.config.lastCommandTimestamp,
        },
      };

      res.json(responsePayload);
    } catch (err: any) {
      res.status(500).json({ status: "ERROR", message: err.message });
    }
  });

  // --- API ROUTE 5: GET Full Telemetry for UI Dashboard ---
  app.get("/api/ea/telemetry", (req, res) => {
    const terminalsList = Array.from(state.terminals.values());
    res.json({
      success: true,
      config: state.config,
      terminals: terminalsList,
      logs: state.commandLogs,
      recentTrades: state.tradeEvents,
      serverTime: new Date().toISOString(),
    });
  });

  // --- API ROUTE 6: POST Trade Event from MT5 ---
  app.post("/api/ea/trade-event", (req, res) => {
    const event = req.body;
    state.tradeEvents.unshift({
      ...event,
      receivedAt: new Date().toISOString(),
    });
    if (state.tradeEvents.length > 100) {
      state.tradeEvents = state.tradeEvents.slice(0, 100);
    }

    state.commandLogs.unshift({
      id: `EVT-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action: event.type === "OPEN" ? "معامله جدید در متاتریدر ۵ باز شد" : "معامله در متاتریدر ۵ بسته شد",
      details: `تیکت: ${event.ticket} | حجم: ${event.volume} | سود/زیان: ${event.profit || 0}`,
      sender: "MT5_TERMINAL",
      status: "EXECUTED",
    });

    res.json({ success: true, message: "رویداد با موفقیت ذخیره شد." });
  });

  // --- Vite Middleware Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Elliott Neowave EA Commander] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
