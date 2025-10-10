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

export default function PopulationCriticalHisto() {
  const [districtData, setDistrictData] = useState([])
  
  // Color palette for different bars
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#22c55e", // green
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#ec4899", // pink
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk/sum-by-district/"
        )
        const json = await res.json()
        
        // Filter out "БКАД За пределами города" and districts with sum = 0
        const filtered = json.filter(
          d => d.district !== "БКАД За пределами города" && d.sum > 0
        )
        
        setDistrictData(filtered)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    
    fetchData()
  }, [])

  // Prepare chart data with rotating colors
  const chartData = districtData.map((d, index) => ({
    district: d.district,
    sum: d.sum,
    color: colors[index % colors.length],
  }))

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">
          Население в критических зонах по районам
        </h2>
        <Info className="h-4 w-4 text-gray-400" />
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
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
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