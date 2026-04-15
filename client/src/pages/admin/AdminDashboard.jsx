import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { GreenBtn, LOGO_URL, SearchBar, StatCard, shellStyles } from "./adminShared";

const AdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [liveStats, setLiveStats] = useState({
    residents: 0,
    officials: 0,
    pendingUsers: 0,
    pendingClearance: 0,
    complaints: 0,
  });
  const [residents, setResidents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [residentSearch, setResidentSearch] = useState("");

  useEffect(() => {
    if (!token) return;

    Promise.all([
      api("/admin/dashboard", { token }),
      api("/admin/users", { token }),
      api("/admin/complaints", { token }),
      api("/admin/officials", { token }),
    ])
      .then(([dashData, usersData, complaintsData, officialsData]) => {
        if (dashData.stats) setLiveStats((prev) => ({ ...prev, ...dashData.stats }));
        if (dashData.logs) setActivityLogs(dashData.logs);
        if (usersData.users) setResidents(usersData.users.filter((u) => u.role === "resident"));
        if (complaintsData.complaints) setComplaints(complaintsData.complaints);
        if (officialsData.officials) setOfficials(officialsData.officials);
      })
      .catch(() => {});
  }, [token]);

  const filteredResidents = residents.filter((r) =>
    `${r.first_name} ${r.last_name}`.toLowerCase().includes(residentSearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Total Residents" value={liveStats.residents} />
        <StatCard label="Appointed Officials" value={liveStats.officials} />
        <StatCard label="Pending Users" value={liveStats.pendingUsers} />
        <StatCard label="Total Complaints" value={liveStats.complaints} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Resident Information */}
        <div style={{ ...shellStyles.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Resident Information</div>
          <SearchBar value={residentSearch} onChange={setResidentSearch} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                {["#", "Resident", "Email", "Address", "Contact"].map((col) => (
                  <th key={col} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResidents.slice(0, 5).map((resident, i) => (
                <tr key={resident.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "6px 8px" }}>{i + 1}.</td>
                  <td style={{ padding: "6px 8px" }}>{resident.first_name} {resident.last_name}</td>
                  <td style={{ padding: "6px 8px" }}>{resident.email}</td>
                  <td style={{ padding: "6px 8px" }}>{resident.address || "-"}</td>
                  <td style={{ padding: "6px 8px" }}>{resident.contact_number || "-"}</td>
                </tr>
              ))}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "10px 8px", color: "#999", textAlign: "center" }}>No residents found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              Showing {Math.min(5, filteredResidents.length)} of {filteredResidents.length} entries
            </div>
            <GreenBtn small outline onClick={() => navigate("/admin/residents")}>View All</GreenBtn>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Recent Complaints */}
          <div style={{ ...shellStyles.card, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Recent Complaints</div>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ padding: "5px 8px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "5px 8px", textAlign: "left" }}>Resident</th>
                  <th style={{ padding: "5px 8px", textAlign: "left" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 4).map((complaint) => (
                  <tr key={complaint.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "5px 8px" }}>{new Date(complaint.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "5px 8px" }}>{complaint.resident_name}</td>
                    <td style={{ padding: "5px 8px" }}>
                      <GreenBtn small onClick={() => navigate("/admin/complaints")}>View</GreenBtn>
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: "10px 8px", color: "#999", textAlign: "center" }}>No complaints yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Activity Logs */}
          <div style={{ ...shellStyles.card, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Activity Logs</div>
            {activityLogs.length === 0 && (
              <div style={{ fontSize: 12, color: "#999" }}>No activity yet.</div>
            )}
            {activityLogs.map((log) => (
              <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#c8e6c9", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>OK</span>
                <span style={{ flex: 1 }}>{log.action} on {log.entity_type}</span>
                <span style={{ color: "#999" }}>{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 20 }}>
        {/* Barangay Officials */}
        <div style={{ ...shellStyles.card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Barangay Officials
            <span
              onClick={() => navigate("/admin/officials")}
              style={{ background: "#e0e0e0", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}
            >
              &gt;
            </span>
          </div>
          {officials.slice(0, 2).map((official) => (
            <div key={official.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>OF</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{official.name}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{official.position}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{official.contact}</div>
              </div>
            </div>
          ))}
          {officials.length === 0 && (
            <div style={{ fontSize: 12, color: "#999" }}>No officials yet.</div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ ...shellStyles.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Quick Actions</div>
          <div style={{ background: "#f0faf2", borderRadius: 6, padding: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Approval Queue</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
              New resident accounts must be approved before they can log in.
            </div>
            <GreenBtn small onClick={() => navigate("/admin/residents")}>Review Residents</GreenBtn>
          </div>
          <div style={{ background: "#f0faf2", borderRadius: 6, padding: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Landing Page Editor</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
              Manage and update the content displayed on the Barangay website&apos;s landing page.
            </div>
            <GreenBtn small onClick={() => navigate("/admin/settings")}>Edit Landing Page</GreenBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
