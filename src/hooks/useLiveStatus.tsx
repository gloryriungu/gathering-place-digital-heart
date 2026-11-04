import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** True when the Watch page live stream is switched on and has a link. */
export const useLiveStatus = () => {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase
        .from("media_content")
        .select("content_data")
        .eq("content_type", "live_stream")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const c = (data?.content_data as any) || {};
      if (!cancelled) setIsLive(Boolean(c.is_live && String(c.youtube_url || "").trim()));
    };
    check();

    const channel = supabase
      .channel(`live-status-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "media_content" }, check)
      .subscribe();
    const interval = setInterval(check, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return isLive;
};
