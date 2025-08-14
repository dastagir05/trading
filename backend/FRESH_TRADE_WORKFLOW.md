# 🚀 Fresh AI Trade Workflow

## Overview
This system automatically generates fresh AI trade suggestions based on current market conditions, replacing outdated suggestions with real-time analysis.

## 🔄 Workflow Steps

### 1. **Fetch Fresh Market Data**
- Connects to Upstox API
- Gets real-time Nifty & BankNifty prices
- Fetches current option chain data
- Saves to `marketData.json`

### 2. **Generate AI Trade Suggestions**
- Uses Google Gemini AI
- Analyzes current market conditions
- Generates 3 fresh trade suggestions
- Saves to `tradeSuggestions.json`

### 3. **Clean Up Old Trades**
- Deletes all old AI trades from database
- Removes outdated suggestions
- Prepares for fresh data

### 4. **Create New AI Trades**
- Creates new AI trade records in database
- Assigns fresh IDs and timestamps
- Sets status to 'suggested'

## 🕐 Automatic Schedule

### **Every 30 Minutes (9:15 AM - 3:30 PM IST)**
```bash
# System automatically generates fresh suggestions
cron.schedule('*/30 9-15 * * 1-5', () => {
  this.generateFreshSuggestions();
}, {
  timezone: "Asia/Kolkata"
});
```

### **Every 5 Minutes (9:15 AM - 3:30 PM IST)**
```bash
# System monitors active trades
cron.schedule('*/5 9-15 * * 1-5', () => {
  this.monitorActiveTrades();
}, {
  timezone: "Asia/Kolkata"
});
```

## 🛠️ Manual Commands

### **Generate Fresh Trades Now**
```bash
# Using npm script
npm run generate-fresh-trades

# Using node directly
node scripts/generateFreshTrades.js

# Using the file directly
node aiTradeSugg/generateFreshTrades.js
```

### **Fetch Market Data Only**
```bash
npm run fetch-market-data
```

### **Generate Legacy Trades**
```bash
npm run generate-trades
```

## 🌐 API Endpoints

### **Generate Fresh Trades**
```bash
POST /api/ai-trades/generate-fresh
```
**Response:**
```json
{
  "success": true,
  "message": "Fresh trade suggestions generated successfully",
  "result": [...],
  "timestamp": "2025-01-13T12:30:00.000Z"
}
```

### **View Current Trades**
```bash
GET /api/ai-trades
```

### **View Trade Statistics**
```bash
GET /api/ai-trades/stats
```

## 📁 File Structure

```
backend/
├── aiTradeSugg/
│   ├── generateFreshTrades.js    # Main fresh trade generator
│   ├── generateTrades.js         # Legacy trade generator
│   ├── tradePromt.js            # AI prompt template
│   ├── tradeSuggestions.json    # Generated suggestions
│   └── setOptionData/
│       ├── setOptData.js        # Market data fetcher
│       └── marketData.json      # Current market data
├── scripts/
│   └── generateFreshTrades.js   # CLI script
├── services/
│   └── aiTradeProcessor.js      # Automated processor
└── routes/
    └── aiTrade.route.js         # API endpoints
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
ACCESS_TOKEN=your_upstox_access_token

# Optional
BACKEND_URL=http://localhost:5000
```

### **Market Data Sources**
- **Nifty 50**: `NSE_INDEX|Nifty 50`
- **Bank Nifty**: `NSE_INDEX|Nifty Bank`
- **Update Frequency**: Every 30 minutes during market hours

## 📊 Trade Lifecycle

### **Phase 1: Suggested**
- Trade is created and stored
- Status: `suggested`
- Waiting for market conditions

### **Phase 2: Active**
- Trade is activated when market opens
- Status: `active`
- Real-time monitoring begins

### **Phase 3: Completed**
- Status: `target_hit`, `stoploss_hit`, `expired`, or `cancelled`
- P&L calculated and recorded

## 🚨 Troubleshooting

### **Common Issues**

1. **Market Data Not Found**
   ```bash
   # Run market data fetcher first
   npm run fetch-market-data
   ```

2. **AI Generation Failed**
   ```bash
   # Check Gemini API key
   echo $GEMINI_API_KEY
   ```

3. **Database Connection Error**
   ```bash
   # Check MongoDB connection
   # Ensure backend server is running
   ```

### **Logs to Watch**
```bash
# Backend terminal shows:
🔄 Generating fresh AI trade suggestions...
📊 Fetching fresh market data...
✅ Fresh market data loaded
🤖 Generating AI trade suggestions...
📝 Raw AI response received
✅ Fresh trade suggestions saved
🗑️ Cleaning up old AI trades from database...
📝 Creating new AI trades in database...
🎉 Fresh trade generation workflow completed successfully!
```

## 🎯 Best Practices

1. **Run fresh trades at market open** (9:15 AM IST)
2. **Monitor system logs** for any errors
3. **Verify market data** before generating trades
4. **Check AI suggestions** for logical consistency
5. **Review risk-reward ratios** before execution

## 🔄 Next Steps

1. **Test the workflow** with current market data
2. **Verify AI suggestions** are logical and current
3. **Monitor automatic updates** every 30 minutes
4. **Integrate with frontend** for real-time display
5. **Add market data validation** for better accuracy

---

**Last Updated**: January 13, 2025  
**Version**: 2.0 (Fresh Trade Workflow)  
**Status**: ✅ Ready for Production
