"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export type DashboardFormState = {
  status?: "success" | "error";
  message?: string;
};

function normalizeNullableText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function normalizeBoolean(value: FormDataEntryValue | null) {
  return String(value ?? "") === "on";
}

function normalizeUid(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function generateDeviceToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID().slice(0, 8)}`;
}

async function createDeviceWithCompatibleTokenColumn(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  payload: {
    name: string;
    device_code: string;
    location: string | null;
    is_active: boolean;
  }
) {
  const token = generateDeviceToken();
  const secretPayload = { ...payload, secret_token: token };
  const devicePayload = { ...payload, device_token: token };

  const secretAttempt = await supabase.from("devices").insert(secretPayload);
  if (!secretAttempt.error) {
    return;
  }

  if (!secretAttempt.error.message.toLowerCase().includes("secret_token")) {
    throw new Error(secretAttempt.error.message);
  }

  const deviceAttempt = await supabase.from("devices").insert(devicePayload);
  if (deviceAttempt.error) {
    throw new Error(deviceAttempt.error.message);
  }
}

async function rotateDeviceTokenWithCompatibleColumn(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  id: string
) {
  const token = generateDeviceToken();
  const secretAttempt = await supabase
    .from("devices")
    .update({ secret_token: token })
    .eq("id", id);

  if (!secretAttempt.error) {
    return;
  }

  if (!secretAttempt.error.message.toLowerCase().includes("secret_token")) {
    throw new Error(secretAttempt.error.message);
  }

  const deviceAttempt = await supabase
    .from("devices")
    .update({ device_token: token })
    .eq("id", id);

  if (deviceAttempt.error) {
    throw new Error(deviceAttempt.error.message);
  }
}

function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function saveCardAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    device_id: normalizeNullableText(formData.get("device_id")),
    uid: normalizeUid(formData.get("uid")),
    label: String(formData.get("label") ?? "").trim(),
    owner_name: normalizeNullableText(formData.get("owner_name")),
    email: normalizeNullableText(formData.get("email")),
    notes: normalizeNullableText(formData.get("notes")),
    is_enabled: normalizeBoolean(formData.get("is_enabled"))
  };

  if (!payload.uid || !payload.label) {
    throw new Error("Card UID and label are required.");
  }

  if (id) {
    const { error } = await supabase.from("authorized_cards").update(payload).eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("authorized_cards").insert(payload);
    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePaths(["/dashboard/cards"]);
}

export async function saveCardFormAction(
  _prevState: DashboardFormState,
  formData: FormData
): Promise<DashboardFormState> {
  try {
    await saveCardAction(formData);
    return { status: "success", message: "Card saved successfully." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to save card."
    };
  }
}

export async function deleteCardAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("Card id is required.");
  }

  const { error } = await supabase.from("authorized_cards").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePaths(["/dashboard/cards"]);
}

export async function saveDeviceAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    device_code: String(formData.get("device_code") ?? "").trim(),
    location: normalizeNullableText(formData.get("location")),
    is_active: normalizeBoolean(formData.get("is_active"))
  };

  if (!payload.name || !payload.device_code) {
    throw new Error("Device name and code are required.");
  }

  if (id) {
    const { error } = await supabase.from("devices").update(payload).eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  } else {
    await createDeviceWithCompatibleTokenColumn(supabase, payload);
  }

  revalidatePaths([
    "/dashboard",
    "/dashboard/cards",
    "/dashboard/devices",
    "/dashboard/events",
    "/dashboard/security"
  ]);
}

export async function saveDeviceFormAction(
  _prevState: DashboardFormState,
  formData: FormData
): Promise<DashboardFormState> {
  try {
    await saveDeviceAction(formData);
    return { status: "success", message: "Device saved successfully." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to save device."
    };
  }
}

export async function rotateDeviceTokenAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("Device id is required.");
  }

  await rotateDeviceTokenWithCompatibleColumn(supabase, id);

  revalidatePaths(["/dashboard/devices"]);
}

export async function deleteDeviceAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("Device id is required.");
  }

  const { error } = await supabase.from("devices").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePaths([
    "/dashboard",
    "/dashboard/cards",
    "/dashboard/devices",
    "/dashboard/events",
    "/dashboard/security"
  ]);
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const fullName = normalizeNullableText(formData.get("full_name"));

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePaths(["/dashboard/settings"]);
}
