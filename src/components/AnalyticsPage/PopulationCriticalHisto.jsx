"use client"
import { useEffect, useState } from "react"
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

export default function PopulationCriticalHisto({ selectedDistrict }) {
  const [districtData, setDistrictData] = useState([])

  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#f59e0b",
    "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk/sum-by-district/"
        )
        const json = await res.json()

        // Filter out "БКАД За пределами города" and zero-sum
        let filtered = json.filter(
          (d) => d.district !== "БКАД За пределами города" && d.sum > 0
        )

        // Client-side filter by selected district (if not "Все районы")
        if (selectedDistrict && selectedDistrict !== "Все районы") {
          filtered = filtered.filter(
            (d) => d.district === `${selectedDistrict} район`
          )
        }

        setDistrictData(filtered)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }

    fetchData()
  }, [selectedDistrict])

  const chartData = districtData.map((d, index) => ({
    district: d.district,
    sum: d.sum,
    color: colors[index % colors.length],
  }))

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50">
        <h2 className="text-base font-semibold text-gray-900">
          Население в критических зонах по районам
        </h2>
        <Info className="h-5 w-5 text-amber-600" />
      </div>
      <div className="p-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <XAxis
                dataKey="district"
                angle={-25}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={false} axisLine={false} />
              <Tooltip
                formatter={(value) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="sum" name="Население (чел.)" minPointSize={5}>
                <LabelList
                  dataKey="sum"
                  position="top"
                  formatter={(value) => value.toLocaleString()}
                  style={{ fill: "#838383", fontSize: 12, fontWeight: "bold" }}
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
