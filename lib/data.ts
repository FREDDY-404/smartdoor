import { securityEventTypes } from "@/lib/constants";
import { isRecentlySeen } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/ssr";
import type {
  AuthorizedCard,
  DashboardMetrics,
  Device,
  DeviceStatus,
  DoorEvent,
  OverviewSnapshot,
  Profile
} from "@/types";

type SupabaseLike = ReturnType<typeof createServerSupabase>;

function mapEvent(record: any): DoorEvent {
  return {
    id: record.id,
    device_id: record.device_id,
    event_type: record.event_type,
    uid: record.uid,
    message: record.message,
    metadata: record.metadata,
    created_at: record.created_at,
    device: record.devices
      ? {
          id: record.devices.id,
          name: record.devices.name,
          device_code: record.devices.device_code,
          location: record.devices.location
        }
      : null
  };
}

export async function getDevices(supabase: SupabaseLike) {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as any[]).map((device) => ({
    id: device.id,
    name: device.name ?? "Unnamed device",
    device_code: device.device_code ?? device.code ?? device.name ?? device.id,
    location: device.location ?? null,
    is_active: device.is_active ?? true,
    last_seen_at: device.last_seen_at ?? null,
    created_at: device.created_at ?? new Date(0).toISOString(),
    updated_at: device.updated_at ?? device.created_at ?? new Date(0).toISOString()
  })) as Device[];
}

export async function getDeviceStatuses(supabase: SupabaseLike) {
  const { data, error } = await supabase
    .from("device_status")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as any[]).map((status) => ({
    device_id: status.device_id,
    door_state: status.door_state ?? "unknown",
    last_event_id: status.last_event_id ?? null,
    last_event_type: status.last_event_type ?? null,
    last_message: status.last_message ?? null,
    last_seen_at: status.last_seen_at ?? null,
    is_online: status.is_online ?? false,
    updated_at: status.updated_at ?? status.last_seen_at ?? new Date(0).toISOString()
  })) as DeviceStatus[];
}

export async function getOverviewSnapshot(
  supabase: SupabaseLike,
  selectedDeviceId?: string | null
) {
  const [devices, statuses, recentEvents, metrics] = await Promise.all([
    getDevices(supabase),
    getDeviceStatuses(supabase),
    getRecentEvents(supabase, {
      deviceId: selectedDeviceId,
      limit: 8
    }),
    getMetrics(supabase, selectedDeviceId)
  ]);

  const statusMap = new Map(statuses.map((status) => [status.device_id, status]));
  const rows = devices.map((device) => {
    const status = statusMap.get(device.id);

    return {
      device: {
        id: device.id,
        name: device.name,
        device_code: device.device_code,
        location: device.location,
        is_active: device.is_active
      },
      device_id: device.id,
      door_state: status?.door_state ?? "unknown",
      last_event_id: status?.last_event_id ?? null,
      last_event_type: status?.last_event_type ?? null,
      last_message: status?.last_message ?? null,
      last_seen_at: status?.last_seen_at ?? device.last_seen_at ?? null,
      is_online: status ? status.is_online : isRecentlySeen(device.last_seen_at),
      updated_at: status?.updated_at ?? device.updated_at
    };
  });

  return {
    selectedDeviceId: selectedDeviceId ?? devices[0]?.id ?? null,
    devices,
    statuses: rows,
    latestEvent: recentEvents[0] ?? null,
    recentEvents,
    metrics
  } satisfies OverviewSnapshot;
}

export async function getMetrics(
  supabase: SupabaseLike,
  deviceId?: string | null
) {
  const count = async (eventType: string) => {
    try {
      let query = supabase
        .from("door_events")
        .select("id", { count: "planned", head: true })
        .eq("event_type", eventType);

      if (deviceId) {
        query = query.eq("device_id", deviceId);
      }

      const { count, error } = await query;
      if (error) {
        console.error(`Failed to count ${eventType} events`, error.message);
        return 0;
      }

      return count ?? 0;
    } catch (error) {
      console.error(
        `Unexpected error counting ${eventType} events`,
        error instanceof Error ? error.message : error
      );
      return 0;
    }
  };

  const [
    totalAccessGranted,
    totalAccessDenied,
    totalFailedOtpAttempts,
    totalAlarms
  ] = await Promise.all([
    count("ACCESS_GRANTED"),
    count("ACCESS_DENIED"),
    count("OTP_FAILED"),
    count("ALARM")
  ]);

  return {
    totalAccessGranted,
    totalAccessDenied,
    totalFailedOtpAttempts,
    totalAlarms
  } satisfies DashboardMetrics;
}

export async function getRecentEvents(
  supabase: SupabaseLike,
  options?: {
    deviceId?: string | null;
    eventTypes?: string[];
    from?: string | null;
    to?: string | null;
    search?: string | null;
    limit?: number;
  }
) {
  let query = supabase
    .from("door_events")
    .select(
      "id, device_id, event_type, uid, message, metadata, created_at, devices(id, name, device_code, location)"
    )
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 200);

  if (options?.deviceId) {
    query = query.eq("device_id", options.deviceId);
  }

  if (options?.eventTypes && options.eventTypes.length > 0) {
    query = query.in("event_type", options.eventTypes);
  }

  if (options?.from) {
    query = query.gte("created_at", new Date(options.from).toISOString());
  }

  if (options?.to) {
    const end = new Date(options.to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  if (options?.search) {
    const escaped = options.search.replace(/[%_]/g, "");
    query = query.or(`message.ilike.%${escaped}%,uid.ilike.%${escaped}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapEvent);
}

export async function getCards(supabase: SupabaseLike) {
  const [{ data: cards, error: cardsError }, { data: devices, error: devicesError }] =
    await Promise.all([
      supabase.from("authorized_cards").select("*").order("created_at", { ascending: false }),
      supabase.from("devices").select("*")
    ]);

  if (cardsError) {
    throw new Error(cardsError.message);
  }

  if (devicesError) {
    throw new Error(devicesError.message);
  }

  const deviceMap = new Map(
    ((devices ?? []) as any[]).map((device) => [
      device.id,
      {
        id: device.id,
        name: device.name ?? "Unnamed device",
        device_code: device.device_code ?? device.code ?? device.name ?? device.id
      }
    ])
  );

  return ((cards ?? []) as any[]).map((record) => ({
    id: record.id,
    device_id: record.device_id ?? null,
    uid: record.uid ?? "",
    label: record.label ?? "Unnamed card",
    owner_name: record.owner_name ?? null,
    email: record.email ?? null,
    is_enabled: record.is_enabled ?? true,
    notes: record.notes ?? null,
    created_at: record.created_at ?? new Date(0).toISOString(),
    updated_at: record.updated_at ?? record.created_at ?? new Date(0).toISOString(),
    device: record.device_id ? deviceMap.get(record.device_id) ?? null : null
  })) as AuthorizedCard[];
}

export async function getSecuritySnapshot(
  supabase: SupabaseLike,
  deviceId?: string | null
) {
  const [events, metrics, statuses] = await Promise.all([
    getRecentEvents(supabase, {
      deviceId,
      eventTypes: securityEventTypes,
      limit: 100
    }),
    getMetrics(supabase, deviceId),
    getDeviceStatuses(supabase)
  ]);

  const activeAlarmDevices = statuses.filter((status) => status.door_state === "alarm");

  return {
    events,
    metrics,
    activeAlarmDevices
  };
}

export async function getProfile(supabase: SupabaseLike, userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile", error.message);
      return {
        id: userId,
        full_name: null,
        role: "admin",
        created_at: new Date(0).toISOString(),
        updated_at: new Date(0).toISOString()
      } satisfies Profile;
    }

    return {
      id: data?.id ?? userId,
      full_name: data?.full_name ?? null,
      role: data?.role === "viewer" ? "viewer" : "admin",
      created_at: data?.created_at ?? new Date(0).toISOString(),
      updated_at: data?.updated_at ?? data?.created_at ?? new Date(0).toISOString()
    } satisfies Profile;
  } catch (error) {
    console.error(
      "Unexpected error loading profile",
      error instanceof Error ? error.message : error
    );
    return {
      id: userId,
      full_name: null,
      role: "admin",
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString()
    } satisfies Profile;
  }
}
