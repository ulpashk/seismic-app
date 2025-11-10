import React, { useState } from "react";
import Filters from "../components/RecomendPage/Filters";
import Demolition from "../components/RecomendPage/Demolition";
import ClusterMap from "../components/RecomendPage/ClusterMap";
import Certification from "../components/RecomendPage/Certification";
import Reinforcement from "../components/RecomendPage/Reinforcement";

export default function RecomendPage() {
  const districts = [
    "Алатауский",
    "Алмалинский",
    "Ауэзовский",
    "Бостандыкский",
    "Жетысуский",
    "Медеуский",
    "Наурызбайский",
    "Турксибский",
  ];
  const [filters, setFilters] = useState({
    selectedDistrict: null, // Изменяем структуру для совместимости с API
    districts: [],
    riskLevels: {
      high: true,
      medium: true,
      low: true,
    },
    categories: {
      mudflow: true,
      landslide: true,
      fault: true,
    },
  });
  const resetToAllDistricts = () => {
    setFilters((prev) => ({
      ...prev,
      districts: [],
      selectedDistrict: null,
    }));
  };

  const selectDistrict = (district) => {
    setFilters((prev) => ({
      ...prev,
      districts: [district],
      selectedDistrict: district,
    }));
  };

  return (
    <div className="px-6 py-4 bg-gray-50 min-h-screen">
      <Filters
        districts={districts}
        filters={filters}
        selectDistrict={selectDistrict}
        resetToAllDistricts={resetToAllDistricts}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="space-y-6">
          <Demolition filters={filters} />
          <ClusterMap filters={filters} />
        </div>
        <Certification filters={filters} />
        <Reinforcement filters={filters} />
      </div>
    </div>
  );
}
