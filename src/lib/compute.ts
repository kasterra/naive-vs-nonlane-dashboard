import type { Channel, Filters, LogRow } from "@/api"

export interface Derived {
  filtered: LogRow[]
  dailyRevenue: { day: string; value: number }[]
  dailyVisitors: { day: string; value: number }[]
  channelShares: { channel: Channel; value: number }[]
}

export function computeDashboard(data: LogRow[], filters: Filters): Derived {
  const startTs = new Date(filters.startDate).getTime()
  const endTs = new Date(filters.endDate).getTime() + 24 * 3600 * 1000 - 1
  const q = filters.query.trim().toLowerCase()
  const seg = filters.segment

  const filteredRows: LogRow[] = []
  const revByDay = new Map<string, number>()
  const visitByDay = new Map<string, number>()
  const byChannel = new Map<Channel, number>()

  for (const row of data) {
    if (row.timestamp < startTs || row.timestamp > endTs) continue
    if (seg !== "All" && row.segment !== seg) continue
    if (q && !("" + row.queryText).toLowerCase().includes(q) && !row.orderId.toLowerCase().includes(q)) continue

    filteredRows.push(row)
    revByDay.set(row.date, (revByDay.get(row.date) || 0) + row.revenue)
    visitByDay.set(row.date, (visitByDay.get(row.date) || 0) + 1)
    byChannel.set(row.channel, (byChannel.get(row.channel) || 0) + row.revenue)
  }

  const dailyRevenue = Array.from(revByDay.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, value]) => ({ day, value }))
  const dailyVisitors = Array.from(visitByDay.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, value]) => ({ day, value }))
  const channelShares = Array.from(byChannel.entries())
    .map(([channel, value]) => ({ channel, value }))
    .sort((a, b) => b.value - a.value)

  return { filtered: filteredRows, dailyRevenue, dailyVisitors, channelShares }
}

