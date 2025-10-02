"use client"

import { Info } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

export default function PopulationIRIHisto({ infraSummary }) {
  // Define fixed order + colors
  const categories = [
    { key: "Критическая (<0.40)", color: "#ef4444" },   // red
    { key: "Низкая (0.40–0.59)", color: "#f97316" },    // orange
    { key: "Умеренная (0.60–0.79)", color: "#eab308" }, // yellow
    { key: "Высокая готовность (0.80–1.00)", color: "#22c55e" }, // green
  ]

  // Convert into chart data with fixed order
  const chartData = categories.map(({ key, color }) => ({
    iri: key,
    gri_pop_sum: infraSummary?.[key]?.gri_pop_sum || 0,
    color,
  }))

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">Население по индексу IRI</h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <div className="p-6">
        {chartData.some(d => d.gri_pop_sum > 0) ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="iri" angle={-25} textAnchor="end" interval={0} height={80} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="gri_pop_sum" name="Население (чел.)">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500">Нет данных для отображения</p>
        )}
      </div>
    </div>
  )
}
