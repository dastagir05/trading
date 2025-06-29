// index.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.route");
const connectDB = require("./config/db");

const app = express();
const PORT = 4000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
