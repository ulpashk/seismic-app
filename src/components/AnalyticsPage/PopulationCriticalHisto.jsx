"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

export default function PopulationCriticalHisto({ selectedDistrict }) {
  const [districtData, setDistrictData] = useState([]);

  // Use our unified 3-color system for critical zones (danger levels)
  const getCriticalColor = (sum, maxSum) => {
    const ratio = sum / maxSum;
    if (ratio > 0.7) return "#B91C1C"; // High critical - muted red
    if (ratio > 0.3) return "#C49B0B"; // Medium critical - muted gold
    return "#2B6CB0"; // Lower critical - muted blue
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk/sum-by-district/"
        );
        const json = await res.json();

        // Filter out "БКАД За пределами города" and zero-sum
        let filtered = json.filter(
          (d) => d.district !== "БКАД За пределами города" && d.sum > 0
        );

        // Client-side filter by selected district (if not "Все районы")
        if (selectedDistrict && selectedDistrict !== "Все районы") {
          filtered = filtered.filter(
            (d) => d.district === `${selectedDistrict} район`
          );
        }

        setDistrictData(filtered);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchData();
  }, [selectedDistrict]);

  const maxSum = Math.max(...districtData.map((d) => d.sum), 1);
  const chartData = districtData.map((d) => ({
    district: d.district,
    sum: d.sum,
    color: getCriticalColor(d.sum, maxSum),
  }));

  return (
    <div className="rounded-xl border border-gray-100 bg-gov-card shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gov-text-primary">
          Население в критических зонах по районам
        </h2>
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
                tick={{ fontSize: 10, fill: "#6B7280" }}
                axisLine={{ stroke: "rgba(0,0,0,0.06)" }}
                tickLine={{ stroke: "rgba(0,0,0,0.06)" }}
              />
              <YAxis
                tick={false}
                axisLine={false}
                gridLine={{ stroke: "rgba(0,0,0,0.06)" }}
              />
              <Tooltip
                formatter={(value) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "8px",
                  color: "#1D1F24",
                }}
              />
              <Bar dataKey="sum" name="Население (чел.)" minPointSize={5}>
                <LabelList
                  dataKey="sum"
                  position="top"
                  formatter={(value) => value.toLocaleString()}
                  style={{ fill: "#1D1F24", fontSize: 12, fontWeight: "bold" }}
                />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gov-text-secondary">
            Нет данных для отображения
          </p>
        )}
      </div>
    </div>
  );
}
