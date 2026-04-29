import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, EmptyState, PageHeader, TextArea, TextInput } from "../../components/ui";
import { formatDateTime } from "../../lib/format";

const SuggestionsPage = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api("/suggestions/mine", { token });
      setSuggestions(data.suggestions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/suggestions", { method: "POST", token, body: form });
      toast.success("Project suggestion submitted.");
      setForm({ title: "", description: "" });
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Suggestions"
        title="Suggest a project for the barangay"
        description="Share an idea that could improve your purok or the wider Barangay Iba community. Approved suggestions can be turned into a voting draft."
      />

      <Card>
        <form className="space-y-4" onSubmit={submit}>
          <TextInput
            label="Project Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Example: Solar lights for Purok 3"
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Explain the community problem and how your idea helps."
          />
          <Button type="submit" loading={saving}>
            Submit Suggestion
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-[var(--brand-900)]">Your Submissions</h2>
        <div className="mt-5 space-y-4">
          {loading ? (
            <p className="text-sm text-stone-500">Loading suggestions...</p>
          ) : !suggestions.length ? (
            <EmptyState title="No suggestions yet" description="Your submitted ideas will appear here with their review status." />
          ) : (
            suggestions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--brand-900)]">{item.title}</h3>
                    <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                    <p className="mt-3 text-xs text-stone-400">{formatDateTime(item.created_at)}</p>
                  </div>
                  <Badge tone={item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : "info"}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default SuggestionsPage;
