import React, { useState, useCallback } from "react";
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
    setVisibleBuildings(buildings);
    setIsLoading(false);
  }, []);

  return (
    <div className="px-6 py-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="space-y-6">
          <Demolition buildings={visibleBuildings} isLoading={isLoading} />
          <ClusterMap onBuildingsUpdate={handleBuildingsUpdate} />
        </div>
        <Certification buildings={visibleBuildings} isLoading={isLoading} />
        <Reinforcement buildings={visibleBuildings} isLoading={isLoading} />
      </div>
    </div>
  );
}
