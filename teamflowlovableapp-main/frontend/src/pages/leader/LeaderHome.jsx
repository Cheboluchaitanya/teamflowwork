import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ListTodo, Plus, CheckCircle2, XCircle, Clock,
  FolderKanban, Layers, UserCheck, ThumbsUp, ThumbsDown,
  ClipboardCheck, RefreshCcw, TrendingUp, Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function LeaderHome() {
  const { user } = useAuth();
  const { projects, tasks, users, acceptProject, addTask, reviewTask, updateProjectProgress } = useStore();

  const myTeamProjects = projects.filter((p) => p.teamId === user.teamId);
  const myTeamTasks = tasks.filter((t) => myTeamProjects.some((p) => p.id === t.projectId));
  const myTeamMembers = users.filter((u) => u.teamId === user.teamId && u.role === "member");

  const [taskForm, setTaskForm] = useState({ projectId: "", title: "", description: "", assignedTo: "" });
  const [taskOpen, setTaskOpen] = useState(false);
  const [progressForm, setProgressForm] = useState({ projectId: "", progress: 0 });
  const [progressOpen, setProgressOpen] = useState(false);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskForm.description || !taskForm.assignedTo || !taskForm.projectId) return toast.error("Please fill all fields");
    addTask(taskForm.projectId, {
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: taskForm.assignedTo,
    });
    toast.success("Task created and assigned to member!");
    setTaskOpen(false);
    setTaskForm({ projectId: "", title: "", description: "", assignedTo: "" });
  };

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    updateProjectProgress(progressForm.projectId, Number(progressForm.progress));
    toast.success("Project progress updated!");
    setProgressOpen(false);
  };

  const pendingProjects = myTeamProjects.filter((p) => p.status === "pending");
  const activeProjects = myTeamProjects.filter((p) => p.status !== "pending");
  const pendingReview = myTeamTasks.filter((t) => t.status === "completed" && t.approved === undefined);
  const approvedTasks = myTeamTasks.filter((t) => t.approved === true);
  const rejectedTasks = myTeamTasks.filter((t) => t.approved === false);

  return (
    <DashboardLayout title="Team Dashboard">
      <div className="space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "My Projects", value: myTeamProjects.length, icon: FolderKanban, gradient: "bg-gradient-primary" },
            { label: "Total Tasks", value: myTeamTasks.length, icon: Layers, gradient: "bg-gradient-accent" },
            { label: "Pending Review", value: pendingReview.length, icon: Clock, gradient: "bg-gradient-sunset" },
            { label: "Approved", value: approvedTasks.length, icon: CheckCircle2, gradient: "bg-gradient-primary" },
          ].map((s) => (
            <Card key={s.label} className="p-5 transition-base hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{s.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.gradient} text-primary-foreground`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pending Acceptance */}
        {pendingProjects.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Awaiting Your Acceptance
              <Badge className="bg-warning/10 text-warning border-warning/20 ml-1">{pendingProjects.length}</Badge>
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingProjects.map((p) => (
                <Card key={p.id} className="p-6 border-warning/30 bg-warning/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning flex-shrink-0">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Due {new Date(p.deadline).toLocaleDateString()}
                  </p>
                  <Button
                    className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                    onClick={() => { acceptProject(p.id); toast.success("Project accepted! Now break it into tasks."); }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Project
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> Active Projects
              </h2>
              <div className="flex gap-2">
                <Dialog open={progressOpen} onOpenChange={setProgressOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <TrendingUp className="mr-2 h-4 w-4" /> Update Progress
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Update Project Progress
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProgress} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Project</Label>
                        <Select value={progressForm.projectId} onValueChange={(v) => setProgressOpen(true) || setProgressForm({ ...progressForm, projectId: v })}>
                          <SelectTrigger><SelectValue placeholder="Choose project" /></SelectTrigger>
                          <SelectContent>
                            {activeProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Progress: {progressForm.progress}%</Label>
                        <Input
                          type="range" min="0" max="100" step="5"
                          value={progressForm.progress}
                          onChange={(e) => setProgressForm({ ...progressForm, progress: Number(e.target.value) })}
                          className="cursor-pointer"
                        />
                        <Progress value={progressForm.progress} className="h-2" />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="bg-gradient-primary text-primary-foreground">Save Progress</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary text-primary-foreground shadow-glow" size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ListTodo className="h-5 w-5 text-primary" /> Break Down Project into Task
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTask} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Project *</Label>
                        <Select value={taskForm.projectId} onValueChange={(v) => setTaskForm({ ...taskForm, projectId: v })}>
                          <SelectTrigger><SelectValue placeholder="Choose project" /></SelectTrigger>
                          <SelectContent>
                            {activeProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input placeholder="e.g. Design hero section" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Task Description *</Label>
                        <Textarea
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          placeholder="Describe what needs to be done..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Assign To *</Label>
                        <Select value={taskForm.assignedTo} onValueChange={(v) => setTaskForm({ ...taskForm, assignedTo: v })}>
                          <SelectTrigger><SelectValue placeholder="Choose member" /></SelectTrigger>
                          <SelectContent>
                            {myTeamMembers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                          <UserCheck className="mr-1 h-4 w-4" /> Assign Task
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeProjects.map((p) => {
                const projTasks = tasks.filter((t) => t.projectId === p.id);
                const done = projTasks.filter((t) => t.approved).length;
                return (
                  <Card key={p.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground flex-shrink-0">
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold">{p.title}</h3>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {done}/{projTasks.length} tasks approved</span>
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Pending Review */}
        {pendingReview.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Eye className="h-5 w-5 text-status-progress" />
              Submissions for Review
              <Badge className="bg-status-progress/10 text-status-progress border-status-progress/20 ml-1">{pendingReview.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {pendingReview.map((t) => {
                const member = users.find((u) => u.id === t.assignedTo);
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <Card key={t.id} className="p-5 border-status-progress/20 bg-status-progress/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-progress/10 text-status-progress flex-shrink-0">
                            <ClipboardCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-status-progress uppercase tracking-wider">{member?.name}'s Submission</p>
                            <p className="text-xs text-muted-foreground">{project?.title}</p>
                          </div>
                        </div>
                        <p className="font-semibold">{t.description}</p>
                        <div className="rounded-lg bg-background p-3 text-sm border border-border italic text-muted-foreground">
                          "{t.submission}"
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button size="sm" className="bg-status-completed text-white hover:bg-status-completed/90" onClick={() => { reviewTask(t.id, true); toast.success("Task approved!"); }}>
                          <ThumbsUp className="mr-1.5 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { reviewTask(t.id, false); toast.info("Task sent back for revision."); }}>
                          <ThumbsDown className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* All Team Tasks */}
        <section>
          <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" /> All Team Tasks
          </h2>
          {myTeamTasks.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              <ListTodo className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>No tasks yet. Accept a project and create tasks for your team.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {myTeamTasks.map((t) => {
                const member = users.find((u) => u.id === t.assignedTo);
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <Card key={t.id} className="p-4 transition-base hover:shadow-elegant">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${
                          t.approved === true ? "bg-status-completed/10 text-status-completed" :
                          t.approved === false ? "bg-destructive/10 text-destructive" :
                          t.status === "completed" ? "bg-status-progress/10 text-status-progress" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {t.approved === true ? <CheckCircle2 className="h-4 w-4" /> :
                           t.approved === false ? <RefreshCcw className="h-4 w-4" /> :
                           t.status === "completed" ? <ClipboardCheck className="h-4 w-4" /> :
                           <ListTodo className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{t.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-foreground font-medium">{project?.title}</span>
                            {" • Assigned to "}
                            <span className="text-foreground font-medium">{member?.name}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {t.approved === false && (
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                            <XCircle className="mr-1 h-3 w-3" /> Revision needed
                          </Badge>
                        )}
                        <StatusBadge status={t.approved === true ? "completed" : t.status} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
