import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Force dynamic rendering for this route
type Candle = [
  timestamp: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
];
export async function GET(
  request: NextRequest,
  context: {
    params: { instrumentkey: string; unit: string; interval: string };
  }
) {
  try {
    const instrumentkey = decodeURIComponent(context.params.instrumentkey);
    const unit = context.params.unit;
    const interval = context.params.interval;
    console.log("ikks", instrumentkey, request.url);
    if (!instrumentkey) {
      return NextResponse.json(
        { error: "Missing instrument key(s)" },
        { status: 400 }
      );
    }
    if (!unit || !interval) {
      return NextResponse.json(
        { error: "Missing unit or interval" },
        { status: 400 }
      );
    }

    const toDate = new Date().toISOString().split("T")[0];
    const today = new Date(); // 2025-09-28T14:00:00.000Z
    const past = new Date(today); // clone becz past and today will both point to the same object — so today also changes.This creates a new Date object with the same value as today, so you can modify it safely.

    if (unit === "minutes" && interval <= "15")
      past.setDate(today.getDate() - 10); // 4*6*15 = 240
    else if (unit === "minutes" && interval > "15")
      past.setDate(today.getDate() - 20); // 2*6*30 = 204
    else if (unit === "hours") past.setDate(today.getDate() - 60); // 45
    else if (unit === "days") past.setDate(today.getDate() - 200); // 200
    else if (unit === "weeks") past.setDate(today.getDate() - 7 * 32); // 224
    else if (unit === "months") past.setMonth(today.getMonth() - 12 * 12); // 144

    // for acc token call tokenG get token and send in header
    const fromDate = past.toISOString().split("T")[0];

    const yesterday = `https://api.upstox.com/v3/historical-candle/${instrumentkey}/${unit}/${interval}/${toDate}/${fromDate}`;
    const url = `https://api.upstox.com/v3/historical-candle/intraday/${instrumentkey}/${unit}/${interval}`;
    console.log("URL:", url);

    const yesterdayres = await axios.get(yesterday, {
      headers: {
        Accept: "application/json",
      },
    });
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    const candles1: Candle[][] = (await yesterdayres.data?.data?.candles) ?? [];
    const candles: Candle[][] = (await response.data?.data?.candles) ?? [];

    console.log(`✅ Showing last ${candles.length} candles:\n`);
    const length = candles.length;
    const yesterdaylen = candles1.length;

    const mergedCandles = candles1
      .slice(-yesterdaylen)
      .reverse()
      .concat(candles.slice(-length).reverse());

    candles
      .slice(-13)
      .reverse()
      .forEach((candle, index) => {
        const [time, open, high, low, close, volume] = candle;
        console.log(
          `${
            index + 1
          }. [${time}] O: ${open} H: ${high} L: ${low} C: ${close} V: ${volume}`
        );
      });

    return NextResponse.json(mergedCandles);
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error fetching historical candles:", error.message);
    } else {
      console.error("Unknown API error:", error);
    }
    return new Response("Failed to fetch candle data", { status: 500 });
  }
}
