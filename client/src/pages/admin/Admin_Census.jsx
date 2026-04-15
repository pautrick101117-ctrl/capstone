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

const Admin_Census = () => {
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
                  <GreenBtn
                    small
                    onClick={() =>
                      api(`/admin/census_households/${item.id}`, {
                        method: "PATCH",
                        token,
                        body: { status: item.status === "active" ? "for update" : "active" },
                      }).then(reload)
                    }
                  >
                    Toggle
                  </GreenBtn>
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

export default Admin_Census;
