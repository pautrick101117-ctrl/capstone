import { Outlet, NavLink } from "react-router-dom";

const LandingPageLayout = () => {
  const headerNav = [
    { name: "HOME", path: "/" },
    { name: "NEWS & ANNOUNCEMENT", path: "/news_and_announcement" },
    { name: "FUND TRANSPARENCY", path: "/fund_transparency" },
    { name: "OFFICIALS", path: "/officials" },
    { name: "SK", path: "/sangguniang_kabataan" },
    { name: "LOGIN", path: "/login" },
  ];

  return (
    <>
      {/* HEADER (OVERLAY) */}
      <header className="absolute top-0 left-0 w-full z-50 bg-[rgba(0,0,0,0.5)] border-b-2 border-green-400 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="logo" className="h-14 w-14" />
            <div>
              <h1 className="text-lg font-bold">BARANGAY IBA</h1>
              <h2 className="text-xs">SILANG, CAVITE</h2>
            </div>
          </div>

          <ul className="flex gap-8 text-sm font-semibold">
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
        </div>
      </header>

      {/* MAIN */}
      <main className="min-h-screen">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-green-600 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-20" />
            <p className="text-sm">BARANGAY IBA SILANG, CAVITE</p>
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