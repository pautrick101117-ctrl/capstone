import { CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge, Button, Card, EmptyState, PageHeader } from "../../components/ui";
import { countdownText, formatDateTime } from "../../lib/format";

const VotingCenter = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [election, setElection] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completionSaving, setCompletionSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [electionData, statusData] = await Promise.all([
        api("/voting/current", { token }),
        api("/voting/my-status", { token }).catch(() => ({ hasVoted: false })),
      ]);
      setElection(electionData.election);
      setHasVoted(Boolean(statusData.hasVoted));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]);

  const castVote = async (optionId) => {
    setSaving(true);
    try {
      await api("/voting/vote", { method: "POST", token, body: { optionId } });
      toast.success("Your vote has been recorded.");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async () => {
    setCompletionSaving(true);
    try {
      await api("/voting/mark-completed", { method: "POST", token, body: { electionId: election.id } });
      toast.success("Project delivery confirmation submitted.");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCompletionSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-stone-500">Loading election details...</div>;
  }

  if (!election) {
    return <EmptyState title="No election available" description="There is no active or recent election to display right now." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resident Voting Center"
        title={election.title}
        description={election.description || "Review the project details and cast one vote during the live election window."}
      />

      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-72 bg-[var(--brand-50)] lg:h-full">
            {election.imageUrl ? (
              <img src={election.imageUrl} alt={election.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#dfeedd,#ffffff)] text-[var(--brand-600)]">
                Election image
              </div>
            )}
          </div>
          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={election.status === "live" ? "success" : "neutral"}>{election.status}</Badge>
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                <Clock3 className="h-3.5 w-3.5" />
                {countdownText(election.endsAt)}
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--brand-50)] p-4 text-sm text-stone-600">
              Voting ends on {formatDateTime(election.endsAt)}. Eligible residents: {election.eligibleVoters}. Votes cast so far: {election.totalVotes}.
            </div>
            <div className="space-y-4">
              {election.options.map((option) => (
                <div key={option.id} className="rounded-2xl border border-stone-200 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--brand-900)]">{option.name}</h3>
                      <p className="mt-1 text-sm text-stone-500">{option.description || "No extra description provided."}</p>
                    </div>
                    <Button
                      onClick={() => castVote(option.id)}
                      disabled={saving || hasVoted || election.status !== "live"}
                      loading={saving}
                    >
                      {hasVoted ? "Vote submitted" : "Vote for this option"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {hasVoted ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Your vote has already been counted.
              </div>
            ) : null}
            {election.status === "closed" ? (
              <Button onClick={markCompleted} loading={completionSaving}>
                Mark project as completed
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VotingCenter;
