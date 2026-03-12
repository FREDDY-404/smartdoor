import { type DoorState, type EventType } from "@/types";

export const ONLINE_WINDOW_MINUTES = 5;

export const securityEventTypes: EventType[] = [
  "RFID_INVALID",
  "OTP_FAILED",
  "ACCESS_DENIED",
  "ALARM"
];

export const eventTypeLabels: Record<EventType, string> = {
  SYSTEM_READY: "System Ready",
  RFID_OK: "RFID OK",
  RFID_INVALID: "RFID Invalid",
  OTP_SENT: "OTP Sent",
  OTP_FAILED: "OTP Failed",
  ACCESS_GRANTED: "Access Granted",
  ACCESS_DENIED: "Access Denied",
  DOOR_UNLOCKED: "Door Unlocked",
  DOOR_LOCKED: "Door Locked",
  ALARM: "Alarm",
  RESET: "Reset",
  CANCELLED: "Cancelled"
};

export const eventStateMap: Partial<Record<EventType, DoorState>> = {
  DOOR_UNLOCKED: "unlocked",
  DOOR_LOCKED: "locked",
  ALARM: "alarm",
  RESET: "unknown"
};

export const eventToneMap: Record<EventType, "neutral" | "success" | "danger" | "warning"> = {
  SYSTEM_READY: "neutral",
  RFID_OK: "success",
  RFID_INVALID: "danger",
  OTP_SENT: "neutral",
  OTP_FAILED: "danger",
  ACCESS_GRANTED: "success",
  ACCESS_DENIED: "danger",
  DOOR_UNLOCKED: "warning",
  DOOR_LOCKED: "neutral",
  ALARM: "danger",
  RESET: "neutral",
  CANCELLED: "warning"
};
