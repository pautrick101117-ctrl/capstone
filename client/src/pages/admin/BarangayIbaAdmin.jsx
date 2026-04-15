import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const LOGO_URL =
  "https://raw.githubusercontent.com/pautrick101117-ctrl/capstone/HEAD/client/public/logo.png";

const MOCK = {
  stats: { residents: 18224, officials: 15, pendingClearance: 9, complaints: 4 },
  residents: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: [
      "Maria Santos",
      "Juan dela Cruz",
      "Ana Reyes",
      "Pedro Bautista",
      "Rosa Mendoza",
      "Carlo Villanueva",
      "Liza Aquino",
      "Raul Castillo",
      "Jenny Flores",
      "Mark Ramos",
      "Christine Diaz",
      "Allan Torres",
    ][i],
    age: [25, 32, 45, 28, 61, 19, 37, 52, 23, 41, 30, 55][i],
    gender: ["Female", "Male", "Female", "Male", "Female", "Male", "Female", "Male", "Female", "Male", "Female", "Male"][i],
    household: [
      "Santos HH",
      "Dela Cruz HH",
      "Reyes HH",
      "Bautista HH",
      "Mendoza HH",
      "Villanueva HH",
      "Aquino HH",
      "Castillo HH",
      "Flores HH",
      "Ramos HH",
      "Diaz HH",
      "Torres HH",
    ][i],
    contact: `0917${String(1000000 + i * 111111).slice(0, 7)}`,
  })),
  officials: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: [
      "Brgy. Capt. Jose Magtoto",
      "Kagawad Maria Lim",
      "Kagawad Roberto Cruz",
      "Kagawad Elena Gomez",
      "Kagawad Felix Dela Vega",
      "Kagawad Perla Navarro",
      "SK Chair Kevin Alvarez",
      "Treasurer Diana Ocampo",
    ][i],
    position: [
      "Barangay Captain",
      "Kagawad",
      "Kagawad",
      "Kagawad",
      "Kagawad",
      "Kagawad",
      "SK Chairperson",
      "Treasurer",
    ][i],
    term: "2023-2026",
    contact: `0918${String(2000000 + i * 123456).slice(0, 7)}`,
  })),
  clearances: Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1).padStart(3, "0"),
    name: [
      "Maria Santos",
      "Juan dela Cruz",
      "Ana Reyes",
      "Pedro Bautista",
      "Rosa Mendoza",
      "Carlo Villanueva",
      "Liza Aquino",
      "Raul Castillo",
      "Jenny Flores",
      "Mark Ramos",
    ][i],
    type: [
      "Business Permit",
      "Barangay ID",
      "Barangay Clearance",
      "Cedula",
      "Business Permit",
      "Barangay ID",
      "Barangay Clearance",
      "Business Permit",
      "Cedula",
      "Barangay ID",
    ][i],
    requestDate: `08-${String(10 + i).padStart(2, "0")}-2026`,
    issuedDate: `08-${String(11 + i).padStart(2, "0")}-2026`,
    status: ["Approved", "Disapproved", "Pending", "Approved", "Disapproved", "Approved", "Pending", "Approved", "Disapproved", "Pending"][i],
  })),
  complaints: Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1).padStart(3, "0"),
    name: [
      "Maria Santos",
      "Juan dela Cruz",
      "Ana Reyes",
      "Pedro Bautista",
      "Rosa Mendoza",
      "Carlo Villanueva",
      "Liza Aquino",
      "Raul Castillo",
    ][i],
    type: [
      "Noise Disturbance",
      "Garbage Disposal",
      "Road Obstruction",
      "Noise Disturbance",
      "Illegal Parking",
      "Garbage Disposal",
      "Stray Animals",
      "Road Obstruction",
    ][i],
    date: "08-24-2026",
    status: ["Pending", "Resolved", "Pending", "Resolved", "Pending", "Resolved", "Pending", "Resolved"][i],
  })),
  census: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: [
      "Santos Household",
      "Dela Cruz Household",
      "Reyes Household",
      "Bautista Household",
      "Mendoza Household",
      "Villanueva Household",
      "Aquino Household",
      "Castillo Household",
    ][i],
    purok: `Purok ${(i % 5) + 1}`,
    members: [6, 4, 9, 3, 7, 5, 8, 4][i],
    houseNo: `#${70 + i}`,
    status: ["Active", "Active", "For Update", "Active", "For Update", "Active", "Active", "For Update"][i],
    updated: "08-24-2026",
  })),
  votingResults: {
    title: "Priority Infrastructure Project",
    options: [
      { name: "Baradong Kanal", votes: 300 },
      { name: "Sirang Daan", votes: 90 },
    ],
    total: 390,
  },
  activityLogs: [
    { msg: "Administrator generated a report", time: "5 mins ago" },
    { msg: "Admin updated portal settings", time: "12 mins ago" },
    { msg: "New clearance request approved", time: "20 mins ago" },
    { msg: "Resident record updated", time: "1 hr ago" },
  ],
};

const shellStyles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f4",
    fontFamily: '"Segoe UI", sans-serif',
  },
  body: {
    display: "flex",
    minHeight: "calc(100vh - 64px)",
  },
  main: {
    flex: 1,
    padding: "28px 32px",
    minWidth: 0,
  },
  card: {
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #e0e0e0",
    padding: 20,
  },
};

const GreenBtn = ({ children, onClick, small, danger, outline, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    style={{
      background: danger ? "#c0392b" : outline ? "transparent" : "#2d7a3a",
      color: danger || !outline ? "#fff" : "#2d7a3a",
      border: outline ? "1px solid #2d7a3a" : "none",
      borderRadius: 5,
      padding: small ? "4px 12px" : "8px 20px",
      fontWeight: 600,
      fontSize: small ? 12 : 13,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </button>
);

const StatusBadge = ({ status }) => {
  const map = {
    Approved: ["#1a7a3a", "#e6f7ed"],
    Disapproved: ["#c0392b", "#fdeaea"],
    Pending: ["#c0392b", "#fdeaea"],
    Resolved: ["#1a7a3a", "#e6f7ed"],
    Active: ["#1a7a3a", "#e6f7ed"],
    "For Update": ["#3a5fb0", "#e6eeff"],
  };
  const [fg, bg] = map[status] || ["#555", "#eee"];

  return (
    <span
      style={{
        background: bg,
        color: fg,
        borderRadius: 4,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
};

const Table = ({ cols, rows, renderRow }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#e8e8e8" }}>
          {cols.map((col) => (
            <th
              key={col}
              style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#444" }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
            {renderRow(row, i)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Paginate = ({ total, perPage, page, setPage }) => {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 12,
        fontSize: 13,
        color: "#555",
        flexWrap: "wrap",
      }}
    >
      <span>
        Showing {start} to {end} of {total} entries
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        <span onClick={() => setPage(Math.max(1, page - 1))} style={{ cursor: "pointer", padding: "2px 8px" }}>
          Previous
        </span>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
          <span
            key={p}
            onClick={() => setPage(p)}
            style={{
              cursor: "pointer",
              padding: "2px 8px",
              background: p === page ? "#2d7a3a" : "transparent",
              color: p === page ? "#fff" : "#333",
              borderRadius: 3,
            }}
          >
            {p}
          </span>
        ))}
        <span onClick={() => setPage(Math.min(pages, page + 1))} style={{ cursor: "pointer", padding: "2px 8px" }}>
          Next
        </span>
      </div>
    </div>
  );
};

const SearchBar = ({ value, onChange }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#f5f5f5",
      borderRadius: 6,
      padding: "6px 12px",
      width: "min(220px, 100%)",
      marginBottom: 16,
    }}
  >
    <span style={{ color: "#888", fontSize: 14 }}>Search</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
      style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, width: "100%" }}
    />
  </div>
);

const useAdminCollection = (path, key, fallback = []) => {
  const { token } = useAuth();
  const [items, setItems] = useState(fallback);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api(path, { token });
      setItems(data[key] || fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  return { items, setItems, loading, reload: load, token };
};

const SmallInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{ background: "#f5f5f5", border: "1px solid #d8d8d8", borderRadius: 6, padding: "8px 10px", fontSize: 13, width: "100%" }}
  />
);

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
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#aed9b6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: "#2d7a3a",
        }}
      >
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
  <div
    style={{
      background: "#2d7a3a",
      color: "#fff",
      padding: "24px 40px",
      marginTop: 40,
      display: "flex",
      gap: 40,
      alignItems: "flex-start",
      flexWrap: "wrap",
    }}
  >
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
      <div
        style={{
          background: "#1877f2",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
        }}
      >
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
    { id: "clearances", label: "Clearances", to: "/admin/clearances" },
    { id: "complaints", label: "Complaints", to: "/admin/complaints" },
    { id: "settings", label: "Settings", to: "/admin/settings" },
    { id: "census", label: "Census", to: "/admin/census" },
    { id: "voting", label: "Voting Results", to: "/admin/voting" },
  ];

  return (
    <div style={{ width: 220, minHeight: "100%", background: "#fff", borderRight: "1px solid #e0e0e0", paddingTop: 12 }}>
      <div
        style={{
          background: "#2d7a3a",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          padding: "10px 16px",
          borderRadius: "0 0 4px 4px",
          margin: "0 8px 8px",
        }}
      >
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
        style={{
          border: "none",
          background: "transparent",
          padding: "10px 18px",
          cursor: "pointer",
          fontSize: 13,
          color: "#c0392b",
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "1px 6px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div style={{ background: "#2d7a3a", color: "#fff", borderRadius: 6, padding: "12px 20px", minWidth: 150, flex: 1 }}>
    <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 700 }}>{typeof value === "number" && value > 100 ? value.toLocaleString() : value}</div>
  </div>
);

export const AdminLayoutShell = () => (
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

export const AdminLoginPage = () => {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("admin");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, loading, isAuthenticated, user: authUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && ["super_admin", "staff"].includes(authUser?.role)) {
      navigate("/admin");
    }
  }, [isAuthenticated, authUser, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#4caf50 0%,#1b5e20 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <img
        src={LOGO_URL}
        alt="Barangay Iba logo"
        style={{ width: 90, height: 90, borderRadius: "50%", border: "3px solid #fff", marginBottom: 8 }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div style={{ fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: 2 }}>BARANGAY IBA</div>
      <div style={{ fontSize: 13, color: "#e8f5e9", letterSpacing: 2, marginBottom: 24 }}>SILANG, CAVITE</div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            await login({
              usernameOrEmail: user,
              password: pass,
              adminOnly: true,
            });
            navigate("/admin");
          } catch (err) {
            setError(err.message);
          }
        }}
        style={{ background: "#fff", borderRadius: 8, width: "100%", maxWidth: 420, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      >
        <div style={{ background: "#1a5c25", color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 16, padding: "14px 0", letterSpacing: 2 }}>
          ADMIN LOGIN
        </div>
        <div style={{ padding: "28px 36px" }}>
          {error ? (
            <div style={{ marginBottom: 12, borderRadius: 6, background: "#fdeaea", color: "#c0392b", padding: "10px 12px", fontSize: 13 }}>
              {error}
            </div>
          ) : null}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#ddd",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: "#888",
            }}
          >
            A
          </div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Username</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0f0f0", borderRadius: 5, padding: "8px 12px", margin: "6px 0 14px" }}>
            <input value={user} onChange={(e) => setUser(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1 }} />
          </div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Password</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0f0f0", borderRadius: 5, padding: "8px 12px", margin: "6px 0 14px" }}>
            <input type={show ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1 }} />
            <button type="button" onClick={() => setShow(!show)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#888", fontSize: 12 }}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 20 }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: "#2d7a3a" }} />
            Remember Me
          </label>
          <GreenBtn type="submit">{loading ? "LOGGING IN..." : "LOGIN"}</GreenBtn>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#2d7a3a", cursor: "pointer" }}>Forgot Password?</div>
        </div>
        <div style={{ background: "#1a5c25", color: "#fff", display: "flex", justifyContent: "space-around", padding: "14px 20px", fontSize: 12, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600 }}>Barangay Iba Silang, Cavite</div>
            <div>fb.com/BarangayIBAOfficialPage</div>
          </div>
          <div>
            <div>+63 1234567890</div>
            <div>barangaylba@gmail.com</div>
          </div>
        </div>
      </form>
    </div>
  );
};

export const DashboardPage = () => {
  const { stats, residents, activityLogs } = MOCK;
  const [liveStats, setLiveStats] = useState(stats);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    api("/admin/dashboard", { token })
      .then((data) => {
        if (data.stats) {
          setLiveStats((prev) => ({ ...prev, ...data.stats }));
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Total Residents" value={liveStats.residents} />
        <StatCard label="Appointed Officials" value={liveStats.officials} />
        <StatCard label="Pending Users" value={liveStats.pendingUsers || liveStats.pendingClearance} />
        <StatCard label="Total Complaints" value={liveStats.complaints} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div style={{ ...shellStyles.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Resident Information</div>
          <SearchBar value="" onChange={() => {}} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                {["#", "Resident", "Age", "Household", "Contact"].map((col) => (
                  <th key={col} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {residents.slice(0, 5).map((resident, i) => (
                <tr key={resident.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "6px 8px" }}>{i + 1}.</td>
                  <td style={{ padding: "6px 8px" }}>{resident.name}</td>
                  <td style={{ padding: "6px 8px" }}>{resident.age}</td>
                  <td style={{ padding: "6px 8px" }}>{resident.household}</td>
                  <td style={{ padding: "6px 8px" }}>{resident.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Showing 1 to 5 of 50 entries</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...shellStyles.card, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Recent Complaints</div>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "5px 8px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "5px 8px", textAlign: "left" }}>Complaint</th>
                  <th style={{ padding: "5px 8px", textAlign: "left" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK.complaints.slice(0, 4).map((complaint) => (
                  <tr key={complaint.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "5px 8px" }}>{complaint.date}</td>
                    <td style={{ padding: "5px 8px" }}>{complaint.name}</td>
                    <td style={{ padding: "5px 8px" }}>
                      <GreenBtn small>View</GreenBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontSize: 12, color: "#2d7a3a", marginTop: 6, cursor: "pointer" }}>View All</div>
          </div>

          <div style={{ ...shellStyles.card, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Activity Logs</div>
            {activityLogs.map((log) => (
              <div key={log.msg} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#c8e6c9", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  OK
                </span>
                <span style={{ flex: 1 }}>{log.msg}</span>
                <span style={{ color: "#999" }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 20 }}>
        <div style={{ ...shellStyles.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Barangay Officials
            <span style={{ background: "#e0e0e0", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              &gt;
            </span>
          </div>
          {MOCK.officials.slice(0, 2).map((official) => (
            <div key={official.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                OF
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{official.name}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{official.position}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{official.contact}</div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <GreenBtn small>View All</GreenBtn>
          </div>
        </div>

        <div style={{ ...shellStyles.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Clearance Requests</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            {["Business Permit", "Barangay Clearance", "Cedula"].map((type) => (
              <div key={type} style={{ background: "#e8f5e9", color: "#2d7a3a", borderRadius: 4, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
                {type}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#2d7a3a", cursor: "pointer" }}>View All</div>
          <div style={{ background: "#f0faf2", borderRadius: 6, padding: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Landing Page Editor</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
              Manage and update the content displayed on the Barangay website&apos;s landing page.
            </div>
            <GreenBtn small>Edit Landing Page</GreenBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResidentsPage = () => {
  const { items: residents, loading, reload, token } = useAdminCollection("/admin/users", "users", []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const filtered = residents
    .filter((resident) => resident.role === "resident")
    .filter((resident) =>
      `${resident.first_name} ${resident.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      resident.email.toLowerCase().includes(search.toLowerCase())
    );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const updateResident = async (residentId, updates) => {
    await api(`/admin/users/${residentId}`, {
      method: "PATCH",
      token,
      body: updates,
    });
    await reload();
  };

  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a", marginBottom: 16 }}>Residents</div>
      <div style={shellStyles.card}>
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Table
          cols={["#", "Name", "Email", "Address", "Contact", "Status", "Actions"]}
          rows={paged}
          renderRow={(resident, i) => (
            <>
              <td style={{ padding: "10px 10px" }}>{(page - 1) * perPage + i + 1}.</td>
              <td style={{ padding: "10px 10px" }}>{resident.first_name} {resident.last_name}</td>
              <td style={{ padding: "10px 10px" }}>{resident.email}</td>
              <td style={{ padding: "10px 10px" }}>{resident.address || "-"}</td>
              <td style={{ padding: "10px 10px" }}>{resident.contact_number || "-"}</td>
              <td style={{ padding: "10px 10px" }}><StatusBadge status={resident.status === "approved" ? "Approved" : resident.status === "pending" ? "Pending" : resident.status} /></td>
              <td style={{ padding: "10px 10px" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <GreenBtn small onClick={() => updateResident(resident.id, { status: "approved" })}>Approve</GreenBtn>
                  <GreenBtn small outline onClick={() => updateResident(resident.id, { status: "pending" })}>Pending</GreenBtn>
                  <GreenBtn small danger onClick={() => updateResident(resident.id, { status: "rejected" })}>Reject</GreenBtn>
                </div>
              </td>
            </>
          )}
        />
        {loading ? <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>Loading residents...</div> : null}
        <Paginate total={filtered.length} perPage={perPage} page={page} setPage={setPage} />
      </div>
    </div>
  );
};

export const OfficialsPage = () => {
  const { items: officials, loading, reload, token } = useAdminCollection("/admin/officials", "officials", []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", position: "", term: "2023-2026", contact: "", status: "active" });
  const perPage = 5;
  const filtered = officials.filter((official) => official.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const saveOfficial = async (official) => {
    if (official.id) {
      await api(`/admin/officials/${official.id}`, { method: "PATCH", token, body: official });
    } else {
      await api("/admin/officials", { method: "POST", token, body: official });
    }
    setForm({ name: "", position: "", term: "2023-2026", contact: "", status: "active" });
    await reload();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Officials</div>
        <GreenBtn onClick={() => saveOfficial(form)}>Add New Official</GreenBtn>
      </div>
      <div style={shellStyles.card}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
          <SmallInput value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Official name" />
          <SmallInput value={form.position} onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))} placeholder="Position" />
          <SmallInput value={form.term} onChange={(e) => setForm((prev) => ({ ...prev, term: e.target.value }))} placeholder="Term" />
          <SmallInput value={form.contact} onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))} placeholder="Contact" />
        </div>
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Table
          cols={["#", "Name", "Position", "Term", "Contact", "Status"]}
          rows={paged}
          renderRow={(official, i) => (
            <>
              <td style={{ padding: "10px 10px" }}>{(page - 1) * perPage + i + 1}.</td>
              <td style={{ padding: "10px 10px" }}>{official.name}</td>
              <td style={{ padding: "10px 10px" }}>{official.position}</td>
              <td style={{ padding: "10px 10px" }}>{official.term}</td>
              <td style={{ padding: "10px 10px" }}>{official.contact}</td>
              <td style={{ padding: "10px 10px" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <GreenBtn small onClick={() => setForm({ id: official.id, name: official.name, position: official.position, term: official.term, contact: official.contact, status: official.status || "active" })}>Edit</GreenBtn>
                  <GreenBtn small danger onClick={() => api(`/admin/officials/${official.id}`, { method: "PATCH", token, body: { status: official.status === "active" ? "inactive" : "active" } }).then(reload)}>Toggle</GreenBtn>
                </div>
              </td>
            </>
          )}
        />
        {loading ? <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>Loading officials...</div> : null}
        <Paginate total={filtered.length} perPage={perPage} page={page} setPage={setPage} />
      </div>
    </div>
  );
};

export const ClearancesPage = () => {
  const { items: clearances, loading, reload, token } = useAdminCollection("/admin/clearances", "clearances", []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ resident_name: "", type: "Barangay Clearance", status: "pending" });
  const perPage = 5;
  const filtered = clearances.filter(
    (clearance) =>
      clearance.resident_name.toLowerCase().includes(search.toLowerCase()) ||
      clearance.type.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const saveClearance = async () => {
    await api("/admin/clearances", {
      method: "POST",
      token,
      body: {
        resident_name: form.resident_name,
        type: form.type,
        status: form.status,
        request_date: new Date().toISOString().slice(0, 10),
      },
    });
    setForm({ resident_name: "", type: "Barangay Clearance", status: "pending" });
    await reload();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Clearances</div>
        <GreenBtn onClick={saveClearance}>Add Clearance</GreenBtn>
      </div>
      <div style={shellStyles.card}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
          <SmallInput value={form.resident_name} onChange={(e) => setForm((prev) => ({ ...prev, resident_name: e.target.value }))} placeholder="Resident name" />
          <SmallInput value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} placeholder="Clearance type" />
        </div>
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Table
          cols={["ID", "Name", "Type", "Request Date", "Issued Date", "Status"]}
          rows={paged}
          renderRow={(clearance) => (
            <>
              <td style={{ padding: "10px 10px" }}>{String(clearance.id).slice(0, 8)}</td>
              <td style={{ padding: "10px 10px" }}>{clearance.resident_name}</td>
              <td style={{ padding: "10px 10px" }}>{clearance.type}</td>
              <td style={{ padding: "10px 10px" }}>{clearance.request_date}</td>
              <td style={{ padding: "10px 10px" }}>{clearance.issued_date || "-"}</td>
              <td style={{ padding: "10px 10px" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <StatusBadge status={clearance.status === "approved" ? "Approved" : clearance.status === "pending" ? "Pending" : "Disapproved"} />
                  <GreenBtn small onClick={() => api(`/admin/clearances/${clearance.id}`, { method: "PATCH", token, body: { status: "approved", issued_date: new Date().toISOString().slice(0, 10) } }).then(reload)}>Approve</GreenBtn>
                </div>
              </td>
            </>
          )}
        />
        {loading ? <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>Loading clearances...</div> : null}
        <Paginate total={filtered.length} perPage={perPage} page={page} setPage={setPage} />
      </div>
    </div>
  );
};

export const ComplaintsPage = () => {
  const { items: complaints, loading, reload, token } = useAdminCollection("/admin/complaints", "complaints", []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ resident_name: "", complaint_type: "", details: "", status: "pending" });
  const perPage = 5;
  const filtered = complaints.filter(
    (complaint) =>
      complaint.resident_name.toLowerCase().includes(search.toLowerCase()) ||
      complaint.complaint_type.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const total = complaints.length;
  const resolved = complaints.filter((complaint) => complaint.status === "resolved").length;
  const pending = complaints.filter((complaint) => complaint.status === "pending").length;

  const saveComplaint = async () => {
    await api("/admin/complaints", { method: "POST", token, body: form });
    setForm({ resident_name: "", complaint_type: "", details: "", status: "pending" });
    await reload();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Complaints</div>
        <GreenBtn onClick={saveComplaint}>Add Complaint</GreenBtn>
      </div>
      <div style={{ ...shellStyles.card, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
          <SmallInput value={form.resident_name} onChange={(e) => setForm((prev) => ({ ...prev, resident_name: e.target.value }))} placeholder="Resident name" />
          <SmallInput value={form.complaint_type} onChange={(e) => setForm((prev) => ({ ...prev, complaint_type: e.target.value }))} placeholder="Complaint type" />
        </div>
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Table
          cols={["ID", "Resident", "Type", "Date Filed", "Status"]}
          rows={paged}
          renderRow={(complaint) => (
            <>
              <td style={{ padding: "8px 10px" }}>{String(complaint.id).slice(0, 8)}</td>
              <td style={{ padding: "8px 10px" }}>{complaint.resident_name}</td>
              <td style={{ padding: "8px 10px" }}>{complaint.complaint_type}</td>
              <td style={{ padding: "8px 10px" }}>{new Date(complaint.created_at).toLocaleDateString()}</td>
              <td style={{ padding: "8px 10px" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <StatusBadge status={complaint.status === "resolved" ? "Resolved" : "Pending"} />
                  <GreenBtn small onClick={() => api(`/admin/complaints/${complaint.id}`, { method: "PATCH", token, body: { status: complaint.status === "resolved" ? "pending" : "resolved" } }).then(reload)}>Toggle</GreenBtn>
                </div>
              </td>
            </>
          )}
        />
        {loading ? <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>Loading complaints...</div> : null}
        <Paginate total={filtered.length} perPage={perPage} page={page} setPage={setPage} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[`${total} Total Complaints`, `${resolved} Resolved Complaints`, `${pending} Pending Complaints`].map((label) => (
          <div key={label} style={{ background: "#2d7a3a", color: "#fff", borderRadius: 6, padding: "12px 24px", fontWeight: 600, fontSize: 14 }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CensusPage = () => {
  const { items: census, loading, reload, token } = useAdminCollection("/admin/census_households", "census_households", []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ household_name: "", purok: "", members: 1, house_number: "", status: "active" });
  const perPage = 5;
  const filtered = census.filter((item) => item.household_name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalMembers = census.reduce((sum, item) => sum + Number(item.members || 0), 0);

  const saveHousehold = async () => {
    await api("/admin/census_households", { method: "POST", token, body: form });
    setForm({ household_name: "", purok: "", members: 1, house_number: "", status: "active" });
    await reload();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Census Data Management</div>
        <GreenBtn onClick={saveHousehold}>Add New Household</GreenBtn>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          ["Total Households", census.length.toString()],
          ["Total Residents", totalMembers.toString()],
          ["For Update", census.filter((item) => item.status === "for update").length.toString()],
          ["Puroks", [...new Set(census.map((item) => item.purok))].length.toString()],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#2d7a3a", color: "#fff", borderRadius: 6, padding: "10px 18px", flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 11, opacity: 0.85 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={shellStyles.card}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
          <SmallInput value={form.household_name} onChange={(e) => setForm((prev) => ({ ...prev, household_name: e.target.value }))} placeholder="Household name" />
          <SmallInput value={form.purok} onChange={(e) => setForm((prev) => ({ ...prev, purok: e.target.value }))} placeholder="Purok" />
          <SmallInput type="number" value={form.members} onChange={(e) => setForm((prev) => ({ ...prev, members: Number(e.target.value) }))} placeholder="Members" />
          <SmallInput value={form.house_number} onChange={(e) => setForm((prev) => ({ ...prev, house_number: e.target.value }))} placeholder="House number" />
        </div>
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <Table
          cols={["#", "Name", "Purok", "Members", "House Number", "Status", "Date Updated"]}
          rows={paged}
          renderRow={(item, i) => (
            <>
              <td style={{ padding: "10px 10px" }}>{(page - 1) * perPage + i + 1}.</td>
              <td style={{ padding: "10px 10px" }}>{item.household_name}</td>
              <td style={{ padding: "10px 10px" }}>{item.purok}</td>
              <td style={{ padding: "10px 10px" }}>{item.members}</td>
              <td style={{ padding: "10px 10px" }}>{item.house_number}</td>
              <td style={{ padding: "10px 10px" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <StatusBadge status={item.status === "active" ? "Active" : "For Update"} />
                  <GreenBtn small onClick={() => api(`/admin/census_households/${item.id}`, { method: "PATCH", token, body: { status: item.status === "active" ? "for update" : "active" } }).then(reload)}>Toggle</GreenBtn>
                </div>
              </td>
              <td style={{ padding: "10px 10px" }}>{new Date(item.updated_at).toLocaleDateString()}</td>
            </>
          )}
        />
        {loading ? <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>Loading census data...</div> : null}
        <Paginate total={filtered.length} perPage={perPage} page={page} setPage={setPage} />
      </div>
    </div>
  );
};

export const SettingsPage = () => {
  const { token } = useAuth();
  const [saved, setSaved] = useState(false);
  const [contentForm, setContentForm] = useState({
    heroTitle: "Welcome to Barangay Iba!",
    heroDescription:
      "A Barangay Portal System is an online platform designed to optimize services and transactions within local barangay.",
    project1: "Project: Preparation for the Upcoming Basketball and Volleyball League",
    project2: "Project: Kontra Dengue Clean-Up Drive",
    project3: "Project: Nutrisyon para sa Kabataan",
    project4: "Project: Medical Mission and Free Check-Up",
    contactPhone: "+63 9876532198",
    contactEmail: "barangayiba@gmail.com",
    contactAddress: "Iba Silang, Cavite",
    facebook: "fb.com/BarangayIBAOfficialPage",
  });
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "staff",
  });

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api("/admin/content", { token }),
      api("/admin/users", { token }),
      api("/admin/audit-logs", { token }),
    ])
      .then(([contentData, usersData, logsData]) => {
        const hero = contentData.content?.hero || {};
        const contact = contentData.content?.contact || {};
        const projects = contentData.content?.fund_projects || [];
        setContentForm((prev) => ({
          ...prev,
          heroTitle: hero.title || prev.heroTitle,
          heroDescription: hero.description || prev.heroDescription,
          project1: projects[0] || prev.project1,
          project2: projects[1] || prev.project2,
          project3: projects[2] || prev.project3,
          project4: projects[3] || prev.project4,
          contactPhone: contact.phone || prev.contactPhone,
          contactEmail: contact.email || prev.contactEmail,
          contactAddress: contact.address || prev.contactAddress,
          facebook: contact.facebook || prev.facebook,
        }));
        setAdmins((usersData.users || []).filter((user) => ["super_admin", "staff"].includes(user.role)));
        setLogs(logsData.logs || []);
      })
      .catch(() => {});
  }, [token]);

  const onFieldChange = (key, value) => {
    setContentForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await api("/admin/content", {
        method: "PUT",
        token,
        body: {
          hero: {
            title: contentForm.heroTitle,
            description: contentForm.heroDescription,
          },
          fund_projects: [contentForm.project1, contentForm.project2, contentForm.project3, contentForm.project4].filter(Boolean),
          contact: {
            phone: contentForm.contactPhone,
            email: contentForm.contactEmail,
            address: contentForm.contactAddress,
            facebook: contentForm.facebook,
          },
        },
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(false);
    }
  };

  const reloadSettingsData = async () => {
    const [usersData, logsData] = await Promise.all([
      api("/admin/users", { token }),
      api("/admin/audit-logs", { token }),
    ]);
    setAdmins((usersData.users || []).filter((user) => ["super_admin", "staff"].includes(user.role)));
    setLogs(logsData.logs || []);
  };

  const createAdminUser = async () => {
    await api("/admin/admin-users", {
      method: "POST",
      token,
      body: adminForm,
    });
    setAdminForm({ firstName: "", lastName: "", email: "", password: "", role: "staff" });
    await reloadSettingsData();
  };

  const toggleAdminRole = async (admin) => {
    await api(`/admin/users/${admin.id}`, {
      method: "PATCH",
      token,
      body: { role: admin.role === "super_admin" ? "staff" : "super_admin" },
    });
    await reloadSettingsData();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Portal Settings</div>
        <GreenBtn onClick={handleSave}>
          {saved ? "Saved" : "Save Changes"}
        </GreenBtn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div>
          <div style={{ ...shellStyles.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Landing Page Content</div>
            {[
              ["Hero Title", "heroTitle"],
              ["Hero Description", "heroDescription"],
              ["Fund Project 1", "project1"],
              ["Fund Project 2", "project2"],
              ["Fund Project 3", "project3"],
              ["Fund Project 4", "project4"],
              ["Phone Number", "contactPhone"],
              ["Email Address", "contactEmail"],
              ["Address", "contactAddress"],
              ["Facebook", "facebook"],
            ].map(([label, key]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 120, fontSize: 13, color: "#555" }}>{label}:</div>
                <input
                  value={contentForm[key]}
                  onChange={(e) => onFieldChange(key, e.target.value)}
                  style={{ flex: 1, background: "#f5f5f5", border: "none", borderRadius: 4, padding: "6px 10px", fontSize: 13 }}
                />
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              <div style={{ width: 120, fontSize: 13, color: "#555" }}>Barangay Logo:</div>
              <GreenBtn small>Upload New Logo</GreenBtn>
            </div>
          </div>
          <div style={{ ...shellStyles.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>User Management</div>
            {["Enable New User Registration", "Enable Login for Residents"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 13, flex: 1 }}>{label}:</div>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: i === 1 ? "#2d7a3a" : "#ccc", position: "relative", cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: i === 1 ? 20 : 2 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={shellStyles.card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Admin Accounts</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
              <SmallInput value={adminForm.firstName} onChange={(e) => setAdminForm((prev) => ({ ...prev, firstName: e.target.value }))} placeholder="First name" />
              <SmallInput value={adminForm.lastName} onChange={(e) => setAdminForm((prev) => ({ ...prev, lastName: e.target.value }))} placeholder="Last name" />
              <SmallInput value={adminForm.email} onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Admin email" />
              <SmallInput value={adminForm.password} onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Temp password" />
            </div>
            {admins.map((admin) => (
              <div key={admin.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                  AD
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {admin.first_name} {admin.last_name} ({admin.role})
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>{admin.email}</div>
                </div>
                <GreenBtn small onClick={() => toggleAdminRole(admin)}>Toggle Role</GreenBtn>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <GreenBtn small outline onClick={createAdminUser}>Add Admin Account</GreenBtn>
            </div>
          </div>
        </div>
        <div>
          <div style={{ ...shellStyles.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Portal Preferences</div>
            {[
              ["Time Zone", "Asia/Manila (GMT+8)"],
              ["Date Format", "MM-DD-YYYY"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 120, fontSize: 13, color: "#555" }}>{label}:</div>
                <input defaultValue={value} style={{ flex: 1, background: "#f5f5f5", border: "none", borderRadius: 4, padding: "6px 10px", fontSize: 13 }} />
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, flex: 1 }}>Maintenance Mode:</div>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: "#2d7a3a", position: "relative", cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 20 }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#e57373", marginBottom: 12 }}>This site is currently under maintenance. Please check back later.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13 }}>Upload Favicon:</div>
              <GreenBtn small>Upload Favicon</GreenBtn>
              <div style={{ fontSize: 11, color: "#888" }}>Required: 128x128px (.ico)</div>
            </div>
          </div>
          <div style={{ ...shellStyles.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Email Notification</div>
            <input defaultValue="admin_email_notifications@barangayiba.ph" style={{ width: "100%", background: "#f5f5f5", border: "none", borderRadius: 4, padding: "7px 10px", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }} />
            {["Receive Complaint Alerts", "Receive Clearance Request Alerts", "Receive Resident Registration Alerts"].map((label) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 13, flex: 1 }}>{label}</div>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: "#2d7a3a", position: "relative" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 20 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={shellStyles.card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Audit Logs</div>
            {logs.map((log) => (
              <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#c8e6c9", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                  OK
                </span>
                <span style={{ flex: 1 }}>{log.action} on {log.entity_type}</span>
                <span style={{ color: "#999" }}>{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            <div style={{ textAlign: "right", marginTop: 8, fontSize: 13, color: "#2d7a3a", cursor: "pointer" }}>View All Logs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VotingResultPage = () => {
  const { token } = useAuth();
  const [election, setElection] = useState({
    id: "",
    title: MOCK.votingResults.title,
    description: "Community voting outcomes",
    status: "live",
  });
  const [options, setOptions] = useState(
    MOCK.votingResults.options.map((option) => ({
      name: option.name,
      description: "",
      votes_count: option.votes,
    }))
  );
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!token) return;

    api("/admin/election", { token })
      .then((data) => {
        if (data.election) {
          setElection({
            id: data.election.id,
            title: data.election.title,
            description: data.election.description || "",
            status: data.election.status,
          });
        }
        if (data.options?.length) {
          setOptions(data.options);
        }
      })
      .catch(() => {});
  }, [token]);

  const winner = [...options].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))[0];
  const totalVotes = options.reduce((sum, option) => sum + Number(option.votes_count || 0), 0);

  const saveElection = async () => {
    await api("/admin/election", {
      method: "PUT",
      token,
      body: { election, options },
    });
    setSaved("Election details saved.");
    window.setTimeout(() => setSaved(""), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Voting Results</div>
        <GreenBtn onClick={saveElection}>Save Election</GreenBtn>
      </div>
      <div style={{ ...shellStyles.card, padding: 24 }}>
        {saved ? (
          <div style={{ marginBottom: 16, borderRadius: 6, background: "#e6f7ed", color: "#1a7a3a", padding: "10px 12px", fontSize: 13 }}>
            {saved}
          </div>
        ) : null}
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Community Voting Outcomes</div>
        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          <input
            value={election.title}
            onChange={(e) => setElection((prev) => ({ ...prev, title: e.target.value }))}
            style={{ background: "#f5f5f5", border: "none", borderRadius: 6, padding: "10px 12px", fontSize: 14 }}
          />
          <textarea
            value={election.description}
            onChange={(e) => setElection((prev) => ({ ...prev, description: e.target.value }))}
            style={{ background: "#f5f5f5", border: "none", borderRadius: 6, padding: "10px 12px", fontSize: 14, minHeight: 80 }}
          />
        </div>
        <div style={{ background: "#2d7a3a", color: "#fff", textAlign: "center", padding: "10px", borderRadius: 6, marginBottom: 16, fontWeight: 700 }}>
          Winning Option
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
          {options.map((option, index) => (
            <div key={`${option.name}-${index}`} style={{ flex: 1, minWidth: 220, borderRadius: 8, padding: 16, textAlign: "center", background: option.name === winner?.name ? "#e8f5e9" : "#f0f0f0", border: option.name === winner?.name ? "2px solid #2d7a3a" : "2px solid #ccc" }}>
              <div style={{ width: "100%", height: 100, background: option.name === winner?.name ? "#4a7c59" : "#888", borderRadius: 6, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                <input
                  value={option.name}
                  onChange={(e) =>
                    setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, name: e.target.value } : item)))
                  }
                  style={{ width: "100%", background: "transparent", border: "none", color: "#fff", textAlign: "center", fontSize: 13, fontWeight: 600 }}
                />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{option.name}</div>
              <input
                type="number"
                value={option.votes_count}
                onChange={(e) =>
                  setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, votes_count: Number(e.target.value) } : item)))
                }
                style={{ marginTop: 8, width: "100%", background: "#fff", border: "1px solid #d0d0d0", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
              />
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, borderTop: "1px solid #e0e0e0", paddingTop: 16, marginBottom: 16 }}>
          Total Votes: {totalVotes}
        </div>
        <div style={{ fontSize: 13, color: "#444", background: "#f9f9f9", borderRadius: 6, padding: 14 }}>
          With a total of {totalVotes} votes, <strong>{winner?.name}</strong> is currently leading with {winner?.votes_count || 0} votes.
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {options.map((option, index) => (
            <div key={`${option.name}-${index}`} style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span>{option.name}</span>
                <span style={{ fontWeight: 700 }}>{totalVotes ? Math.round((option.votes_count / totalVotes) * 100) : 0}%</span>
              </div>
              <div style={{ height: 10, background: "#e0e0e0", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${totalVotes ? (option.votes_count / totalVotes) * 100 : 0}%`, height: "100%", background: option.name === winner?.name ? "#2d7a3a" : "#888", borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
