/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-code, x-device-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type DeviceRow = {
  id: string;
  name?: string | null;
  device_code?: string | null;
  device_token?: string | null;
  secret_token?: string | null;
  is_active?: boolean | null;
};

type CardRow = {
  id: string;
  uid?: string | null;
  label?: string | null;
  owner_name?: string | null;
  device_id?: string | null;
  is_enabled?: boolean | null;
  is_active?: boolean | null;
};

type VerifyCardPayload = {
  uid?: string | null;
};

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

function isCardActive(card: CardRow | null) {
  if (!card) {
    return false;
  }

  if (typeof card.is_enabled === "boolean") {
    return card.is_enabled;
  }

  if (typeof card.is_active === "boolean") {
    return card.is_active;
  }

  return true;
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

    const deviceCode = request.headers.get("x-device-code")?.trim();
    const deviceToken = request.headers.get("x-device-token")?.trim();

    if (!deviceCode || !deviceToken) {
      return json({ ok: false, error: "Missing device credentials." }, { status: 401 });
    }

    let payload: VerifyCardPayload;
    try {
      payload = (await request.json()) as VerifyCardPayload;
    } catch {
      return json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const uid = normalizeUid(payload.uid);
    if (!uid) {
      return json({ ok: false, error: "UID is required." }, { status: 400 });
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

    const expectedToken = device?.device_token ?? device?.secret_token ?? null;
    if (!device || device.is_active === false || !expectedToken || expectedToken !== deviceToken) {
      return json({ ok: false, error: "Unauthorized device." }, { status: 401 });
    }

    const { data: rawCard, error: cardError } = await supabase
      .from("authorized_cards")
      .select("*")
      .eq("uid", uid)
      .maybeSingle();

    if (cardError) {
      console.error("Card lookup failed", cardError);
      return json({ ok: false, error: "Card lookup failed." }, { status: 500 });
    }

    const card = (rawCard ?? null) as CardRow | null;
    const activeCard = isCardActive(card) ? card : null;
    const isScopedToDevice =
      !activeCard?.device_id || activeCard.device_id === device.id;

    return json({
      ok: true,
      authorized: Boolean(activeCard && isScopedToDevice),
      uid,
      device: {
        id: device.id,
        name: device.name ?? null,
        device_code: device.device_code ?? null
      },
      card:
        activeCard && isScopedToDevice
          ? {
              id: activeCard.id,
              label: activeCard.label ?? null,
              owner_name: activeCard.owner_name ?? null,
              device_id: activeCard.device_id ?? null
            }
          : null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    console.error("verify-card fatal", message);
    return json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
});
