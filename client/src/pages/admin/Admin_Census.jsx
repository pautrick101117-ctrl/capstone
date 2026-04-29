import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button, Card, PageHeader, TableShell, TextInput } from "../../components/ui";

const emptyForm = { householdName: "", purok: "", members: 1, houseNumber: "", status: "active" };

const Admin_Census = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [households, setHouseholds] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const data = await api("/admin/census_households", { token });
    setHouseholds(data.census_households || []);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/admin/census_households", { method: "POST", token, body: form });
      toast.success("Household saved.");
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Census"
        title="Maintain household census records"
        description="Manage household-level census information alongside the resident account import and export tools."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Add Household</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={save}>
            <TextInput label="Household Name" className="sm:col-span-2" value={form.householdName} onChange={(event) => setForm((current) => ({ ...current, householdName: event.target.value }))} />
            <TextInput label="Purok" value={form.purok} onChange={(event) => setForm((current) => ({ ...current, purok: event.target.value }))} />
            <TextInput label="House Number" value={form.houseNumber} onChange={(event) => setForm((current) => ({ ...current, houseNumber: event.target.value }))} />
            <TextInput label="Members" type="number" value={form.members} onChange={(event) => setForm((current) => ({ ...current, members: event.target.value }))} />
            <TextInput label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} />
            <div className="sm:col-span-2">
              <Button type="submit">Save Household</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Household List</h2>
          <div className="mt-5">
            <TableShell>
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-left text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Household</th>
                    <th className="px-4 py-3 font-semibold">Purok</th>
                    <th className="px-4 py-3 font-semibold">Members</th>
                    <th className="px-4 py-3 font-semibold">House Number</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {households.map((item) => (
                    <tr key={item.id} className="border-t border-stone-100">
                      <td className="px-4 py-4 font-semibold text-[var(--brand-900)]">{item.household_name}</td>
                      <td className="px-4 py-4 text-stone-600">{item.purok}</td>
                      <td className="px-4 py-4 text-stone-600">{item.members}</td>
                      <td className="px-4 py-4 text-stone-600">{item.house_number}</td>
                      <td className="px-4 py-4 text-stone-600">{item.status}</td>
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

export default Admin_Census;
