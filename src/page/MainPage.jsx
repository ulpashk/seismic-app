import { useState } from "react";
import MapGeoRisk from "../components/MainPage/MapGeoRiskG";
import MapFilters from "../components/MainPage/MapFilters";
import HeatMapPopulation from "../components/MainPage/HeatMapPopulation";
// import GeoRiskFilter from "../components/MainPage/GeoRiskFilter";

export default function MainPage({ mainPageTab, setMainPageTab }) {
  // Constants - single source of truth
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

  const districtCoordinates = {
    Алатауский: [76.8347886720185, 43.2987364390376],
    Алмалинский: [76.9087951573108, 43.2522310686198],
    Ауэзовский: [76.8504995220839, 43.223745973742],
    Бостандыкский: [76.923470827708, 43.1557279031715],
    Жетысуский: [76.9247715410888, 43.3089271719003],
    Медеуский: [77.0214117650313, 43.1639355276689],
    Наурызбайский: [76.8309409706471, 43.1744182686828],
    Турксибский: [76.9856814001376, 43.3409268951072],
  };

  const riskLabelMap = {
    high: "высокий",
    medium: "средний",
    low: "низкий",
  };

  const categoryLabelMap = {
    mudflow: "сель",
    landslide: "оползни",
    fault: "разломы",
  };

  // Unified filter state
  const [filters, setFilters] = useState({
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

  // Filter handler functions
  const toggleRiskLevel = (level) => {
    setFilters((prev) => ({
      ...prev,
      riskLevels: { ...prev.riskLevels, [level]: !prev.riskLevels[level] },
    }));
  };

  const toggleCategory = (cat) => {
    setFilters((prev) => ({
      ...prev,
      categories: { ...prev.categories, [cat]: !prev.categories[cat] },
    }));
  };

  // These functions will have enhanced functionality in MapGeoRisk
  const selectDistrict = (district) => {
    setFilters((prev) => ({
      ...prev,
      districts: [district],
    }));
    // Map flying logic will be handled in MapGeoRisk
  };

  const resetToAllDistricts = () => {
    setFilters((prev) => ({ ...prev, districts: [] }));
    // Map flying logic will be handled in MapGeoRisk
  };

  // Legacy state for backward compatibility (can be removed later)
  const [densityLevels] = useState({
    high: true,
    medium: true,
    low: true,
  });
  const [selectedDistrict] = useState(["Все районы"]);
  const [mode, setMode] = useState("grid");

  // Tab configuration - аналогично InfraPage
  const tabsConfig = [
    {
      key: "geo-risk",
      name: "Гео-риски",
    },
    {
      key: "heat-map",
      name: "Тепловая карта населения",
    },
  ];

  return (
    <div className="relative w-full h-screen">
      {/* Layer Switcher - аналогично InfraPage */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center">
        <div className="flex space-x-2">
          {tabsConfig.map((tab) => {
            return (
              <div key={tab.key}>
                <div
                  onClick={() => setMainPageTab(tab.key)}
                  className={`w-full px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center justify-start ${
                    mainPageTab === tab.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {mainPageTab === "geo-risk" ? (
        <>
          <MapGeoRisk
            // Constants
            districts={districts}
            districtCoordinates={districtCoordinates}
            riskLabelMap={riskLabelMap}
            categoryLabelMap={categoryLabelMap}
            // State
            filters={filters}
            setFilters={setFilters}
            // Filter handlers
            toggleRiskLevel={toggleRiskLevel}
            toggleCategory={toggleCategory}
            selectDistrict={selectDistrict}
            resetToAllDistricts={resetToAllDistricts}
            // Legacy props (for backward compatibility)
            mode={mode}
            setMode={setMode}
            selectedDistrict={selectedDistrict}
            densityLevels={densityLevels}
          />

          <MapFilters
            // Constants
            districts={districts}
            riskLabelMap={riskLabelMap}
            categoryLabelMap={categoryLabelMap}
            // State
            filters={filters}
            // Handlers
            toggleRiskLevel={toggleRiskLevel}
            toggleCategory={toggleCategory}
            selectDistrict={selectDistrict}
            resetToAllDistricts={resetToAllDistricts}
          />
        </>
      ) : (
        <HeatMapPopulation />
      )}
    </div>
  );
}
