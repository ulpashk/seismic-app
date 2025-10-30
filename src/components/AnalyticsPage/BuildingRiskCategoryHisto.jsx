"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

export default function BuildingRiskCategoryHisto({ data }) {
  // Function to determine color based on risk category
  const getBarColor = (category) => {
    if (!category || typeof category !== "string") {
      return "#6B7280"; // Default gray for undefined/invalid categories
    }

    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("аварийное") || categoryLower.includes("низк")) {
      return "#B91C1C"; // status-low - muted red
    } else if (
      categoryLower.includes("средн") ||
      categoryLower.includes("умерен")
    ) {
      return "#C49B0B"; // status-medium - muted gold
    } else {
      return "#2B6CB0"; // status-high - muted blue (for high/good categories)
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gov-card shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gov-text-primary">
          Здания по уровням сейсмостойкости
        </h2>
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
              <Bar dataKey="count" minPointSize={5}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.category)}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={(value) => value.toLocaleString()}
                  style={{ fontSize: 12, fontWeight: "bold", fill: "#1D1F24" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gov-text-secondary text-sm">
            Нет данных для отображения
          </p>
        )}
      </div>
    </div>
  );
}
