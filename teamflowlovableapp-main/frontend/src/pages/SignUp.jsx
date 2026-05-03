import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowRight, Crown, Shield, UserCheck } from "lucide-react";
import { useStore } from "@/context/store";
import { useAuth, dashboardPathFor } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignUp() {
  const navigate = useNavigate();
  const { addUser } = useStore();
  const { login } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // default role
  const [busy, setBusy] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      return toast.error("Please fill all fields");
    }

    setBusy(true);
    try {
      // Create user in the database
      const userData = {
        name,
        email: email.toLowerCase(),
        password, // In a real app, hash this!
        role,
      };
      
      await addUser(userData);
      
      // Auto login after signup
      const u = await login(userData.email, userData.password);
      toast.success(`Account created! Welcome, ${u.name.split(" ")[0]}`);
      navigate(dashboardPathFor(u.role), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
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
            Join your team today.
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80">
            Create an account to start managing projects, leading teams, or completing tasks.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 TeamFlow</p>
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      </div>

      {/* Right: signup form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">
          
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TeamFlow</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Sign up to get started.</p>

          <form onSubmit={handleSignUp} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Select your role</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${role === 'admin' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
                >
                  <Crown className={`h-6 w-6 mb-2 ${role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-semibold">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('leader')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${role === 'leader' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
                >
                  <Shield className={`h-6 w-6 mb-2 ${role === 'leader' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-semibold">Leader</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${role === 'member' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
                >
                  <UserCheck className={`h-6 w-6 mb-2 ${role === 'member' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-semibold">Member</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-11 text-base font-semibold mt-4"
            >
              {busy ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" />
              ) : (
                <>Sign Up <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
