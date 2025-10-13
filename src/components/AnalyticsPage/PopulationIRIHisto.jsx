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

export default function PopulationIRIHisto({ chartData }) {

  // Преобразуем данные в нужный формат для Recharts
  const formattedData = chartData?.map((item) => ({
    iri: item.IRI_cat,
    gri_pop_sum: item.total_gri_pop_sum,
    // color: iriColors[item.IRI_cat] || "#9ca3af", // серый по умолчанию
    color: "#2d6bd6ff", // серый по умолчанию
  })) || []

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">Население по индексам готовности IRI</h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>

      <div className="p-6">
        {formattedData.some((d) => d.gri_pop_sum > 0) ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={formattedData}
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
                  style={{ fill: "#6b7280", fontSize: 12, fontWeight: "bold" }}
                />
                {formattedData.map((entry, index) => (
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
