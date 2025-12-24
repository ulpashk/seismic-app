import React, { useState, useCallback, useMemo } from "react";
import Demolition from "../components/RecomendPage/Demolition";
import ClusterMap from "../components/RecomendPage/ClusterMap";
import Certification from "../components/RecomendPage/Certification";
import Reinforcement from "../components/RecomendPage/Reinforcement";

const TABS = [
  { id: "demolition", label: "Снос", color: "red" },
  { id: "certification", label: "Паспортизация", color: "orange" },
  { id: "reinforcement", label: "Усиление", color: "green" },
];

export default function RecomendPage() {
  // Состояние для хранения зданий с карты
  const [visibleBuildings, setVisibleBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("demolition");

  // Callback для получения данных с карты
  const handleBuildingsUpdate = useCallback((buildings) => {
    console.log(`📊 RecomendPage получил ${buildings.length} зданий с карты`);

    // Логируем уникальные значения measure_category
    const categories = [...new Set(buildings.map((b) => b.measure_category))];
    console.log("📋 Уникальные measure_category:", categories);

    setVisibleBuildings(buildings);
    setIsLoading(false);
  }, []);

  // Фильтруем здания по категориям мероприятий
  // Возможные значения measure_category нужно уточнить в консоли
  const demolitionBuildings = useMemo(() => {
    const filtered = visibleBuildings.filter((b) => {
      const cat = (b.measure_category || "").toLowerCase();
      return (
        cat.includes("demolition") ||
        cat.includes("снос") ||
        cat.includes("demol")
      );
    });
    console.log(`🔴 Снос: ${filtered.length} зданий`);
    return filtered;
  }, [visibleBuildings]);

  const certificationBuildings = useMemo(() => {
    const filtered = visibleBuildings.filter((b) => {
      const cat = (b.measure_category || "").toLowerCase();
      return (
        cat.includes("passport") ||
        cat.includes("паспорт") ||
        cat.includes("certif")
      );
    });
    console.log(`🟠 Паспортизация: ${filtered.length} зданий`);
    return filtered;
  }, [visibleBuildings]);

  const reinforcementBuildings = useMemo(() => {
    const filtered = visibleBuildings.filter((b) => {
      const cat = (b.measure_category || "").toLowerCase();
      return (
        cat.includes("strength") ||
        cat.includes("усилен") ||
        cat.includes("reinforc")
      );
    });
    console.log(`🟢 Усиление: ${filtered.length} зданий`);
    return filtered;
  }, [visibleBuildings]);

  return (
    // <div className="px-6 py-4 bg-gray-50 h-[90vh]">
    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //     <div className="flex flex-col gap-6">
    //       <Demolition buildings={demolitionBuildings} isLoading={isLoading} />
    //       <ClusterMap onBuildingsUpdate={handleBuildingsUpdate} />
    //     </div>
    //     <Certification
    //       buildings={certificationBuildings}
    //       isLoading={isLoading}
    //     />
    //     <Reinforcement
    //       buildings={reinforcementBuildings}
    //       isLoading={isLoading}
    //     />
    //   </div>
    // </div>
    <div className="px-6 py-4 bg-gray-50 h-[90vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-6 col-span-3">
          <ClusterMap onBuildingsUpdate={handleBuildingsUpdate} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Рекомендации по зданиям</h2>

          {/* Табы для переключения */}
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg ">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? `bg-white shadow text-${tab.color}-600`
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Контент табов */}
          {activeTab === "demolition" && (
            <Demolition buildings={demolitionBuildings} isLoading={isLoading} />
          )}
          {activeTab === "certification" && (
            <Certification
              buildings={certificationBuildings}
              isLoading={isLoading}
            />
          )}
          {activeTab === "reinforcement" && (
            <Reinforcement
              buildings={reinforcementBuildings}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
