import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  LogOut, Sparkles, Shield,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

const NAV_BY_ROLE = {
  admin: [
    { to: "/admin",          label: "Overview",  icon: LayoutDashboard },
    { to: "/admin/teams",    label: "Teams",     icon: Users },
    { to: "/admin/projects", label: "Projects",  icon: FolderKanban },
  ],
  leader: [
    { to: "/leader", label: "My Dashboard", icon: LayoutDashboard },
  ],
  member: [
    { to: "/member", label: "My Tasks", icon: CheckSquare },
  ],
};

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const nav = NAV_BY_ROLE[user?.role ?? "member"] ?? [];

  const roleColors = {
    admin:  "bg-gradient-primary",
    leader: "bg-gradient-accent",
    member: "bg-secondary",
  };

  const RoleIcon = {
    admin: Shield,
    leader: Shield,
    member: Users,
  }[user?.role] ?? Users;

  return (
    <div className="flex min-h-screen w-full bg-mesh">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/80 backdrop-blur md:flex md:flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">TeamFlow</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role} workspace</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-base",
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
              roleColors[user?.role] ?? "bg-secondary",
              user?.role === "member" ? "text-muted-foreground" : "text-white"
            )}>
              {user?.name?.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline" size="sm" className="w-full"
            onClick={() => { logout(); navigate("/login"); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card/60 px-6 py-4 backdrop-blur">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 animate-fade-in p-6">{children}</main>
      </div>
    </div>
  );
}
