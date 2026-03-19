"use client";

import { useEffect, useState } from "react";

export default function Indicators({
  totalBuildings,
  a1Count,
  emergencyBuildings,
  seismicEvalCount,
}) {
  const [highRiskBuildings, setHighRiskBuildings] = useState(null);

  useEffect(() => {
    // Fetch the count for "Высотных зданий в опасных участках"
    fetch(
      "https://admin.smartalmaty.kz/api/v1/address/postgis/buildings-risk/count-by-cluster-no-high-vul/"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.results?.length > 0) {
          setHighRiskBuildings(data.results[0].count);
        }
      })
      .catch((err) => {
        console.error("Error fetching high risk building count:", err);
      });
  }, []);

  const formatNumber = (num) => num?.toLocaleString("ru-RU");

  const stats = [
    { number: totalBuildings, label: "Объекты паспортизации" },
    { number: seismicEvalCount, label: "Несейсмостойких зданий" },
    { number: highRiskBuildings, label: "Высотных зданий в опасных участках" },
    { number: emergencyBuildings, label: "Аварийных зданий" },
  ];

  // Indicators.jsx
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="text-center rounded-lg border border-gray-100 bg-white p-3 md:p-4 shadow-sm"
        >
          <div className="text-lg md:text-xl font-bold text-gray-900 mb-1">
            {stat.number !== null ? formatNumber(stat.number) : "…"}
          </div>
          <p className="text-[10px] md:text-xs font-medium text-gray-500 leading-tight">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
