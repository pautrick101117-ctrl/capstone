import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { GreenBtn, shellStyles, SmallInput } from "./adminShared";

const Admin_Settings = () => {
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

    Promise.all([api("/admin/content", { token }), api("/admin/users", { token }), api("/admin/audit-logs", { token })])
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
    const [usersData, logsData] = await Promise.all([api("/admin/users", { token }), api("/admin/audit-logs", { token })]);
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
        <GreenBtn onClick={handleSave}>{saved ? "Saved" : "Save Changes"}</GreenBtn>
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
              <GreenBtn small outline onClick={createAdminUser}>
                Add Admin Account
              </GreenBtn>
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
            <input
              defaultValue="admin_email_notifications@barangayiba.ph"
              style={{ width: "100%", background: "#f5f5f5", border: "none", borderRadius: 4, padding: "7px 10px", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }}
            />
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
                <span style={{ flex: 1 }}>
                  {log.action} on {log.entity_type}
                </span>
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

export default Admin_Settings;
