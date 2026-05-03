import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/context/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Users, Shield, UserCheck, Mail,
  Trash2, FolderKanban, Layers
} from "lucide-react";
import { toast } from "sonner";

export default function AdminTeams() {
  const { teams, users, projects, tasks, addTeam, deleteTeam } = useStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1=team name, 2=leader, 3=members
  const [teamName, setTeamName] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [memberNamesText, setMemberNamesText] = useState("");

  const resetForm = () => {
    setTeamName(""); setLeaderId(""); setMemberNamesText(""); setStep(1);
  };

  const close = () => { setOpen(false); resetForm(); };

  const availableLeaders = users.filter(u => u.role === "leader" && !u.teamId);
  const availableMembers = users.filter(u => u.role === "member" && !u.teamId);

  const nextStep = () => {
    if (step === 1 && !teamName.trim()) return toast.error("Enter a team name");
    if (step === 2 && !leaderId) return toast.error("Please select a leader");
    setStep(step + 1);
  };

  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!leaderId) return toast.error("Please select a leader");
    
    setBusy(true);
    try {
      const memberNames = memberNamesText.split('\n').filter(n => n.trim() !== '');
      await addTeam(teamName.trim(), leaderId, memberNames);
      toast.success(`✅ "${teamName}" created!`);
      close();
    } catch (err) {
      toast.error(`Failed to create team: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const toggleMember = (id) => {
    setMemberIds(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const steps = ["Team Name", "Leader", "Members"];

  return (
    <DashboardLayout title="Teams">
      <div className="mb-6 flex items-start justify-between gap-4">
        <p className="text-muted-foreground">
          Create teams by grouping existing users who have signed up as Leaders and Members.
        </p>
        <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Create New Team
              </DialogTitle>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center gap-2 py-1">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                    step > i + 1 ? "bg-status-completed text-white" :
                    step === i + 1 ? "bg-gradient-primary text-white" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs flex-1 ${step === i + 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
                </div>
              ))}
            </div>

            {/* Step 1: Team Name */}
            {step === 1 && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Team Name *</Label>
                  <Input
                    placeholder="e.g. Alpha Squad"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && nextStep()}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={nextStep} className="w-full bg-gradient-primary text-primary-foreground">
                    Next: Assign Leader →
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Step 2: Leader */}
            {step === 2 && (
              <div className="space-y-4 pt-2">
                <div className="rounded-lg bg-status-progress/5 border border-status-progress/20 p-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-status-progress flex-shrink-0" />
                  <p className="text-sm font-medium">Select the Team Leader for <strong>{teamName}</strong></p>
                </div>
                <div className="space-y-3">
                  <Label>Available Leaders *</Label>
                  {availableLeaders.length === 0 ? (
                    <div className="p-4 text-center rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground">
                      No available leaders found. Ask a user to sign up as a Leader first.
                    </div>
                  ) : (
                    <Select value={leaderId} onValueChange={setLeaderId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a leader..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLeaders.map(l => (
                          <SelectItem key={l.id} value={l.id}>{l.name} ({l.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                  <Button onClick={nextStep} disabled={!leaderId} className="bg-gradient-primary text-primary-foreground">
                    Next: Add Members →
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Step 3: Members */}
            {step === 3 && (
              <div className="space-y-4 pt-2">
                <div className="rounded-lg bg-status-completed/5 border border-status-completed/20 p-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-status-completed flex-shrink-0" />
                  <p className="text-sm font-medium">Add members to <strong>{teamName}</strong></p>
                </div>
                <div className="space-y-2">
                  <Label>Member Names (One per line)</Label>
                  <Textarea
                    placeholder="John Doe\nJane Smith\n..."
                    rows={6}
                    value={memberNamesText}
                    onChange={(e) => setMemberNamesText(e.target.value)}
                    className="font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    The system will automatically create accounts for these members. 
                    Default password will be <strong>password123</strong>.
                  </p>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                  <Button onClick={submit} disabled={busy} className="bg-gradient-primary text-primary-foreground">
                    {busy ? "Creating..." : <><Users className="mr-2 h-4 w-4" /> Create Team</>}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-12 w-12 opacity-20" />
          <p className="font-semibold text-base">No teams yet</p>
          <p className="text-sm mt-1">Click "Create Team" to set up your first team with a leader and members.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((t) => {
            const leaderUser = users.find((u) => u.id === t.leaderId);
            const memberUsers = users.filter((u) => t.members?.includes(u.id));
            const teamProjects = projects.filter((p) => p.teamId === t.id);
            const teamTasks = tasks.filter((tk) => teamProjects.some((p) => p.id === tk.projectId));
            const doneTasks = teamTasks.filter((tk) => tk.approved).length;

            return (
              <Card key={t.id} className="p-5 transition-base hover:shadow-elegant flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow font-bold text-lg">
                      {t.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{t.name}</h3>
                      <div className="flex gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[11px]">
                          <FolderKanban className="mr-1 h-3 w-3" />{teamProjects.length} projects
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          <Layers className="mr-1 h-3 w-3" />{doneTasks}/{teamTasks.length} tasks
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => { deleteTeam(t.id); toast.success("Team removed"); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Leader */}
                {leaderUser && (
                  <div className="rounded-xl border border-status-progress/20 bg-status-progress/5 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-status-progress" />
                      <span className="text-xs font-semibold text-status-progress uppercase tracking-wider">Team Leader</span>
                    </div>
                    <p className="font-semibold">{leaderUser.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Mail className="h-3 w-3"/>{leaderUser.email}</p>
                  </div>
                )}

                {/* Members */}
                {memberUsers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-status-completed" />
                      <span className="text-xs font-semibold text-status-completed uppercase tracking-wider">
                        Members ({memberUsers.length})
                      </span>
                    </div>
                    {memberUsers.map((m) => (
                      <div key={m.id} className="rounded-xl border border-border bg-background p-3 flex flex-col gap-1">
                        <p className="font-semibold text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3"/>{m.email}</p>
                      </div>
                    ))}
                  </div>
                )}

                {memberUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No members yet</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
