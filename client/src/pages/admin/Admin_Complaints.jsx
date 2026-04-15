import { useState } from "react";
import {
  GreenBtn,
  Paginate,
  SearchBar,
  shellStyles,
  SmallInput,
  StatusBadge,
  Table,
  useAdminCollection,
} from "./adminShared";
import { api } from "../../lib/api";

const Admin_Complaints = () => {
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
                  <GreenBtn
                    small
                    onClick={() =>
                      api(`/admin/complaints/${complaint.id}`, {
                        method: "PATCH",
                        token,
                        body: { status: complaint.status === "resolved" ? "pending" : "resolved" },
                      }).then(reload)
                    }
                  >
                    Toggle
                  </GreenBtn>
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

export default Admin_Complaints;
