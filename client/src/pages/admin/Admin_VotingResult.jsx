import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, PageHeader, SelectInput, TableShell, TextArea, TextInput } from "../../components/ui";

const emptyElection = {
  title: "",
  description: "",
  status: "draft",
  startsAt: "",
  endsAt: "",
  sourceSuggestionId: "",
  image: null,
  preview: "",
};

const Admin_VotingResult = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [elections, setElections] = useState([]);
  const [election, setElection] = useState(emptyElection);
  const [options, setOptions] = useState([
    { name: "", description: "" },
    { name: "", description: "" },
  ]);

  const load = async () => {
    const [suggestionData, electionData, resultData] = await Promise.all([
      api("/admin/suggestions", { token }),
      api("/admin/election", { token }),
      api("/admin/election-results", { token }),
    ]);
    setSuggestions(suggestionData.suggestions || []);
    if (electionData.election) {
      setElection({
        id: electionData.election.id,
        title: electionData.election.title,
        description: electionData.election.description || "",
        status: electionData.election.status,
        startsAt: electionData.election.starts_at || "",
        endsAt: electionData.election.ends_at || "",
        sourceSuggestionId: electionData.election.source_suggestion_id || "",
        image: null,
        preview: electionData.election.image_url || "",
      });
      setOptions((electionData.options || []).length ? electionData.options.map((item) => ({ name: item.name, description: item.description || "" })) : [{ name: "", description: "" }, { name: "", description: "" }]);
    }
    setElections(resultData.elections || []);
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const reviewSuggestion = async (id, status) => {
    try {
      await api(`/admin/suggestions/${id}`, { method: "PATCH", token, body: { status } });
      toast.success(`Suggestion ${status}.`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveElection = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    if (election.image) formData.append("image", election.image);
    formData.append(
      "election",
      JSON.stringify({
        id: election.id,
        title: election.title,
        description: election.description,
        status: election.status,
        startsAt: election.startsAt,
        endsAt: election.endsAt,
        sourceSuggestionId: election.sourceSuggestionId || null,
        imageUrl: election.preview || null,
      })
    );
    formData.append("options", JSON.stringify(options));

    try {
      await api("/admin/election", { method: "PUT", token, body: formData });
      toast.success("Election saved.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const selectedResults = elections[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Voting Management"
        title="Review suggestions and manage elections"
        description="Approve resident suggestions into election drafts, configure options and schedules, and monitor anonymous participation metrics."
      />

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Project Suggestions</h2>
          <div className="mt-5 space-y-4">
            {suggestions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-stone-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--brand-900)]">{item.title}</p>
                    <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                  </div>
                  <Badge tone={item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : "info"}>{item.status}</Badge>
                </div>
                {item.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => reviewSuggestion(item.id, "approved")}>Approve</Button>
                    <Button variant="ghost" onClick={() => reviewSuggestion(item.id, "rejected")}>Reject</Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Election Builder</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveElection}>
            <TextInput label="Title" className="sm:col-span-2" value={election.title} onChange={(event) => setElection((current) => ({ ...current, title: event.target.value }))} />
            <TextArea label="Description" className="sm:col-span-2" value={election.description} onChange={(event) => setElection((current) => ({ ...current, description: event.target.value }))} />
            <TextInput label="Starts At" type="datetime-local" value={election.startsAt} onChange={(event) => setElection((current) => ({ ...current, startsAt: event.target.value }))} />
            <TextInput label="Ends At" type="datetime-local" value={election.endsAt} onChange={(event) => setElection((current) => ({ ...current, endsAt: event.target.value }))} />
            <SelectInput label="Status" value={election.status} onChange={(event) => setElection((current) => ({ ...current, status: event.target.value }))}>
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="closed">Closed</option>
            </SelectInput>
            <TextInput label="Source Suggestion ID" value={election.sourceSuggestionId} onChange={(event) => setElection((current) => ({ ...current, sourceSuggestionId: event.target.value }))} />
            <label className="sm:col-span-2 flex flex-col gap-2 text-sm font-medium text-stone-700">
              <span>Election Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setElection((current) => ({
                    ...current,
                    image: file || null,
                    preview: file ? URL.createObjectURL(file) : current.preview,
                  }));
                }}
              />
            </label>
            {election.preview ? <img src={election.preview} alt="Election preview" className="sm:col-span-2 h-48 w-full rounded-3xl object-cover" /> : null}
            <div className="sm:col-span-2 space-y-3">
              {options.map((option, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-stone-200 p-4 sm:grid-cols-2">
                  <TextInput
                    label={`Option ${index + 1} Name`}
                    value={option.name}
                    onChange={(event) =>
                      setOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, name: event.target.value } : item)))
                    }
                  />
                  <TextInput
                    label="Description"
                    value={option.description}
                    onChange={(event) =>
                      setOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)))
                    }
                  />
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => setOptions((current) => [...current, { name: "", description: "" }])}>
                Add Option
              </Button>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save Election</Button>
            </div>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[var(--brand-900)]">Election Results Dashboard</h2>
        {selectedResults ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--brand-50)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-500)]">Winner</p>
                <h3 className="mt-2 text-2xl font-black text-[var(--brand-900)]">{selectedResults.winner?.name || "No votes yet"}</h3>
              </div>
              <TableShell>
                <table className="min-w-full text-sm">
                  <tbody>
                    {[
                      ["Status", selectedResults.status],
                      ["Total Votes", selectedResults.totalVotes],
                      ["Eligible Residents", selectedResults.eligibleVoters],
                      ["Participation Rate", `${selectedResults.participationRate}%`],
                      ["Not Yet Voted", selectedResults.notVotedCount],
                      ["Completion Confirmations", selectedResults.completionCount],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-t border-stone-100">
                        <td className="px-4 py-3 font-semibold text-stone-600">{label}</td>
                        <td className="px-4 py-3 text-[var(--brand-900)]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedResults.options}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#2d7a3a" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-stone-500">No election results available yet.</p>
        )}
      </Card>
    </div>
  );
};

export default Admin_VotingResult;
