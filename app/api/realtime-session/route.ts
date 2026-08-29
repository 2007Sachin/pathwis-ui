import { NextResponse } from "next/server";

import { REALTIME_SESSION_CONFIG } from "@/lib/openai/realtime-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const sdp = await request.text();

  if (!sdp.trim()) {
    return NextResponse.json(
      { error: "A WebRTC SDP offer is required." },
      { status: 400 },
    );
  }

  const formData = new FormData();
  formData.set("sdp", sdp);
  formData.set("session", JSON.stringify(REALTIME_SESSION_CONFIG));

  const response = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to create a Realtime session.", details: body },
      { status: response.status },
    );
  }

  return new Response(body, {
    status: 201,
    headers: {
      "Content-Type": "application/sdp",
      "Cache-Control": "no-store",
    },
  });
}
