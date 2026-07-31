"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, TrendingUp, Clock, Users, Calendar } from "lucide-react"

const chartPlaceholders = [
  { title: "Booking per Hari", type: "Line Chart", icon: TrendingUp, height: "h-48" },
  { title: "Booking per Bulan", type: "Bar Chart", icon: Calendar, height: "h-48" },
  { title: "Barber Terlaris", type: "Bar Chart", icon: Users, height: "h-48" },
  { title: "Layanan Terlaris", type: "Bar Chart", icon: BarChart3, height: "h-48" },
  { title: "Jam Ramai", type: "Heatmap", icon: Clock, height: "h-56" },
  { title: "Customer Baru vs Lama", type: "Pie Chart", icon: Users, height: "h-48" },
  { title: "Repeat Customer Rate", type: "Line Chart", icon: TrendingUp, height: "h-48" },
  { title: "Pendapatan Trend", type: "Area Chart", icon: TrendingUp, height: "h-48" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Analisis performa bisnis</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Dari</Label>
          <Input type="date" defaultValue="2026-07-01" className="h-9 w-auto" />
          <Label className="text-xs text-muted-foreground">Sampai</Label>
          <Input type="date" defaultValue="2026-07-29" className="h-9 w-auto" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {chartPlaceholders.map((chart) => (
          <Card key={chart.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <chart.icon className="h-4 w-4 text-muted-foreground" />
                {chart.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`${chart.height} flex flex-col items-center justify-center rounded-[14px] bg-muted/50 border border-dashed border-border`}>
                <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
                <span className="mt-2 text-xs text-muted-foreground">{chart.type}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
