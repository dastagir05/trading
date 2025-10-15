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
const { getCode } = require("./utils/tokenG");
const getMarketStatus = require("./services/marketStatus");

const app = express();
const PORT = 5000;
const server = http.createServer(app);

connectDB();

(async () => {
  if (await getMarketStatus()) {
    console.log("Market is open, running strategy...");
    aiTradeProcessor.init();
    strategyProcessor.init();
    autoTradeExecute();
  } else {
    console.log("Market is closed, skipping job");
  }
})();

// Start the socket server
initializeSocketServer(server);

app.use(
  cors({
    origin: [
      "http://localhost:3000", // your local frontend (dev)
      "http://127.0.0.1:3000/", // your local frontend (dev)
      "https://nivesh-now.vercel.app", // your deployed frontend
    ],
    methods: ["GET", "POST"],
    credentials: true, // if you use cookies/auth
  })
);
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
