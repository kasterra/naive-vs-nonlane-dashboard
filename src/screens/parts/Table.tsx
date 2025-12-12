import type { LogRow } from "@/api"

export default function TablePane({
  pageRows,
  filteredCount,
  pageStart,
  currentPage,
  totalPages,
  pageSize,
  onChangePageSize,
  onPrev,
  onNext,
}: {
  pageRows: LogRow[]
  filteredCount: number
  pageStart: number
  currentPage: number
  totalPages: number
  pageSize: number
  onChangePageSize: (n: number) => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Rows: {filteredCount.toLocaleString()} • Page {currentPage} / {totalPages}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground">Rows per page</label>
          <select
            className="h-8 rounded-md border bg-background px-2"
            value={pageSize}
            onChange={(e) => onChangePageSize(Number(e.target.value))}
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
              <tr key={r.id} className={"border-t " + (i % 2 === 0 ? "bg-background" : "bg-muted/30")}>
                <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 font-mono">{r.orderId}</td>
                <td className="px-3 py-2 font-mono">{r.userId}</td>
                <td className="px-3 py-2 text-right">${""}{r.revenue.toFixed(2)}</td>
                <td className="px-3 py-2">{r.channel}</td>
                <td className="px-3 py-2">{r.segment}</td>
                <td className="px-3 py-2 truncate max-w-[360px]">{r.queryText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Showing {filteredCount === 0 ? 0 : pageStart + 1}–{Math.min(filteredCount, pageStart + pageRows.length)} of {filteredCount.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <button className="h-8 px-3 rounded-md border bg-background disabled:opacity-50" onClick={onPrev} disabled={currentPage <= 1}>
            Prev
          </button>
          <button className="h-8 px-3 rounded-md border bg-background disabled:opacity-50" onClick={onNext} disabled={currentPage >= totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
