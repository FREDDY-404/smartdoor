"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format";
import { securityEventTypes } from "@/lib/constants";
import type { Device, DoorEvent, EventType } from "@/types";
import EmptyState from "@/components/dashboard/EmptyState";
import { EventTypePill } from "@/components/dashboard/StatePill";

type FeedMode = "all" | "security";

export default function EventFeed({
  initialEvents,
  devices,
  mode = "all"
}: {
  initialEvents: DoorEvent[];
  devices: Device[];
  mode?: FeedMode;
}) {
  const [supabase] = useState(createClient);
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [deviceId, setDeviceId] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    const channel = supabase
      .channel(`feed-${mode}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "door_events" },
        (payload) => {
          const incoming = payload.new as DoorEvent;
          setEvents((current) => [incoming, ...current].slice(0, 200));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, supabase]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (mode === "security" && !securityEventTypes.includes(event.event_type)) {
        return false;
      }

      if (deviceId !== "all" && event.device_id !== deviceId) {
        return false;
      }

      if (eventType !== "all" && event.event_type !== eventType) {
        return false;
      }

      if (from && event.created_at < new Date(from).toISOString()) {
        return false;
      }

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (event.created_at > end.toISOString()) {
          return false;
        }
      }

      if (deferredSearch) {
        const haystack = `${event.uid || ""} ${event.message || ""} ${event.device?.name || ""}`
          .toLowerCase()
          .trim();
        if (!haystack.includes(deferredSearch.toLowerCase().trim())) {
          return false;
        }
      }

      return true;
    });
  }, [deferredSearch, deviceId, eventType, events, from, mode, to]);

  const availableTypes = useMemo(() => {
    const types = new Set<EventType>();
    for (const event of events) {
      if (mode === "security" && !securityEventTypes.includes(event.event_type)) {
        continue;
      }
      types.add(event.event_type);
    }

    return Array.from(types);
  }, [events, mode]);

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,0.8fr))]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search UID, message, or device"
          className="min-w-0 rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-accent/60"
        />
        <select
          value={deviceId}
          onChange={(event) => setDeviceId(event.target.value)}
          className="min-w-0 rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
        >
          <option value="all">All devices</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
        <select
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
          className="min-w-0 rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
        >
          <option value="all">All events</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="min-w-0 rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
        />
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="min-w-0 rounded-2xl border border-border bg-panel2 px-4 py-3 text-sm text-white outline-none transition focus:border-accent/60"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No matching events"
          description="Adjust the event, device, search, or date filters to broaden the activity feed."
        />
      ) : (
        <div className="max-w-full overflow-x-auto rounded-[24px] border border-border/70 bg-panel/50">
          <table className="min-w-[880px] w-full table-fixed text-left text-sm">
            <thead className="bg-panel2/90 text-xs uppercase tracking-[0.22em] text-slate-500">
              <tr>
                <th className="w-[140px] px-4 py-3">Event</th>
                <th className="w-[220px] px-4 py-3">Device</th>
                <th className="w-[160px] px-4 py-3">UID</th>
                <th className="px-4 py-3">Message</th>
                <th className="w-[190px] px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-t border-border/70 bg-panel/70">
                  <td className="px-4 py-3">
                    <EventTypePill eventType={event.event_type} />
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    <div className="truncate">{event.device?.name || event.device_id}</div>
                    <div className="mt-1 truncate text-xs text-slate-500">{event.device?.location || ""}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{event.uid || "-"}</td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="max-w-full truncate">{event.message || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(event.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
