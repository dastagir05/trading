import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai-trades/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching AI trade stats:", error);

    // Return mock data for development/testing
    return NextResponse.json({
      total: 0,
      suggested: 0,
      active: 0,
      targetHit: 0,
      stopLossHit: 0,
      expired: 0,
      cancelled: 0,
      totalPnL: 0,
      successRate: 0,
      avgConfidence: 0,
    });
  }
}
