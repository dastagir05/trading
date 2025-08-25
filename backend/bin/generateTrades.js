require("dotenv").config();
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");
const tradePrompt = require("../aiTradeSugg/tradePromt");
const marketData = require("../aiTradeSugg/setOptionData/marketData.json");

async function generateTradeSuggestions() {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY || "AIzaSyCoL4mZUg_oGWHvBa-jI4e0v2g0utr-vU0";
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const ai = new GoogleGenAI({ apiKey });

    const promptText = tradePrompt(marketData);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // free & fast model
      contents: [{ role: "user", parts: [{ text: promptText }] }],
    });

    // const text = response.output_text.trim();
    const text = response.text;
    console.log(text);
    let cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse the cleaned JSON string
    const trades = JSON.parse(cleanText);
    fs.writeFileSync(
      "tradeSuggestions.json",
      JSON.stringify(trades, null, 2),
      "utf8"
    );
    console.log("✅ Trade suggestions saved to tradeSuggestions.json");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

generateTradeSuggestions();
