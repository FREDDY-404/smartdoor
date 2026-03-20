import { ONLINE_WINDOW_MINUTES, eventTypeLabels } from "@/lib/constants";
import { type DoorState, type EventType } from "@/types";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const yangonFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Yangon",
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  hour12: true
});

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const parts = yangonFormatter.formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value ?? monthLabels[date.getUTCMonth()] ?? "Jan";
  const day = parts.find((part) => part.type === "day")?.value ?? String(date.getUTCDate()).padStart(2, "0");
  const hour = parts.find((part) => part.type === "hour")?.value ?? "12";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const period = parts.find((part) => part.type === "dayPeriod")?.value ?? "AM";

  return `${month} ${day}, ${hour}:${minute} ${period} Yangon`;
}

export function formatRelativeTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return value;
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.round(diffHours / 24)}d ago`;
}

export function isRecentlySeen(value: string | null) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= ONLINE_WINDOW_MINUTES * 60 * 1000;
}

export function formatDoorState(state: DoorState) {
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export function formatEventType(eventType: EventType) {
  return eventTypeLabels[eventType] ?? eventType;
}

export function maskToken(token: string) {
  if (token.length <= 8) {
    return "••••••••";
  }

  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}
