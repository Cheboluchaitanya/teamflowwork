import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Calendar, FolderKanban, Users, Clock, CheckCircle2,
  Layers, ArrowUpRight, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminProjects() {
  const { projects, teams, tasks, addProject } = useStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", teamId: "", deadline: "" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.teamId || !form.deadline) return toast.error("Fill all required fields");
    addProject({
      title: form.title.trim(),
      description: form.description.trim(),
      teamId: form.teamId,
      deadline: new Date(form.deadline).toISOString(),
      createdBy: user.id,
    });
    toast.success("Project created and assigned to team!");
    setForm({ title: "", description: "", teamId: "", deadline: "" });
    setOpen(false);
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <DashboardLayout title="Projects">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground">Create projects and assign them to teams. Team leaders will accept and break them into tasks.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> Create a Project
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input id="title" placeholder="e.g. Launch new landing page" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={3} placeholder="What should this project achieve?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Assign Team *</Label>
                  <Select value={form.teamId} onValueChange={(v) => setForm({ ...form, teamId: v })}>
                    <SelectTrigger><SelectValue placeholder="Choose team" /></SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Deadline *</Label>
                  <Input id="deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                  <ArrowUpRight className="mr-1 h-4 w-4" /> Create & Assign
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary bar */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Pending Acceptance", count: projects.filter(p => p.status === "pending").length, color: "text-warning", bg: "bg-warning/10", icon: Clock },
          { label: "In Progress", count: projects.filter(p => p.status === "in-progress" || p.status === "accepted").length, color: "text-status-progress", bg: "bg-status-progress/10", icon: Layers },
          { label: "Completed", count: projects.filter(p => p.status === "completed").length, color: "text-status-completed", bg: "bg-status-completed/10", icon: CheckCircle2 },
        ].map(s => (
          <Card key={s.label} className={`p-4 flex items-center gap-3 ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <FolderKanban className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>No projects yet — create your first one.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const team = teams.find((t) => t.id === p.teamId);
            const projTasks = tasks.filter((t) => t.projectId === p.id);
            const daysLeft = getDaysLeft(p.deadline);
            const isOverdue = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 3;

            return (
              <Card key={p.id} className="border-border p-5 transition-base hover:shadow-elegant flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground mt-0.5">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight truncate">{p.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description || "No description"}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {team?.name ?? "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {projTasks.length} task{projTasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {isOverdue ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Overdue by {Math.abs(daysLeft)}d
                      </Badge>
                    ) : isUrgent ? (
                      <Badge className="bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {daysLeft}d left
                      </Badge>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Due {p.deadline ? new Date(p.deadline).toLocaleDateString() : "TBD"}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-2" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
