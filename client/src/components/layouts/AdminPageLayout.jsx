import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LOGO_URL, shellStyles } from "../../pages/admin/adminShared";

const Header = () => (
  <div style={{ background: "#2d7a3a", display: "flex", alignItems: "center", padding: "0 24px", height: 64, gap: 16 }}>
    <img
      src={LOGO_URL}
      alt="Barangay Iba logo"
      style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff" }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
    <div style={{ color: "#fff", marginRight: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>BARANGAY IBA</div>
      <div style={{ fontSize: 11, letterSpacing: 1 }}>SILANG, CAVITE</div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#aed9b6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#2d7a3a" }}>
        A
      </div>
      <div style={{ color: "#fff", textAlign: "right" }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>ADMIN</div>
        <div style={{ fontSize: 11 }}>ADMINISTRATOR</div>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <div style={{ background: "#2d7a3a", color: "#fff", padding: "24px 40px", marginTop: 40, display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <img
        src={LOGO_URL}
        alt="Barangay Iba logo"
        style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #fff" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div style={{ fontWeight: 800, letterSpacing: 1, fontSize: 13 }}>BARANGAY IBA</div>
      <div style={{ fontSize: 11 }}>SILANG, CAVITE</div>
    </div>
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Contact Us</div>
      <div style={{ fontSize: 13, lineHeight: 1.8 }}>
        Barangay IBA
        <br />
        Silang, Cavite, Philippines
        <br />
        Phone: +639123456789
        <br />
        Email: barangaylba@gmail.com
      </div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ background: "#1877f2", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
        f
      </div>
      <span style={{ fontSize: 13 }}>fb.com/BarangayIBAOfficialPage</span>
    </div>
  </div>
);

const getActivePage = (pathname) => {
  if (pathname === "/admin" || pathname === "/admin/") return "dashboard";
  const segment = pathname.split("/")[2];
  return segment || "dashboard";
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const active = getActivePage(location.pathname);
  const items = [
    { id: "dashboard", label: "Dashboard", to: "/admin" },
    { id: "residents", label: "Residents", to: "/admin/residents" },
    { id: "officials", label: "Officials", to: "/admin/officials" },
    { id: "clearances", label: "Users To Approve", to: "/admin/clearances" },
    { id: "complaints", label: "Complaints", to: "/admin/complaints" },
    { id: "settings", label: "Settings", to: "/admin/settings" },
    { id: "census", label: "Census", to: "/admin/census" },
    { id: "voting", label: "Voting Results", to: "/admin/voting" },
  ];

  return (
    <div style={{ width: 220, minHeight: "100%", background: "#fff", borderRight: "1px solid #e0e0e0", paddingTop: 12 }}>
      <div style={{ background: "#2d7a3a", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 16px", borderRadius: "0 0 4px 4px", margin: "0 8px 8px" }}>
        User Management
      </div>
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          end={item.id === "dashboard"}
          style={{
            display: "block",
            textDecoration: "none",
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: active === item.id ? 700 : 400,
            background: active === item.id ? "#2d7a3a" : "transparent",
            color: active === item.id ? "#fff" : "#333",
            borderRadius: 4,
            margin: "1px 6px",
          }}
        >
          {item.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/admin/login");
        }}
        style={{ border: "none", background: "transparent", padding: "10px 18px", cursor: "pointer", fontSize: 13, color: "#c0392b", display: "flex", alignItems: "center", gap: 8, margin: "1px 6px" }}
      >
        Logout
      </button>
    </div>
  );
};

const AdminPageLayout = () => (
  <div style={shellStyles.page}>
    <Header />
    <div style={shellStyles.body}>
      <Sidebar />
      <div style={shellStyles.main}>
        <Outlet />
      </div>
    </div>
    <Footer />
  </div>
);

export default AdminPageLayout;
