import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const VotingCenter = () => {
  const { isAuthenticated, token, refreshProfile, refreshNotifications } = useAuth();
  const [election, setElection] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [live, status] = await Promise.all([
          api("/voting/live"),
          api("/voting/my-status", { token }),
        ]);
        setElection(live.election);
        setHasVoted(status.hasVoted);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      load();
    }
  }, [token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleVote = async () => {
    if (!selectedOption) return;

    setSubmitting(true);
    setMessage("");
    try {
      const data = await api("/voting/vote", {
        method: "POST",
        token,
        body: { optionId: selectedOption },
      });
      setMessage(data.message);
      setHasVoted(true);
      await Promise.all([refreshProfile(), refreshNotifications()]);
      const live = await api("/voting/live");
      setElection(live.election);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 shadow">Loading voting center...</div>;
  }

  if (!election) {
    return <div className="rounded-3xl bg-white p-8 shadow">There is no live election right now.</div>;
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Live Election</p>
          <h1 className="mt-2 text-2xl font-bold text-stone-800">{election.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">{election.description}</p>
        </div>
        <div className="rounded-2xl bg-green-700 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-green-100">One vote only</p>
          <p className="mt-2 text-lg font-semibold">{hasVoted ? "Vote submitted" : "Vote pending"}</p>
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {election.options.map((option) => {
          const checked = selectedOption === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={hasVoted}
              onClick={() => setSelectedOption(option.id)}
              className={`rounded-3xl border p-5 text-left transition ${
                checked ? "border-green-700 bg-green-50" : "border-stone-200 bg-white"
              } ${hasVoted ? "cursor-not-allowed opacity-70" : "hover:border-green-500"}`}
            >
              <p className="text-lg font-bold text-stone-800">{option.name}</p>
              <p className="mt-2 text-sm text-stone-600">{option.description || "Priority infrastructure item"}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                Current votes: {option.votes}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleVote}
          disabled={!selectedOption || hasVoted || submitting}
          className="rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {hasVoted ? "Vote Locked" : submitting ? "Submitting..." : "Submit Vote"}
        </button>
        <p className="text-sm text-stone-500">Your account can only cast one vote for each live election.</p>
      </div>
    </div>
  );
};

export default VotingCenter;
