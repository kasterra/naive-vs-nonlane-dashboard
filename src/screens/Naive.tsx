import { useMemo, useState } from "react";
import {
  getDataset,
  regenerateDataset,
  type Filters,
  type Segment,
  type Channel,
} from "../api";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { computeDashboard } from "@/lib/compute";
import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  Tooltip,
  XAxis,
  YAxis,
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Naive() {
  const [data, setData] = useState(() => getDataset());

  // initial dates: last 30 days
  const today = new Date();
  const startInit = new Date(today);
  startInit.setDate(today.getDate() - 30);
  const toStr = (d: Date) => d.toISOString().slice(0, 10);

  const [filters, setFilters] = useState<Filters>({
    startDate: toStr(startInit),
    endDate: toStr(today),
    query: "",
    segment: "All",
  });

  // HEAVY compute: share the same logic as Non-Lane, but run synchronously
  const { filtered, dailyRevenue, dailyVisitors, channelShares } = useMemo(
    () => computeDashboard(data, filters),
    [data, filters]
  );

  // demo: allow changing data volume to better show jank
  const [volume, setVolume] = useState(20000);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);

  const channelColorVar: Record<Channel, string> = {
    Direct: "var(--chart-1)",
    Search: "var(--chart-2)",
    Ads: "var(--chart-3)",
    Social: "var(--chart-4)",
    Referral: "var(--chart-5)",
  };

  const uniqueSegments: Segment[] = ["All", "New", "Returning", "VIP"];

  // quick ranges
  function setRange(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFilters((f) => ({ ...f, startDate: toStr(start), endDate: toStr(end) }));
    setPage(1);
  }

  const totalRevenue = useMemo(
    () => filtered.reduce((s, r) => s + r.revenue, 0),
    [filtered]
  );
  const totalVisitors = filtered.length;
  const avgOrder = totalVisitors ? totalRevenue / totalVisitors : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Naive Dashboard (Sync compute on input)
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground">Start date</label>
          <input
            type="date"
            className="mt-1 h-9 rounded-md border px-3 bg-background"
            value={filters.startDate}
            onChange={(e) => {
              setFilters((f) => ({ ...f, startDate: e.target.value }));
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground">End date</label>
          <input
            type="date"
            className="mt-1 h-9 rounded-md border px-3 bg-background"
            value={filters.endDate}
            onChange={(e) => {
              setFilters((f) => ({ ...f, endDate: e.target.value }));
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-col md:col-span-1">
          <label className="text-sm text-muted-foreground">Search</label>
          <input
            type="text"
            placeholder="Type to filter..."
            className="mt-1 h-9 rounded-md border px-3 bg-background"
            value={filters.query}
            onChange={(e) => {
              setFilters((f) => ({ ...f, query: e.target.value }));
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground">Segment</label>
          <select
            className="mt-1 h-9 rounded-md border px-3 bg-background"
            value={filters.segment}
            onChange={(e) => {
              setFilters((f) => ({ ...f, segment: e.target.value as Segment }));
              setPage(1);
            }}
          >
            {uniqueSegments.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-muted-foreground">Quick ranges:</div>
        <div className="flex items-center gap-2">
          {[7, 30, 90, 180].map((d) => (
            <button
              key={d}
              className="h-8 px-3 rounded-md border bg-background hover:bg-secondary"
              onClick={() => setRange(d)}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <label className="text-muted-foreground">Data volume</label>
          <select
            className="h-8 rounded-md border bg-background px-2"
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              const next = regenerateDataset(v);
              setData(next);
              setPage(1);
            }}
          >
            {[10000, 20000, 50000].map((s) => (
              <option key={s} value={s}>
                {s.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md border bg-card p-4">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="mt-1 text-2xl font-semibold">
            ${""}
            {totalRevenue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
        <div className="rounded-md border bg-card p-4">
          <div className="text-sm text-muted-foreground">Visitors</div>
          <div className="mt-1 text-2xl font-semibold">
            {totalVisitors.toLocaleString()}
          </div>
        </div>
        <div className="rounded-md border bg-card p-4">
          <div className="text-sm text-muted-foreground">Avg Order Value</div>
          <div className="mt-1 text-2xl font-semibold">
            ${""}
            {avgOrder.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm font-medium">Daily Revenue</div>
          <ChartContainer
            config={{ value: { label: "Revenue", color: "var(--chart-1)" } }}
            className="w-full h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart
                data={dailyRevenue}
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} minTickGap={24} />
                <YAxis width={50} tick={{ fontSize: 10 }} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Channel Share</div>
          <ChartContainer
            config={{
              Direct: { label: "Direct", color: channelColorVar.Direct },
              Search: { label: "Search", color: channelColorVar.Search },
              Ads: { label: "Ads", color: channelColorVar.Ads },
              Social: { label: "Social", color: channelColorVar.Social },
              Referral: { label: "Referral", color: channelColorVar.Referral },
            }}
            className="w-full h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Tooltip content={<ChartTooltipContent />} />
                <Pie
                  data={channelShares}
                  dataKey="value"
                  nameKey="channel"
                  innerRadius={50}
                  outerRadius={90}
                  strokeWidth={1}
                >
                  {channelShares.map((it) => (
                    <Cell
                      key={it.channel}
                      fill={`var(--color-${it.channel})`}
                    />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {channelShares.map((it) => (
              <div key={it.channel} className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ background: `var(--color-${it.channel})` }}
                />
                <span className="text-foreground">{it.channel}</span>
                <span className="ml-auto text-muted-foreground">
                  {((it.value / (totalRevenue || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm font-medium">Daily Visitors</div>
          <ChartContainer
            config={{ value: { label: "Visitors", color: "var(--chart-2)" } }}
            className="w-full h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart
                data={dailyVisitors}
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} minTickGap={24} />
                <YAxis width={50} tick={{ fontSize: 10 }} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Visitors"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Rows: {filtered.length.toLocaleString()} • Page {currentPage} /{" "}
            {totalPages}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-foreground">Rows per page</label>
            <select
              className="h-8 rounded-md border bg-background px-2"
              value={pageSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                setPageSize(size);
                setPage(1);
              }}
            >
              {[50, 100, 200, 500, 1000].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="border rounded-md overflow-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="bg-secondary sticky top-0 z-10">
              <tr className="text-left">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Revenue</th>
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Segment</th>
                <th className="px-3 py-2">Text</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr
                  key={r.id}
                  className={
                    "border-t " +
                    (i % 2 === 0 ? "bg-background" : "bg-muted/30")
                  }
                >
                  <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-2 font-mono">{r.orderId}</td>
                  <td className="px-3 py-2 font-mono">{r.userId}</td>
                  <td className="px-3 py-2 text-right">
                    ${""}
                    {r.revenue.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm"
                        style={{
                          background: `var(--chart-${
                            r.channel === "Direct"
                              ? 1
                              : r.channel === "Search"
                              ? 2
                              : r.channel === "Ads"
                              ? 3
                              : r.channel === "Social"
                              ? 4
                              : 5
                          })`,
                        }}
                      />
                      {r.channel}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.segment}</td>
                  <td className="px-3 py-2 truncate max-w-[360px]">
                    {r.queryText}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : pageStart + 1}–
            {Math.min(filtered.length, pageStart + pageRows.length)} of{" "}
            {filtered.length.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="h-8 px-3 rounded-md border bg-background disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <button
              className="h-8 px-3 rounded-md border bg-background disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
