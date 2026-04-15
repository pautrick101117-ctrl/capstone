import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const VotingResult = () => {
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/voting/live")
      .then((data) => setElection(data.election))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 shadow">Loading live results...</div>;
  }

  if (!election) {
    return <div className="rounded-3xl bg-white p-8 shadow">No live election yet.</div>;
  }

  const winner = [...election.options].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Live Results</p>
      <h1 className="mt-2 text-2xl font-bold text-stone-800">{election.title}</h1>
      <p className="mt-2 text-sm text-stone-600">{election.description}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {election.options.map((option) => {
          const percent = election.totalVotes ? Math.round((option.votes / election.totalVotes) * 100) : 0;
          return (
            <div key={option.id} className={`rounded-3xl border p-5 ${winner?.id === option.id ? "border-green-700 bg-green-50" : "border-stone-200 bg-stone-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-bold text-stone-800">{option.name}</p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-green-700">{percent}%</span>
              </div>
              <p className="mt-2 text-sm text-stone-600">{option.description || "Priority infrastructure item"}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200">
                <div className="h-full rounded-full bg-green-700" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-700">{option.votes} votes</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-green-700 px-5 py-4 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-100">Current leader</p>
        <p className="mt-2 text-xl font-bold">{winner?.name}</p>
        <p className="mt-1 text-sm text-green-100">Total votes cast: {election.totalVotes}</p>
      </div>
    </div>
  );
};

export default VotingResult;
