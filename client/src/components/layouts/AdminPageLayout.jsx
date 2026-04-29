import {
  BadgePlus,
  Banknote,
  BellRing,
  CalendarDays,
  ClipboardList,
  Gauge,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  Vote,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/residents", label: "Residents", icon: Users },
  { to: "/admin/requests", label: "Requests", icon: ClipboardList },
  { to: "/admin/officials", label: "Officials", icon: Landmark },
  { to: "/admin/news", label: "News", icon: BadgePlus },
  { to: "/admin/announcements", label: "Announcements", icon: BellRing },
  { to: "/admin/funds", label: "Funds", icon: Banknote },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/voting", label: "Voting", icon: Vote },
  { to: "/admin/census", label: "Census", icon: Gauge },
];

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    isActive ? "bg-[var(--brand-500)] text-white shadow-lg shadow-emerald-900/15" : "text-stone-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)]"
  }`;

const AdminPageLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-2xl border border-stone-200 p-2 lg:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <img src="/logo.png" alt="Barangay Iba" className="h-12 w-12 rounded-2xl border border-[var(--brand-100)] bg-white p-1" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-500)]">Admin Portal</p>
              <h1 className="text-xl font-black text-[var(--brand-900)]">{user?.fullName || "Barangay Admin"}</h1>
            </div>
          </div>
          <Button variant="secondary" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="section-shell flex gap-8 py-8">
        <aside className={`${open ? "fixed inset-0 z-40 bg-black/20 lg:static lg:bg-transparent" : "hidden lg:block"} lg:w-72`}>
          <div className={`${open ? "absolute left-4 top-4 h-[calc(100vh-2rem)] w-72" : ""} rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm`}>
            <div className="mb-6">
              <p className="text-sm font-semibold text-stone-500">Navigation</p>
              <h2 className="text-lg font-bold text-[var(--brand-900)]">Administrative tools</h2>
            </div>
            <nav className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end} className={itemClass} onClick={() => setOpen(false)}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPageLayout;
