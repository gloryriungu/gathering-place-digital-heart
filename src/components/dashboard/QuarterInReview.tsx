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

type Metrics = { journal: number; answered: number; milestones: number; events: number; giving: number; downloads: number };

const SPACES = [
  ["watch_page", "Sermons & Watch"], ["faith_journal", "Faith Journal"], ["events", "Events & Calendar"],
  ["giving", "Giving & Stewardship"], ["counseling", "Counseling & Prayer"],
];
const TIMES = [
  ["early_morning", "Early morning"], ["midday", "Midday break"], ["evening", "Evening reflection"],
  ["night_owl", "Late night"], ["sundays", "Sundays only"],
];
const DURATIONS = [["under_5", "Quick (< 5 mins)"], ["15_30", "15–30 mins"], ["30_plus", "30+ mins"]];
const label = (list: string[][], v?: string | null) => list.find(([k]) => k === v)?.[1] ?? v ?? "—";

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
  const [space, setSpace] = useState<string>();
  const [time, setTime] = useState<string>();
  const [duration, setDuration] = useState<string>();
  const [word, setWord] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["quarter-metrics", user?.id, quarter.key],
    enabled: !!user,
    queryFn: async (): Promise<Metrics> => {
      const uid = user!.id;
      const opts = { count: "exact" as const, head: true };
      const { data: member } = await supabase.from("members").select("id").eq("user_id", uid).maybeSingle();
      const [journal, answered, milestones, events, downloads, giving] = await Promise.all([
        countRows(supabase.from("user_journal_entries").select("id", opts).eq("user_id", uid).gte("created_at", quarter.start).lt("created_at", quarter.end)),
        countRows(supabase.from("user_journal_entries").select("id", opts).eq("user_id", uid).eq("is_answered", true).gte("answered_date", quarter.start).lt("answered_date", quarter.end)),
        countRows(supabase.from("user_milestones").select("id", opts).eq("user_id", uid).gte("created_at", quarter.start).lt("created_at", quarter.end)),
        countRows(supabase.from("event_registrations").select("id", opts).eq("user_id", uid).gte("created_at", quarter.start).lt("created_at", quarter.end)),
        countRows(supabase.from("digital_purchases").select("id", opts).eq("user_id", uid).gte("created_at", quarter.start).lt("created_at", quarter.end)),
        member?.id
          ? countRows(supabase.from("contributions").select("id", opts).eq("member_id", member.id).eq("transaction_status", "completed").gte("contribution_date", quarter.start).lt("contribution_date", quarter.end))
          : Promise.resolve(0),
      ]);
      return { journal, answered, milestones, events, downloads, giving };
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
    if (!user || !space || !time || !duration) return toast.error("Please answer the three questions.");
    setSaving(true);
    const { error } = await (supabase as any).from("quarterly_reviews").upsert({
      user_id: user.id, quarter: quarter.key, favorite_space: space, typical_time_of_day: time,
      session_duration: duration, spiritual_theme_word: word.trim().split(/\s+/)[0]?.slice(0, 30) || null,
      metrics_snapshot: metrics ?? {}, completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,quarter" });
    setSaving(false);
    if (error) return toast.error("Couldn't save your reflection. Please try again.");
    toast.success(`Your ${quarter.title} reflection is saved 🎉`);
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

  const Pills = ({ options, value, onChange }: { options: string[][]; value?: string; onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(([k, l]) => (
        <button key={k} type="button" onClick={() => onChange(k)}
          className={cn("rounded-full border px-4 py-2 text-sm transition-colors",
            value === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted")}>
          {l}
        </button>
      ))}
    </div>
  );

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
            <p><span className="text-muted-foreground">Favourite space:</span> {label(SPACES, existing.favorite_space)}</p>
            <p><span className="text-muted-foreground">Time of day:</span> {label(TIMES, existing.typical_time_of_day)}</p>
            <p><span className="text-muted-foreground">Typical visit:</span> {label(DURATIONS, existing.session_duration)}</p>
            {existing.spiritual_theme_word && <p><span className="text-muted-foreground">Word of the quarter:</span> <Badge>{existing.spiritual_theme_word}</Badge></p>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your digital rhythm</CardTitle>
            <CardDescription>Three quick questions — under a minute.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2"><p className="font-medium">Where do you spend most of your time on the portal?</p><Pills options={SPACES} value={space} onChange={setSpace} /></div>
            <div className="space-y-2"><p className="font-medium">When do you usually engage with us online?</p><Pills options={TIMES} value={time} onChange={setTime} /></div>
            <div className="space-y-2"><p className="font-medium">How long is your typical visit?</p><Pills options={DURATIONS} value={duration} onChange={setDuration} /></div>
            <div className="space-y-2">
              <p className="font-medium">One word for God's theme this quarter <span className="text-muted-foreground">(optional)</span></p>
              <Input value={word} onChange={(e) => setWord(e.target.value)} maxLength={30} placeholder="e.g. Faithfulness" className="max-w-xs" />
            </div>
            <Button onClick={submit} disabled={saving || !space || !time || !duration}>{saving ? "Saving…" : "Complete my review"}</Button>
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
