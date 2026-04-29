import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../lib/api";
import { Badge, Card, EmptyState, PageHeader } from "../../components/ui";
import { countdownText, formatDateTime } from "../../lib/format";

const VotingResult = () => {
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/voting/results/latest")
      .then((data) => setElection(data.election))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="section-shell py-10"><p className="text-sm text-stone-500">Loading voting results...</p></section>;
  }

  if (!election) {
    return (
      <section className="section-shell py-10">
        <EmptyState title="No voting data yet" description="Voting results will appear here once an election has been created." />
      </section>
    );
  }

  const winner = election.options.find((option) => option.isWinner);

  return (
    <section className="section-shell py-10 sm:py-14">
      <PageHeader
        eyebrow="Voting Results"
        title={election.title}
        description={election.description || "Public results remain anonymous while still showing participation and option performance."}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={election.status === "closed" ? "success" : "info"}>{election.status}</Badge>
            <Badge tone="neutral">{countdownText(election.endsAt)}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Votes Cast", election.totalVotes],
              ["Eligible Residents", election.eligibleVoters],
              ["Participation Rate", `${election.participationRate}%`],
              ["Completion Confirmations", election.completionCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[var(--brand-50)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-500)]">{label}</p>
                <p className="mt-2 text-2xl font-black text-[var(--brand-900)]">{value}</p>
              </div>
            ))}
          </div>
          {winner ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Current Leader</p>
                  <h2 className="text-xl font-bold text-emerald-900">{winner.name}</h2>
                </div>
              </div>
            </div>
          ) : null}
          <p className="text-sm text-stone-500">Last updated: {formatDateTime(election.endsAt)}</p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Option performance</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={election.options}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="votes" fill="#2d7a3a" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {election.options.map((option) => (
              <div key={option.id} className={`rounded-2xl border p-4 ${option.isWinner ? "border-emerald-300 bg-emerald-50" : "border-stone-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--brand-900)]">{option.name}</p>
                    <p className="mt-1 text-sm text-stone-500">{option.description || "No description provided."}</p>
                  </div>
                  {option.isWinner ? <Badge tone="success">winner</Badge> : null}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-stone-500">Votes</span>
                  <span className="font-semibold text-[var(--brand-700)]">{option.votes}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-stone-500">Percentage</span>
                  <span className="font-semibold text-[var(--brand-700)]">{option.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default VotingResult;
