"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import type { DeviceStatus, DoorEvent, OverviewSnapshot } from "@/types";
import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { DoorStatePill, EventTypePill } from "@/components/dashboard/StatePill";

type StatusRow = OverviewSnapshot["statuses"][number];

function mergeStatus(rows: StatusRow[], nextStatus: DeviceStatus) {
  return rows.map((row) =>
    row.device_id === nextStatus.device_id
      ? {
          ...row,
          ...nextStatus
        }
      : row
  );
}

export default function OverviewClient({
  snapshot
}: {
  snapshot: OverviewSnapshot;
}) {
  const [supabase] = useState(createClient);
  const [statuses, setStatuses] = useState(snapshot.statuses);
  const [recentEvents, setRecentEvents] = useState(snapshot.recentEvents);

  useEffect(() => {
    setStatuses(snapshot.statuses);
    setRecentEvents(snapshot.recentEvents);
  }, [snapshot]);

  useEffect(() => {
    const channel = supabase
      .channel("overview-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_status" },
        (payload) => {
          setStatuses((current) => mergeStatus(current, payload.new as DeviceStatus));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "door_events" },
        (payload) => {
          const event = payload.new as DoorEvent;
          setRecentEvents((current) => [event, ...current].slice(0, 8));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const selectedStatus = useMemo(() => {
    if (!snapshot.selectedDeviceId) {
      return null;
    }

    return statuses.find((status) => status.device_id === snapshot.selectedDeviceId) ?? null;
  }, [snapshot.selectedDeviceId, statuses]);

  const latestEvent = recentEvents[0] ?? snapshot.latestEvent;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Access Granted"
          value={snapshot.metrics.totalAccessGranted}
          hint="Successful smart door entries"
        />
        <StatCard
          label="Access Denied"
          value={snapshot.metrics.totalAccessDenied}
          hint="Denied or blocked access attempts"
        />
        <StatCard
          label="Failed OTP"
          value={snapshot.metrics.totalFailedOtpAttempts}
          hint="Wrong OTP attempts recorded"
        />
        <StatCard label="Alarms" value={snapshot.metrics.totalAlarms} hint="Alarm event count" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Live Door Status"
          description="Current state, last seen time, and latest event across registered devices."
        >
          {statuses.length === 0 ? (
            <EmptyState
              title="No devices registered"
              description="Create a device in the Devices page to start receiving smart door events."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {statuses.map((status) => (
                <article
                  key={status.device_id}
                  className="rounded-2xl border border-border/70 bg-panel2/75 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{status.device.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {status.device.location || "No location"} · {status.device.device_code}
                      </p>
                    </div>
                    <DoorStatePill state={status.door_state} />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Online</p>
                      <p className="mt-1">{status.is_online ? "Online" : "Offline"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Seen</p>
                      <p className="mt-1">{formatRelativeTime(status.last_seen_at)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Latest Event
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {status.last_event_type ? (
                          <EventTypePill eventType={status.last_event_type} />
                        ) : (
                          <span className="text-slate-500">No events yet</span>
                        )}
                        {status.last_message ? (
                          <span className="text-sm text-slate-300">{status.last_message}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Current Focus"
          description="Overview summary for the most recently selected or active device."
        >
          {selectedStatus ? (
            <div className="space-y-4 rounded-2xl border border-border/70 bg-panel2/75 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{selectedStatus.device.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedStatus.device.location || "No location"}
                  </p>
                </div>
                <DoorStatePill state={selectedStatus.door_state} />
              </div>
              <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                  <p className="mt-1">{selectedStatus.is_online ? "Online" : "Offline"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Seen</p>
                  <p className="mt-1">{formatDateTime(selectedStatus.last_seen_at)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Latest Message
                  </p>
                  <p className="mt-1">
                    {selectedStatus.last_message || "No device message captured yet."}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest Event</p>
                  <div className="mt-2">
                    {selectedStatus.last_event_type ? (
                      <EventTypePill eventType={selectedStatus.last_event_type} />
                    ) : (
                      <span className="text-slate-500">No events yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No status available"
              description="Device status rows are created automatically when devices are added."
            />
          )}

          <div className="mt-5 rounded-2xl border border-border/70 bg-panel2/75 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">Latest Event Across Devices</p>
                <p className="mt-1 text-sm text-slate-400">
                  The newest event inserted into `door_events`.
                </p>
              </div>
              {latestEvent ? <EventTypePill eventType={latestEvent.event_type} /> : null}
            </div>
            {latestEvent ? (
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>{latestEvent.message || "No message provided."}</p>
                <p className="text-slate-400">
                  UID: {latestEvent.uid || "N/A"} · {formatDateTime(latestEvent.created_at)}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No event received yet.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
