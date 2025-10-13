"use client"

import { useEffect, useState } from "react"

export default function Indicators({
  totalBuildings,
  a1Count, 
  emergencyBuildings,
  seismicEvalCount
}) {
  const [highRiskBuildings, setHighRiskBuildings] = useState(null)

  useEffect(() => {
    // Fetch the count for "Высотных зданий в опасных участках"
    fetch("https://admin.smartalmaty.kz/api/v1/address/postgis/buildings-risk/count-by-cluster-no-high-vul/")
      .then(res => res.json())
      .then(data => {
        if (data?.results?.length > 0) {
          setHighRiskBuildings(data.results[0].count)
        }
      })
      .catch(err => {
        console.error("Error fetching high risk building count:", err)
      })
  }, [])

  const formatNumber = (num) => num?.toLocaleString("ru-RU")

  const stats = [
    { number: totalBuildings, label: "Объекты паспортизации" },
    { number: seismicEvalCount, label: "Несейсмостойких зданий" },
    { number: highRiskBuildings, label: "Высотных зданий в опасных участках" },
    { number: emergencyBuildings, label: "Аварийных зданий" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="text-center rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stat.number !== null && stat.number !== undefined
              ? formatNumber(stat.number)
              : "…"}
          </div>
          <p className="text-xs font-medium text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
