import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";

type Candle = [
  timestamp: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
];

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ instrumentkey: string; unit: string; interval: string }>;
  } // ✅ FIX
) {
  const { instrumentkey, unit, interval } = await context.params; // ✅ FIX

  try {
    const decodedInstrumentKey = decodeURIComponent(instrumentkey);

    if (!decodedInstrumentKey || !unit || !interval) {
      return NextResponse.json(
        { error: "Missing instrument key(s), unit, or interval" },
        { status: 400 }
      );
    }

    const toDate = new Date().toISOString().split("T")[0];
    const today = new Date();
    const past = new Date(today);

    const intervalNum = Number(interval);

    if (unit === "minutes" && intervalNum <= 15)
      past.setDate(today.getDate() - 10);
    else if (unit === "minutes" && intervalNum > 15)
      past.setDate(today.getDate() - 20);
    else if (unit === "hours") past.setDate(today.getDate() - 60);
    else if (unit === "days") past.setDate(today.getDate() - 200);
    else if (unit === "weeks") past.setDate(today.getDate() - 7 * 32);
    else if (unit === "months") past.setMonth(today.getMonth() - 12 * 12);

    const fromDate = past.toISOString().split("T")[0];

    const yesterday = `https://api.upstox.com/v3/historical-candle/${decodedInstrumentKey}/${unit}/${interval}/${toDate}/${fromDate}`;
    const url = `https://api.upstox.com/v3/historical-candle/intraday/${decodedInstrumentKey}/${unit}/${interval}`;

    const [yesterdayres, response] = await Promise.all([
      axios.get(yesterday, { headers: { Accept: "application/json" } }),
      axios.get(url, { headers: { Accept: "application/json" } }),
    ]);

    const candles1: Candle[] = yesterdayres.data?.data?.candles ?? [];
    const candles: Candle[] = response.data?.data?.candles ?? [];

    const mergedCandles = [...candles1.reverse(), ...candles.reverse()];

    return NextResponse.json(mergedCandles);
  } catch (error) {
    console.error("❌ Error fetching candles:", error);
    return NextResponse.json(
      { error: "Failed to fetch candle data" },
      { status: 500 }
    );
  }
}
