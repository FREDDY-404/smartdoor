import clsx from "clsx";
import { formatDoorState, formatEventType } from "@/lib/format";
import { eventToneMap } from "@/lib/constants";
import { type DoorState, type EventType } from "@/types";

export function DoorStatePill({ state }: { state: DoorState }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        state === "locked" && "bg-slate-500/20 text-slate-200",
        state === "unlocked" && "bg-warning/20 text-warning",
        state === "alarm" && "bg-danger/20 text-danger",
        state === "unknown" && "bg-sky-500/20 text-sky-300"
      )}
    >
      {formatDoorState(state)}
    </span>
  );
}

export function EventTypePill({ eventType }: { eventType: EventType }) {
  const tone = eventToneMap[eventType];

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        tone === "neutral" && "bg-slate-500/20 text-slate-200",
        tone === "success" && "bg-success/20 text-success",
        tone === "danger" && "bg-danger/20 text-danger",
        tone === "warning" && "bg-warning/20 text-warning"
      )}
    >
      {formatEventType(eventType)}
    </span>
  );
}
