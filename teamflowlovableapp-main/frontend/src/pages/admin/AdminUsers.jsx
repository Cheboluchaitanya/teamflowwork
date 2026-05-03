import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/context/store";
import { useAuth } from "@/context/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Users, Shield, UserCheck,
  Trash2, Crown, User,
} from "lucide-react";
import { toast } from "sonner";

const ROLE_CONFIG = {
  admin:  { label: "Admin",        color: "bg-primary/10 text-primary border-primary/20",            Icon: Crown },
  leader: { label: "Team Leader",  color: "bg-status-progress/10 text-status-progress border-status-progress/20", Icon: Shield },
  member: { label: "Member",       color: "bg-status-completed/10 text-status-completed border-status-completed/20", Icon: UserCheck },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.member;
  return (
    <Badge className={`${cfg.color} flex items-center gap-1 border`}>
      <cfg.Icon className="h-3 w-3" /> {cfg.label}
    </Badge>
  );
}



export default function AdminUsers() {
  const { users, teams, addUser, deleteUser } = useStore();
  const { user: currentUser } = useAuth();

  const [open, setOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return toast.error("All fields are required");
    }
    if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      return toast.error("Email already in use");
    }
    addUser({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, role: form.role });
    toast.success(`${ROLE_CONFIG[form.role].label} account created!`);
    setForm({ name: "", email: "", password: "", role: "member" });
    setOpen(false);
  };

  const handleDelete = (u) => {
    if (u.id === currentUser?.id) return toast.error("You cannot delete your own account");
    if (u.role === "admin" && users.filter((x) => x.role === "admin").length === 1) {
      return toast.error("Cannot delete the last admin account");
    }
    deleteUser(u.id);
    toast.success("User removed");
  };

  const getTeamName = (userId) => {
    const team = teams.find((t) => t.leaderId === userId || t.members?.includes(userId));
    return team?.name ?? null;
  };

  const admins  = users.filter((u) => u.role === "admin");
  const leaders = users.filter((u) => u.role === "leader");
  const members = users.filter((u) => u.role === "member");

  const Section = ({ title, Icon, color, userList }) => (
    userList.length > 0 && (
      <section>
        <h2 className={`mb-4 text-lg font-semibold flex items-center gap-2 ${color}`}>
          <Icon className="h-5 w-5" /> {title}
          <span className="ml-1 text-sm font-normal text-muted-foreground">({userList.length})</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userList.map((u) => {
            const teamName = getTeamName(u.id);
            return (
              <Card key={u.id} className="p-5 transition-base hover:shadow-elegant">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm
                      ${u.role === "admin" ? "bg-gradient-primary text-primary-foreground" :
                        u.role === "leader" ? "bg-gradient-accent text-white" :
                        "bg-secondary text-muted-foreground"}`}>
                      {u.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      {teamName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> {teamName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <RoleBadge role={u.role} />
                    {u.id !== currentUser?.id && (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(u)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-mono">{u.email}</p>
              </Card>
            );
          })}
        </div>
      </section>
    )
  );

  return (
    <DashboardLayout title="User Management">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            Create and manage all user accounts. Leaders and members log in using the credentials you set here.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Create User Account
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="e.g. John Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email *</Label>
                <Input
                  type="email"
                  placeholder="e.g. john@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Password *</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Set their login password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button" variant="ghost" size="icon"
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-primary" /> Admin</div>
                    </SelectItem>
                    <SelectItem value="leader">
                      <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-status-progress" /> Team Leader</div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-status-completed" /> Member</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-secondary/80 p-3 text-xs text-muted-foreground">
                💡 Share the email and password with the user so they can log in at <strong>localhost:8080</strong>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                  <Plus className="mr-1 h-4 w-4" /> Create Account
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-10">
        <Section title="Admins" Icon={Crown} color="text-primary" userList={admins} />
        <Section title="Team Leaders" Icon={Shield} color="text-status-progress" userList={leaders} />
        <Section title="Members" Icon={UserCheck} color="text-status-completed" userList={members} />

        {users.length === 1 && (
          <Card className="p-10 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-medium">No other users yet</p>
            <p className="text-sm mt-1">Click "Add User" to create accounts for team leaders and members.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
