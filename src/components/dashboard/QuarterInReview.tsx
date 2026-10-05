import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookHeart, CalendarHeart, CalendarCheck, Download, HandHeart, Sparkles, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Metrics = { journal: number; answered: number; milestones: number; events: number; giving: number; downloads: number; rhythm: Rhythm };

const SPACES = [
  ["faith_journal", "Faith Journal"], ["milestones", "My Milestones"], ["events", "Events & Calendar"],
  ["giving", "Giving & Stewardship"], ["downloads", "Resources & Library"], ["watch_page", "Sermons & Watch"],
];
const TIMES = [
  ["early_morning", "Morning (5am–12pm)"], ["midday", "Afternoon (12–5pm)"], ["evening", "Evening (5–10pm)"], ["night_owl", "Late night (10pm–5am)"],
];
const DURATIONS = [["deep", "Deep devotion"], ["weekly", "Weekly rhythm"], ["growing", "Growing habit"], ["starting", "Just getting started"],
  ["under_5", "Quick (< 5 mins)"], ["15_30", "15–30 mins"], ["30_plus", "30+ mins"]];
const label = (list: string[][], v?: string | null) => list.find(([k]) => k === v)?.[1] ?? v ?? "—";

type Rhythm = { space: string; time: string | null; consistency: string; activeDays: number; total: number };
function inferRhythm(stamps: Record<string, string[]>): Rhythm {
  const counts = Object.entries(stamps).map(([k, v]) => [k, v.length] as const).sort((a, b) => b[1] - a[1]);
  const all = Object.values(stamps).flat();
  const buckets = { early_morning: 0, midday: 0, evening: 0, night_owl: 0 } as Record<string, number>;
  const days = new Set<string>();
  all.forEach((t) => {
    const d = new Date(t); const h = d.getHours();
    if (t.length > 10) buckets[h >= 5 && h < 12 ? "early_morning" : h >= 12 && h < 17 ? "midday" : h >= 17 && h < 22 ? "evening" : "night_owl"]++;
    days.add(d.toDateString());
  });
  const topTime = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
  const n = days.size;
  return {
    space: counts[0]?.[1] ? counts[0][0] : "watch_page",
    time: topTime[1] > 0 ? topTime[0] : null,
    consistency: n >= 24 ? "deep" : n >= 10 ? "weekly" : n >= 3 ? "growing" : "starting",
    activeDays: n, total: all.length,
  };
}

function quarterInfo(offset = 0) {
  const now = new Date();
  let q = Math.floor(now.getMonth() / 3) + offset;
  let y = now.getFullYear();
  while (q < 0) { q += 4; y -= 1; }
  const start = new Date(y, q * 3, 1);
  const end = new Date(y, q * 3 + 3, 1);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  return { key: `${y}-Q${q + 1}`, title: `Q${q + 1} ${y}`, start: iso(start), end: iso(end) };
}

async function countRows(q: any) {
  const { count, error } = await q;
  if (error) { console.warn(error.message); return 0; }
  return count ?? 0;
}

export default function QuarterInReview() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [offset, setOffset] = useState(0);
  const quarter = useMemo(() => quarterInfo(offset), [offset]);
  const [word, setWord] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["quarter-metrics", user?.id, quarter.key],
    enabled: !!user,
    queryFn: async (): Promise<Metrics> => {
      const uid = user!.id;
      const rows = async (q: any, col = "created_at"): Promise<string[]> => {
        const { data, error } = await q;
        if (error) { console.warn(error.message); return []; }
        return (data ?? []).map((r: any) => r[col]).filter(Boolean);
      };
      const { data: member } = await supabase.from("members").select("id").eq("user_id", uid).maybeSingle();
      const range = (q: any, col = "created_at") => q.gte(col, quarter.start).lt(col, quarter.end);
      const [journal, answered, milestones, events, downloads, giving] = await Promise.all([
        rows(range(supabase.from("user_journal_entries").select("created_at").eq("user_id", uid))),
        rows(range(supabase.from("user_journal_entries").select("answered_date").eq("user_id", uid).eq("is_answered", true), "answered_date"), "answered_date"),
        rows(range(supabase.from("user_milestones").select("created_at").eq("user_id", uid))),
        rows(range(supabase.from("event_registrations").select("created_at").eq("user_id", uid))),
        rows(range(supabase.from("digital_purchases").select("created_at").eq("user_id", uid))),
        member?.id
          ? rows(range(supabase.from("contributions").select("created_at, contribution_date").eq("member_id", member.id).eq("transaction_status", "completed"), "contribution_date"))
          : Promise.resolve([] as string[]),
      ]);
      const rhythm = inferRhythm({ faith_journal: journal, milestones, events, giving, downloads });
      return { journal: journal.length, answered: answered.length, milestones: milestones.length, events: events.length, downloads: downloads.length, giving: giving.length, rhythm };
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["quarterly-reviews", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("quarterly_reviews").select("*").eq("user_id", user!.id).order("quarter", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
  const existing = reviews.find((r) => r.quarter === quarter.key);

  const submit = async () => {
    if (!user || !metrics) return;
    const { rhythm, ...snapshot } = metrics;
    setSaving(true);
    const { error } = await (supabase as any).from("quarterly_reviews").upsert({
      user_id: user.id, quarter: quarter.key, favorite_space: rhythm.space, typical_time_of_day: rhythm.time ?? "unknown",
      session_duration: rhythm.consistency, spiritual_theme_word: word.trim().split(/\s+/)[0]?.slice(0, 30) || null,
      metrics_snapshot: { ...snapshot, active_days: rhythm.activeDays, interactions: rhythm.total }, completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,quarter" });
    setSaving(false);
    if (error) return toast.error("Couldn't save your reflection. Please try again.");
    toast.success(`Your ${quarter.title} recap is saved`);
    await qc.invalidateQueries({ queryKey: ["quarterly-reviews", user.id] });
  };

  const stats = [
    { icon: BookHeart, label: "Journal reflections", value: metrics?.journal },
    { icon: Trophy, label: "Prayers answered", value: metrics?.answered, gold: true },
    { icon: CalendarHeart, label: "Milestones added", value: metrics?.milestones },
    { icon: CalendarCheck, label: "Events registered", value: metrics?.events },
    { icon: HandHeart, label: "Gifts given", value: metrics?.giving },
    { icon: Download, label: "Resources unlocked", value: metrics?.downloads },
  ];


  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setOffset((o) => o - 1)} aria-label="Previous quarter"><ChevronLeft /></Button>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest opacity-80">Your quarter with TOT</p>
              <h2 className="font-serif text-3xl md:text-4xl">{quarter.title} in Review</h2>
              <p className="mt-1 text-sm opacity-80">Reflect on what God has done over these three months.</p>
            </div>
            <Button variant="ghost" size="icon" disabled={offset === 0} className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setOffset((o) => o + 1)} aria-label="Next quarter"><ChevronRight /></Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-primary-foreground/10 p-4">
                <s.icon className={cn("h-5 w-5", s.gold ? "text-accent" : "opacity-80")} />
                <p className="mt-2 text-3xl font-semibold">{isLoading ? "…" : s.value ?? 0}</p>
                <p className="text-xs opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {existing ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Reflection complete</CardTitle>
            <CardDescription>"The Lord has done great things for us, and we are filled with joy." Psalm 126:3</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <p><span className="text-muted-foreground">Most time spent:</span> {label(SPACES, existing.favorite_space)}</p>
            <p><span className="text-muted-foreground">Time of day:</span> {label(TIMES, existing.typical_time_of_day)}</p>
            <p><span className="text-muted-foreground">Consistency:</span> {label(DURATIONS, existing.session_duration)}</p>
            {existing.spiritual_theme_word && <p><span className="text-muted-foreground">Word of the quarter:</span> <Badge>{existing.spiritual_theme_word}</Badge></p>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your digital rhythm</CardTitle>
            <CardDescription>Worked out automatically from your activity on the portal this quarter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading || !metrics ? <p className="text-muted-foreground">Reading your quarter…</p> : (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Most time spent", metrics.rhythm.total ? label(SPACES, metrics.rhythm.space) : "No activity yet"],
                  ["Usually active", metrics.rhythm.time ? label(TIMES, metrics.rhythm.time) : "Not enough data yet"],
                  ["Consistency", `${label(DURATIONS, metrics.rhythm.consistency)} · ${metrics.rhythm.activeDays} active day${metrics.rhythm.activeDays === 1 ? "" : "s"}`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-secondary p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                    <p className="mt-1 font-semibold text-secondary-foreground">{v}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <p className="font-medium">One word for God's theme this quarter <span className="text-muted-foreground">(optional)</span></p>
              <Input value={word} onChange={(e) => setWord(e.target.value)} maxLength={30} placeholder="e.g. Faithfulness" className="max-w-xs" />
            </div>
            <Button onClick={submit} disabled={saving || isLoading || !metrics}>{saving ? "Saving…" : "Save my quarter recap"}</Button>
          </CardContent>
        </Card>
      )}

      {reviews.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Past quarters</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {reviews.map((r) => (
              <Badge key={r.id} variant="outline" className="px-3 py-1">
                {r.quarter.replace(/(\d+)-(Q\d)/, "$2 $1")}{r.spiritual_theme_word ? ` · ${r.spiritual_theme_word}` : ""}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
