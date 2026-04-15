import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LandingPageLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const headerNav = [
    { name: "HOME", path: "/" },
    { name: "NEWS & ANNOUNCEMENT", path: "/news_and_announcement" },
    { name: "FUND TRANSPARENCY", path: "/fund_transparency" },
    { name: "OFFICIALS", path: "/officials" },
    { name: "SK", path: "/sangguniang_kabataan" },
    { name: "LIVE VOTING", path: "/voting-result" },
  ];

  return (
    <>
      {/* HEADER (OVERLAY) */}
      <header className="absolute top-0 left-0 w-full z-50 bg-[rgba(0,0,0,0.5)] border-b-2 border-green-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="logo" className="h-14 w-14" />
            <div>
              <h1 className="text-lg font-bold">BARANGAY IBA</h1>
              <h2 className="text-xs">SILANG, CAVITE</h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
          <ul className="flex flex-wrap gap-4 lg:justify-end text-sm font-semibold">
            {headerNav.map((nav, index) => (
              <li key={index}>
                <NavLink
                  to={nav.path}
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-green-400 pb-1"
                      : "hover:text-green-300"
                  }
                >
                  {nav.name}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            {isAuthenticated ? (
              <>
                <NavLink to="/portal" className="rounded-full bg-white px-4 py-2 font-semibold text-green-700">
                  {user?.firstName ? `${user.firstName}'s Portal` : "My Portal"}
                </NavLink>
                <button onClick={logout} className="rounded-full border border-white px-4 py-2 font-semibold text-white">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="rounded-full bg-white px-4 py-2 font-semibold text-green-700">
                  Login
                </NavLink>
                <NavLink to="/register" className="rounded-full border border-white px-4 py-2 font-semibold text-white">
                  Register
                </NavLink>
              </>
            )}
          </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="min-h-screen">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-green-600 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-20" />
            <p className="text-sm">BARANGAY IBA SILANG, CAVITE</p>
          </div>
                    {/* QUICK LINKS */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-green-100">
              <li>
                <NavLink to="/help-center" className="hover:text-white transition">
                  Help Center
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms-of-use" className="hover:text-white transition">
                  Terms of Use
                </NavLink>
              </li>
              <li>
                <NavLink to="/privacy-policy" className="hover:text-white transition">
                  Privacy Policy
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="text-sm">
            <p>Contact Us</p>
            <p>Barangay Iba, Silang, Cavite</p>
            <p>Phone: 639123456789</p>
            <p>Email: barangayiba@gmail.com</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPageLayout;
