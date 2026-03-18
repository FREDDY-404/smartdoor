import { handleDeviceCardAccessRequest } from "@/lib/device-card-access";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/device/cards/verify",
    method: "POST",
    message: "Use POST with x-device-code, x-device-token, and a JSON body containing uid."
  });
}

export async function POST(request: Request) {
  return handleDeviceCardAccessRequest(request);
}
