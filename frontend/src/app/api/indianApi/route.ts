import { NextResponse } from "next/server";
import axios from "axios";
export async function GET() {
  const options = {
    method: "GET",
    url: "https://stock.indianapi.in/trending",
    headers: {
      "X-Api-Key": process.env.INDIAN_API_KEY,
    },
  };

  try {
    const { data } = await axios.request(options);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API error:", error.message);
    return new Response("Error sending message", { status: 500 });
  }
}
