import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarHeart, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

const CATEGORIES: Record<string, { label: string; blessing: string }> = {
  salvation: { label: "Salvation / Re-dedication", blessing: "Celebrating the day you said yes to Jesus. 2 Corinthians 5:17" },
  baptism: { label: "Baptism", blessing: "Buried with Him, raised to new life. Romans 6:4" },
  birthday: { label: "Birthday", blessing: "You are fearfully and wonderfully made. Psalm 139:14" },
  wedding: { label: "Wedding anniversary", blessing: "A cord of three strands is not quickly broken. Ecclesiastes 4:12" },
  child: { label: "Child's birthday / dedication", blessing: "Children are a heritage from the Lord. Psalm 127:3" },
  answered_prayer: { label: "Answered prayer", blessing: "The Lord has done great things for us. Psalm 126:3" },
  remembrance: { label: "In loving memory", blessing: "Blessed are those who mourn, for they will be comforted. Matthew 5:4" },
  other: { label: "Other special date", blessing: "This is the day the Lord has made. Psalm 118:24" },
};

const schema = z.object({
  title: z.string().trim().min(1, "Please give this date a name").max(100),
  category: z.string().min(1),
  milestone_date: z.string().min(1, "Please pick a date"),
  recurring: z.boolean(),
  reminder_enabled: z.boolean(),
  note: z.string().trim().max(1000).optional(),
});

type Milestone = {
  id: string; title: string; category: string; milestone_date: string;
  recurring: boolean; reminder_enabled: boolean; note: string | null;
};

const empty = { title: "", category: "birthday", milestone_date: "", recurring: true, reminder_enabled: true, note: "" };

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

function nextOccurrence(m: Milestone): Date | null {
  const [y, mo, d] = m.milestone_date.split("-").map(Number);
  const today = startOfToday();
  if (!m.recurring) {
    const dt = new Date(y, mo - 1, d);
    return dt >= today ? dt : null;
  }
  let dt = new Date(today.getFullYear(), mo - 1, d);
  if (dt < today) dt = new Date(today.getFullYear() + 1, mo - 1, d);
  return dt;
}

const daysUntil = (dt: Date) => Math.round((dt.getTime() - startOfToday().getTime()) / 86400000);

function yearsCount(m: Milestone, next: Date) {
  const y = Number(m.milestone_date.slice(0, 4));
  return next.getFullYear() - y;
}

const fmt = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

export const MyMilestones = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ["user-milestones", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_milestones" as never).select("*").order("milestone_date");
      if (error) throw error;
      return (data ?? []) as unknown as Milestone[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["user-milestones", user?.id] });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (m: Milestone) => {
    setEditing(m);
    setForm({ title: m.title, category: m.category, milestone_date: m.milestone_date, recurring: m.recurring, reminder_enabled: m.reminder_enabled, note: m.note ?? "" });
    setOpen(true);
  };

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) return;
    setSaving(true);
    const payload = { ...parsed.data, note: parsed.data.note || null };
    const table = supabase.from("user_milestones" as never);
    const { error } = editing
      ? await table.update(payload as never).eq("id", editing.id)
      : await table.insert({ ...payload, user_id: user.id } as never);
    setSaving(false);
    if (error) { toast.error("Could not save this date. Please try again or contact info@tot.co.ke."); return; }
    toast.success(editing ? "Date updated" : "Date saved — we'll celebrate it with you!");
    setOpen(false);
    refresh();
  };

  const remove = async (m: Milestone) => {
    if (!confirm(`Remove "${m.title}"?`)) return;
    const { error } = await supabase.from("user_milestones" as never).delete().eq("id", m.id);
    if (error) { toast.error("Could not remove this date."); return; }
    toast.success("Date removed");
    refresh();
  };

  const withNext = milestones
    .map((m) => ({ m, next: nextOccurrence(m) }))
    .sort((a, b) => (a.next?.getTime() ?? Infinity) - (b.next?.getTime() ?? Infinity));
  const todays = withNext.filter((x) => x.next && daysUntil(x.next) === 0);
  const upcoming = withNext.filter((x) => x.next && daysUntil(x.next) > 0 && daysUntil(x.next) <= 60);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><CalendarHeart className="h-6 w-6 text-primary" /> My Milestones & Dates</h2>
          <p className="text-muted-foreground">Keep the days that matter — we'll help you remember and celebrate them.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add a date</Button>
      </div>

      {todays.map(({ m, next }) => (
        <Card key={m.id} className="border-primary bg-primary/5">
          <CardContent className="py-5 flex gap-4 items-start">
            <Sparkles className="h-8 w-8 text-primary shrink-0" />
            <div>
              <p className="text-lg font-semibold">Today: {m.title}{m.recurring && next && yearsCount(m, next) > 0 ? ` — ${yearsCount(m, next)} year${yearsCount(m, next) === 1 ? "" : "s"}` : ""}</p>
              <p className="text-muted-foreground italic">{(CATEGORIES[m.category] ?? CATEGORIES.other).blessing}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Coming up</CardTitle>
          <CardDescription>Your special dates in the next 60 days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing in the next 60 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(({ m, next }) => (
                <li key={m.id} className="flex justify-between items-center gap-2 border-b border-border pb-2 last:border-0">
                  <span className="font-medium">{m.title}</span>
                  <Badge variant="secondary">in {daysUntil(next!)} day{daysUntil(next!) === 1 ? "" : "s"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All my dates</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : milestones.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground">You haven't added any dates yet. Start with your salvation day, baptism or wedding anniversary.</p>
              <Button variant="outline" onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add your first date</Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {withNext.map(({ m }) => (
                <div key={m.id} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-semibold">{m.title}</p>
                      <p className="text-sm text-muted-foreground">{fmt(m.milestone_date)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(m)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{(CATEGORIES[m.category] ?? CATEGORIES.other).label}</Badge>
                    {m.recurring && <Badge variant="outline">Every year</Badge>}
                  </div>
                  {m.note && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.note}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit date" : "Add a special date"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What kind of date?</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms-title">Name</Label>
              <Input id="ms-title" maxLength={100} placeholder="e.g. The day I gave my life to Christ" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms-date">Date</Label>
              <Input id="ms-date" type="date" value={form.milestone_date} onChange={(e) => setForm({ ...form, milestone_date: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ms-rec">Celebrate every year</Label>
              <Switch id="ms-rec" checked={form.recurring} onCheckedChange={(v) => setForm({ ...form, recurring: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ms-rem">Remind me</Label>
              <Switch id="ms-rem" checked={form.reminder_enabled} onCheckedChange={(v) => setForm({ ...form, reminder_enabled: v })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms-note">Your story or note (private)</Label>
              <Textarea id="ms-note" maxLength={1000} rows={4} placeholder="What made this day special?" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
