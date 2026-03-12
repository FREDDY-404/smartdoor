import { NextResponse } from "next/server";
import { eventStateMap } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";
import { doorStates, eventTypes, type DoorState, type EventType } from "@/types";

type DeviceEventPayload = {
  device_code?: string;
  device_token?: string;
  device_key?: string;
  event_type?: string;
  uid?: string | null;
  message?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
  door_state?: string | null;
};

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

function isEventType(value: string): value is EventType {
  return (eventTypes as readonly string[]).includes(value);
}

function isDoorState(value: string): value is DoorState {
  return (doorStates as readonly string[]).includes(value);
}

function parseTimestamp(value?: string | null) {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export async function handleDeviceEventRequest(request: Request) {
  let payload: DeviceEventPayload;

  try {
    payload = (await request.json()) as DeviceEventPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.event_type || !isEventType(payload.event_type)) {
    return NextResponse.json({ ok: false, error: "Invalid event_type." }, { status: 400 });
  }

  const timestamp = parseTimestamp(payload.created_at);
  if (!timestamp) {
    return NextResponse.json({ ok: false, error: "Invalid created_at timestamp." }, { status: 400 });
  }

  if (payload.uid !== null && payload.uid !== undefined && typeof payload.uid !== "string") {
    return NextResponse.json({ ok: false, error: "Invalid uid." }, { status: 400 });
  }

  if (
    payload.message !== null &&
    payload.message !== undefined &&
    typeof payload.message !== "string"
  ) {
    return NextResponse.json({ ok: false, error: "Invalid message." }, { status: 400 });
  }

  if (
    payload.metadata !== null &&
    payload.metadata !== undefined &&
    (typeof payload.metadata !== "object" || Array.isArray(payload.metadata))
  ) {
    return NextResponse.json({ ok: false, error: "Invalid metadata object." }, { status: 400 });
  }

  if (payload.door_state && !isDoorState(payload.door_state)) {
    return NextResponse.json({ ok: false, error: "Invalid door_state." }, { status: 400 });
  }

  const supabase = createServiceClient();

  let deviceQuery = supabase
    .from("devices")
    .select("id, name, device_code, secret_token, is_active")
    .limit(1);

  if (payload.device_code && payload.device_token) {
    deviceQuery = deviceQuery
      .eq("device_code", payload.device_code)
      .eq("secret_token", payload.device_token);
  } else if (payload.device_key) {
    deviceQuery = deviceQuery.eq("secret_token", payload.device_key);
  } else {
    return NextResponse.json(
      { ok: false, error: "Device credentials are required." },
      { status: 401 }
    );
  }

  const { data: devices, error: deviceError } = await deviceQuery;
  const device = devices?.[0];

  if (deviceError || !device || !device.is_active) {
    return NextResponse.json({ ok: false, error: "Unauthorized device." }, { status: 401 });
  }

  const { data: currentStatus } = await supabase
    .from("device_status")
    .select("door_state")
    .eq("device_id", device.id)
    .single();

  const nextDoorState =
    (payload.door_state && isDoorState(payload.door_state) ? payload.door_state : null) ??
    eventStateMap[payload.event_type] ??
    currentStatus?.door_state ??
    "unknown";

  const clientIp = getClientIp(request);
  const metadata = {
    ...(payload.metadata ?? {}),
    source_ip: clientIp
  };

  const { data: insertedEvent, error: insertError } = await supabase
    .from("door_events")
    .insert({
      device_id: device.id,
      event_type: payload.event_type,
      uid: payload.uid?.trim() || null,
      message: payload.message?.trim() || null,
      metadata,
      created_at: timestamp
    })
    .select("id")
    .single();

  if (insertError || !insertedEvent) {
    return NextResponse.json(
      { ok: false, error: insertError?.message ?? "Failed to insert event." },
      { status: 500 }
    );
  }

  const statusPayload = {
    device_id: device.id,
    door_state: nextDoorState,
    last_seen_at: timestamp,
    is_online: true
  };

  const [{ error: statusError }, { error: deviceUpdateError }] = await Promise.all([
    supabase.from("device_status").upsert(statusPayload),
    supabase.from("devices").update({ last_seen_at: timestamp }).eq("id", device.id)
  ]);

  if (statusError || deviceUpdateError) {
    return NextResponse.json(
      { ok: false, error: statusError?.message ?? deviceUpdateError?.message ?? "Failed to update status." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    device_id: device.id,
    event_id: insertedEvent.id
  });
}
