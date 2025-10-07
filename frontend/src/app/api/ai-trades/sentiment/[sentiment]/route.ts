import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest, context) {
  const { sentiment } = (context as { params: { sentiment: string } }).params;
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/ai-trades/sentiment/${sentiment}`,
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
    console.error("Error fetching AI trades by sentiment:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI trades by sentiment" },
      { status: 500 }
    );
  }
}
