import { useState } from "react";
import { useAdminStats, useAdminEvents, useAdminHosts, useAdminDonations } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, CalendarDays, Gift,
  LogOut, RefreshCw, Circle
} from "lucide-react";

type Tab = "overview" | "parties" | "hosts" | "revenue";

const fmt = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const AdminPage = () => {
  const [tab, setTab] = useState<Tab>("overview");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: events = [], isLoading: eventsLoading } = useAdminEvents();
  const { data: hosts = [], isLoading: hostsLoading } = useAdminHosts();
  const { data: donations = [], isLoading: donationsLoading } = useAdminDonations();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "parties", label: "Parties" },
    { key: "hosts", label: "Hosts" },
    { key: "revenue", label: "Revenue" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F2] font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-[#F7F5F2]/90 backdrop-blur-sm border-b border-black/8">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-black/40">
              PartyPal
            </span>
            <span className="text-black/20">/</span>
            <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-black">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetchStats()}
              className="p-2 rounded-lg text-black/40 hover:text-black hover:bg-black/5 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-black/40 hover:text-black hover:bg-black/5 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Page title */}
        <div>
          <h1 className="text-4xl font-serif italic text-black">Platform</h1>
          <p className="text-sm text-black/40 mt-1">Live data across all PartyPal users</p>
        </div>

        {/* Stat cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-4 w-4" strokeWidth={1.5} />}
              label="Hosts"
              value={stats.total_hosts}
              sub={`+${stats.signups_this_week} this week`}
              accent="#E8F4FD"
              iconColor="#2D7DD2"
            />
            <StatCard
              icon={<CalendarDays className="h-4 w-4" strokeWidth={1.5} />}
              label="Parties"
              value={stats.total_events}
              sub={`+${stats.events_this_week} this week`}
              accent="#F0FAF0"
              iconColor="#2D8A4E"
            />
            <StatCard
              icon={<Circle className="h-4 w-4" strokeWidth={1.5} />}
              label="RSVPs"
              value={stats.attending_guests}
              sub={`of ${stats.total_guests} invited`}
              accent="#FFF8ED"
              iconColor="#D97706"
            />
            <StatCard
              icon={<Gift className="h-4 w-4" strokeWidth={1.5} />}
              label="Donations"
              value={fmt(stats.total_donations)}
              sub="total collected"
              accent="#FDF0F8"
              iconColor="#C026D3"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-black/10">
          <div className="flex gap-6">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`pb-3 text-sm transition-colors border-b-2 -mb-px ${
                  tab === t.key
                    ? "border-black text-black font-medium"
                    : "border-transparent text-black/40 hover:text-black/70"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab panels */}
        {tab === "overview" && (
          <OverviewTab stats={stats} events={events} donations={donations} />
        )}
        {tab === "parties" && (
          <PartiesTab events={events} loading={eventsLoading} />
        )}
        {tab === "hosts" && (
          <HostsTab hosts={hosts} events={events} loading={hostsLoading} />
        )}
        {tab === "revenue" && (
          <RevenueTab donations={donations} loading={donationsLoading} stats={stats} />
        )}
      </div>
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────

const StatCard = ({
  icon, label, value, sub, accent, iconColor
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  iconColor: string;
}) => (
  <div className="bg-white rounded-xl p-5 border border-black/6 space-y-3">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: accent, color: iconColor }}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-semibold text-black tracking-tight">{value}</p>
      <p className="text-[11px] text-black/40 mt-0.5">{label}</p>
    </div>
    <p className="text-[11px] text-black/30">{sub}</p>
  </div>
);

// ── Overview Tab ───────────────────────────────────────────────────────────────

const OverviewTab = ({ stats, events, donations }: any) => {
  const recentEvents = events.slice(0, 6);
  const recentDonations = donations.slice(0, 5);
  const rsvpRate = stats
    ? Math.round((stats.attending_guests / Math.max(stats.total_guests, 1)) * 100)
    : 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent parties */}
      <div className="bg-white rounded-xl border border-black/6 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/6 flex items-center justify-between">
          <h3 className="text-sm font-medium text-black">Recent parties</h3>
          <span className="text-[11px] text-black/30">{events.length} total</span>
        </div>
        <div className="divide-y divide-black/4">
          {recentEvents.map((e: any) => (
            <div key={e.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-black font-medium">{e.child_name}'s Party</p>
                <p className="text-[11px] text-black/40">{e.location} · {fmtDate(e.date)}</p>
              </div>
              <span className="text-[11px] text-black/30">{fmtDate(e.created_at)}</span>
            </div>
          ))}
          {recentEvents.length === 0 && (
            <p className="px-5 py-6 text-sm text-black/30 text-center">No parties yet</p>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* RSVP rate */}
        <div className="bg-white rounded-xl border border-black/6 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-black">RSVP rate</h3>
            <span className="text-sm font-semibold text-black">{rsvpRate}%</span>
          </div>
          <div className="h-2 bg-black/6 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-700"
              style={{ width: `${rsvpRate}%` }}
            />
          </div>
          <p className="text-[11px] text-black/30">
            {stats?.attending_guests ?? 0} attending of {stats?.total_guests ?? 0} invited
          </p>
        </div>

        {/* Recent donations */}
        <div className="bg-white rounded-xl border border-black/6 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/6">
            <h3 className="text-sm font-medium text-black">Recent donations</h3>
          </div>
          <div className="divide-y divide-black/4">
            {recentDonations.map((d: any) => (
              <div key={d.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">{d.donor_name ?? "Anonymous"}</p>
                  <p className="text-[11px] text-black/40">
                    {(d.events as any)?.child_name}'s party
                  </p>
                </div>
                <span className="text-sm font-semibold text-black">
                  {fmt(d.amount_pence)}
                </span>
              </div>
            ))}
            {recentDonations.length === 0 && (
              <p className="px-5 py-6 text-sm text-black/30 text-center">No donations yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Parties Tab ────────────────────────────────────────────────────────────────

const PartiesTab = ({ events, loading }: { events: any[]; loading: boolean }) => {
  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="bg-white rounded-xl border border-black/6 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/6 text-left">
            <Th>Child</Th>
            <Th>Date</Th>
            <Th>Location</Th>
            <Th>Gift pot</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/4">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-black/[0.02] transition-colors">
              <Td><span className="font-medium">{e.child_name}</span></Td>
              <Td>{fmtDate(e.date)}</Td>
              <Td><span className="text-black/50">{e.location}</span></Td>
              <Td>
                {e.gift_enabled
                  ? <span className="text-emerald-600 font-medium">{fmt(e.gift_pot_total ?? 0)}</span>
                  : <span className="text-black/20">—</span>
                }
              </Td>
              <Td><span className="text-black/40">{fmtDate(e.created_at)}</span></Td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr><td colSpan={5} className="px-5 py-10 text-center text-black/30">No parties yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ── Hosts Tab ──────────────────────────────────────────────────────────────────

const HostsTab = ({ hosts, events, loading }: { hosts: any[]; events: any[]; loading: boolean }) => {
  if (loading) return <TableSkeleton rows={6} />;

  // Count events per host
  const eventsByHost = events.reduce((acc: Record<string, number>, e) => {
    acc[e.organiser_id] = (acc[e.organiser_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl border border-black/6 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/6 text-left">
            <Th>User ID</Th>
            <Th>Parties</Th>
            <Th>Role</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/4">
          {hosts.map((h) => (
            <tr key={h.id} className="hover:bg-black/[0.02] transition-colors">
              <Td>
                <span className="font-mono text-xs text-black/50">
                  {h.id.slice(0, 8)}…
                </span>
              </Td>
              <Td>
                <span className="font-medium">{eventsByHost[h.id] ?? 0}</span>
              </Td>
              <Td>
                {h.is_admin
                  ? <span className="text-[11px] bg-black text-white px-2 py-0.5 rounded-full">Admin</span>
                  : <span className="text-[11px] bg-black/6 text-black/50 px-2 py-0.5 rounded-full">Host</span>
                }
              </Td>
              <Td><span className="text-black/40">{fmtDate(h.created_at)}</span></Td>
            </tr>
          ))}
          {hosts.length === 0 && (
            <tr><td colSpan={4} className="px-5 py-10 text-center text-black/30">No hosts yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ── Revenue Tab ────────────────────────────────────────────────────────────────

const RevenueTab = ({ donations, loading, stats }: { donations: any[]; loading: boolean; stats: any }) => {
  if (loading) return <TableSkeleton rows={8} />;

  const totalPence = stats?.total_donations ?? 0;
  const avgPence = donations.length > 0 ? Math.round(totalPence / donations.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total collected", value: fmt(totalPence) },
          { label: "Donations", value: donations.length },
          { label: "Average gift", value: fmt(avgPence) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-black/6 p-5">
            <p className="text-2xl font-semibold text-black">{s.value}</p>
            <p className="text-[11px] text-black/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Donation list */}
      <div className="bg-white rounded-xl border border-black/6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/6 text-left">
              <Th>Donor</Th>
              <Th>Party</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/4">
            {donations.map((d) => (
              <tr key={d.id} className="hover:bg-black/[0.02] transition-colors">
                <Td>
                  <p className="font-medium">{d.donor_name ?? "Anonymous"}</p>
                  <p className="text-[11px] text-black/40">{d.donor_email}</p>
                </Td>
                <Td><span className="text-black/60">{(d.events as any)?.child_name}'s party</span></Td>
                <Td><span className="font-semibold text-emerald-600">{fmt(d.amount_pence)}</span></Td>
                <Td><span className="text-black/40">{fmtDate(d.created_at)}</span></Td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-black/30">No donations yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Shared table primitives ────────────────────────────────────────────────────

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/30">
    {children}
  </th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-5 py-3.5 text-black">{children}</td>
);

const TableSkeleton = ({ rows }: { rows: number }) => (
  <div className="bg-white rounded-xl border border-black/6 p-4 space-y-3">
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-lg" />
    ))}
  </div>
);

export default AdminPage;
