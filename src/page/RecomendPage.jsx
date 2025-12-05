import React, { useState, useCallback, useMemo } from "react";
import Demolition from "../components/RecomendPage/Demolition";
import ClusterMap from "../components/RecomendPage/ClusterMap";
import Certification from "../components/RecomendPage/Certification";
import Reinforcement from "../components/RecomendPage/Reinforcement";

export default function RecomendPage() {
  // Состояние для хранения зданий с карты
  const [visibleBuildings, setVisibleBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="px-6 py-4 bg-gray-50 h-[90vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6">
          <Demolition buildings={demolitionBuildings} isLoading={isLoading} />
          <ClusterMap onBuildingsUpdate={handleBuildingsUpdate} />
        </div>
        <Certification
          buildings={certificationBuildings}
          isLoading={isLoading}
        />
        <Reinforcement
          buildings={reinforcementBuildings}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
