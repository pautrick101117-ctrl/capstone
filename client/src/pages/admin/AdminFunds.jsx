import { Eye, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, PageHeader, SelectInput, TableShell, TextArea, TextInput } from "../../components/ui";
import { formatCurrency, formatDate } from "../../lib/format";

const AdminFunds = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [funds, setFunds] = useState({ sources: [], projects: [] });
  const [sourceForm, setSourceForm] = useState({ name: "", term: "", allocatedAmount: "" });
  const [projectForm, setProjectForm] = useState({
    name: "",
    date: "",
    amount: "",
    description: "",
    term: "",
    status: "ongoing",
    receipt: null,
    preview: "",
  });

  const load = async () => {
    const data = await api("/public/funds");
    setFunds(data);
  };

  useEffect(() => {
    load();
  }, []);

  const saveSource = async (event) => {
    event.preventDefault();
    try {
      await api("/admin/fund_sources", { method: "POST", token, body: sourceForm });
      toast.success("Fund source added.");
      setSourceForm({ name: "", term: "", allocatedAmount: "" });
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveProject = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(projectForm).forEach(([key, value]) => {
      if (key === "preview") return;
      if (key === "receipt" && value) formData.append("receipt", value);
      else if (key !== "receipt") formData.append(key, value);
    });

    try {
      await api("/admin/fund_projects", { method: "POST", token, body: formData });
      toast.success("Fund project saved.");
      setProjectForm({ name: "", date: "", amount: "", description: "", term: "", status: "ongoing", receipt: null, preview: "" });
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fund Management"
        title="Manage sources and project spending"
        description="Encode fund allocations, publish project spending entries, and preview receipt uploads before saving."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Add Fund Source</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveSource}>
            <TextInput label="Source Name" value={sourceForm.name} onChange={(event) => setSourceForm((current) => ({ ...current, name: event.target.value }))} />
            <TextInput label="Administration Term" value={sourceForm.term} onChange={(event) => setSourceForm((current) => ({ ...current, term: event.target.value }))} />
            <TextInput label="Allocated Amount" type="number" className="sm:col-span-2" value={sourceForm.allocatedAmount} onChange={(event) => setSourceForm((current) => ({ ...current, allocatedAmount: event.target.value }))} />
            <div className="sm:col-span-2">
              <Button type="submit">Save Fund Source</Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <ReceiptText className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-xl font-bold text-[var(--brand-900)]">Add Fund Project</h2>
          </div>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveProject}>
            <TextInput label="Project Name" value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} />
            <TextInput label="Date" type="date" value={projectForm.date} onChange={(event) => setProjectForm((current) => ({ ...current, date: event.target.value }))} />
            <TextInput label="Amount" type="number" value={projectForm.amount} onChange={(event) => setProjectForm((current) => ({ ...current, amount: event.target.value }))} />
            <TextInput label="Administration Term" value={projectForm.term} onChange={(event) => setProjectForm((current) => ({ ...current, term: event.target.value }))} />
            <SelectInput label="Status" value={projectForm.status} onChange={(event) => setProjectForm((current) => ({ ...current, status: event.target.value }))}>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </SelectInput>
            <label className="flex flex-col gap-2 text-sm font-medium text-stone-700">
              <span>Receipt Upload</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setProjectForm((current) => ({
                    ...current,
                    receipt: file || null,
                    preview: file && file.type.startsWith("image/") ? URL.createObjectURL(file) : file?.name || "",
                  }));
                }}
              />
            </label>
            <TextArea label="Description" className="sm:col-span-2" value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} />
            {projectForm.preview ? (
              <div className="sm:col-span-2 rounded-3xl border border-stone-200 p-4">
                <p className="mb-3 text-sm font-semibold text-stone-700">Receipt preview</p>
                {projectForm.receipt?.type?.startsWith("image/") ? (
                  <img src={projectForm.preview} alt="Receipt preview" className="max-h-60 rounded-2xl object-cover" />
                ) : (
                  <p className="text-sm text-stone-500">{projectForm.preview}</p>
                )}
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <Button type="submit">Save Fund Project</Button>
            </div>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[var(--brand-900)]">Published Fund Projects</h2>
        <div className="mt-5">
          <TableShell>
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 text-left text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Term</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {funds.projects.map((project) => (
                  <tr key={project.id} className="border-t border-stone-100">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--brand-900)]">{project.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{formatDate(project.date)}</p>
                    </td>
                    <td className="px-4 py-4 text-[var(--brand-700)]">{formatCurrency(project.amount)}</td>
                    <td className="px-4 py-4 text-stone-600">{project.term}</td>
                    <td className="px-4 py-4">
                      <Badge tone={project.status === "completed" ? "success" : project.status === "cancelled" ? "danger" : "warning"}>{project.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      {project.receiptUrl ? (
                        <a href={project.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[var(--brand-600)] hover:underline">
                          <Eye className="h-4 w-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-stone-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </Card>
    </div>
  );
};

export default AdminFunds;
