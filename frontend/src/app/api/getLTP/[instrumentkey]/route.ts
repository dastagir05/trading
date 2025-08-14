import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
// const { getMarketStatus } = require("./marketStatus");
const accessToken = process.env.ACCESS_TOKEN;

//test when market open
export async function GET(
  _req: NextRequest,
  { params }: { params: { instrumentkey: string } }
) {
  try {
    const raw = params.instrumentkey;
    const keys = raw.split(",");
    console.log("dattt", raw, keys)
    const res = await axios.get("https://api.upstox.com/v3/market-quote/ltp", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: {
        instrument_key: keys.join(","),
      },
    });

    const quoteMap = res.data.data as Record<string, any>;

    // Return just one if original input was a single instrument
    console.log("raw", raw);
    if (!Array.isArray(raw) && !raw.includes(",")) {
      const first = Object.values(quoteMap)[0] as any;
      console.log("fir wtt", first)
      return NextResponse.json({
        last_price: first.last_price,
        cp: first.cp ?? 0,
      });
    }

    const result = Object.values(quoteMap).map((q: any) => ({
      instrument_key: q.instrument_token, // original NSE_EQ|… or NSE_INDEX|…
      last_price: q.last_price ?? 0,
      cp: q.cp ?? 0, // cp is present only for indices
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching LTP:", error);
    return NextResponse.json(
      { error: "Failed to fetch LTP data" },
      { status: 500 }
    );
  }
}
