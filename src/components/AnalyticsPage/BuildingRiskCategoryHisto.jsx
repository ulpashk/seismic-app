"use client"

import { useEffect, useState } from "react"
import { Info } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from "recharts"

export default function BuildingRiskCategoryHisto({ setTotalBuildingsRisk, setA1Count }) {
  const [data, setData] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://admin.smartalmaty.kz/api/v1/address/postgis/buildings-risk/count-by-category/"
        )
        const json = await response.json()

        // ✅ Map API response to match chart expectations
        const processed = json.results.map(item => ({
          category: item.group,
          count: item.count
        }))

        setTotalBuildingsRisk(json.count)
        setData(processed)

        // Optional: if you ever need a specific category
        const a1 = json.results.find(item =>
          item.group.toLowerCase().includes("аварийное")
        )
        if (a1) setA1Count(a1.count)

      } catch (error) {
        console.error("Error fetching histogram data:", error)
      }
    }
    fetchData()
  }, [setA1Count, setTotalBuildingsRisk])

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">Здания по уровням сейсмостойкости</h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>

      <div className="p-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
            >
              {/* <XAxis
                dataKey="category"
                interval={0}
                textAnchor="middle"
                tick={{ fontSize: 11, wordBreak: "break-word", whiteSpace: "normal" }}
                height={80}
              /> */}
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
          <p className="text-gray-500 text-sm">Загрузка данных...</p>
        )}
      </div>
    </div>
  )
}
