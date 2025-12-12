import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart as ReLineChart, Tooltip, XAxis, YAxis, PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { Channel } from "@/api"

const channelColorVar: Record<Channel, string> = {
  Direct: "var(--chart-1)",
  Search: "var(--chart-2)",
  Ads: "var(--chart-3)",
  Social: "var(--chart-4)",
  Referral: "var(--chart-5)",
}

export default function Charts({ dailyRevenue, dailyVisitors, channelShares, totalRevenue }: {
  dailyRevenue: { day: string; value: number }[]
  dailyVisitors: { day: string; value: number }[]
  channelShares: { channel: Channel; value: number }[]
  totalRevenue: number
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="mb-2 text-sm font-medium">Daily Revenue</div>
        <ChartContainer config={{ value: { label: "Revenue", color: "var(--chart-1)" } }} className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={dailyRevenue} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} minTickGap={24} />
              <YAxis width={50} tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="value" name="Revenue" stroke="var(--color-value)" strokeWidth={2} dot={false} />
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
              <Pie data={channelShares} dataKey="value" nameKey="channel" innerRadius={50} outerRadius={90} strokeWidth={1}>
                {channelShares.map((it) => (
                  <Cell key={it.channel} fill={`var(--color-${it.channel})`} />
                ))}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {channelShares.map((it) => (
            <div key={it.channel} className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: `var(--color-${it.channel})` }} />
              <span className="text-foreground">{it.channel}</span>
              <span className="ml-auto text-muted-foreground">{((it.value / (totalRevenue || 1)) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="mb-2 text-sm font-medium">Daily Visitors</div>
        <ChartContainer config={{ value: { label: "Visitors", color: "var(--chart-2)" } }} className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={dailyVisitors} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} minTickGap={24} />
              <YAxis width={50} tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="value" name="Visitors" stroke="var(--color-value)" strokeWidth={2} dot={false} />
            </ReLineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

