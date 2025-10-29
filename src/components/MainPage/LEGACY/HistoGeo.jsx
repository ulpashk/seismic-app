import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "../../App.css";
import { districtLandslides } from "../../data/district_landslides";

export default function HistoGeo({ selectedDistrict, setSelectedDistrict }) {
  const CustomTick = ({ x, y, payload }) => {
    const name = payload.value;
    const parts = name.split(" ");
    let first = parts[0];
    if (first.length > 7) {
      first = first.slice(0, 7) + "...";
    }
    const second = parts[1] || "";

    return (
      <text x={x} y={y + 10} textAnchor="middle" fontSize={12} fill="#666">
        <tspan x={x} dy="0">
          {first}
        </tspan>
        {second && (
          <tspan x={x} dy="14">
            {second}
          </tspan>
        )}
      </text>
    );
  };

  const label = "Количество оползней по районам";

  return (
    <div
      className={`histogram-container w-full h-[400px] pb-7 pt-2 bg-gray-100 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray/20 cursor-pointer`}
    >
      <h1 className="text-center text-xl font-bold text-green-800">{label}</h1>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={districtLandslides}>
          <Tooltip />
          <Bar
            dataKey="count"
            onClick={(data) => {
              const clickedDistrict = data?.payload?.district;
              // if (!clickedDistrict) return;

              if (clickedDistrict === selectedDistrict) {
                setSelectedDistrict(""); // Unselect if same
              } else {
                setSelectedDistrict(clickedDistrict); // Select new
              }
            }}
          >
            {districtLandslides.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  !selectedDistrict ||
                  entry.district === selectedDistrict ||
                  selectedDistrict === "Все районы"
                    ? "#51ab7fff"
                    : "#aeadc5ff"
                }
              />
            ))}

            <LabelList dataKey="count" position="top" />
          </Bar>
          <XAxis
            dataKey="district"
            axisLine={false}
            tickLine={false}
            height={40}
            tick={<CustomTick />}
            interval={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
