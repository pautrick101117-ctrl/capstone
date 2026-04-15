import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GreenBtn, LOGO_URL } from "./adminShared";

const AdminLogin = () => {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("admin");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, loading, isAuthenticated, user: authUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && authUser?.role === "admin") {
      navigate("/admin");
    }
  }, [isAuthenticated, authUser, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#4caf50 0%,#1b5e20 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
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
            await login({ usernameOrEmail: user, password: pass, adminOnly: true });
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
          {error ? <div style={{ marginBottom: 12, borderRadius: 6, background: "#fdeaea", color: "#c0392b", padding: "10px 12px", fontSize: 13 }}>{error}</div> : null}
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ddd", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#888" }}>
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
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
