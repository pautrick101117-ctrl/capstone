import { BellRing, ClipboardCheck, Vote, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Badge, Card, EmptyState, PageHeader, StatCard } from "../../components/ui";
import { formatDateTime } from "../../lib/format";

const UserDashboard = () => {
  const { token, user, notifications } = useAuth();
  const [requests, setRequests] = useState([]);
  const [election, setElection] = useState(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([api("/requests/mine", { token }), api("/voting/current", { token })]).then(([requestData, votingData]) => {
      setRequests(requestData.requests || []);
      setElection(votingData.election);
    });
  }, [token]);

  const completedRequests = requests.filter((item) => item.status === "completed").length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resident Overview"
        title={`Welcome back, ${user?.firstName || "Resident"}`}
        description="Keep an eye on your active requests, resident notifications, and current voting activity."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Total Requests" value={requests.length} />
        <StatCard icon={Wallet} label="Completed Requests" value={completedRequests} />
        <StatCard icon={BellRing} label="Unread Notifications" value={notifications.filter((item) => !item.is_read).length} />
        <StatCard icon={Vote} label="Live Voting" value={election?.status === "live" ? "Open" : "No live poll"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Account Snapshot</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Username", user?.username],
              ["Purok", user?.purok || "Not set"],
              ["Address", user?.address || "Not set"],
              ["Contact", user?.contactNumber || "Not set"],
              ["Birthdate", user?.birthdate || "Not set"],
              ["Status", user?.isActive ? "Active" : "Inactive"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-[var(--brand-50)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-500)]">{label}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--brand-900)]">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-900)]">Latest Notifications</h2>
              <p className="mt-1 text-sm text-stone-500">Updates from the barangay administration and system activity.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {!notifications.length ? (
              <EmptyState title="No notifications yet" description="Resident updates will show here when there is activity." />
            ) : (
              notifications.slice(0, 5).map((note) => (
                <div key={note.id} className="rounded-2xl border border-stone-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--brand-900)]">{note.title}</p>
                      <p className="mt-2 text-sm text-stone-600">{note.body}</p>
                    </div>
                    {!note.is_read ? <Badge tone="info">new</Badge> : null}
                  </div>
                  <p className="mt-3 text-xs text-stone-400">{formatDateTime(note.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-[var(--brand-900)]">Recent Requests</h2>
        <div className="mt-5 space-y-4">
          {!requests.length ? (
            <EmptyState title="No requests yet" description="Start with a barangay document or service request from the Requests page." />
          ) : (
            requests.slice(0, 4).map((request) => (
              <div key={request.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[var(--brand-900)]">{request.request_type}</p>
                  <p className="mt-1 text-sm text-stone-500">{request.details}</p>
                </div>
                <Badge tone={request.status === "completed" ? "success" : request.status === "processing" ? "warning" : "info"}>
                  {request.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;
