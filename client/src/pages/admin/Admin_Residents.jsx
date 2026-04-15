import { useState } from "react";
import {
  GreenBtn,
  Paginate,
  SearchBar,
  shellStyles,
  StatusBadge,
  Table,
  useAdminCollection,
} from "./adminShared";
import { api } from "../../lib/api";

const Admin_Residents = () => {
  const { items: residents, loading, reload, token } = useAdminCollection("/admin/users", "users", []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = residents
    .filter((resident) => resident.role === "resident")
    .filter(
      (resident) =>
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
              <td style={{ padding: "10px 10px" }}>
                {resident.first_name} {resident.last_name}
              </td>
              <td style={{ padding: "10px 10px" }}>{resident.email}</td>
              <td style={{ padding: "10px 10px" }}>{resident.address || "-"}</td>
              <td style={{ padding: "10px 10px" }}>{resident.contact_number || "-"}</td>
              <td style={{ padding: "10px 10px" }}>
                <StatusBadge
                  status={resident.status === "approved" ? "Approved" : resident.status === "pending" ? "Pending" : resident.status}
                />
              </td>
              <td style={{ padding: "10px 10px" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <GreenBtn small onClick={() => updateResident(resident.id, { status: "approved" })}>
                    Approve
                  </GreenBtn>
                  <GreenBtn small outline onClick={() => updateResident(resident.id, { status: "pending" })}>
                    Pending
                  </GreenBtn>
                  <GreenBtn small danger onClick={() => updateResident(resident.id, { status: "rejected" })}>
                    Reject
                  </GreenBtn>
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

export default Admin_Residents;
