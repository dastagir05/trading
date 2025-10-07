import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest, context) {
  // Type it *inside* the function
  const { id } = (context as { params: { id: string } }).params;

  const body = await request.json();
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai-trades/${id}/notes`, {
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
    console.error("Error adding note to AI trade:", error);
    return NextResponse.json(
      { error: "Failed to add note to AI trade" },
      { status: 500 }
    );
  }
}
