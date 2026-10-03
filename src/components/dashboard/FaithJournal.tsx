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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BookHeart, CheckCircle2, History, Pencil, Plus, Sparkles, Trash2, Trophy } from "lucide-react";

const CATEGORIES: Record<string, { label: string; verse: string }> = {
  gratitude: { label: "Gratitude", verse: "Give thanks in all circumstances. 1 Thessalonians 5:18" },
  prayer_request: { label: "Prayer request", verse: "Do not be anxious about anything, but in every situation, by prayer… present your requests to God. Philippians 4:6" },
  answered_prayer: { label: "Answered prayer", verse: "The Lord has done great things for us, and we are filled with joy. Psalm 126:3" },
  sermon_takeaway: { label: "Sermon takeaway", verse: "Your word is a lamp for my feet, a light on my path. Psalm 119:105" },
};

const schema = z.object({
  title: z.string().trim().min(1, "Please add a title").max(120),
  content: z.string().trim().min(1, "Please write a few words").max(4000),
  category: z.enum(["gratitude", "prayer_request", "answered_prayer", "sermon_takeaway"]),
});

type Entry = {
  id: string; title: string; content: string; category: string;
  is_answered: boolean; answered_date: string | null; answered_notes: string | null; created_at: string;
};

type Filter = "all" | "active" | "answered" | "gratitude" | "sermon";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active Prayers" },
  { value: "answered", label: "Answered Prayers" },
  { value: "gratitude", label: "Gratitude" },
  { value: "sermon", label: "Sermon Notes" },
];

const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
const todayISO = () => new Date().toISOString().slice(0, 10);
const isPrayer = (e: Entry) => e.category === "prayer_request" || e.category === "answered_prayer";

function flashbackLabel(created: string): string | null {
  const c = new Date(created); const t = new Date();
  const days = Math.round((t.getTime() - c.getTime()) / 86400000);
  const sameDay = c.getDate() === t.getDate();
  const monthsAgo = (t.getFullYear() - c.getFullYear()) * 12 + (t.getMonth() - c.getMonth());
  if (sameDay && monthsAgo > 0 && monthsAgo % 12 === 0) return monthsAgo === 12 ? "1 year ago today" : `${monthsAgo / 12} years ago today`;
  if (sameDay && monthsAgo === 6) return "6 months ago today";
  if (Math.abs(days - 365) <= 3) return "About a year ago";
  if (Math.abs(days - 182) <= 3) return "About 6 months ago";
  return null;
}

const empty = { title: "", content: "", category: "gratitude" };

export default function FaithJournal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [answering, setAnswering] = useState<Entry | null>(null);
  const [answer, setAnswer] = useState({ date: todayISO(), notes: "" });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_journal_entries" as never).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Entry[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["journal", user?.id] });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (e: Entry) => { setEditing(e); setForm({ title: e.title, content: e.content, category: e.category }); setOpen(true); };

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setSaving(true);
    const table = supabase.from("user_journal_entries" as never);
    const payload: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.category === "answered_prayer" && !editing?.is_answered) {
      payload.is_answered = true; payload.answered_date = todayISO();
    }
    const { error } = editing
      ? await table.update(payload as never).eq("id", editing.id)
      : await table.insert({ ...payload, user_id: user!.id } as never);
    setSaving(false);
    if (error) { toast.error("Could not save your entry. Please try again."); return; }
    toast.success(editing ? "Entry updated" : "Entry saved to your journal");
    setOpen(false); refresh();
  };

  const remove = async (e: Entry) => {
    if (!confirm(`Delete "${e.title}"?`)) return;
    const { error } = await supabase.from("user_journal_entries" as never).delete().eq("id", e.id);
    if (error) { toast.error("Could not delete entry"); return; }
    toast.success("Entry deleted"); refresh();
  };

  const markAnswered = async () => {
    if (!answering) return;
    const notes = answer.notes.trim().slice(0, 2000);
    const { error } = await supabase.from("user_journal_entries" as never)
      .update({ is_answered: true, answered_date: answer.date || todayISO(), answered_notes: notes || null, category: "answered_prayer" } as never)
      .eq("id", answering.id);
    if (error) { toast.error("Could not update this prayer"); return; }
    toast.success("Praise God! Prayer marked as answered 🎉");
    setAnswering(null); refresh();
  };

  const filtered = entries.filter((e) => {
    switch (filter) {
      case "active": return isPrayer(e) && !e.is_answered;
      case "answered": return e.is_answered;
      case "gratitude": return e.category === "gratitude";
      case "sermon": return e.category === "sermon_takeaway";
      default: return true;
    }
  });

  const flashbacks = entries
    .filter((e) => e.category !== "sermon_takeaway")
    .map((e) => ({ e, label: flashbackLabel(e.created_at) }))
    .filter((x) => x.label);

  const answeredCount = entries.filter((e) => e.is_answered).length;
  const activeCount = entries.filter((e) => isPrayer(e) && !e.is_answered).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="eyebrow">My Journey</p>
          <h2 className="font-display text-3xl text-foreground flex items-center gap-2">
            <BookHeart className="h-7 w-7 text-accent" /> Faith & Gratitude Journal
          </h2>
          <p className="text-muted-foreground mt-1">A private place for prayers, thanksgiving and what God is teaching you.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New entry</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ n: entries.length, l: "Entries" }, { n: activeCount, l: "Active prayers" }, { n: answeredCount, l: "Answered prayers" }].map((s) => (
          <Card key={s.l}><CardContent className="p-4 text-center">
            <p className="font-display text-2xl text-primary">{s.n}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </CardContent></Card>
        ))}
      </div>

      {flashbacks.length > 0 && (
        <Card className="border-accent/50 bg-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg"><History className="h-5 w-5 text-accent" /> On This Day</CardTitle>
            <CardDescription>Look back at how God has been faithful.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {flashbacks.slice(0, 3).map(({ e, label }) => (
              <div key={e.id} className="rounded-xl bg-background/70 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-accent text-accent">{label}</Badge>
                  <span className="text-xs text-muted-foreground">{CATEGORIES[e.category]?.label}</span>
                </div>
                <p className="font-semibold text-foreground">{e.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{e.content}</p>
                {isPrayer(e) && (
                  <p className="text-xs mt-1 text-primary">
                    {e.is_answered ? `Answered on ${fmt(e.answered_date!)} — what a testimony!` : "Still waiting? Keep trusting — He hears you."}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${filter === f.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading your journal…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-accent" />
          {entries.length === 0 ? "Your journal is empty. Start with something you're thankful for today." : "No entries in this view yet."}
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((e) => (
            <Card key={e.id} className={e.is_answered ? "border-accent" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="secondary" className="mb-2">{CATEGORIES[e.category]?.label}</Badge>
                    <CardTitle className="text-lg">{e.title}</CardTitle>
                    <CardDescription>{fmt(e.created_at)}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(e)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(e)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{e.content}</p>
                {e.is_answered ? (
                  <div className="rounded-xl bg-gradient-amber p-3 text-primary">
                    <p className="flex items-center gap-2 font-semibold text-sm">
                      <Trophy className="h-4 w-4" /> Answered {e.answered_date ? `on ${fmt(e.answered_date)}` : ""}
                    </p>
                    {e.answered_notes && <p className="text-sm mt-1 whitespace-pre-wrap">{e.answered_notes}</p>}
                  </div>
                ) : e.category === "prayer_request" ? (
                  <Button variant="outline" size="sm" onClick={() => { setAnswering(e); setAnswer({ date: todayISO(), notes: "" }); }}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Mark as answered
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit entry" : "New journal entry"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs italic text-muted-foreground mt-1">{CATEGORIES[form.category]?.verse}</p>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Healing for Mum" />
            </div>
            <div>
              <Label>Your words</Label>
              <Textarea rows={6} value={form.content} maxLength={4000} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your prayer, thanks or reflection…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!answering} onOpenChange={(o) => !o && setAnswering(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /> Prayer answered!</DialogTitle>
            <DialogDescription>Record how God answered "{answering?.title}" — it becomes part of your testimony.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date answered</Label>
              <Input type="date" max={todayISO()} value={answer.date} onChange={(e) => setAnswer({ ...answer, date: e.target.value })} />
            </div>
            <div>
              <Label>How did God answer? (optional)</Label>
              <Textarea rows={4} maxLength={2000} value={answer.notes} onChange={(e) => setAnswer({ ...answer, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnswering(null)}>Cancel</Button>
            <Button onClick={markAnswered}>Celebrate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
