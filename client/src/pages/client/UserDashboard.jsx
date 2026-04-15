import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const UserDashboard = () => {
  const { token, user, notifications, refreshNotifications, refreshProfile } = useAuth();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [live] = await Promise.all([
          api("/voting/live"),
          refreshNotifications(),
          refreshProfile(),
        ]);
        setElection(live.election);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      load();
    }
  }, [token]);

  if (loading) {
    return <div className="rounded-3xl bg-white p-8 shadow">Loading your dashboard...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-green-800">Welcome back, {user?.firstName}.</h1>
        <p className="mt-2 text-sm text-stone-600">
          Your resident portal keeps your election status, notifications, and account approval in one place.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-green-700 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-green-100">Account</p>
            <p className="mt-2 text-lg font-semibold">{user?.status}</p>
          </div>
          <div className="rounded-2xl bg-green-700 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-green-100">Role</p>
            <p className="mt-2 text-lg font-semibold">{user?.role}</p>
          </div>
          <div className="rounded-2xl bg-green-700 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-green-100">Voting</p>
            <p className="mt-2 text-lg font-semibold">{user?.hasVoted ? "Completed" : "Pending"}</p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">Election status</p>
          <p className="mt-1 text-sm text-stone-700">
            {election
              ? `${election.title} is now live with ${election.totalVotes} total votes.`
              : "No live election is published yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/voting-center" className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white">
              Open Voting Center
            </Link>
            <Link to="/voting-result" className="rounded-full border border-green-700 px-4 py-2 text-sm font-semibold text-green-700">
              View Live Results
            </Link>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-green-800">Notifications</h2>
        <div className="mt-4 space-y-3">
          {notifications.length ? (
            notifications.map((note) => (
              <div key={note.id} className="rounded-2xl border border-stone-200 p-4">
                <p className="font-semibold text-stone-800">{note.title}</p>
                <p className="mt-1 text-sm text-stone-600">{note.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">No notifications yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default UserDashboard;
