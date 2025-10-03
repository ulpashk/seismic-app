"use client"

import { Info } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function SocialObjectsIRIHisto({ infraSummary }) {
  // Define fixed categories order
  const categories = [
    { key: "Критическая (<0.40)", color: "#ef4444" },   // red
    { key: "Низкая (0.40–0.59)", color: "#f97316" },    // orange
    { key: "Умеренная (0.60–0.79)", color: "#eab308" }, // yellow
    { key: "Высокая готовность (0.80–1.00)", color: "#22c55e" }, // green
  ]

  // Build chart data in fixed order
  const chartData = categories.map(({ key }) => ({
    iri: key,
    cnt_ddo: infraSummary?.[key]?.cnt_ddo || 0,
    cnt_health: infraSummary?.[key]?.cnt_health || 0,
    cnt_pppn: infraSummary?.[key]?.cnt_pppn || 0,
    bldg_count: infraSummary?.[key]?.bldg_count || 0,
  }))

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">Соц. объекты по индексу IRI</h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <div className="p-6">
        {chartData.some(d => d.cnt_ddo || d.cnt_health || d.cnt_pppn) ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="iri" angle={-25} textAnchor="end" interval={0} height={80} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="cnt_ddo" stackId="a" fill="#ef4444" name="ДОУ" />
              <Bar dataKey="cnt_health" stackId="a" fill="#22c55e" name="Здравоохранение" />
              <Bar dataKey="cnt_pppn" stackId="a" fill="#2563eb" name="ПППН" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500">Нет данных для отображения</p>
        )}
      </div>
    </div>
  )
}
