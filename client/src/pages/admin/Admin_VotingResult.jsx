import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { GreenBtn, shellStyles, SmallInput } from "./adminShared";

const emptyOption = () => ({
  name: "",
  description: "",
  votes_count: 0,
});

const Admin_VotingResult = () => {
  const { token } = useAuth();
  const [election, setElection] = useState({
    id: "",
    title: "",
    description: "",
    status: "draft",
    startsAt: "",
    endsAt: "",
  });
  const [options, setOptions] = useState([emptyOption(), emptyOption()]);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    api("/admin/election", { token })
      .then((data) => {
        if (data.election) {
          setElection({
            id: data.election.id,
            title: data.election.title,
            description: data.election.description || "",
            status: data.election.status || "draft",
            startsAt: data.election.starts_at ? data.election.starts_at.slice(0, 16) : "",
            endsAt: data.election.ends_at ? data.election.ends_at.slice(0, 16) : "",
          });
        }

        if (data.options?.length) {
          setOptions(data.options);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const totalVotes = options.reduce((sum, option) => sum + Number(option.votes_count || 0), 0);
  const winner = [...options].sort((a, b) => Number(b.votes_count || 0) - Number(a.votes_count || 0))[0];

  const saveElection = async () => {
    setFeedback({ error: "", success: "" });

    const cleanedOptions = options
      .map((option) => ({
        ...option,
        name: option.name.trim(),
        description: (option.description || "").trim(),
      }))
      .filter((option) => option.name);

    if (!election.title.trim()) {
      setFeedback({ error: "Voting project title is required.", success: "" });
      return;
    }

    if (cleanedOptions.length < 2) {
      setFeedback({ error: "Add at least two options for residents to vote on.", success: "" });
      return;
    }

    try {
      const data = await api("/admin/election", {
        method: "PUT",
        token,
        body: {
          election,
          options: cleanedOptions,
        },
      });
      if (data.election) {
        setElection((current) => ({
          ...current,
          id: data.election.id,
          status: data.election.status || current.status,
        }));
      }
      setOptions(cleanedOptions);
      setFeedback({ error: "", success: election.id ? "Voting project updated." : "Voting project created." });
    } catch (error) {
      setFeedback({ error: error.message, success: "" });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Voting Project Setup</div>
        <GreenBtn onClick={saveElection}>Save Voting Project</GreenBtn>
      </div>

      <div style={{ ...shellStyles.card, padding: 24 }}>
        {feedback.success ? (
          <div style={{ marginBottom: 16, borderRadius: 6, background: "#e6f7ed", color: "#1a7a3a", padding: "10px 12px", fontSize: 13 }}>
            {feedback.success}
          </div>
        ) : null}
        {feedback.error ? (
          <div style={{ marginBottom: 16, borderRadius: 6, background: "#fdeaea", color: "#c0392b", padding: "10px 12px", fontSize: 13 }}>
            {feedback.error}
          </div>
        ) : null}

        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Create what residents will vote for</div>
        <div style={{ display: "grid", gap: 12, marginBottom: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <SmallInput value={election.title} onChange={(event) => setElection((current) => ({ ...current, title: event.target.value }))} placeholder="Voting project title" />
          <select
            value={election.status}
            onChange={(event) => setElection((current) => ({ ...current, status: event.target.value }))}
            style={{ width: "100%", background: "#f5f5f5", border: "1px solid #d8d8d8", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="datetime-local"
            value={election.startsAt}
            onChange={(event) => setElection((current) => ({ ...current, startsAt: event.target.value }))}
            style={{ width: "100%", background: "#f5f5f5", border: "1px solid #d8d8d8", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
          />
          <input
            type="datetime-local"
            value={election.endsAt}
            onChange={(event) => setElection((current) => ({ ...current, endsAt: event.target.value }))}
            style={{ width: "100%", background: "#f5f5f5", border: "1px solid #d8d8d8", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
          />
          <textarea
            value={election.description}
            onChange={(event) => setElection((current) => ({ ...current, description: event.target.value }))}
            placeholder="Explain the purpose of this vote"
            style={{ minHeight: 90, gridColumn: "1 / -1", background: "#f5f5f5", border: "1px solid #d8d8d8", borderRadius: 6, padding: "10px 12px", fontSize: 14 }}
          />
        </div>

        {loading ? <div style={{ marginBottom: 16, fontSize: 13, color: "#666" }}>Loading voting data...</div> : null}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: "#2d7a3a", color: "#fff", textAlign: "center", padding: "10px 14px", borderRadius: 6, fontWeight: 700 }}>
            Voting Options
          </div>
          <GreenBtn small outline onClick={() => setOptions((current) => [...current, emptyOption()])}>
            Add Option
          </GreenBtn>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
          {options.map((option, index) => (
            <div key={`${option.id || "option"}-${index}`} style={{ flex: 1, minWidth: 240, borderRadius: 8, padding: 16, textAlign: "center", background: option.name && option.name === winner?.name ? "#e8f5e9" : "#f0f0f0", border: option.name && option.name === winner?.name ? "2px solid #2d7a3a" : "2px solid #ccc" }}>
              <div style={{ width: "100%", height: 100, background: option.name && option.name === winner?.name ? "#4a7c59" : "#888", borderRadius: 6, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600, padding: 8 }}>
                <input
                  value={option.name}
                  onChange={(event) => setOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, name: event.target.value } : item)))}
                  placeholder={`Option ${index + 1}`}
                  style={{ width: "100%", background: "transparent", border: "none", color: "#fff", textAlign: "center", fontSize: 13, fontWeight: 600 }}
                />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{option.name || `Option ${index + 1}`}</div>
              <textarea
                value={option.description || ""}
                onChange={(event) => setOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)))}
                placeholder="Describe this option"
                style={{ marginTop: 8, width: "100%", minHeight: 72, background: "#fff", border: "1px solid #d0d0d0", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
              />
              <div style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
                Votes recorded: <strong>{option.votes_count || 0}</strong>
              </div>
              <div style={{ marginTop: 10 }}>
                <GreenBtn small danger onClick={() => setOptions((current) => (current.length > 2 ? current.filter((_, itemIndex) => itemIndex !== index) : current))}>
                  Remove
                </GreenBtn>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, borderTop: "1px solid #e0e0e0", paddingTop: 16, marginBottom: 16 }}>
          Total Votes: {totalVotes}
        </div>

        <div style={{ fontSize: 13, color: "#444", background: "#f9f9f9", borderRadius: 6, padding: 14 }}>
          {winner?.name ? (
            <>
              With a total of {totalVotes} votes, <strong>{winner.name}</strong> is currently leading with {winner.votes_count || 0} votes.
            </>
          ) : (
            "No votes have been recorded yet."
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {options.map((option, index) => (
            <div key={`${option.id || "bar"}-${index}`} style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span>{option.name || `Option ${index + 1}`}</span>
                <span style={{ fontWeight: 700 }}>{totalVotes ? Math.round((Number(option.votes_count || 0) / totalVotes) * 100) : 0}%</span>
              </div>
              <div style={{ height: 10, background: "#e0e0e0", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${totalVotes ? (Number(option.votes_count || 0) / totalVotes) * 100 : 0}%`, height: "100%", background: option.name && option.name === winner?.name ? "#2d7a3a" : "#888", borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin_VotingResult;
