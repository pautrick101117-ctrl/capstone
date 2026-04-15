import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { GreenBtn, MOCK, shellStyles } from "./adminShared";

const Admin_VotingResult = () => {
  const { token } = useAuth();
  const [election, setElection] = useState({
    id: "",
    title: MOCK.votingResults.title,
    description: "Community voting outcomes",
    status: "live",
  });
  const [options, setOptions] = useState(
    MOCK.votingResults.options.map((option) => ({
      name: option.name,
      description: "",
      votes_count: option.votes,
    }))
  );
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!token) return;

    api("/admin/election", { token })
      .then((data) => {
        if (data.election) {
          setElection({
            id: data.election.id,
            title: data.election.title,
            description: data.election.description || "",
            status: data.election.status,
          });
        }
        if (data.options?.length) {
          setOptions(data.options);
        }
      })
      .catch(() => {});
  }, [token]);

  const winner = [...options].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))[0];
  const totalVotes = options.reduce((sum, option) => sum + Number(option.votes_count || 0), 0);

  const saveElection = async () => {
    await api("/admin/election", {
      method: "PUT",
      token,
      body: { election, options },
    });
    setSaved("Election details saved.");
    window.setTimeout(() => setSaved(""), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: "#2d7a3a" }}>Voting Results</div>
        <GreenBtn onClick={saveElection}>Save Election</GreenBtn>
      </div>
      <div style={{ ...shellStyles.card, padding: 24 }}>
        {saved ? (
          <div style={{ marginBottom: 16, borderRadius: 6, background: "#e6f7ed", color: "#1a7a3a", padding: "10px 12px", fontSize: 13 }}>
            {saved}
          </div>
        ) : null}
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Community Voting Outcomes</div>
        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          <input
            value={election.title}
            onChange={(e) => setElection((prev) => ({ ...prev, title: e.target.value }))}
            style={{ background: "#f5f5f5", border: "none", borderRadius: 6, padding: "10px 12px", fontSize: 14 }}
          />
          <textarea
            value={election.description}
            onChange={(e) => setElection((prev) => ({ ...prev, description: e.target.value }))}
            style={{ background: "#f5f5f5", border: "none", borderRadius: 6, padding: "10px 12px", fontSize: 14, minHeight: 80 }}
          />
        </div>
        <div style={{ background: "#2d7a3a", color: "#fff", textAlign: "center", padding: "10px", borderRadius: 6, marginBottom: 16, fontWeight: 700 }}>
          Winning Option
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
          {options.map((option, index) => (
            <div key={`${option.name}-${index}`} style={{ flex: 1, minWidth: 220, borderRadius: 8, padding: 16, textAlign: "center", background: option.name === winner?.name ? "#e8f5e9" : "#f0f0f0", border: option.name === winner?.name ? "2px solid #2d7a3a" : "2px solid #ccc" }}>
              <div style={{ width: "100%", height: 100, background: option.name === winner?.name ? "#4a7c59" : "#888", borderRadius: 6, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                <input
                  value={option.name}
                  onChange={(e) =>
                    setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, name: e.target.value } : item)))
                  }
                  style={{ width: "100%", background: "transparent", border: "none", color: "#fff", textAlign: "center", fontSize: 13, fontWeight: 600 }}
                />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{option.name}</div>
              <input
                type="number"
                value={option.votes_count}
                onChange={(e) =>
                  setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, votes_count: Number(e.target.value) } : item)))
                }
                style={{ marginTop: 8, width: "100%", background: "#fff", border: "1px solid #d0d0d0", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
              />
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, borderTop: "1px solid #e0e0e0", paddingTop: 16, marginBottom: 16 }}>
          Total Votes: {totalVotes}
        </div>
        <div style={{ fontSize: 13, color: "#444", background: "#f9f9f9", borderRadius: 6, padding: 14 }}>
          With a total of {totalVotes} votes, <strong>{winner?.name}</strong> is currently leading with {winner?.votes_count || 0} votes.
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {options.map((option, index) => (
            <div key={`${option.name}-${index}`} style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span>{option.name}</span>
                <span style={{ fontWeight: 700 }}>{totalVotes ? Math.round((option.votes_count / totalVotes) * 100) : 0}%</span>
              </div>
              <div style={{ height: 10, background: "#e0e0e0", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${totalVotes ? (option.votes_count / totalVotes) * 100 : 0}%`, height: "100%", background: option.name === winner?.name ? "#2d7a3a" : "#888", borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin_VotingResult;
