import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

type DeviceCardAccessPayload = {
  uid?: string | null;
};

function normalizeUid(value: string | null | undefined) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  return normalized || null;
}

export async function handleDeviceCardAccessRequest(request: Request) {
  const deviceCode = request.headers.get("x-device-code")?.trim();
  const deviceToken = request.headers.get("x-device-token")?.trim();

  if (!deviceCode || !deviceToken) {
    return NextResponse.json(
      { ok: false, error: "Missing device credentials." },
      { status: 401 }
    );
  }

  let payload: DeviceCardAccessPayload;

  try {
    payload = (await request.json()) as DeviceCardAccessPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const uid = normalizeUid(payload.uid);
  if (!uid) {
    return NextResponse.json({ ok: false, error: "UID is required." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id, name, device_code, secret_token, device_token, is_active")
    .eq("device_code", deviceCode)
    .maybeSingle();

  const expectedToken = device?.secret_token ?? device?.device_token ?? null;

  if (deviceError || !device || !device.is_active || !expectedToken || expectedToken !== deviceToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized device." }, { status: 401 });
  }

  const { data: card, error: cardError } = await supabase
    .from("authorized_cards")
    .select("id, uid, label, owner_name, device_id, is_enabled, is_active")
    .eq("uid", uid)
    .or(`device_id.is.null,device_id.eq.${device.id}`)
    .maybeSingle();

  if (cardError) {
    return NextResponse.json(
      { ok: false, error: cardError.message ?? "Card lookup failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    authorized: Boolean(
      card &&
        (typeof card.is_enabled === "boolean"
          ? card.is_enabled
          : typeof card.is_active === "boolean"
            ? card.is_active
            : true)
    ),
    uid,
    device: {
      id: device.id,
      name: device.name,
      device_code: device.device_code
    },
    card: card &&
      (typeof card.is_enabled === "boolean"
        ? card.is_enabled
        : typeof card.is_active === "boolean"
          ? card.is_active
          : true)
      ? {
          id: card.id,
          label: card.label,
          owner_name: card.owner_name,
          device_id: card.device_id
        }
      : null
  });
}
