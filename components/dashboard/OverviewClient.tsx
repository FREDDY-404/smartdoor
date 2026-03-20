"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/dashboard/Navbar";
import ActivityChart from "@/components/dashboard/ActivityChart";
import ActivityTable from "@/components/dashboard/ActivityTable";
import type { ActivityRow } from "@/components/dashboard/ActivityTable";
import AlertPanel from "@/components/dashboard/AlertPanel";
import StatusCard from "@/components/dashboard/StatusCard";
import { createClient } from "@/lib/supabase/client";
import { eventTypeLabels, eventToneMap, securityEventTypes } from "@/lib/constants";
import type { DeviceStatus, DoorEvent, OverviewSnapshot } from "@/types";

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
  snapshot,
  userLabel
}: {
  snapshot: OverviewSnapshot;
  userLabel: string;
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

  const doorState = useMemo(() => {
    if (statuses.some((status) => status.door_state === "alarm")) {
      return "alarm" as const;
    }
    if (statuses.some((status) => status.door_state === "unlocked")) {
      return "unlocked" as const;
    }
    if (statuses.some((status) => status.door_state === "locked")) {
      return "locked" as const;
    }
    return "unknown" as const;
  }, [statuses]);

  const chartData = useMemo(() => {
    const buckets = [
      { label: "RFID", success: 0, failed: 0 },
      { label: "OTP", success: 0, failed: 0 },
      { label: "Door", success: 0, failed: 0 },
      { label: "Alert", success: 0, failed: 0 }
    ];

    for (const event of recentEvents) {
      const failed = ["RFID_INVALID", "OTP_FAILED", "ACCESS_DENIED", "ALARM"].includes(event.event_type);
      const key =
        event.event_type.startsWith("RFID")
          ? "RFID"
          : event.event_type.startsWith("OTP")
            ? "OTP"
            : event.event_type.startsWith("DOOR") || event.event_type === "ACCESS_GRANTED"
              ? "Door"
              : "Alert";

      const bucket = buckets.find((item) => item.label === key);
      if (!bucket) continue;
      if (failed) {
        bucket.failed += 1;
      } else {
        bucket.success += 1;
      }
    }

    return buckets;
  }, [recentEvents]);

  const activityRows = useMemo(() => {
    return (recentEvents.length > 0 ? recentEvents : snapshot.recentEvents).slice(0, 8).map((event): ActivityRow => {
      const method: ActivityRow["method"] = event.event_type.startsWith("OTP") ? "OTP" : "RFID";
      const status: ActivityRow["status"] =
        eventToneMap[event.event_type] === "success" ? "success" : "failed";

      return {
        id: event.id,
        time: event.created_at,
        user: event.uid || event.device?.name || "Unknown",
        method,
        status,
        reason: event.message || eventTypeLabels[event.event_type] || event.event_type
      };
    });
  }, [recentEvents, snapshot.recentEvents]);

  const alertItems = useMemo(() => {
    const source = recentEvents.length > 0 ? recentEvents : snapshot.recentEvents;
    const alerts = source
      .filter((event) => securityEventTypes.includes(event.event_type))
      .slice(0, 4)
      .map((event) => ({
        id: event.id,
        title: eventTypeLabels[event.event_type] || event.event_type,
        detail: event.message || "Suspicious activity detected.",
        tone: event.event_type === "ALARM" || event.event_type === "ACCESS_DENIED" ? "danger" as const : "warning" as const
      }));

    return alerts.length > 0
      ? alerts
      : [
          {
            id: "mock-1",
            title: "Multiple failed attempts",
            detail: "Repeated denied scans will appear here for rapid review.",
            tone: "warning" as const
          }
        ];
  }, [recentEvents, snapshot.recentEvents]);

  const chartTotals = useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({
        success: acc.success + item.success,
        failed: acc.failed + item.failed
      }),
      { success: 0, failed: 0 }
    );
  }, [chartData]);

  return (
    <div className="min-w-0 space-y-6">
      <Navbar doorState={doorState} userLabel={userLabel} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          label="Total Access Today"
          value={snapshot.metrics.totalAccessGranted + snapshot.metrics.totalAccessDenied}
          tone="neutral"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="M4 12h4l2-4 4 8 2-4h4" />
            </svg>
          }
        />
        <StatusCard
          label="Successful Access"
          value={snapshot.metrics.totalAccessGranted}
          tone="success"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatusCard
          label="Failed Attempts"
          value={snapshot.metrics.totalAccessDenied}
          tone="danger"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          }
        />
        <StatusCard
          label="Security Alerts"
          value={snapshot.metrics.totalAlarms}
          tone="warning"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3z" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          }
        />
      </section>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
        <ActivityChart barData={chartData} totals={chartTotals} />
        <AlertPanel alerts={alertItems} />
      </section>

      <ActivityTable rows={activityRows} />
    </div>
  );
}
