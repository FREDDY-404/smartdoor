/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-code, x-device-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const RFID_NOTIFICATION_EVENTS = new Set(["RFID_OK", "RFID_INVALID"]);
const DEFAULT_FROM_EMAIL = "Smart Door <onboarding@resend.dev>";

type IngestPayload = {
  event?: string;
  event_type?: string;
  uid?: string | null;
  otp?: string | null;
  message?: string | null;
  state_code?: number | null;
  uptime_ms?: number | null;
  created_at?: string | null;
};

type DeviceRow = {
  id: string;
  name?: string | null;
  device_code?: string | null;
  device_token?: string | null;
  secret_token?: string | null;
  location?: string | null;
  is_active?: boolean | null;
};

type CardRow = {
  uid?: string | null;
  owner_name?: string | null;
  email?: string | null;
  label?: string | null;
  is_active?: boolean | null;
  is_enabled?: boolean | null;
};

function getFromEmail() {
  return Deno.env.get("RESEND_FROM_EMAIL")?.trim() || DEFAULT_FROM_EMAIL;
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init?.headers ?? {})
    }
  });
}

function requireEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeUid(uid: string | null | undefined) {
  const value = String(uid ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  return value || null;
}

function normalizeMessage(message: string | null | undefined) {
  const value = String(message ?? "").trim();
  return value || null;
}

function normalizeOtp(otp: string | null | undefined) {
  const value = String(otp ?? "")
    .trim()
    .replace(/\s+/g, "");
  return value || null;
}

function normalizeEmail(email: string | null | undefined) {
  const value = String(email ?? "").trim().toLowerCase();
  return value || null;
}

function normalizeTimestamp(value: string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isCardActive(card: CardRow | null) {
  if (!card) {
    return false;
  }

  if (typeof card.is_active === "boolean") {
    return card.is_active;
  }

  if (typeof card.is_enabled === "boolean") {
    return card.is_enabled;
  }

  return true;
}

function deriveDoorState(eventType: string, stateCode: number | null | undefined) {
  if (stateCode === 2) {
    return "alarm";
  }

  if (stateCode === 1) {
    return "unlocked";
  }

  if (stateCode === 0) {
    return "locked";
  }

  switch (eventType) {
    case "DOOR_UNLOCKED":
    case "ACCESS_GRANTED":
      return "unlocked";
    case "DOOR_LOCKED":
    case "ACCESS_DENIED":
    case "RFID_INVALID":
      return "locked";
    case "ALARM":
      return "alarm";
    default:
      return "unknown";
  }
}

function buildEmailText(input: {
  deviceName: string;
  location: string;
  uid: string | null;
  accessStatus: string;
  timestamp: string;
  eventType: string;
  ownerName: string | null;
  message: string | null;
}) {
  const ownerLine = input.ownerName ? `Card Owner: ${input.ownerName}\n` : "";
  const messageLine = input.message ? `Message: ${input.message}\n` : "";

  return [
    "Smart Door Event",
    "",
    `Device: ${input.deviceName}`,
    `Location: ${input.location}`,
    `RFID UID: ${input.uid ?? "Unknown"}`,
    `Status: ${input.accessStatus}`,
    `Event Type: ${input.eventType}`,
    `Time: ${input.timestamp}`,
    ownerLine.trimEnd(),
    messageLine.trimEnd()
  ]
    .filter(Boolean)
    .join("\n");
}

function buildEmailHtml(input: {
  deviceName: string;
  location: string;
  uid: string | null;
  accessStatus: string;
  timestamp: string;
  eventType: string;
  ownerName: string | null;
  message: string | null;
}) {
  const ownerBlock = input.ownerName
    ? `<p><strong>Card Owner:</strong> ${escapeHtml(input.ownerName)}</p>`
    : "";
  const messageBlock = input.message
    ? `<p><strong>Message:</strong> ${escapeHtml(input.message)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <h2>Smart Door Event</h2>
    <p><strong>Device:</strong> ${escapeHtml(input.deviceName)}</p>
    <p><strong>Location:</strong> ${escapeHtml(input.location)}</p>
    <p><strong>RFID UID:</strong> ${escapeHtml(input.uid ?? "Unknown")}</p>
    <p><strong>Status:</strong> ${escapeHtml(input.accessStatus)}</p>
    <p><strong>Event Type:</strong> ${escapeHtml(input.eventType)}</p>
    <p><strong>Time:</strong> ${escapeHtml(input.timestamp)}</p>
    ${ownerBlock}
    ${messageBlock}
  </body>
</html>`;
}

async function sendEmail(args: {
  resendApiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorText}`);
  }
}

function buildOtpEmailText(input: {
  deviceName: string;
  location: string;
  uid: string | null;
  otp: string;
  timestamp: string;
  ownerName: string | null;
}) {
  return [
    "Smart Door OTP Code",
    "",
    `OTP Code: ${input.otp}`,
    `Device: ${input.deviceName}`,
    `Location: ${input.location}`,
    `RFID UID: ${input.uid ?? "Unknown"}`,
    `Time: ${input.timestamp}`,
    input.ownerName ? `Card Owner: ${input.ownerName}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function buildOtpEmailHtml(input: {
  deviceName: string;
  location: string;
  uid: string | null;
  otp: string;
  timestamp: string;
  ownerName: string | null;
}) {
  const ownerBlock = input.ownerName
    ? `<p><strong>Card Owner:</strong> ${escapeHtml(input.ownerName)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <h2>Smart Door OTP Code</h2>
    <p><strong>Your OTP Code:</strong> ${escapeHtml(input.otp)}</p>
    <p><strong>Device:</strong> ${escapeHtml(input.deviceName)}</p>
    <p><strong>Location:</strong> ${escapeHtml(input.location)}</p>
    <p><strong>RFID UID:</strong> ${escapeHtml(input.uid ?? "Unknown")}</p>
    <p><strong>Time:</strong> ${escapeHtml(input.timestamp)}</p>
    ${ownerBlock}
  </body>
</html>`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, { status: 405 });
  }

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = requireEnv("RESEND_API_KEY");
    const adminAlertEmail = requireEnv("ADMIN_ALERT_EMAIL");
    const fromEmail = getFromEmail();

    const deviceCode = request.headers.get("x-device-code")?.trim();
    const deviceToken = request.headers.get("x-device-token")?.trim();

    if (!deviceCode || !deviceToken) {
      return json({ ok: false, error: "Missing device credentials." }, { status: 401 });
    }

    let payload: IngestPayload;
    try {
      payload = (await request.json()) as IngestPayload;
    } catch {
      return json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const eventType = String(payload.event ?? payload.event_type ?? "")
      .trim()
      .toUpperCase();
    if (!eventType) {
      return json({ ok: false, error: "Missing event type." }, { status: 400 });
    }

    const stateCode =
      typeof payload.state_code === "number" && Number.isFinite(payload.state_code)
        ? payload.state_code
        : null;
    const uid = normalizeUid(payload.uid);
    const otp = normalizeOtp(payload.otp);
    const message = normalizeMessage(payload.message);
    const createdAt = normalizeTimestamp(payload.created_at);

    if (!createdAt) {
      return json({ ok: false, error: "Invalid created_at value." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: deviceRecord, error: deviceError } = await supabase
      .from("devices")
      .select("*")
      .eq("device_code", deviceCode)
      .maybeSingle();

    const device = (deviceRecord ?? null) as DeviceRow | null;

    if (deviceError) {
      console.error("Device lookup failed", deviceError);
      return json({ ok: false, error: "Device lookup failed." }, { status: 500 });
    }

    if (!device || device.is_active === false) {
      return json({ ok: false, error: "Unauthorized device." }, { status: 401 });
    }

    const expectedToken = device.device_token ?? device.secret_token ?? null;
    if (!expectedToken || expectedToken !== deviceToken) {
      return json({ ok: false, error: "Unauthorized device." }, { status: 401 });
    }

    const eventInsert = {
      device_id: device.id,
      event_type: eventType,
      uid,
      message,
      state_code: stateCode,
      created_at: createdAt
    };

    const { data: insertedEvent, error: insertError } = await supabase
      .from("door_events")
      .insert(eventInsert)
      .select("id, created_at")
      .single();

    if (insertError || !insertedEvent) {
      console.error("Event insert failed", insertError);
      return json({ ok: false, error: "Failed to store event." }, { status: 500 });
    }

    const statusPayload = {
      device_id: device.id,
      last_event_type: eventType,
      last_uid: uid,
      door_state: deriveDoorState(eventType, stateCode),
      last_seen_at: insertedEvent.created_at ?? createdAt
    };

    const { error: statusError } = await supabase
      .from("device_status")
      .upsert(statusPayload, { onConflict: "device_id" });

    if (statusError) {
      console.error("Status upsert failed", statusError);
      return json({ ok: false, error: "Failed to update device status." }, { status: 500 });
    }

    let notificationSent = false;
    let notificationRecipient: string | null = null;
    let notificationError: string | null = null;

    if (RFID_NOTIFICATION_EVENTS.has(eventType) || eventType === "OTP_SENT") {
      let card: CardRow | null = null;

      if (uid) {
        const { data: rawCard, error: cardError } = await supabase
          .from("authorized_cards")
          .select("*")
          .eq("uid", uid)
          .maybeSingle();

        if (cardError) {
          console.error("Card lookup failed", cardError);
        } else {
          card = (rawCard ?? null) as CardRow | null;
        }
      }

      const activeCard = isCardActive(card) ? card : null;
      const isAuthorized = eventType === "RFID_OK" && Boolean(activeCard);
      const recipient =
        eventType === "OTP_SENT"
          ? normalizeEmail(activeCard?.email)
          : normalizeEmail(isAuthorized && activeCard?.email ? activeCard.email : adminAlertEmail);
      const deviceName = device.name?.trim() || device.device_code || "Smart Door";
      const location = device.location?.trim() || "Unknown location";

      if (!recipient) {
        notificationError =
          eventType === "OTP_SENT"
            ? "Card email is not configured."
            : "Notification recipient is not configured.";
      } else {
        notificationRecipient = recipient;

        try {
          if (eventType === "OTP_SENT") {
            if (!otp) {
              notificationError = "OTP value is missing from the event payload.";
            } else {
              await sendEmail({
                resendApiKey,
                from: fromEmail,
                to: recipient,
                subject: "Smart Door OTP Code",
                html: buildOtpEmailHtml({
                  deviceName,
                  location,
                  uid,
                  otp,
                  timestamp: createdAt,
                  ownerName: activeCard?.owner_name ?? null
                }),
                text: buildOtpEmailText({
                  deviceName,
                  location,
                  uid,
                  otp,
                  timestamp: createdAt,
                  ownerName: activeCard?.owner_name ?? null
                })
              });
              notificationSent = true;
            }
          } else {
            const subject = isAuthorized
              ? "Smart Door Access Granted"
              : "Smart Door Unauthorized RFID Scan";
            const accessStatus = isAuthorized ? "Authorized" : "Unauthorized";

            await sendEmail({
              resendApiKey,
              from: fromEmail,
              to: recipient,
              subject,
              html: buildEmailHtml({
                deviceName,
                location,
                uid,
                accessStatus,
                timestamp: createdAt,
                eventType,
                ownerName: activeCard?.owner_name ?? null,
                message
              }),
              text: buildEmailText({
                deviceName,
                location,
                uid,
                accessStatus,
                timestamp: createdAt,
                eventType,
                ownerName: activeCard?.owner_name ?? null,
                message
              })
            });
            notificationSent = true;
          }
        } catch (error) {
          notificationError = error instanceof Error ? error.message : "Email delivery failed.";
          console.error("Email send failed", notificationError);
        }
      }
    }

    return json({
      ok: true,
      event_id: insertedEvent.id,
      notification_sent: notificationSent,
      notification_recipient: notificationRecipient,
      notification_error: notificationError
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    console.error("door-event-ingest fatal", message);
    return json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
});
