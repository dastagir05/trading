// tradePrompt.js - Enhanced prompt generation with technical analysis

function generateTradePrompt(marketData, analysisData = null) {
  const currentTime = new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const currentDate = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  // Base prompt structure
  let prompt = `
# AI Trading Assistant - Fresh Trade Suggestions

## Context
You are an expert options trading AI generating FRESH trade ideas for **Nifty** and **BankNifty** options for TODAY's current market session.

**Current Time**: ${currentTime} IST
**Date**: ${currentDate}

## Market Data Analysis
`;

  // Add technical analysis if available
  if (
    analysisData &&
    analysisData.niftyAnalysis &&
    analysisData.bankNiftyAnalysis
  ) {
    prompt += generateTechnicalAnalysisSection(
      analysisData.niftyAnalysis,
      analysisData.bankNiftyAnalysis
    );
  } else {
    prompt += generateBasicMarketDataSection(marketData);
  }

  // Add trading instructions
  prompt += generateTradingInstructions(analysisData);

  // Add market data
  prompt += `
## Raw Market Data
${JSON.stringify(marketData, null, 2)}

## Response Format
Return exactly 3 trade suggestions in JSON format as an array of objects with the following structure:
give any price round off not in decimal and expiry should be a proper data e.g.2025-08-28,if is not strategy then it must be a buy trade only,
like for strategy make  schema like mentioning which two symbol and use & give entry= 35 not like "entry": "CALL=87 & PUT=53 it just 87 & 53 & 88 and target and stoploss also in entry
the strategy make isStrategy true and for normal trade make it false and don't give strike like Nifty 24700 CALL BUY/SELL & PUT BUY/SELL strike must be Nifty 24700 CALL & Nifty 24700 PUT
\`\`\`json
[
  {
    "isStrategy": "true/false",
    "title": "Descriptive trade title",
    "sentiment": "BULLISH/BEARISH/NEUTRAL",
    "setup": {
      "currentPrice": "current spot price",
      "instrument_key": "e.g. NSE_FO|53020, many instrument for strategy by , seprated",
      "strategy": "strategy type",
      "strike": "stock and strike selection e.g.Nifty 25050 PUT/CALL and BUY/SELL",
      "expiry": "expiry selection"
    },
    "tradePlan": {
      "entry": "entry price",
      "target": "target price",
      "stopLoss": "stoploss price",
      "timeFrame": "holding period"
    },
    "logic": "detailed reasoning for the trade",
    "confidence": "1 to 100",
    "riskLevel": "LOW/MEDIUM/HIGH"
  }
]
\`\`\`

Generate 3 diverse trades with entry prices ≤ ₹150 each.
`;

  return prompt;
}

function generateTechnicalAnalysisSection(niftyAnalysis, bankNiftyAnalysis) {
  return `
## LIVE TECHNICAL ANALYSIS

### NIFTY Analysis:
- **Current Price**: ${niftyAnalysis.currentMarketAnalysis.spotPrice}
- **Market Strength**: ${niftyAnalysis.currentMarketAnalysis.marketStrength} (${
    niftyAnalysis.currentMarketAnalysis.confidenceScore
  }% confidence)
- **RSI**: ${niftyAnalysis.technicalSignals.rsi.interpretation}
- **MACD**: ${niftyAnalysis.technicalSignals.macd.interpretation}
- **Support**: ${niftyAnalysis.keyLevels.support} | **Resistance**: ${
    niftyAnalysis.keyLevels.resistance
  }
- **Max Pain**: ${niftyAnalysis.keyLevels.maxPain}
- **Options Sentiment**: ${niftyAnalysis.optionsIntelligence.sentiment}
- **Trend Direction**: ${
    niftyAnalysis.currentMarketAnalysis.trendDirection || "Unknown"
  }

### BANKNIFTY Analysis:
- **Current Price**: ${bankNiftyAnalysis.currentMarketAnalysis.spotPrice}
- **Market Strength**: ${
    bankNiftyAnalysis.currentMarketAnalysis.marketStrength
  } (${bankNiftyAnalysis.currentMarketAnalysis.confidenceScore}% confidence)
- **RSI**: ${bankNiftyAnalysis.technicalSignals.rsi.interpretation}
- **MACD**: ${bankNiftyAnalysis.technicalSignals.macd.interpretation}
- **Support**: ${bankNiftyAnalysis.keyLevels.support} | **Resistance**: ${
    bankNiftyAnalysis.keyLevels.resistance
  }
- **Max Pain**: ${bankNiftyAnalysis.keyLevels.maxPain}
- **Options Sentiment**: ${bankNiftyAnalysis.optionsIntelligence.sentiment}
- **Trend Direction**: ${
    bankNiftyAnalysis.currentMarketAnalysis.trendDirection || "Unknown"
  }

### Key Trading Insights:
- **Nifty Focus Areas**: ${
    niftyAnalysis.aiInstructions?.focus_areas?.join(", ") ||
    "Standard technical analysis"
  }
- **BankNifty Focus Areas**: ${
    bankNiftyAnalysis.aiInstructions?.focus_areas?.join(", ") ||
    "Standard technical analysis"
  }
`;
}

function generateBasicMarketDataSection(marketData) {
  return `
## BASIC MARKET DATA

### NIFTY:
- **Current Price**: ${marketData.nifty?.currentPrice || "N/A"}
- **Change**: ${marketData.nifty?.change || "N/A"} (${
    marketData.nifty?.pChange || "N/A"
  }%)

### BANKNIFTY:
- **Current Price**: ${marketData.banknifty?.currentPrice || "N/A"}
- **Change**: ${marketData.bankNifty?.change || "N/A"} (${
    marketData.bankNifty?.pChange || "N/A"
  }%)
`;
}

function generateTradingInstructions(analysisData) {
  let instructions = `
## AI TRADING INSTRUCTIONS:

### Primary Objectives:
1. **Risk Management**: All entries must be ≤ ₹200 to ensure affordable risk
2. **Technical Confluence**: Use multiple technical indicators for trade validation
3. **Time Decay Management**: Consider theta decay in option selection
4. **Volatility Awareness**: Factor in current IV levels for entry/exit

### Strategy Guidelines:
- **Bullish Bias**: Look for Call buying opportunities near support levels
- **Bearish Bias**: Consider Put buying near resistance levels  
- **Neutral Strategy**: Iron Condor or Straddle/Strangle for range-bound markets
- **Breakout Strategy**: Momentum trades on key level breaks

### Risk Parameters:
- Maximum entry cost: ₹250 per trade
- Risk-reward ratio: as you predict breakdown
- Position sizing: Based on account size and risk tolerance
- Time frame: Intraday to weekly expiry preferred
`;

  // Add specific focus areas if analysis data is available
  if (analysisData?.niftyAnalysis?.aiInstructions?.focus_areas) {
    instructions += `
### Current Market Focus:
${analysisData.niftyAnalysis.aiInstructions.focus_areas.join(". ")}
`;
  }

  return instructions;
}

// Export the main function
module.exports = generateTradePrompt;
