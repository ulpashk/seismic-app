"use client"

import { Info } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts"

export default function SocialObjectsIRIHisto({ infraSummary }) {
  // Define fixed categories order
  const categories = [
    { key: "Критическая (<0.40)", color: "#ef4444" },
    { key: "Низкая (0.40–0.59)", color: "#f97316" },
    { key: "Умеренная (0.60–0.79)", color: "#eab308" },
    { key: "Высокая готовность (0.80–1.00)", color: "#22c55e" },
  ]

  // Build chart data in fixed order
  const chartData = categories.map(({ key }) => {
    const cnt_ddo = infraSummary?.[key]?.cnt_ddo || 0
    const cnt_health = infraSummary?.[key]?.cnt_health || 0
    const cnt_pppn = infraSummary?.[key]?.cnt_pppn || 0
    const cnt_school = infraSummary?.[key]?.cnt_school || 0
    const total = cnt_ddo + cnt_health + cnt_pppn + cnt_school

    return {
      iri: key,
      cnt_ddo,
      cnt_health,
      cnt_pppn,
      cnt_school,
      total,
    }
  })

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">Соц. объекты по индексу IRI</h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <div className="p-6">
        {chartData.some(d => d.total > 0) ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 20, left: 40, bottom: 30 }}
              barCategoryGap="20%"
              barGap={2}
              barSize={60}
            >
              <XAxis
                dataKey="iri"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis hide />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: 12 }} />

              <Bar dataKey="cnt_ddo" stackId="a" fill="#eab308" name="Детские сады" />
              <Bar dataKey="cnt_health" stackId="a" fill="#dc2626" name="Больницы" />
              <Bar dataKey="cnt_pppn" stackId="a" fill="#16a34a" name="ПППН"/>
              <Bar dataKey="cnt_school" stackId="a" fill="#2563eb" name="Школы">
                {/* custom label for totals */}
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(val) => val.toLocaleString()}
                  style={{ fontWeight: "bold", fontSize: 12 }}
                />
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
