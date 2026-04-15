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

const Admin_Officials = () => {
  const { items: officials, loading, reload, token } = useAdminCollection("/admin/officials", "officials", []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: "", position: "", term: "2023-2026", contact: "", status: "active" });
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const perPage = 5;
  const filtered = officials.filter((official) => official.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const saveOfficial = async (official) => {
    if (!official.name.trim() || !official.position.trim()) {
      setFeedback({ error: "Official name and position are required.", success: "" });
      return;
    }

    setFeedback({ error: "", success: "" });
    try {
      if (official.id) {
        await api(`/admin/officials/${official.id}`, { method: "PATCH", token, body: official });
      } else {
        await api("/admin/officials", { method: "POST", token, body: official });
      }
      setForm({ name: "", position: "", term: "2023-2026", contact: "", status: "active" });
      setFeedback({ error: "", success: official.id ? "Official updated." : "Official added." });
      await reload();
    } catch (error) {
      setFeedback({ error: error.message, success: "" });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Officials</div>
        <GreenBtn onClick={() => saveOfficial(form)}>Add New Official</GreenBtn>
      </div>
      <div style={shellStyles.card}>
        {feedback.error ? <div style={{ marginBottom: 12, borderRadius: 6, background: "#fdeaea", color: "#c0392b", padding: "10px 12px", fontSize: 13 }}>{feedback.error}</div> : null}
        {feedback.success ? <div style={{ marginBottom: 12, borderRadius: 6, background: "#e6f7ed", color: "#1a7a3a", padding: "10px 12px", fontSize: 13 }}>{feedback.success}</div> : null}
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
          cols={["#", "Name", "Position", "Term", "Contact", "Status", "Actions"]}
          rows={paged}
          renderRow={(official, i) => (
            <>
              <td style={{ padding: "10px 10px" }}>{(page - 1) * perPage + i + 1}.</td>
              <td style={{ padding: "10px 10px" }}>{official.name}</td>
              <td style={{ padding: "10px 10px" }}>{official.position}</td>
              <td style={{ padding: "10px 10px" }}>{official.term}</td>
              <td style={{ padding: "10px 10px" }}>{official.contact}</td>
              <td style={{ padding: "10px 10px" }}>
                <StatusBadge status={official.status === "active" ? "Active" : "Pending"} />
              </td>
              <td style={{ padding: "10px 10px" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <GreenBtn
                    small
                    onClick={() =>
                      setForm({
                        id: official.id,
                        name: official.name,
                        position: official.position,
                        term: official.term,
                        contact: official.contact,
                        status: official.status || "active",
                      })
                    }
                  >
                    Edit
                  </GreenBtn>
                  <GreenBtn
                    small
                    danger
                    onClick={() =>
                      api(`/admin/officials/${official.id}`, {
                        method: "PATCH",
                        token,
                        body: { status: official.status === "active" ? "inactive" : "active" },
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
        {loading ? <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>Loading officials...</div> : null}
        <Paginate total={filtered.length} perPage={perPage} page={page} setPage={setPage} />
      </div>
    </div>
  );
};

export default Admin_Officials;
