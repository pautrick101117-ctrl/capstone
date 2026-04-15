import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UserPortalLayout = () => {
  const { user, logout, notifications } = useAuth();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      <header className="bg-green-700 text-white shadow">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Barangay Iba" className="h-12 w-12 rounded-full bg-white p-1" />
            <div>
              <p className="text-lg font-bold uppercase tracking-wide">Barangay Iba Portal</p>
              <p className="text-xs uppercase tracking-[0.2em] text-green-100">Resident Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1">{user?.firstName} {user?.lastName}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{notifications.length} notifications</span>
            <button onClick={logout} className="rounded-full bg-white px-4 py-2 font-semibold text-green-700">
              Logout
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 pb-4 text-sm font-semibold">
          {[
            ["Dashboard", "/portal"],
            ["Vote", "/voting-center"],
            ["Live Results", "/voting-result"],
          ].map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/portal"}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${isActive ? "bg-white text-green-700" : "bg-white/10 text-white hover:bg-white/20"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserPortalLayout;
