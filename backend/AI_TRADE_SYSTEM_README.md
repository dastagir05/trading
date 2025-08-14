# AI Trade System Documentation

## Overview
The AI Trade System is a comprehensive solution that automatically processes AI-generated trade suggestions, tracks their performance, and integrates them with the existing trade management system. It includes cron job scheduling, automated monitoring, and detailed reporting.

## Features

### 🤖 Automated AI Trade Processing
- **Cron Job Scheduler**: Automatically processes new AI trade suggestions every 30 minutes during market hours
- **Real-time Monitoring**: Monitors active AI trades every 5 minutes
- **Daily Cleanup**: Automated cleanup and reporting at 6 PM daily
- **Market Hours Detection**: Automatically detects market open/close times (9:15 AM - 3:30 PM IST)

### 📊 AI Trade Tracking
- **Separate Collection**: Dedicated `aiTrades` collection for AI trade management
- **Status Management**: Tracks trade lifecycle from suggestion to completion
- **Performance Metrics**: Calculates PnL, win rate, and confidence scores
- **Notes System**: Maintains detailed notes and updates for each trade

### 🔄 Integration with Existing System
- **Trade Conversion**: Converts AI suggestions to actual trades
- **Bidirectional Sync**: Updates AI trade status when actual trades change
- **User Performance**: Tracks individual user performance with AI trades
- **Personalized Suggestions**: Provides tailored recommendations based on user history

## System Architecture

### Models

#### 1. AiTrade Model (`models/aiTrade.model.js`)
```javascript
{
  aiTradeId: String,           // Unique identifier
  title: String,               // Trade title
  sentiment: String,           // bullish/bearish/neutral
  setup: {                     // Trade setup details
    currentPrice: Number,
    strategy: String,
    strike: String,
    expiry: String,
    symbol: String
  },
  tradePlan: {                 // Entry/exit plan
    entry: String,
    target: String,
    stopLoss: String,
    timeFrame: String
  },
  status: String,              // suggested/active/target_hit/stoploss_hit/expired/cancelled
  confidence: Number,          // AI confidence score (0-100)
  riskLevel: String,           // low/medium/high
  // ... additional fields
}
```

#### 2. Enhanced Trade Model
The existing trade model now includes AI tracking fields:
```javascript
{
  // ... existing fields
  isAiTrade: Boolean,          // Flag for AI-generated trades
  aiTradeId: String,           // Reference to AI trade
  aiConfidence: Number,        // AI confidence score
  aiSentiment: String          // AI sentiment
}
```

### Services

#### 1. AiTradeProcessor (`services/aiTradeProcessor.js`)
- **Cron Job Management**: Handles all scheduled tasks
- **Suggestion Processing**: Processes new AI trade suggestions
- **Trade Monitoring**: Monitors active trades for target/stop loss
- **Daily Reporting**: Generates performance reports

#### 2. AiTradeIntegration (`services/aiTradeIntegration.js`)
- **Trade Conversion**: Converts AI suggestions to actual trades
- **Status Synchronization**: Keeps AI trades and actual trades in sync
- **Performance Analytics**: Calculates user performance metrics
- **Personalized Recommendations**: Provides tailored suggestions

### Controllers

#### 1. AiTrade Controller (`controllers/aiTrade.controller.js`)
- **CRUD Operations**: Full CRUD for AI trades
- **Statistics**: Performance metrics and analytics
- **Filtering**: By status, sentiment, risk level, symbol
- **Reporting**: Performance reports with date grouping

#### 2. Enhanced Trade Controller
- **AI Trade Execution**: Execute AI trade suggestions
- **Performance Tracking**: User AI trade performance
- **Personalized Suggestions**: Tailored recommendations

## API Endpoints

### AI Trade Management
```
GET    /api/ai-trades                    # Get all AI trades
GET    /api/ai-trades/stats              # Get AI trade statistics
GET    /api/ai-trades/:id                # Get AI trade by ID
GET    /api/ai-trades/sentiment/:sentiment  # Get by sentiment
GET    /api/ai-trades/risk/:riskLevel   # Get by risk level
GET    /api/ai-trades/symbol/:symbol    # Get by symbol
GET    /api/ai-trades/report/performance # Performance report
POST   /api/ai-trades/:id/notes         # Add note to AI trade
PATCH  /api/ai-trades/:id/status        # Update AI trade status
POST   /api/ai-trades/force-process     # Force process suggestions
```

### AI Trade Integration
```
POST   /api/trade/execute-ai-trade      # Execute AI trade suggestion
GET    /api/trade/ai-performance/:userId # Get user AI performance
GET    /api/trade/ai-suggestions/:userId # Get personalized suggestions
```

## Cron Job Schedule

### Market Hours (9:15 AM - 3:30 PM IST, Mon-Fri)
- **Every 30 minutes**: Process new AI trade suggestions
- **Every 5 minutes**: Monitor active AI trades
- **6:00 PM daily**: Cleanup and reporting

### Timezone
All cron jobs use `Asia/Kolkata` timezone for Indian market hours.

## Usage Examples

### 1. Execute AI Trade Suggestion
```javascript
POST /api/trade/execute-ai-trade
{
  "userId": "user123",
  "aiTradeId": "1",
  "quantity": 100,
  "marginUsed": 5000,
  "lotSize": 1
}
```

### 2. Get User AI Performance
```javascript
GET /api/trade/ai-performance/user123
```

### 3. Get Personalized Suggestions
```javascript
GET /api/trade/ai-suggestions/user123?sentiment=bullish&riskLevel=medium
```

### 4. Add Note to AI Trade
```javascript
POST /api/ai-trades/1/notes
{
  "message": "Market conditions changed, monitoring closely",
  "type": "warning"
}
```

## Configuration

### Environment Variables
```bash
# MongoDB connection
MONGODB_URI=your_mongodb_connection_string

# Timezone for cron jobs
TZ=Asia/Kolkata
```

### Market Hours Configuration
Market hours are hardcoded in the `AiTradeProcessor` class:
- **Market Open**: 9:15 AM IST
- **Market Close**: 3:30 PM IST
- **Trading Days**: Monday to Friday

## Monitoring and Logging

### Console Logs
The system provides detailed console logging with emojis for easy identification:
- 🤖 AI Trade Processor events
- 🔄 Processing operations
- ✅ Success operations
- ❌ Error operations
- 📊 Daily reports
- 🧹 Cleanup operations

### Performance Metrics
- Total AI trades
- Active trades count
- Win rate percentage
- Average confidence score
- Total PnL
- Sentiment breakdown

## Error Handling

### Graceful Degradation
- Processing continues even if individual trades fail
- Database connection issues are handled gracefully
- Market data integration failures don't crash the system

### Error Logging
All errors are logged with detailed context for debugging.

## Future Enhancements

### 1. Market Data Integration
- Real-time price monitoring
- Automatic target/stop loss execution
- Market sentiment analysis

### 2. Machine Learning
- Confidence score optimization
- Risk level adjustment based on performance
- Personalized strategy recommendations

### 3. Advanced Analytics
- Risk-adjusted returns
- Correlation analysis
- Portfolio optimization

### 4. Notifications
- Email/SMS alerts for trade status changes
- Daily performance summaries
- Risk alerts

## Troubleshooting

### Common Issues

#### 1. Cron Jobs Not Running
- Check timezone configuration
- Verify market hours logic
- Check console logs for initialization

#### 2. AI Trades Not Processing
- Verify JSON file path
- Check file permissions
- Review console logs for errors

#### 3. Database Connection Issues
- Verify MongoDB connection string
- Check network connectivity
- Review connection pool settings

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=ai-trade-system
```

## Support

For technical support or questions about the AI Trade System, please refer to the console logs or check the system documentation.

---

**Note**: This system is designed for the Indian stock market and uses IST timezone. Adjust market hours and timezone settings for other markets.
