import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { instrumentkey: string } }
) {
  try {
    const raw = params.instrumentkey;
    if (!raw) {
      return NextResponse.json(
        { error: "Missing instrument key(s)" },
        { status: 400 }
      );
    }
    // send this instrument key to backend backend will give you ltp in response

    const keys = raw.split(",");
    console.log("sending key to backend", raw, keys);

    const response = await axios.get(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/utils/getLtp/${encodeURIComponent(keys.join(","))}`
    );
    const data = response.data.ltp;

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching LTP:", error.message);
    } else {
      console.error("Unknown API error:", error);
    }
    return new Response("Failed to fetch LTP data", { status: 500 });
  }
}
