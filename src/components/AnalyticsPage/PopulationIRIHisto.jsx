"use client"

import { Info } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"

export default function PopulationIRIHisto({ infraSummary }) {
  const categories = [
    { key: "Критическая (<0.40)", color: "#ef4444" },
    { key: "Низкая (0.40–0.59)", color: "#f97316" },
    { key: "Умеренная (0.60–0.79)", color: "#eab308" },
    { key: "Высокая готовность (0.80–1.00)", color: "#22c55e" },
  ]

  const chartData = categories.map(({ key, color }) => ({
    iri: key,
    gri_pop_sum: infraSummary?.[key]?.gri_pop_sum || 0,
    color,
  }))

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">Население по зонам индексах IRI</h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <div className="p-6">
        {chartData.some(d => d.gri_pop_sum > 0) ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="iri"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={false} axisLine={false} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="gri_pop_sum" name="Население (чел.)" minPointSize={5}>
                <LabelList
                  dataKey="gri_pop_sum"
                  position="top"
                  formatter={(value) => value.toLocaleString()}
                  style={{ fill: "#838383ff", fontSize: 12, fontWeight: "bold" }}
                />
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
