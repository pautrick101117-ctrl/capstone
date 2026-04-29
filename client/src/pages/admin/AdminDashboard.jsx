import { BellRing, ClipboardList, Landmark, Users, Vote } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, PageHeader, StatCard } from "../../components/ui";
import { formatDateTime } from "../../lib/format";
import { NavLink } from "react-router-dom";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) return;
    api("/admin/dashboard", { token }).then(setData);
  }, [token]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Barangay operations at a glance"
        description="Monitor resident activity, open requests, voting participation, and recent administrative actions."
        actions={
          <>
            <NavLink to="/admin/residents"><Button>Create User</Button></NavLink>
            <NavLink to="/admin/announcements"><Button variant="secondary">Post Announcement</Button></NavLink>
            <NavLink to="/admin/voting"><Button variant="secondary">Create Election</Button></NavLink>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Residents" value={data?.stats?.totalResidents ?? "--"} />
        <StatCard icon={ClipboardList} label="Pending Requests" value={data?.stats?.pendingRequests ?? "--"} />
        <StatCard icon={Landmark} label="Active Officials" value={data?.stats?.activeOfficials ?? "--"} />
        <StatCard icon={Vote} label="Open Elections" value={data?.stats?.openElections ?? "--"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Requests by type over time</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.requestsByType || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Barangay Clearance" fill="#2d7a3a" radius={[12, 12, 0, 0]} />
                <Bar dataKey="Certificate of Residency" fill="#5e9d5d" radius={[12, 12, 0, 0]} />
                <Bar dataKey="Certificate of Indigency" fill="#92c28b" radius={[12, 12, 0, 0]} />
                <Bar dataKey="Barangay ID" fill="#beddb9" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Resident status breakdown</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts?.residentStatusBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  fill="#2d7a3a"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-xl font-bold text-[var(--brand-900)]">Voting participation</h2>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.charts?.votingParticipation || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="election" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="participationRate" stroke="#2d7a3a" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <BellRing className="h-5 w-5 text-[var(--brand-600)]" />
            <h2 className="text-xl font-bold text-[var(--brand-900)]">Recent activity</h2>
          </div>
          <div className="mt-5 space-y-4">
            {(data?.recentActivity || []).map((log) => (
              <div key={log.id} className="rounded-2xl border border-stone-200 p-4">
                <p className="font-semibold text-[var(--brand-900)]">{log.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm text-stone-500">{log.entity_type} • {log.entity_id}</p>
                <p className="mt-3 text-xs text-stone-400">{formatDateTime(log.created_at)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
