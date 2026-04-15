import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { GreenBtn, LOGO_URL, MOCK, SearchBar, StatCard, shellStyles } from "./adminShared";

const AdminDashboard = () => {
  const { stats, residents, activityLogs } = MOCK;
  const [liveStats, setLiveStats] = useState(stats);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    api("/admin/dashboard", { token }).then((data) => {
      if (data.stats) setLiveStats((prev) => ({ ...prev, ...data.stats }));
    }).catch(() => {});
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
                  <th key={col} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 600 }}>{col}</th>
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
                    <td style={{ padding: "5px 8px" }}><GreenBtn small>View</GreenBtn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ ...shellStyles.card, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Activity Logs</div>
            {activityLogs.map((log) => (
              <div key={log.msg} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#c8e6c9", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>OK</span>
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
            <span style={{ background: "#e0e0e0", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>&gt;</span>
          </div>
          {MOCK.officials.slice(0, 2).map((official) => (
            <div key={official.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#c8e6c9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>OF</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{official.name}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{official.position}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{official.contact}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...shellStyles.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Users To Approve</div>
          <div style={{ background: "#f0faf2", borderRadius: 6, padding: 12, marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Approval Queue</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
              New resident accounts must be approved before they can log in.
            </div>
            <GreenBtn small>Review Residents</GreenBtn>
          </div>
          <div style={{ background: "#f0faf2", borderRadius: 6, padding: 12, marginTop: 12 }}>
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

export default AdminDashboard;
