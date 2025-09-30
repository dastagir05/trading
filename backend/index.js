const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const userRoutes = require("./routes/user.route");
const connectDB = require("./config/db");
const tradeRoutes = require("./routes/trade.route");
const { autoTradeExecute, initializeSocketServer } = require("./trade/auto");
const watchlistRoutes = require("./routes/watchlist.route");
const optionRoutes = require("./routes/option.route");
const aiTradeRoutes = require("./routes/aiTrade.route");
const adminRoutes = require("./routes/admin.route");
const utilsRoutes = require("./routes/utils.route");
const aiTradeProcessor = require("./services/aiTradeProcessor");
const strategyProcessor = require("./services/strategyTradeProcess");
const AiSuggesstion = require("./aiTradeSugg/tradeSuggestions.json");
const { getCode } = require("./utils/tokenG");

const app = express();
const PORT = 5000;
const server = http.createServer(app);

connectDB();

// Initialize AI Trade Processor with cron jobs
aiTradeProcessor.init();
strategyProcessor.init();

// Start the auto trade execution process
autoTradeExecute();
initializeSocketServer(server);

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/option", optionRoutes);
app.use("/api/utils", utilsRoutes);
app.use("/api/ai-trades", aiTradeRoutes);
app.use("/api/admin", adminRoutes);
// app.get("/api/aiSuggested", (req, res) => {
//   res.json(AiSuggesstion);
// });
app.use("/", getCode);

server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
