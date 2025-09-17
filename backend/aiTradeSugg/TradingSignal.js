const { RSI, MACD, EMA} = require("technicalindicators")
const axios = require("axios")

class TradingAnalysisEngine {
  constructor() {
    this.ohlcData = [];
    this.analysisReport = {};
  }

  // Main orchestrator function
  async generateCompleteAnalysis(instrumentKey, optionsData) {
    try {
      // Step 1: Get OHLC data
      this.ohlcData = await this.getOHCL(instrumentKey);

      // Step 2: Run all indicators in sequence
      const marketContext = this.getMarketContext(new Date(), this.ohlcData);
      const momentum = this.getMomentumSignals(this.ohlcData);
      const levels = this.getSupportResistance(this.ohlcData);
      const optionsContext = this.getOptionsContext(
        optionsData,
        instrumentKey,
        this.getCurrentPrice()
      );

      // Step 3: Generate comprehensive report
      this.analysisReport = this.generateDetailedReport(
        marketContext,
        momentum,
        levels,
        optionsContext
      );

      // Step 4: Return formatted data for AI prompt
      return this.formatForAIPrompt();
    } catch (error) {
      console.error("Analysis failed:", error);
      return null;
    }
  }

  // Your existing OHLC function (cleaned up)
  async getOHCL(instrumentkey) {
    try {
      const { unit, interval } = { unit: "minutes", interval: "5" };
      const toDate = new Date().toISOString().split("T")[0];
      const fromDate = "2025-08-24";

      const yesterday = `https://api.upstox.com/v3/historical-candle/${instrumentkey}/${unit}/${interval}/${toDate}/${fromDate}`;
      const url = `https://api.upstox.com/v3/historical-candle/intraday/${instrumentkey}/${unit}/${interval}`;

      const [yesterdayRes, todayRes] = await Promise.all([
        axios.get(yesterday, { headers: { Accept: "application/json" } }),
        axios.get(url, { headers: { Accept: "application/json" } }),
      ]);

      const yesterdayCandles = yesterdayRes.data?.data?.candles ?? [];
      const todayCandles = todayRes.data?.data?.candles ?? [];

      // Merge and format candles
      const mergedCandles = yesterdayCandles
        .slice(-50) // Last 50 from yesterday
        .reverse()
        .concat(todayCandles.slice(-100).reverse()) // Last 100 from today
        .map((candle) => ({
          timestamp: candle[0],
          open: candle[1],
          high: candle[2],
          low: candle[3],
          close: candle[4],
          volume: candle[5],
        }));

      return mergedCandles;
    } catch (error) {
      throw new Error(`OHLC fetch failed: ${error.message}`);
    }
  }

  // Your existing functions with helper functions added
  getMarketContext(currentTime, ohlcData) {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    let session;
    if (hour === 9 && minute >= 15 && minute < 45)
      session = "OPENING_VOLATILITY";
    else if (hour >= 10 && hour < 14) session = "MIDDAY_CALM";
    else if (hour >= 14 && hour < 15) session = "CLOSING_RUSH";
    else session = "PRE_POST_MARKET";

    // Volatility calculation
    const currentATR = this.calculateSimpleATR(ohlcData.slice(-20));
    const avg20ATR = this.calculateAverage20ATR(ohlcData);

    let volEnvironment;
    if (currentATR > avg20ATR * 1.5) volEnvironment = "HIGH_VOLATILITY";
    else if (currentATR < avg20ATR * 0.7) volEnvironment = "LOW_VOLATILITY";
    else volEnvironment = "NORMAL_VOLATILITY";

    // Trend analysis
    const ema20 = this.calculateEMA(ohlcData, 20);
    const ema50 = this.calculateEMA(ohlcData, 50);
    const currentPrice = ohlcData[ohlcData.length - 1].close;

    let trendDirection;
    if (currentPrice > ema20 && ema20 > ema50)
      trendDirection = "STRONG_BULLISH";
    else if (currentPrice > ema20) trendDirection = "WEAK_BULLISH";
    else if (currentPrice < ema20 && ema20 < ema50)
      trendDirection = "STRONG_BEARISH";
    else trendDirection = "WEAK_BEARISH";

    return { session, volEnvironment, trendDirection, currentATR, avg20ATR };
  }

  getMomentumSignals(ohlcData) {
    const closes = ohlcData.map((d) => d.close);

    const rsi = RSI.calculate({ period: 14, values: closes });
    const currentRSI = rsi[rsi.length - 1];

    let rsiSignal;
    if (currentRSI > 70) rsiSignal = "OVERBOUGHT";
    else if (currentRSI < 30) rsiSignal = "OVERSOLD";
    else if (currentRSI > 50) rsiSignal = "BULLISH_ZONE";
    else rsiSignal = "BEARISH_ZONE";

    const macd = MACD.calculate({
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      values: closes,
    });
    const currentMACD = macd[macd.length - 1];

    let macdSignal;
    if (currentMACD.MACD > currentMACD.signal && currentMACD.MACD > 0)
      macdSignal = "STRONG_BUY";
    else if (currentMACD.MACD > currentMACD.signal) macdSignal = "WEAK_BUY";
    else if (currentMACD.MACD < currentMACD.signal && currentMACD.MACD < 0)
      macdSignal = "STRONG_SELL";
    else macdSignal = "WEAK_SELL";

    const roc =
      ((closes[closes.length - 1] - closes[closes.length - 11]) /
        closes[closes.length - 11]) *
      100;

    let rocSignal;
    if (roc > 2) rocSignal = "FAST_RISE";
    else if (roc > 0.5) rocSignal = "SLOW_RISE";
    else if (roc < -2) rocSignal = "FAST_FALL";
    else if (roc < -0.5) rocSignal = "SLOW_FALL";
    else rocSignal = "SIDEWAYS";

    return { rsiSignal, currentRSI, macdSignal, rocSignal, roc };
  }

  getSupportResistance(ohlcData) {
    const highs = ohlcData.map((d) => d.high);
    const lows = ohlcData.map((d) => d.low);
    const currentPrice = ohlcData[ohlcData.length - 1].close;

    const prevDayHigh = Math.max(...highs.slice(-20, -1));
    const prevDayLow = Math.min(...lows.slice(-20, -1));

    // Pivot points calculation
    const pivotHighs = [];
    const pivotLows = [];
    const recent50 = ohlcData.slice(-50);

    for (let i = 2; i < recent50.length - 2; i++) {
      if (
        recent50[i].high > recent50[i - 1].high &&
        recent50[i].high > recent50[i - 2].high &&
        recent50[i].high > recent50[i + 1].high &&
        recent50[i].high > recent50[i + 2].high
      ) {
        pivotHighs.push(recent50[i].high);
      }

      if (
        recent50[i].low < recent50[i - 1].low &&
        recent50[i].low < recent50[i - 2].low &&
        recent50[i].low < recent50[i + 1].low &&
        recent50[i].low < recent50[i + 2].low
      ) {
        pivotLows.push(recent50[i].low);
      }
    }

    const nearestResistance =
      pivotHighs.filter((h) => h > currentPrice).sort((a, b) => a - b)[0] ||
      prevDayHigh;
    const nearestSupport =
      pivotLows.filter((l) => l < currentPrice).sort((a, b) => b - a)[0] ||
      prevDayLow;

    return {
      nearestSupport,
      nearestResistance,
      distanceToSupport: currentPrice - nearestSupport,
      distanceToResistance: nearestResistance - currentPrice,
      prevDayHigh,
      prevDayLow,
    };
  }

  getOptionsContext(optionsData, instrumentKey, spotPrice) {
    console.log("s", instrumentKey)
    if (!optionsData[instrumentKey] || !optionsData[instrumentKey].optionChain) {
      return { error: "Invalid data for " + instrumentKey };
    }
  
    const chain = optionsData[instrumentKey].optionChain;
    console.log("opchain length", chain.length())
    const calls = chain
      .filter((opt) => opt.call !== null)
      .map((opt) => ({
        strike_price: opt.strike_price,
        ...opt.call,
        option_type: "CE",
      }));
  
    const puts = chain
      .filter((opt) => opt.put !== null)
      .map((opt) => ({
        strike_price: opt.strike_price,
        ...opt.put,
        option_type: "PE",
      }));
  
    const totalCallOI = calls.reduce((sum, call) => sum + (call.oi || 0), 0);
    const totalPutOI = puts.reduce((sum, put) => sum + (put.oi || 0), 0);
  
    const putCallRatio = totalCallOI > 0 ? (totalPutOI / totalCallOI).toFixed(2) : "NA";

    let sentimentSignal;
    if (putCallRatio > 1.2) sentimentSignal = "FEARFUL";
    else if (putCallRatio < 0.8) sentimentSignal = "GREEDY";
    else sentimentSignal = "NEUTRAL";

    // Find max pain
    const maxPain = this.calculateMaxPain(optionsData);

    // High volume strikes
    const highVolumeStrikes = this.findHighVolumeStrikes(calls, puts);

    return { putCallRatio, sentimentSignal, maxPain, highVolumeStrikes };
  }

  // Helper functions
  calculateSimpleATR(data) {
    let atrSum = 0;
    for (let i = 1; i < data.length; i++) {
      const tr = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      atrSum += tr;
    }
    return atrSum / (data.length - 1);
  }

  calculateAverage20ATR(data) {
    if (data.length < 40) return this.calculateSimpleATR(data);

    let sum = 0;
    for (let i = 0; i < 20; i++) {
      const slice = data.slice(i * 20, (i + 1) * 20);
      if (slice.length >= 20) {
        sum += this.calculateSimpleATR(slice);
      }
    }
    return sum / 20;
  }

  calculateEMA(data, period) {
    const closes = data.map((d) => d.close);
    return EMA.calculate({ period, values: closes });
  }

  calculateMaxPain(optionsData) {
    const strikeMap = {};

    optionsData.forEach((option) => {
      const strike = option.strike_price;
      if (!strikeMap[strike]) strikeMap[strike] = { callOI: 0, putOI: 0 };

      if (option.option_type === "CE")
        strikeMap[strike].callOI += option.open_interest || 0;
      else strikeMap[strike].putOI += option.open_interest || 0;
    });

    let maxPainStrike = 0;
    let minPain = Infinity;

    Object.keys(strikeMap).forEach((strike) => {
      const strikePrice = parseFloat(strike);
      let totalPain = 0;

      Object.keys(strikeMap).forEach((otherStrike) => {
        const otherPrice = parseFloat(otherStrike);
        const { callOI, putOI } = strikeMap[otherStrike];

        if (strikePrice > otherPrice)
          totalPain += callOI * (strikePrice - otherPrice);
        if (strikePrice < otherPrice)
          totalPain += putOI * (otherPrice - strikePrice);
      });

      if (totalPain < minPain) {
        minPain = totalPain;
        maxPainStrike = strikePrice;
      }
    });

    return maxPainStrike;
  }

  findHighVolumeStrikes(calls, puts) {
    const allOptions = [...calls, ...puts];
    return allOptions
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 5)
      .map((opt) => ({
        strike: opt.strike_price,
        type: opt.option_type,
        volume: opt.volume || 0,
        ltp: opt.ltp || 0,
      }));
  }

  getCurrentPrice() {
    return this.ohlcData[this.ohlcData.length - 1]?.close || 0;
  }

  // Generate detailed analysis report
  generateDetailedReport(marketContext, momentum, levels, optionsContext) {
    const currentPrice = this.getCurrentPrice();
    const priceNearResistance =
      levels.distanceToResistance < currentPrice * 0.005; // Within 0.5%
    const priceNearSupport = levels.distanceToSupport < currentPrice * 0.005;

    // Market strength assessment
    let marketStrength = "NEUTRAL";
    let confidenceScore = 50;

    if (momentum.rsiSignal === "OVERBOUGHT" && priceNearResistance) {
      marketStrength = "BEARISH";
      confidenceScore = 75;
    } else if (momentum.rsiSignal === "OVERSOLD" && priceNearSupport) {
      marketStrength = "BULLISH";
      confidenceScore = 75;
    } else if (momentum.macdSignal.includes("STRONG")) {
      marketStrength = momentum.macdSignal.includes("BUY")
        ? "BULLISH"
        : "BEARISH";
      confidenceScore = 65;
    }

    // Price zones
    const priceZones = {
      strongSupport: levels.nearestSupport,
      weakSupport: levels.nearestSupport + levels.distanceToSupport * 0.5,
      neutral: currentPrice,
      weakResistance:
        levels.nearestResistance - levels.distanceToResistance * 0.5,
      strongResistance: levels.nearestResistance,
    };

    // Options analysis
    const optionStrategy = this.suggestOptionStrategy(
      marketStrength,
      optionsContext,
      levels
    );

    return {
      timestamp: new Date().toISOString(),
      currentPrice,
      marketContext,
      momentum,
      levels,
      optionsContext,
      marketStrength,
      confidenceScore,
      priceZones,
      optionStrategy,
      tradingRecommendation: this.generateTradingRecommendation(
        marketStrength,
        confidenceScore,
        priceZones,
        optionStrategy
      ),
    };
  }

  suggestOptionStrategy(marketStrength, optionsContext, levels) {
    const strategies = [];

    if (
      marketStrength === "BULLISH" &&
      optionsContext.sentimentSignal !== "GREEDY"
    ) {
      strategies.push({
        type: "CALL_BUYING",
        reason: "Bullish momentum with reasonable sentiment",
        strikes: this.findOptimalCallStrikes(levels),
      });
    }

    if (
      marketStrength === "BEARISH" &&
      optionsContext.sentimentSignal !== "FEARFUL"
    ) {
      strategies.push({
        type: "PUT_BUYING",
        reason: "Bearish momentum with reasonable sentiment",
        strikes: this.findOptimalPutStrikes(levels),
      });
    }

    if (marketStrength === "NEUTRAL") {
      strategies.push({
        type: "RANGE_STRATEGY",
        reason: "Sideways market, range trading opportunity",
        strikes: { sell: levels.nearestResistance, buy: levels.nearestSupport },
      });
    }

    return strategies;
  }

  findOptimalCallStrikes(levels) {
    const currentPrice = this.getCurrentPrice();
    return {
      conservative:
        Math.round((currentPrice + levels.distanceToResistance * 0.3) / 50) *
        50,
      aggressive:
        Math.round((currentPrice + levels.distanceToResistance * 0.7) / 50) *
        50,
    };
  }

  findOptimalPutStrikes(levels) {
    const currentPrice = this.getCurrentPrice();
    return {
      conservative:
        Math.round((currentPrice - levels.distanceToSupport * 0.3) / 50) * 50,
      aggressive:
        Math.round((currentPrice - levels.distanceToSupport * 0.7) / 50) * 50,
    };
  }

  generateTradingRecommendation(
    marketStrength,
    confidenceScore,
    priceZones,
    optionStrategy
  ) {
    return {
      primary_bias: marketStrength,
      confidence: confidenceScore,
      suggested_entries: {
        bullish_entry: priceZones.weakSupport,
        bearish_entry: priceZones.weakResistance,
        breakout_entry: priceZones.strongResistance + 10,
        breakdown_entry: priceZones.strongSupport - 10,
      },
      option_recommendations: optionStrategy,
      risk_management: {
        position_size: confidenceScore > 70 ? "NORMAL" : "SMALL",
        stop_loss_distance:
          Math.abs(priceZones.neutral - priceZones.strongSupport) * 0.5,
        target_distance:
          Math.abs(priceZones.strongResistance - priceZones.neutral) * 0.7,
      },
    };
  }

  // Format for AI prompt
  formatForAIPrompt() {
    const report = this.analysisReport;

    return {
      // Enhanced market data for AI
      currentMarketAnalysis: {
        spotPrice: report.currentPrice,
        marketStrength: report.marketStrength,
        confidenceScore: report.confidenceScore,
        session: report.marketContext.session,
        volatility: report.marketContext.volEnvironment,
        trend: report.marketContext.trendDirection,
      },

      technicalSignals: {
        rsi: {
          value: report.momentum.currentRSI,
          signal: report.momentum.rsiSignal,
          interpretation: this.interpretRSI(report.momentum.currentRSI),
        },
        macd: {
          signal: report.momentum.macdSignal,
          interpretation: this.interpretMACD(report.momentum.macdSignal),
        },
        momentum: {
          roc: report.momentum.roc,
          signal: report.momentum.rocSignal,
        },
      },

      keyLevels: {
        support: report.levels.nearestSupport,
        resistance: report.levels.nearestResistance,
        maxPain: report.optionsContext.maxPain,
        priceZones: report.priceZones,
      },

      optionsIntelligence: {
        putCallRatio: report.optionsContext.putCallRatio,
        sentiment: report.optionsContext.sentimentSignal,
        highVolumeStrikes: report.optionsContext.highVolumeStrikes,
      },

      tradingGuidance: {
        primaryBias: report.marketStrength,
        optimalStrikes: this.suggestOptimalStrikes(),
        entryZones: report.tradingRecommendation.suggested_entries,
        riskParameters: report.tradingRecommendation.risk_management,
      },

      aiInstructions: this.generateAIInstructions(),
    };
  }

  interpretRSI(rsi) {
    if (rsi > 70) return `Overbought at ${rsi.toFixed(1)} - price may pullback`;
    if (rsi < 30) return `Oversold at ${rsi.toFixed(1)} - price may bounce`;
    if (rsi > 50) return `Bullish momentum at ${rsi.toFixed(1)}`;
    return `Bearish momentum at ${rsi.toFixed(1)}`;
  }

  interpretMACD(signal) {
    switch (signal) {
      case "STRONG_BUY":
        return "Strong bullish momentum building";
      case "WEAK_BUY":
        return "Mild bullish momentum";
      case "STRONG_SELL":
        return "Strong bearish momentum building";
      case "WEAK_SELL":
        return "Mild bearish momentum";
      default:
        return "Neutral momentum";
    }
  }

  suggestOptimalStrikes() {
    const currentPrice = this.getCurrentPrice();
    const report = this.analysisReport;

    // Dynamic strike selection based on current analysis
    const strikes = [];

    if (report.marketStrength === "BULLISH") {
      strikes.push({
        type: "CE",
        strike: Math.round((currentPrice + 50) / 50) * 50,
        reason: "Near ITM call for bullish momentum",
      });
    }

    if (report.marketStrength === "BEARISH") {
      strikes.push({
        type: "PE",
        strike: Math.round((currentPrice - 50) / 50) * 50,
        reason: "Near ITM put for bearish momentum",
      });
    }

    return strikes;
  }

  generateAIInstructions() {
    const report = this.analysisReport;

    return {
      focus_areas: [
        `Current market is ${report.marketStrength} with ${report.confidenceScore}% confidence`,
        `RSI shows ${report.momentum.rsiSignal} condition`,
        `Price near ${
          report.levels.distanceToResistance < report.levels.distanceToSupport
            ? "resistance"
            : "support"
        }`,
        `Options sentiment is ${report.optionsContext.sentimentSignal}`,
      ],

      trade_parameters: {
        preferred_strikes: "Within 100-200 points of spot price",
        max_premium: "₹150 per lot",
        risk_reward: "Minimum 1:2 ratio",
        time_frame: "Intraday only",
      },

      market_context: `Current session: ${report.marketContext.session}, Volatility: ${report.marketContext.volEnvironment}, Trend: ${report.marketContext.trendDirection}`,
    };
  }
}

// Export the class
module.exports = TradingAnalysisEngine;
