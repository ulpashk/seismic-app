import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend
} from "recharts";
import { districtPopulation } from "../data/districts_population";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A569BD",
  "#52BE80",
  "#E74C3C",
  "#5DADE2",
];

export default function PopulationPieChart() {
  // convert population strings like "51 796" → 51796
  const data = districtPopulation.map((d) => ({
    district: d.district,
    population: Number(d.population.replace(/\s/g, "")),
  }));

  const label = "Население в оползнеопасных районах";

  return (
    <div className={`histogram-container h-[400px] p-5 pb-7 pb-0 bg-gray-100 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray/20 cursor-pointer`}>
      <h1 className="text-center text-xl font-bold text-green-800 mb-0">{label}</h1>
      <div style={{ width: "100%", height: "100%" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="population"
              nameKey="district"
              cx="50%"
              cy="45%"
              innerRadius={40} // makes it a donut
              outerRadius={80}
              paddingAngle={2}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value.toLocaleString()} />
            {/* <Legend /> */}
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                marginTop: "-20px",
                fontSize: "12px",   // change size
                color: "#333",      // change text color
              }}
              formatter={(value) => (
                <span style={{ fontSize: "14px", color: "#1f2937", fontWeight: "500" }}>
                  {value}
                </span>
              )}
/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
