import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { GreenBtn, shellStyles, SmallInput } from "./adminShared";

const Toggle = ({ checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      width: 40,
      height: 22,
      borderRadius: 11,
      background: checked ? "#2d7a3a" : "#ccc",
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s",
    }}
  >
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: 2,
        left: checked ? 20 : 2,
        transition: "left 0.2s",
      }}
    />
  </div>
);

const Admin_Settings = () => {
  const { token } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

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

  // User Management toggles
  const [enableRegistration, setEnableRegistration] = useState(false);
  const [enableResidentLogin, setEnableResidentLogin] = useState(true);

  // Portal Preferences
  const [timeZone, setTimeZone] = useState("Asia/Manila (GMT+8)");
  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Email Notifications toggles
  const [notifEmail, setNotifEmail] = useState("admin_email_notifications@barangayiba.ph");
  const [notifComplaints, setNotifComplaints] = useState(true);
  const [notifClearances, setNotifClearances] = useState(true);
  const [notifRegistrations, setNotifRegistrations] = useState(true);

  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
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
        setAdmins((usersData.users || []).filter((user) => user.role === "admin"));
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
    setAdmins((usersData.users || []).filter((user) => user.role === "admin"));
    setLogs(logsData.logs || []);
  };

  const createAdminUser = async () => {
    try {
      await api("/admin/admin-users", {
        method: "POST",
        token,
        body: adminForm,
      });
      setAdminForm({ firstName: "", lastName: "", email: "", password: "" });
      await reloadSettingsData();
    } catch (err) {
      alert(err.message || "Failed to create admin user.");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Logo "${file.name}" selected. Backend upload support required to persist this change.`);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Favicon "${file.name}" selected. Backend upload support required to persist this change.`);
    }
  };

  const visibleLogs = showAllLogs ? logs : logs.slice(0, 6);

  return (
    <div>
      {/* Hidden file inputs */}
      <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
      <input ref={faviconInputRef} type="file" accept=".ico,image/*" style={{ display: "none" }} onChange={handleFaviconUpload} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Portal Settings</div>
        <GreenBtn onClick={handleSave}>{saved ? "✓ Saved!" : "Save Changes"}</GreenBtn>
      </div>

      {saved && (
        <div style={{ marginBottom: 16, borderRadius: 6, background: "#e6f7ed", color: "#1a7a3a", padding: "10px 14px", fontSize: 13 }}>
          Settings saved successfully.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* LEFT COLUMN */}
        <div>
          {/* Landing Page Content */}
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
              <GreenBtn small onClick={() => logoInputRef.current?.click()}>Upload New Logo</GreenBtn>
            </div>
          </div>

          {/* User Management */}
          <div style={{ ...shellStyles.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>User Management</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, flex: 1 }}>Enable New User Registration:</div>
              <Toggle checked={enableRegistration} onChange={setEnableRegistration} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 13, flex: 1 }}>Enable Login for Residents:</div>
              <Toggle checked={enableResidentLogin} onChange={setEnableResidentLogin} />
            </div>
          </div>

          {/* Admin Accounts */}
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
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <GreenBtn small outline onClick={createAdminUser}>
                Add Admin Account
              </GreenBtn>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Portal Preferences */}
          <div style={{ ...shellStyles.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Portal Preferences</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 120, fontSize: 13, color: "#555" }}>Time Zone:</div>
              <input
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                style={{ flex: 1, background: "#f5f5f5", border: "none", borderRadius: 4, padding: "6px 10px", fontSize: 13 }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 120, fontSize: 13, color: "#555" }}>Date Format:</div>
              <input
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                style={{ flex: 1, background: "#f5f5f5", border: "none", borderRadius: 4, padding: "6px 10px", fontSize: 13 }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, flex: 1 }}>Maintenance Mode:</div>
              <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
            </div>
            {maintenanceMode && (
              <div style={{ fontSize: 11, color: "#e57373", marginBottom: 12 }}>
                This site is currently under maintenance. Please check back later.
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <div style={{ fontSize: 13 }}>Upload Favicon:</div>
              <GreenBtn small onClick={() => faviconInputRef.current?.click()}>Upload Favicon</GreenBtn>
              <div style={{ fontSize: 11, color: "#888" }}>Required: 128x128px (.ico)</div>
            </div>
          </div>

          {/* Email Notifications */}
          <div style={{ ...shellStyles.card, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Email Notification</div>
            <input
              value={notifEmail}
              onChange={(e) => setNotifEmail(e.target.value)}
              style={{ width: "100%", background: "#f5f5f5", border: "none", borderRadius: 4, padding: "7px 10px", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, flex: 1 }}>Receive Complaint Alerts</div>
              <Toggle checked={notifComplaints} onChange={setNotifComplaints} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, flex: 1 }}>Receive Clearance Request Alerts</div>
              <Toggle checked={notifClearances} onChange={setNotifClearances} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 13, flex: 1 }}>Receive Resident Registration Alerts</div>
              <Toggle checked={notifRegistrations} onChange={setNotifRegistrations} />
            </div>
          </div>

          {/* Audit Logs */}
          <div style={shellStyles.card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Audit Logs</div>
            {logs.length === 0 && <div style={{ fontSize: 12, color: "#999" }}>No audit logs yet.</div>}
            {visibleLogs.map((log) => (
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
            {logs.length > 6 && (
              <div
                onClick={() => setShowAllLogs((prev) => !prev)}
                style={{ textAlign: "right", marginTop: 8, fontSize: 13, color: "#2d7a3a", cursor: "pointer", fontWeight: 600 }}
              >
                {showAllLogs ? "Show Less" : `View All Logs (${logs.length})`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_Settings;
