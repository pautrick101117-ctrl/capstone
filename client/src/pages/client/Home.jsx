import {
  ArrowRight,
  CalendarDays,
  Landmark,
  Newspaper,
  WalletCards,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { api } from "../../lib/api";
import { Card, Skeleton, StatCard } from "../../components/ui";
import { formatCurrency, formatDate } from "../../lib/format";

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/public/landing")
      .then((payload) => setData(payload))
      .finally(() => setLoading(false));
  }, []);

  const statistics = data?.statistics;
  const hero = data?.hero?.hero || {
    title: "Barangay services that feel organized, transparent, and easy to reach.",
    description:
      "Follow public updates, view project spending, participate in elections, and access resident services through one cleaner digital portal.",
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,122,58,0.22),_transparent_34%),linear-gradient(135deg,#f3f7ef_0%,#ffffff_45%,#dfeedd_100%)]">
        <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(45,122,58,0.08),transparent)]" />
        <div className="section-shell relative grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex rounded-full bg-[var(--brand-50)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-600)]">
              Barangay Iba Portal System
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[var(--brand-900)] sm:text-5xl lg:text-6xl">
                {hero.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">{hero.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <NavLink to="/login" className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-500)] px-5 py-3 text-sm font-semibold text-white">
                Resident Login
                <ArrowRight className="h-4 w-4" />
              </NavLink>
              <NavLink to="/fund_transparency" className="rounded-full border border-[var(--brand-200)] px-5 py-3 text-sm font-semibold text-[var(--brand-700)]">
                View Fund Transparency
              </NavLink>
            </div>
            {data?.liveElection ? (
              <div className="glass-card max-w-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-500)]">Live Election</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--brand-900)]">{data.liveElection.title}</h2>
                    <p className="mt-2 text-sm text-stone-600">{data.liveElection.description}</p>
                  </div>
                  <NavLink to="/voting-result" className="rounded-full bg-[var(--brand-500)] px-4 py-2 text-sm font-semibold text-white">
                    View Results
                  </NavLink>
                </div>
              </div>
            ) : null}
          </div>

          <Card className="overflow-hidden bg-[linear-gradient(160deg,#0f2915_0%,#266a33_50%,#5e9d5d_100%)] p-0 text-white">
            <div className="grid h-full gap-0 md:grid-cols-2 lg:grid-cols-1">
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">Fund Summary</p>
                {loading ? (
                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-8 w-32 bg-white/15" />
                    <Skeleton className="h-5 w-full bg-white/10" />
                    <Skeleton className="h-5 w-5/6 bg-white/10" />
                  </div>
                ) : (
                  <>
                    <p className="mt-4 text-3xl font-black">{formatCurrency(data?.fundSummary?.total)}</p>
                    <div className="mt-6 space-y-3 text-sm text-emerald-50">
                      <div className="flex items-center justify-between">
                        <span>Spent</span>
                        <span className="font-semibold">{formatCurrency(data?.fundSummary?.spent)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Remaining</span>
                        <span className="font-semibold">{formatCurrency(data?.fundSummary?.remaining)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="bg-white/10 p-6">
                <p className="text-sm font-semibold text-emerald-50">Public reminder</p>
                <p className="mt-3 text-sm leading-6 text-emerald-50/90">
                  No account yet? Contact your Barangay admin for resident account creation and initial login credentials.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="section-shell py-12">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Registered Residents" value={statistics?.totalRegisteredResidents ?? "--"} />
          <StatCard icon={Landmark} label="Completed Projects" value={statistics?.completedProjects ?? "--"} />
          <StatCard icon={CalendarDays} label="Active Officials" value={statistics?.activeOfficials ?? "--"} />
          <StatCard icon={WalletCards} label="Funds Spent" value={loading ? "--" : formatCurrency(statistics?.totalFundsSpent)} />
        </div>
      </section>

      <section className="section-shell grid gap-8 pb-14 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-500)]">Upcoming Events</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--brand-900)]">Next 3 community activities</h2>
            </div>
            <NavLink to="/calendar" className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
              View calendar
            </NavLink>
          </div>
          <div className="mt-6 space-y-4">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)
              : (data?.upcomingEvents || []).map((event) => (
                  <div key={event.id} className="rounded-2xl border border-stone-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-500)]">{event.type}</p>
                        <h3 className="mt-2 text-lg font-bold text-[var(--brand-900)]">{event.title}</h3>
                        <p className="mt-2 text-sm text-stone-500">{formatDate(event.date)} {event.time ? `• ${event.time}` : ""}</p>
                      </div>
                      <div className="rounded-full bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-600)]">
                        {event.location || "Barangay Hall"}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{event.description || "Details will be posted soon."}</p>
                  </div>
                ))}
          </div>
        </Card>

        <div className="grid gap-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-500)]">Latest News</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--brand-900)]">What’s happening now</h2>
              </div>
              <NavLink to="/news" className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                View all
              </NavLink>
            </div>
            <div className="mt-6 space-y-4">
              {(data?.news || []).map((item) => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-stone-200 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-50)] text-[var(--brand-600)]">
                    <Newspaper className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{formatDate(item.createdAt)}</p>
                    <h3 className="mt-1 font-bold text-[var(--brand-900)]">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-500)]">Announcements</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--brand-900)]">Resident notices</h2>
              </div>
              <NavLink to="/announcements" className="text-sm font-semibold text-[var(--brand-600)] hover:underline">
                View all
              </NavLink>
            </div>
            <div className="mt-6 space-y-4">
              {(data?.announcements || []).map((item) => (
                <div key={item.id} className="rounded-2xl bg-[var(--brand-50)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-500)]">{formatDate(item.createdAt)}</p>
                  <h3 className="mt-2 font-bold text-[var(--brand-900)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{item.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
