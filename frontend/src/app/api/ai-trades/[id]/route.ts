import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest, context) {
  const { id } = (context as { params: { id: string } }).params;
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai-trades/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Backend responded with status: ${response.status}, ${request.url}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching AI trade:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI trade" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context) {
  try {
    const { id } = (context as { params: { id: string } }).params;

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/ai-trades/${id}`, {
      method: "PATCH",
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
    console.error("Error updating AI trade:", error);
    return NextResponse.json(
      { error: "Failed to update AI trade" },
      { status: 500 }
    );
  }
}
