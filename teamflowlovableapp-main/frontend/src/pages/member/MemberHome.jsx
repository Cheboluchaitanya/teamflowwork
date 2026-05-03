import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2, Clock, Send, Layers, Trophy,
  ClipboardCheck, RefreshCcw, FolderKanban, ListTodo, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function MemberHome() {
  const { user } = useAuth();
  const { tasks, projects, submitTask } = useStore();

  const myTasks = tasks.filter((t) => t.assignedTo === user.id);
  const [submitForm, setSubmitForm] = useState({ taskId: "", work: "" });
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!submitForm.work) return toast.error("Please describe your completed work");
    submitTask(submitForm.taskId, submitForm.work);
    toast.success("Work submitted to leader for review!");
    setOpen(false);
    setSubmitForm({ taskId: "", work: "" });
  };

  const pendingTasks = myTasks.filter((t) => t.status === "pending" || t.status === "in-progress");
  const submittedTasks = myTasks.filter((t) => t.status === "completed" && t.approved === undefined);
  const approvedTasks = myTasks.filter((t) => t.approved === true);
  const rejectedTasks = myTasks.filter((t) => t.approved === false);

  return (
    <DashboardLayout title="My Workspace">
      <div className="space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Open Tasks", value: pendingTasks.length, icon: ListTodo, gradient: "bg-gradient-primary" },
            { label: "Submitted", value: submittedTasks.length, icon: Send, gradient: "bg-gradient-accent" },
            { label: "Approved", value: approvedTasks.length, icon: CheckCircle2, gradient: "bg-gradient-sunset" },
            { label: "Total Tasks", value: myTasks.length, icon: Layers, gradient: "bg-gradient-primary" },
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

        {/* Revision Required */}
        {rejectedTasks.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Needs Revision
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 ml-1">{rejectedTasks.length}</Badge>
            </h2>
            <div className="space-y-3">
              {rejectedTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <Card key={t.id} className="p-5 border-destructive/30 bg-destructive/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <RefreshCcw className="h-4 w-4 text-destructive flex-shrink-0" />
                          <p className="text-xs font-semibold text-destructive uppercase">Sent back for revision</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{project?.title}</p>
                        <p className="font-semibold">{t.description}</p>
                        <div className="rounded-lg bg-background p-2.5 text-sm border border-border italic text-muted-foreground">
                          Your previous submission: "{t.submission}"
                        </div>
                      </div>
                      <Dialog open={open && submitForm.taskId === t.id} onOpenChange={(val) => { setOpen(val); if (val) setSubmitForm({ ...submitForm, taskId: t.id }); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-destructive text-white flex-shrink-0">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Resubmit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Resubmit Revised Work</DialogTitle></DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label>What did you revise?</Label>
                              <Textarea value={submitForm.work} onChange={(e) => setSubmitForm({ ...submitForm, work: e.target.value })} placeholder="Describe the changes you made..." rows={5} />
                            </div>
                            <DialogFooter>
                              <Button type="submit" className="w-full">Resubmit for Review</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Assigned Tasks */}
        <section>
          <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" /> Assigned Tasks
            {pendingTasks.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20 ml-1">{pendingTasks.length} open</Badge>
            )}
          </h2>
          {pendingTasks.length === 0 && submittedTasks.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              <ListTodo className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p>No tasks assigned yet. Your team leader will assign tasks from accepted projects.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {[...pendingTasks, ...submittedTasks].map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                const isSubmitted = t.status === "completed" && t.approved === undefined;

                return (
                  <Card key={t.id} className={`p-5 transition-base hover:shadow-elegant ${isSubmitted ? "border-status-progress/30 bg-status-progress/5" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${isSubmitted ? "bg-status-progress/10 text-status-progress" : "bg-primary/10 text-primary"}`}>
                            {isSubmitted ? <ClipboardCheck className="h-4 w-4" /> : <ListTodo className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{project?.title}</p>
                          </div>
                          <div className="ml-auto">
                            <StatusBadge status={isSubmitted ? "submitted" : t.status} />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold">{t.description}</h3>

                        {isSubmitted && t.submission && (
                          <div className="rounded-lg bg-background p-3 text-sm border border-border italic text-muted-foreground">
                            <p className="text-xs font-semibold text-status-progress mb-1 not-italic flex items-center gap-1">
                              <ClipboardCheck className="h-3.5 w-3.5" /> Your submission (pending leader review)
                            </p>
                            "{t.submission}"
                          </div>
                        )}
                      </div>

                      {!isSubmitted && (
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1.5 h-3.5 w-3.5" /> In progress
                          </div>
                          <Dialog open={open && submitForm.taskId === t.id} onOpenChange={(val) => { setOpen(val); if (val) setSubmitForm({ ...submitForm, taskId: t.id }); }}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow">
                                <Send className="mr-2 h-4 w-4" /> Submit Work
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Send className="h-5 w-5 text-primary" /> Submit Your Work
                                </DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="rounded-lg bg-secondary p-3">
                                  <p className="text-xs text-muted-foreground">Task</p>
                                  <p className="font-semibold">{t.description}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>What did you complete? *</Label>
                                  <Textarea
                                    value={submitForm.work}
                                    onChange={(e) => setSubmitForm({ ...submitForm, work: e.target.value })}
                                    placeholder="Describe your completed work in detail..."
                                    rows={5}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                                    <Send className="mr-1 h-4 w-4" /> Submit for Review
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Approved Work */}
        {approvedTasks.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2 text-status-completed">
              <Trophy className="h-5 w-5" /> Approved Work
            </h2>
            <div className="grid gap-3">
              {approvedTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <Card key={t.id} className="p-4 border-status-completed/30 bg-status-completed/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-status-completed/10 text-status-completed flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{t.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <FolderKanban className="h-3 w-3" /> {project?.title}
                        </p>
                      </div>
                      <Badge className="bg-status-completed/10 text-status-completed border-status-completed/20 flex-shrink-0">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
