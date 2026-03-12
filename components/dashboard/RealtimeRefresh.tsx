"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type WatchTable = "door_events" | "device_status" | "devices" | "authorized_cards";

export default function RealtimeRefresh({
  tables,
  delayMs = 1200
}: {
  tables: WatchTable[];
  delayMs?: number;
}) {
  const router = useRouter();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [supabase] = useState(createClient);

  useEffect(() => {
    const channel = supabase.channel(`refresh-${tables.join("-")}`);

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          if (typeof document !== "undefined" && document.hidden) {
            return;
          }

          if (refreshTimer.current) {
            clearTimeout(refreshTimer.current);
          }

          refreshTimer.current = setTimeout(() => {
            startTransition(() => {
              router.refresh();
            });
          }, delayMs);
        }
      );
    }

    channel.subscribe();

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }

      supabase.removeChannel(channel);
    };
  }, [delayMs, router, supabase, tables]);

  return null;
}
