import { ImageUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button, Card, PageHeader, TableShell, TextArea, TextInput } from "../../components/ui";
import { formatDate } from "../../lib/format";

const AdminContentPage = ({ type = "news" }) => {
  const { token } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", date: "", image: null, preview: "" });

  const label = type === "news" ? "News" : "Announcements";

  const load = async () => {
    const data = await api("/admin/announcements", { token });
    setItems((data.announcements || []).filter((item) => item.type === type));
  };

  useEffect(() => {
    if (token) load();
  }, [token, type]);

  const save = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("body", form.body);
    formData.append("type", type);
    if (form.date) formData.append("date", form.date);
    if (form.image) formData.append("image", form.image);

    try {
      await api("/admin/announcements", { method: "POST", token, body: formData });
      toast.success(`${label.slice(0, -1)} posted successfully.`);
      setForm({ title: "", body: "", date: "", image: null, preview: "" });
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/admin/announcements/${id}`, { method: "DELETE", token });
      toast.success("Entry deleted.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={type === "news" ? "Public News" : "Public Announcements"}
        title={`Manage ${label}`}
        description={`Create, publish, and remove ${type === "news" ? "community stories and updates" : "official notices and alerts"} for the public portal.`}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Create {label.slice(0, -1)}</h2>
          <form className="mt-5 space-y-4" onSubmit={save}>
            <TextInput label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <TextInput label="Date (optional)" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <TextArea label="Body" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
            <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
              <span>Image Upload</span>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-500">
                <ImageUp className="h-4 w-4" />
                <span>{form.image ? form.image.name : "Choose image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setForm((current) => ({
                      ...current,
                      image: file || null,
                      preview: file ? URL.createObjectURL(file) : "",
                    }));
                  }}
                />
              </label>
            </label>
            {form.preview ? <img src={form.preview} alt="Preview" className="h-48 w-full rounded-3xl object-cover" /> : null}
            <Button type="submit">Publish</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Published {label}</h2>
          <div className="mt-5">
            <TableShell>
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-left text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Image</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-stone-100">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[var(--brand-900)]">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-stone-500">{item.body}</p>
                      </td>
                      <td className="px-4 py-4 text-stone-600">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-4">
                        {item.image_url ? <img src={item.image_url} alt={item.title} className="h-12 w-12 rounded-2xl object-cover" /> : "None"}
                      </td>
                      <td className="px-4 py-4">
                        <Button variant="ghost" onClick={() => remove(item.id)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
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

export default AdminContentPage;
