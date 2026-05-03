import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { useStore } from "@/context/store";
import {
  FolderKanban, Users, TrendingUp, CheckCircle2,
  Clock, ArrowRight, Activity, Layers, Send,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOverview() {
  const { teams, projects, tasks, users } = useStore();
  const completed = projects.filter((p) => p.status === "completed").length;
  const inProgress = projects.filter((p) => p.status === "in-progress" || p.status === "accepted").length;
  const pending = projects.filter((p) => p.status === "pending").length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    : 0;

  const stats = [
    { label: "Total Teams", value: teams.length, icon: Users, gradient: "bg-gradient-primary", sub: "Active workgroups" },
    { label: "Total Projects", value: projects.length, icon: FolderKanban, gradient: "bg-gradient-accent", sub: `${pending} pending` },
    { label: "Completed", value: completed, icon: CheckCircle2, gradient: "bg-gradient-sunset", sub: "Projects done" },
    { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, gradient: "bg-gradient-primary", sub: `${inProgress} active` },
  ];

  // Workflow pipeline counts
  const submittedTasks = tasks.filter(t => t.status === "completed" && t.approved === undefined).length;
  const approvedTasks = tasks.filter(t => t.approved === true).length;
  const rejectedTasks = tasks.filter(t => t.approved === false).length;
  const openTasks = tasks.filter(t => t.status === "pending" || t.status === "in-progress").length;

  const pipeline = [
    { label: "Admin creates project", icon: FolderKanban, color: "text-primary", count: projects.length, desc: "Projects created" },
    { label: "Leader accepts & breaks into tasks", icon: Layers, color: "text-accent", count: tasks.length, desc: "Tasks created" },
    { label: "Members working", icon: Activity, color: "text-warning", count: openTasks, desc: "Open tasks" },
    { label: "Submitted for review", icon: Clock, color: "text-status-progress", count: submittedTasks, desc: "Awaiting review" },
    { label: "Approved by leader", icon: CheckCircle2, color: "text-status-completed", count: approvedTasks, desc: "Approved" },
  ];

  return (
    <DashboardLayout title="Admin Overview">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden border-border p-5 transition-base hover:shadow-elegant">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.gradient} text-primary-foreground`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Workflow Pipeline */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Workflow Pipeline
        </h2>
        <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
          {pipeline.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-shrink-0">
              <Card className="p-4 min-w-[160px] text-center transition-base hover:shadow-elegant">
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${step.color}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{step.count}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{step.desc}</p>
                <p className="text-[11px] font-medium text-muted-foreground/70 mt-2 leading-tight">{step.label}</p>
              </Card>
              {i < pipeline.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Team Monitor */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Global Team Monitor
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const teamProjects = projects.filter((p) => p.teamId === team.id);
            const teamTasks = tasks.filter((t) => teamProjects.some((p) => p.id === t.projectId));
            const completedCount = teamTasks.filter((t) => t.approved).length;
            const progress = teamTasks.length ? Math.round((completedCount / teamTasks.length) * 100) : 0;
            const pendingReview = teamTasks.filter(t => t.status === "completed" && t.approved === undefined).length;

            return (
              <Card key={team.id} className="p-5 transition-base hover:shadow-elegant">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{teamProjects.length} project{teamProjects.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  {pendingReview > 0 && (
                    <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                      <Clock className="mr-1 h-3 w-3" /> {pendingReview} review
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Task Completion
                    </span>
                    <span className="font-semibold">{completedCount}/{teamTasks.length}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex gap-2 flex-wrap">
                    {teamProjects.map((p) => (
                      <div key={p.id} className="flex items-center gap-1">
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Workflow Audit Log */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Workflow Audit Log
          </h2>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider opacity-60">Automatic Tracking</Badge>
        </div>
        <Card className="divide-y divide-border overflow-hidden">
          {(() => {
            const activities = [];

            // 1. Leader accepted project
            projects.filter(p => p.acceptedAt).forEach(p => {
              const team = teams.find(t => t.id === p.teamId);
              const leader = team ? users.find(u => u.id === team.leaderId) : null;
              activities.push({
                time: p.acceptedAt,
                type: "accept",
                content: (
                  <p className="text-sm">
                    <span className="font-bold text-primary">{leader?.name || "Team Leader"}</span> accepted project <span className="font-semibold italic">"{p.title}"</span>
                  </p>
                )
              });
            });

            // 2. Leader divided work (tasks created)
            tasks.forEach(t => {
              const project = projects.find(p => p.id === t.projectId);
              const team = project ? teams.find(tm => tm.id === project.teamId) : null;
              const leader = team ? users.find(u => u.id === team.leaderId) : null;
              const member = users.find(u => u.id === t.assignedTo);
              activities.push({
                time: t.createdAt,
                type: "divide",
                content: (
                  <p className="text-sm">
                    <span className="font-bold text-primary">{leader?.name || "Team Leader"}</span> created task <span className="font-semibold">"{t.description}"</span> for <span className="font-bold text-accent">{member?.name || "Member"}</span>
                  </p>
                )
              });
            });

            // 3. Member submitted work
            tasks.filter(t => t.submittedAt).forEach(t => {
              const member = users.find(u => u.id === t.assignedTo);
              activities.push({
                time: t.submittedAt,
                type: "submit",
                content: (
                  <p className="text-sm">
                    <span className="font-bold text-accent">{member?.name || "Member"}</span> submitted work for task <span className="font-semibold">"{t.description}"</span>
                  </p>
                )
              });
            });

            // 4. Leader reviewed
            tasks.filter(t => t.reviewedAt).forEach(t => {
              const project = projects.find(p => p.id === t.projectId);
              const team = project ? teams.find(tm => tm.id === project.teamId) : null;
              const leader = team ? users.find(u => u.id === team.leaderId) : null;
              activities.push({
                time: t.reviewedAt,
                type: "review",
                content: (
                  <p className="text-sm">
                    <span className="font-bold text-primary">{leader?.name || "Team Leader"}</span> {t.approved ? "approved" : "rejected"} task <span className="font-semibold">"{t.description}"</span>
                  </p>
                )
              });
            });

            const sorted = activities.sort((a, b) => b.time - a.time);

            if (sorted.length === 0) {
              return <div className="p-10 text-center text-muted-foreground text-sm">No activity recorded yet. Audit log will populate as work begins.</div>;
            }

            return sorted.slice(0, 15).map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-4 transition-base hover:bg-secondary/30">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                  act.type === "accept" ? "bg-primary/10 text-primary" :
                  act.type === "divide" ? "bg-accent/10 text-accent" :
                  act.type === "submit" ? "bg-status-progress/10 text-status-progress" :
                  "bg-status-completed/10 text-status-completed"
                }`}>
                  {act.type === "accept" && <FolderKanban className="h-4 w-4" />}
                  {act.type === "divide" && <Layers className="h-4 w-4" />}
                  {act.type === "submit" && <Send className="h-4 w-4" />}
                  {act.type === "review" && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  {act.content}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                </div>
              </div>
            ));
          })()}
        </Card>
      </section>

      {/* Recent Projects */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" /> Recent Projects
        </h2>
        {projects.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No projects yet. Create one from the Projects page.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.slice(0, 6).map((p) => {
              const team = teams.find((t) => t.id === p.teamId);
              const projTasks = tasks.filter((t) => t.projectId === p.id);
              const approvedCount = projTasks.filter((t) => t.approved).length;
              return (
                <Card key={p.id} className="border-border p-5 transition-base hover:shadow-elegant">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {team?.name ?? "Unassigned"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {approvedCount}/{projTasks.length} tasks
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Clock className="h-3.5 w-3.5" /> {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-2" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
