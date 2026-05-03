import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowRight, Crown, Shield, UserCheck } from "lucide-react";
import { useAuth, dashboardPathFor } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  {
    label: "Admin",
    email: "admin@teamflow.app",
    password: "admin123",
    role: "admin",
    icon: Crown,
    color: "bg-gradient-primary text-primary-foreground",
    desc: "Manage teams, projects & monitor progress",
  },
  {
    label: "Team Leader",
    email: "leader@teamflow.app",
    password: "leader123",
    role: "leader",
    icon: Shield,
    color: "bg-gradient-accent text-white",
    desc: "Accept projects, assign tasks & review work",
  },
  {
    label: "Team Member",
    email: "member@teamflow.app",
    password: "member123",
    role: "member",
    icon: UserCheck,
    color: "bg-secondary text-foreground",
    desc: "Complete tasks & submit your work",
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(null);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) return toast.error("Please enter email and password");
    
    setBusy(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
      navigate(dashboardPathFor(u.role), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const fillAndLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setActive(acc.role);
    
    // Auto-login for convenience, but the fields are now visible
    setBusy(true);
    try {
      const u = await login(acc.email, acc.password);
      navigate(dashboardPathFor(u.role), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-mesh">
      {/* Left: brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          <span className="text-xl font-bold">TeamFlow</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            Where teams ship work that matters.
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80">
            Plan projects, assign tasks, and track progress — all in one vibrant workspace.
          </p>
          <div className="mt-10 space-y-3">
            {[
              { step: "1", text: "Admin creates projects & assigns to teams" },
              { step: "2", text: "Leader accepts & breaks into tasks" },
              { step: "3", text: "Members complete & submit work" },
              { step: "4", text: "Leader reviews, admin monitors everything" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold flex-shrink-0">
                  {s.step}
                </div>
                {s.text}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 TeamFlow</p>
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      {/* Right: login form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TeamFlow</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-muted-foreground">Enter your credentials or choose a role.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Full Name</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin@teamflow.app or John Doe"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setActive(null); }}
                required
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setActive(null); }}
                required
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-11 text-base font-semibold"
            >
              {busy ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" />
              ) : (
                <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">Or quick login as</span>
            </div>
          </div>

          <div className="grid gap-3">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isActive = active === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  disabled={busy}
                  onClick={() => fillAndLogin(acc)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 hover:shadow-elegant ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-elegant"
                      : "border-border bg-card hover:border-primary/50"
                  } disabled:opacity-60`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${acc.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{acc.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{acc.desc}</p>
                  </div>
                  {isActive && (
                    <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
