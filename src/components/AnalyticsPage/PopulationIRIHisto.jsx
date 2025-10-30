"use client";

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

export default function PopulationIRIHisto({ chartData }) {
  // Function to get color based on IRI level
  const getIRIColor = (iri) => {
    const iriLetter = iri.charAt(0);
    switch (iriLetter) {
      case "A":
        return "#2B6CB0"; // High readiness - muted blue
      case "B":
        return "#C49B0B"; // Medium readiness - muted gold
      case "C":
      case "D":
        return "#B91C1C"; // Low readiness - muted red
      default:
        return "#6B7280"; // Default gray
    }
  };

  // Преобразуем данные в нужный формат для Recharts
  const formattedData =
    chartData?.map((item) => ({
      iri: item.IRI_cat,
      gri_pop_sum: item.total_gri_pop_sum,
      color: getIRIColor(item.IRI_cat),
    })) || [];

  return (
    <div className="rounded-xl border border-gray-100 bg-gov-card shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gov-text-primary">
          Население по индексам готовности IRI
        </h2>
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
              <Bar
                dataKey="gri_pop_sum"
                name="Население (чел.)"
                minPointSize={5}
              >
                <LabelList
                  dataKey="gri_pop_sum"
                  position="top"
                  formatter={(value) => value.toLocaleString()}
                  style={{ fill: "#1D1F24", fontSize: 12, fontWeight: "bold" }}
                />
                {formattedData.map((entry, index) => (
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
