export const eventTypes = [
  "SYSTEM_READY",
  "RFID_OK",
  "RFID_INVALID",
  "OTP_SENT",
  "OTP_FAILED",
  "ACCESS_GRANTED",
  "ACCESS_DENIED",
  "DOOR_UNLOCKED",
  "DOOR_LOCKED",
  "ALARM",
  "RESET",
  "CANCELLED"
] as const;

export const doorStates = ["locked", "unlocked", "alarm", "unknown"] as const;
export const profileRoles = ["admin", "viewer"] as const;

export type EventType = (typeof eventTypes)[number];
export type DoorState = (typeof doorStates)[number];
export type ProfileRole = (typeof profileRoles)[number];

export type Profile = {
  id: string;
  full_name: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};

export type Device = {
  id: string;
  name: string;
  device_code: string;
  location: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DeviceStatus = {
  device_id: string;
  door_state: DoorState;
  last_event_id: string | null;
  last_event_type: EventType | null;
  last_message: string | null;
  last_seen_at: string | null;
  is_online: boolean;
  updated_at: string;
};

export type AuthorizedCard = {
  id: string;
  device_id: string | null;
  uid: string;
  label: string;
  owner_name: string | null;
  is_enabled: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  device?: Pick<Device, "id" | "name" | "device_code"> | null;
};

export type DoorEvent = {
  id: string;
  device_id: string;
  event_type: EventType;
  uid: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  device?: Pick<Device, "id" | "name" | "device_code" | "location"> | null;
};

export type DashboardMetrics = {
  totalAccessGranted: number;
  totalAccessDenied: number;
  totalFailedOtpAttempts: number;
  totalAlarms: number;
};

export type OverviewSnapshot = {
  selectedDeviceId: string | null;
  devices: Device[];
  statuses: Array<DeviceStatus & { device: Pick<Device, "id" | "name" | "device_code" | "location" | "is_active"> }>;
  latestEvent: DoorEvent | null;
  recentEvents: DoorEvent[];
  metrics: DashboardMetrics;
};
