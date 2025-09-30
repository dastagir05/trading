import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sentiment = searchParams.get("sentiment");
    const riskLevel = searchParams.get("riskLevel");
    const symbol = searchParams.get("symbol");

    let url = `${BACKEND_URL}/api/ai-trades`;
    const params = new URLSearchParams();

    if (status) params.append("status", status);
    if (sentiment) params.append("sentiment", sentiment);
    if (riskLevel) params.append("riskLevel", riskLevel);
    if (symbol) params.append("symbol", symbol);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
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
    console.error("Error fetching AI trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI trades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/ai-trades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating AI trade:", error);
    return NextResponse.json(
      { error: "Failed to create AI trade" },
      { status: 500 }
    );
  }
}
