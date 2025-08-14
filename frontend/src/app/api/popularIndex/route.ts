import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
// const { getMarketStatus } = require("./marketStatus");
const accessToken = process.env.ACCESS_TOKEN;

//test when market open
export async function GET(
  request: NextRequest,
  context: { params: { instrumentkey: Array<any> } }
) {
  try {
    const instrumentkey = decodeURIComponent(context.params.instrumentkey);

    const res = await axios.get("https://api.upstox.com/v3/market-quote/ltp", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: { instrument_key: instrumentkey },
    });
    const last_price = res.data.data[instrumentkey]?.last_price || 0;

    return NextResponse.json(last_price);
  } catch (error) {
    console.log("Error in fetching Ltp", error);
    return NextResponse.json(
      { error: "Failed to fetch candle data" },
      { status: 500 }
    );
  }
}
