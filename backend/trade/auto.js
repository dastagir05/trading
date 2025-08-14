const pendingEntries = require("./autoEntryStatus/pendingEntries");
const inprocessEntries = require("./autoEntryStatus/inprocessEntries");
const expiredTrades = require("./autoEntryStatus/validityExpireTrades");
const { Server } = require("socket.io");
const marketFeed = require("./wsMS");
const cron = require("node-cron");
const getMarketStatus = require("../services/marketStatus")
function autoTradeExecute ()  {

  cron.schedule("*/30 9-15 * * 1-5", async () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Further restrict 9:00-9:14 and 15:31-15:59
  if ((hour === 9 && minute < 15) || (hour === 15 && minute > 30)) {
    return;
  }
  const isOpen = await getMarketStatus(); // Assume it returns true/false
  if (!isOpen) {
    console.log("📴 Market is closed (via API/service). Skipping trade check.");
    return;
  }
  console.log("🔁 Running market-time trade check...");
  try {
    await pendingEntries();
    await inprocessEntries();
  } catch (err) {
    console.error("❌ Error in scheduled trade check:", err.message);
  }
});
  
  
  cron.schedule("20 15 * * 1-5", async () => {
    console.log("⏰ Running 3:20 PM Expiry Job...");
    await expiredTrades();
  });
}

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