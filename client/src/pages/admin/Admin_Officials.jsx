import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, PageHeader, TableShell, TextInput } from "../../components/ui";

const emptyForm = { name: "", position: "", term: "", contact: "", isActive: true, photo: null, preview: "" };

const Admin_Officials = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [officials, setOfficials] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const data = await api("/admin/officials", { token });
    setOfficials(data.officials || []);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const save = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "preview") return;
      if (key === "photo" && value) formData.append("photo", value);
      else if (key !== "photo") formData.append(key, value);
    });

    try {
      await api("/admin/officials", { method: "POST", token, body: formData });
      toast.success("Official saved.");
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggle = async (official) => {
    try {
      const formData = new FormData();
      formData.append("name", official.name);
      formData.append("position", official.position);
      formData.append("term", official.term);
      formData.append("contact", official.contact || "");
      formData.append("photoUrl", official.photo_url || "");
      formData.append("isActive", (!official.is_active).toString());
      await api(`/admin/officials/${official.id}`, { method: "PATCH", token, body: formData });
      toast.success("Official status updated.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Officials"
        title="Manage public official profiles"
        description="Upload photos, assign positions and terms, and deactivate former officials without removing their records."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Add Official</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={save}>
            <TextInput label="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <TextInput label="Position" value={form.position} onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))} />
            <TextInput label="Term" value={form.term} onChange={(event) => setForm((current) => ({ ...current, term: event.target.value }))} />
            <TextInput label="Contact" value={form.contact} onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))} />
            <label className="sm:col-span-2 flex flex-col gap-2 text-sm font-medium text-stone-700">
              <span>Photo Upload</span>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-500">
                <Upload className="h-4 w-4" />
                <span>{form.photo ? form.photo.name : "Choose photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setForm((current) => ({
                      ...current,
                      photo: file || null,
                      preview: file ? URL.createObjectURL(file) : "",
                    }));
                  }}
                />
              </label>
            </label>
            {form.preview ? <img src={form.preview} alt="Official preview" className="sm:col-span-2 h-48 w-full rounded-3xl object-cover" /> : null}
            <div className="sm:col-span-2">
              <Button type="submit">Save Official</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Official Directory</h2>
          <div className="mt-5">
            <TableShell>
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-left text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Official</th>
                    <th className="px-4 py-3 font-semibold">Position</th>
                    <th className="px-4 py-3 font-semibold">Term</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {officials.map((official) => (
                    <tr key={official.id} className="border-t border-stone-100">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {official.photo_url ? (
                            <img src={official.photo_url} alt={official.name} className="h-12 w-12 rounded-2xl object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-2xl bg-[var(--brand-50)]" />
                          )}
                          <div>
                            <p className="font-semibold text-[var(--brand-900)]">{official.name}</p>
                            <p className="text-xs text-stone-500">{official.contact || "No contact listed"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-stone-600">{official.position}</td>
                      <td className="px-4 py-4 text-stone-600">{official.term}</td>
                      <td className="px-4 py-4"><Badge tone={official.is_active ? "success" : "danger"}>{official.is_active ? "Active" : "Inactive"}</Badge></td>
                      <td className="px-4 py-4">
                        <Button variant="secondary" onClick={() => toggle(official)}>
                          {official.is_active ? "Deactivate" : "Activate"}
                        </Button>
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

export default Admin_Officials;
