const pendingEntries = require("./autoEntryStatus/pendingEntries");
const inprocessEntries = require("./autoEntryStatus/inprocessEntries");
const expiredTrades = require("./autoEntryStatus/validityExpireTrades");
const { Server } = require("socket.io");
const marketFeed = require("./wsMS");
const cron = require("node-cron");
// const getMarketStatus = require("../services/marketStatus");
function autoTradeExecute() {
  // cron.schedule("*/1 9-15 * * 1-5", async () => {
  //   const now = new Date();
  //   const hour = now.getHours();
  //   const minute = now.getMinutes();

  //   // Further restrict 9:00-9:14 and 15:31-15:59
  //   if ((hour === 9 && minute < 15) || (hour === 15 && minute > 30)) {
  //     return;
  //   }
  //   const isOpen = await getMarketStatus(); // Assume it returns true/false
  //   if (!isOpen) {
  //     console.log(
  //       "📴 Market is closed (via API/service). Skipping trade check."
  //     );
  //     return;
  //   }
  //   console.log("🔁 Running market-time trade check...");
  //   try {
  //     await pendingEntries();
  //     await inprocessEntries();
  //   } catch (err) {
  //     console.error("❌ Error in scheduled trade check:", err.message);
  //   }
  // });

  cron.schedule("20 15 * * 1-5", async () => {
    console.log("⏰ Running 3:20 PM Expiry Job...");
    await expiredTrades();
  });
}

const AiTrade = require("../models/aiTrade.model");
const { getArrayLTP } = require("../services/getLtp"); // your function

function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const activeInstruments = new Map();

  io.on("connection", (socket) => {
    console.log("🧑‍💻 Frontend connected via socket.io");

    socket.on("getInstrumentKey", ({ instrumentKey }) => {
      const previousInstrument = activeInstruments.get(socket.id);

      if (previousInstrument && previousInstrument !== instrumentKey) {
        console.log(`Unsubscribing ${socket.id} from ${previousInstrument}`);
        marketFeed.unsubscribe(previousInstrument, socket);
      }

      console.log("Subscribing to", instrumentKey);
      activeInstruments.set(socket.id, instrumentKey);
      marketFeed.subscribe(instrumentKey, socket);
    });

    // ai ws for monitoring active trade
    socket.on("subscribeAiTrades", async () => {
      socket.join("aiTradesRoom");
      console.log(`📡 ${socket.id} subscribed to AI trades`);
      // Send initial snapshot
      const trades = await AiTrade.find({
        $or: [{ status: "active" }, { status: "suggested" }],
        isStrategy: false,
      });
      const instrumentKeys = trades.map((t) => t.setup.instrument_key);
      const prices = await getArrayLTP(instrumentKeys);

      const priceMap = new Map(prices?.map((p) => [p.instrument_key, p]));

      const enriched = trades.map((t) => {
        const price = priceMap.get(t.setup.instrument_key);
        const entry = t.entryPrice || parseFloat(t.tradePlan.entry);

        return {
          ...t.toObject(),
          currentPrice: price?.last_price ?? null,
          unrealisedPnL: price ? (price.last_price - entry) * t.quantity : null,
        };
      });
      socket.emit("aiTradesUpdate", enriched);
    });

    socket.on("disconnect", () => {
      const currentInstrument = activeInstruments.get(socket.id);
      if (currentInstrument) {
        marketFeed.unsubscribe(currentInstrument, socket);
        activeInstruments.delete(socket.id);
      }
      console.log("❌ Client disconnected");
    });
  });
}

module.exports = {
  autoTradeExecute,
  initializeSocketServer,
};
