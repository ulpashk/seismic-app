"use client"

import { useEffect, useState } from "react"
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

export default function SocialObjectsIRIHisto({ chartData, loading, error }) {

  // 🧠 Преобразуем данные под Recharts
  const transformed = (chartData || []).map(item => ({
    iri: item.IRI_cat,
    cnt_ddo: item.total_cnt_ddo || 0,
    cnt_health: item.total_cnt_health || 0,
    cnt_pppn: item.total_cnt_pppn || 0,
    cnt_school: item.total_cnt_school || 0, // нет в API
    total:
      (item.total_cnt_ddo || 0) +
      (item.total_cnt_health || 0) +
      (item.total_cnt_pppn || 0) +
      (item.total_cnt_school || 0),
  }))

  // Сортируем по IRI: A → B → C → D
  const order = ["A", "B", "C", "D"]
  transformed.sort((a, b) => {
    const getKey = x => order.findIndex(o => x.iri.startsWith(o))
    return getKey(a) - getKey(b)
  })

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">
          Соц. объекты по индексу IRI
        </h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Загрузка...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : transformed.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={transformed}
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
              <Bar dataKey="cnt_pppn" stackId="a" fill="#16a34a" name="ПППН" />
              <Bar dataKey="cnt_school" stackId="a" fill="#2563eb" name="Школы">
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
