import { useState } from "react";
import MapGeoRisk from "../components/MainPage/MapGeoRiskG";
import MapFilters from "../components/MainPage/MapFilters";
import HeatMapPopulation from "../components/MainPage/HeatMapPopulation";
// import GeoRiskFilter from "../components/MainPage/GeoRiskFilter";

export default function MainPage({ mainPageTab, setMainPageTab }) {
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
      {/* Layer Switcher - Адаптированный под правую сторону и вертикальный вид */}
      <div className="absolute top-20 right-2 sm:right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 z-20 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-1.5 md:gap-2 items-end md:items-center">
          {tabsConfig.map((tab) => {
            const isActive = mainPageTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setMainPageTab(tab.key)}
                className={`
                  px-2 py-1.5 rounded-md text-[10px] font-medium transition-all shadow-md border
                  flex items-center justify-center min-w-[100px] text-center
                  md:px-4 md:py-2 md:text-xs md:min-w-0
                  ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/20"
                      : "bg-white/90 backdrop-blur-sm text-gray-700 border-gray-200 hover:bg-white"
                  }
                `}
              >
                {tab.name}
              </button>
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
