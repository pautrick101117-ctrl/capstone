import { FileDown, FileUp, KeyRound, Power, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, API_URL } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, PageHeader, TableShell, TextInput } from "../../components/ui";
import { formatDate } from "../../lib/format";

const initialForm = {
  fullName: "",
  address: "",
  purok: "",
  phoneNumber: "",
  email: "",
  birthdate: "",
};

const Admin_Residents = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const importRef = useRef(null);

  const load = async () => {
    const data = await api("/admin/users", { token });
    setUsers(data.users || []);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const residents = useMemo(
    () =>
      users.filter((user) => user.role === "resident").filter((user) => `${user.fullName} ${user.username}`.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  const createResident = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/admin/users", {
        method: "POST",
        token,
        body: form,
      });
      toast.success("Resident account created. Check the server console for the SMS log.");
      setForm(initialForm);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateResident = async (residentId, updates) => {
    try {
      await api(`/admin/users/${residentId}`, { method: "PATCH", token, body: updates });
      toast.success("Resident updated.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetPassword = async (residentId) => {
    try {
      await api(`/admin/users/${residentId}/reset-password`, { method: "POST", token });
      toast.success("Temporary password reset. Check the server console for the SMS log.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const importResidents = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api("/admin/users/import", { method: "POST", token, body: formData });
      toast.success("Resident import completed.");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      event.target.value = "";
    }
  };

  const exportResidents = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to export residents.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `barangay-iba-residents.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resident Management"
        title="Create and maintain resident accounts"
        description="Resident signup is now admin-only. Create usernames, issue temporary passwords, import from Excel, and manage active status without deleting data."
        actions={
          <>
            <Button variant="secondary" onClick={() => importRef.current?.click()}>
              <FileUp className="h-4 w-4" />
              Import Excel
            </Button>
            <Button variant="secondary" onClick={exportResidents}>
              <FileDown className="h-4 w-4" />
              Export Excel
            </Button>
            <input ref={importRef} type="file" accept=".xlsx" className="hidden" onChange={importResidents} />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-xl font-bold text-[var(--brand-900)]">Create Resident Account</h2>
          </div>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={createResident}>
            <TextInput label="Full Name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            <TextInput label="Birthdate" type="date" value={form.birthdate} onChange={(event) => setForm((current) => ({ ...current, birthdate: event.target.value }))} />
            <TextInput label="Address" className="sm:col-span-2" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
            <TextInput label="Purok" value={form.purok} onChange={(event) => setForm((current) => ({ ...current, purok: event.target.value }))} />
            <TextInput label="Phone Number" value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
            <TextInput label="Email (optional)" type="email" className="sm:col-span-2" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={saving}>
                Create Account
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-900)]">Resident Directory</h2>
              <p className="mt-1 text-sm text-stone-500">Search by resident name or username.</p>
            </div>
            <TextInput label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="mt-5">
            <TableShell>
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-left text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Resident</th>
                    <th className="px-4 py-3 font-semibold">Username</th>
                    <th className="px-4 py-3 font-semibold">Birthdate</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((resident) => (
                    <tr key={resident.id} className="border-t border-stone-100 align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[var(--brand-900)]">{resident.fullName}</p>
                        <p className="mt-1 text-xs text-stone-500">{resident.address} • {resident.purok}</p>
                      </td>
                      <td className="px-4 py-4 text-stone-600">{resident.username}</td>
                      <td className="px-4 py-4 text-stone-600">{resident.birthdate ? formatDate(resident.birthdate) : "Not set"}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <Badge tone={resident.isActive ? "success" : "danger"}>{resident.isActive ? "Active" : "Inactive"}</Badge>
                          <Badge tone={resident.mustChangePassword ? "warning" : "info"}>
                            {resident.mustChangePassword ? "Must change password" : "Password updated"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" onClick={() => updateResident(resident.id, { isActive: !resident.isActive })}>
                            <Power className="h-4 w-4" />
                            {resident.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="ghost" onClick={() => resetPassword(resident.id)}>
                            <KeyRound className="h-4 w-4" />
                            Reset Password
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin_Residents;
