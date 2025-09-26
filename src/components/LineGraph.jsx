import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import '../App.css';

import {districtPopulation} from "../data/districts_population";

export default function LineGraph() {
  // 📊 Sample data: number of events per month
  const data = [
    { month: "Январь", events: 40 },
    { month: "Февраль", events: 32 },
    { month: "Март", events: 55 },
    { month: "Апрель", events: 68 },
    { month: "Май", events: 80 },
    { month: "Июнь", events: 72 },
    { month: "Июль", events: 90 },
    { month: "Август", events: 100 },
    { month: "Сентябрь", events: 85 },
    { month: "Октябрь", events: 75 },
    { month: "Ноябрь", events: 50 },
    { month: "Декабрь", events: 60 },
  ];

  return (
    <div className="histogram-container pb-7 pt-2 linegraph-container pr-4 border border-blue-200 rounded-xl">
      <h1 className="text-center text-xl font-bold text-blue-900 mb-7">
        Динамика событий по месяцам
      </h1>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={districtPopulation}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="district" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="population"
            stroke="#6661c4"
            strokeWidth={3}
            dot={{ r: 5, stroke: "#6661c4", strokeWidth: 2, fill: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
