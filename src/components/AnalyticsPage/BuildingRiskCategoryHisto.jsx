"use client"

import { useEffect, useState } from "react"
import { Info } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from "recharts"

export default function BuildingRiskCategoryHisto({
  data,
}) {
  

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50">
        <h2 className="text-base font-semibold text-gray-900">Здания по уровням сейсмостойкости</h2>
        <Info className="h-5 w-5 text-red-600" />
      </div>

      <div className="p-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
            >
              <XAxis
                dataKey="category"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={false} axisLine={false} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="count" fill="#236FFF" minPointSize={5}>
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={(value) => value.toLocaleString()}
                  style={{ fontSize: 12, fontWeight: "bold" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm">Нет данных для отображения</p>
        )}
      </div>
    </div>
  )
}
