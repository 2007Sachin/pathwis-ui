import { NextResponse } from "next/server";

import { REALTIME_SESSION_CONFIG } from "@/lib/openai/realtime-session";
import type { RealtimeSessionCredential } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_CLIENT_SECRETS_URL =
  "https://api.openai.com/v1/realtime/client_secrets";
const REQUEST_TIMEOUT_MS = 10_000;

interface OpenAIClientSecretResponse {
  value?: unknown;
  expires_at?: unknown;
}

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Realtime session creation failed: OPENAI_API_KEY is missing.");

    return NextResponse.json(
      { error: "Realtime voice is not configured." },
      { status: 503, headers: noStoreHeaders },
    );
  }

  try {
    /*
     * Security boundary:
     * - The permanent OPENAI_API_KEY is read only in this Node.js route.
     * - The browser receives only a short-lived Realtime client secret.
     * - The server controls the model, audio, VAD, transcription, and tool schema,
     *   so browser code cannot mint credentials for an arbitrary session.
     */
    const response = await fetch(OPENAI_CLIENT_SECRETS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session: REALTIME_SESSION_CONFIG }),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const requestId = response.headers.get("x-request-id");

    if (!response.ok) {
      // Do not forward OpenAI's response body; it may contain implementation details.
      console.error("OpenAI Realtime client-secret request failed.", {
        status: response.status,
        requestId,
      });

      return NextResponse.json(
        { error: "Unable to start a realtime voice session." },
        {
          status: response.status >= 500 ? 502 : response.status,
          headers: noStoreHeaders,
        },
      );
    }

    const data = (await response.json()) as OpenAIClientSecretResponse;

    if (typeof data.value !== "string" || data.value.length === 0) {
      console.error("OpenAI returned an invalid Realtime client secret.", {
        requestId,
      });

      return NextResponse.json(
        { error: "Unable to start a realtime voice session." },
        { status: 502, headers: noStoreHeaders },
      );
    }

    const credential: RealtimeSessionCredential = {
      value: data.value,
      ...(typeof data.expires_at === "number"
        ? { expiresAt: data.expires_at }
        : {}),
    };

    // Return only the ephemeral credential metadata required by the browser.
    return NextResponse.json(credential, {
      status: 201,
      headers: noStoreHeaders,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError";

    console.error("Realtime client-secret request failed.", {
      reason: timedOut ? "timeout" : "network_or_parse_error",
    });

    return NextResponse.json(
      {
        error: timedOut
          ? "The realtime voice service timed out. Please try again."
          : "Unable to start a realtime voice session.",
      },
      { status: 502, headers: noStoreHeaders },
    );
  }
}
