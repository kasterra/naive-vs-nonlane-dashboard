export type Channel = "Direct" | "Search" | "Ads" | "Social" | "Referral"
export type Segment = "All" | "New" | "Returning" | "VIP"

export interface LogRow {
  id: string
  timestamp: number // ms since epoch
  date: string // YYYY-MM-DD (local)
  orderId: string
  userId: string
  revenue: number
  channel: Channel
  segment: Exclude<Segment, "All">
  queryText: string
}

export interface Filters {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  query: string
  segment: Segment
}

export interface DailyPoint {
  day: string // YYYY-MM-DD
  value: number
}

