import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest, context) {
  const { riskLevel } = (context as { params: { riskLevel: string } }).params;
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/ai-trades/risk/${riskLevel}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Backend responded with status: ${response.status} , ${request.url}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching AI trades by risk level:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI trades by risk level" },
      { status: 500 }
    );
  }
}
