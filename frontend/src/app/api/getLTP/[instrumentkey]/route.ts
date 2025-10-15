import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: {
    params: Promise<{ instrumentkey: string }>;
  }
) {
  const { instrumentkey } = await context.params;

  try {
    if (!instrumentkey) {
      return NextResponse.json(
        { error: "Missing instrument key(s)" },
        { status: 400 }
      );
    }

    const keys = instrumentkey.split(",");
    console.log("sending key to backend", instrumentkey, keys);

    const response = await axios.get(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/utils/getLtp/${encodeURIComponent(keys.join(","))}`
    );

    const data = response.data.ltp;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching LTP:", error);
    return new Response("Failed to fetch LTP data", { status: 500 });
  }
}
