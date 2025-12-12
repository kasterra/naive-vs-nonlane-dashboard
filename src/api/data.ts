import { faker } from "@faker-js/faker"
import type { Channel, LogRow } from "./types"

// Deterministic-ish dataset across reloads
faker.seed(20251209)

const CHANNELS: Channel[] = ["Direct", "Search", "Ads", "Social", "Referral"]
const SEGMENTS = ["New", "Returning", "VIP"] as const

function toDay(ts: number) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function generateDataset(count = 15000): LogRow[] {
  const now = Date.now()
  const daysBack = 180
  const rows: LogRow[] = []
  for (let i = 0; i < count; i++) {
    const ts = faker
      .date
      .between({ from: new Date(now - daysBack * 24 * 3600 * 1000), to: new Date(now) })
      .getTime()
    const channel = faker.helpers.arrayElement(CHANNELS)
    const segment = faker.helpers.arrayElement(SEGMENTS)
    const revenue = Number(faker.finance.amount({ min: 0, max: 500, dec: 2 }))
    const product = faker.commerce.productName()
    const customer = faker.person.fullName()

    rows.push({
      id: faker.string.uuid(),
      timestamp: ts,
      date: toDay(ts),
      orderId: faker.string.alphanumeric({ length: 10, casing: "upper" }),
      userId: faker.string.alphanumeric({ length: 8, casing: "upper" }),
      revenue,
      channel,
      segment,
      queryText: `${product} ${customer}`,
    })
  }
  // Keep roughly sorted by time (not required, but realistic)
  rows.sort((a, b) => a.timestamp - b.timestamp)
  return rows
}

// Singleton dataset for the app lifetime
let DATASET: LogRow[] | null = null

export function getDataset(): LogRow[] {
  if (!DATASET) {
    DATASET = generateDataset(20000)
  }
  return DATASET
}

export function regenerateDataset(count?: number): LogRow[] {
  const size = count ?? (DATASET ? DATASET.length : 20000)
  DATASET = generateDataset(size)
  return DATASET
}
