import {
  Suspense,
  lazy,
  useDeferredValue,
  useMemo,
  useState,
  useTransition,
  useEffect,
} from "react";
import {
  getDataset,
  regenerateDataset,
  type Filters,
  type Segment,
} from "@/api";
import { computeDashboard } from "@/lib/compute";

const Charts = lazy(() => import("./parts/Charts"));
const TablePane = lazy(() => import("./parts/Table"));

export default function NonLane() {
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

  // urgent vs non-urgent separation
  const deferredQuery = useDeferredValue(filters.query);
  const effectiveFilters = useMemo(
    () => ({
      startDate: filters.startDate,
      endDate: filters.endDate,
      segment: filters.segment,
      query: deferredQuery,
    }),
    [filters.startDate, filters.endDate, filters.segment, deferredQuery]
  );

  const [derived, setDerived] = useState(() => computeDashboard(data, effectiveFilters));
  const [isPending, startTransition] = useTransition();

  // re-run heavy compute in a transition when data or effective filters change
  useEffect(() => {
    startTransition(() => {
      const next = computeDashboard(data, effectiveFilters);
      setDerived(next);
    });
  }, [data, effectiveFilters]);

  // demo: allow changing data volume to better show jank improvement
  const [volume, setVolume] = useState<number>(data.length || 20000);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const totalPages = Math.max(1, Math.ceil(derived.filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = useMemo(
    () => derived.filtered.slice(pageStart, pageStart + pageSize),
    [derived.filtered, pageStart, pageSize]
  );

  const uniqueSegments: Segment[] = ["All", "New", "Returning", "VIP"];

  function setRange(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFilters((f) => ({ ...f, startDate: toStr(start), endDate: toStr(end) }));
    setPage(1);
  }

  const totalRevenue = useMemo(
    () => derived.filtered.reduce((s, r) => s + r.revenue, 0),
    [derived.filtered]
  );
  const totalVisitors = derived.filtered.length;
  const avgOrder = totalVisitors ? totalRevenue / totalVisitors : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Non-Lane Dashboard (Concurrent)
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
          <div className="mt-1 h-4 text-xs text-muted-foreground">&nbsp;</div>
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
          <div className="mt-1 h-4 text-xs text-muted-foreground">&nbsp;</div>
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
          <div className="mt-1 h-4 text-xs text-muted-foreground">
            {isPending ? "Updating results…" : "\u00A0"}
          </div>
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
          <div className="mt-1 h-4 text-xs text-muted-foreground">&nbsp;</div>
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

      {/* Charts (code-split + Suspense) */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[260px] rounded-md border bg-muted animate-pulse" />
            <div className="h-[260px] rounded-md border bg-muted animate-pulse" />
            <div className="lg:col-span-2 h-[260px] rounded-md border bg-muted animate-pulse" />
          </div>
        }
      >
        <Charts
          dailyRevenue={derived.dailyRevenue}
          dailyVisitors={derived.dailyVisitors}
          channelShares={derived.channelShares}
          totalRevenue={totalRevenue}
        />
      </Suspense>

      {/* Table (code-split + Suspense) */}
      <Suspense
        fallback={
          <div className="h-[300px] rounded-md border bg-muted animate-pulse" />
        }
      >
        <TablePane
          pageRows={pageRows}
          filteredCount={derived.filtered.length}
          pageStart={pageStart}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onChangePageSize={(n) => {
            setPageSize(n);
            setPage(1);
          }}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </Suspense>
    </div>
  );
}
