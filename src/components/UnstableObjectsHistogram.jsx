import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList, ResponsiveContainer, Cell,
} from "recharts";
import { useState, useEffect } from "react";
import '../App.css';
import {unstableObjects} from "../data/district_unstable_objects";

export default function UnstableObjectsHistogram({ selectedDistrict, setSelectedDistrict }) {
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
                <tspan x={x} dy="0">{first}</tspan>
                {second && <tspan x={x} dy="14">{second}</tspan>}
            </text>
        );
    };

    const labelObjects = "Количество неустойчивых объектов по районам"
    const labelLandslides = "Количество оползней по районам"

    return (
        <div className={`histogram-container h-[400px] pb-7 pt-2 border bg-gray-100 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-gray/20 cursor-pointer`}>
            <h1 className="text-center text-xl font-bold text-blue-900">{labelObjects}</h1>
            
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unstableObjects}>
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
                        {unstableObjects.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    !selectedDistrict || entry.district === selectedDistrict || selectedDistrict === "Все районы"
                                    ? 
                                    "#5e75c9ff" 
                                    : "#aeadc5ff"      
                                }
                            />
                        ))}
                    
                        <LabelList dataKey="count" position="top"/>
                    </Bar>
                    <XAxis
                        dataKey="district"
                        axisLine={false}
                        tickLine={false}
                        height={60}
                        tick={<CustomTick />}
                        interval={0} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
  );
}