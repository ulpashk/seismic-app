"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export default function SocialObjectsIRIHisto({ chartData, loading, error }) {
  // 🧠 Преобразуем данные под Recharts
  const transformed = (chartData || []).map((item) => ({
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
  }));

  // Сортируем по IRI: A → B → C → D
  const order = ["A", "B", "C", "D"];
  transformed.sort((a, b) => {
    const getKey = (x) => order.findIndex((o) => x.iri.startsWith(o));
    return getKey(a) - getKey(b);
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-gov-card shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gov-text-primary">
          Соц. объекты по индексу IRI
        </h2>
      </div>
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-gov-text-secondary">Загрузка...</p>
        ) : error ? (
          <p className="text-sm text-gov-red">{error}</p>
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
                tick={{ fontSize: 10, fill: "#6B7280" }}
                axisLine={{ stroke: "rgba(0,0,0,0.06)" }}
                tickLine={{ stroke: "rgba(0,0,0,0.06)" }}
              />
              <YAxis hide gridLine={{ stroke: "rgba(0,0,0,0.06)" }} />
              <Tooltip
                formatter={(value) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "8px",
                  color: "#1D1F24",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#6B7280" }} />

              <Bar
                dataKey="cnt_ddo"
                stackId="a"
                fill="#2B6CB0"
                name="Детские сады"
              />
              <Bar
                dataKey="cnt_health"
                stackId="a"
                fill="#C49B0B"
                name="Больницы"
              />
              <Bar dataKey="cnt_pppn" stackId="a" fill="#B91C1C" name="ПППН" />
              <Bar dataKey="cnt_school" stackId="a" fill="#6B7280" name="Школы">
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(val) => val.toLocaleString()}
                  style={{ fontWeight: "bold", fontSize: 12, fill: "#1D1F24" }}
                />
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
