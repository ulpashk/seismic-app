import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function GeoRiskFilter({
  mode,
  setMode,
  setRiskLevels,
  riskLevels,
  setInfrastructureCategories,
  infrastructureCategories,
  setSelectedDistrict,
  selectedDistrict,
  setDensityLevels,
  densityLevels,
}) {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [openSections, setOpenSections] = useState({
    risk: true,
    density: true,
    geostructure: true,
  });

  const allDistricts = [
    "Все районы",
    "Алатауский",
    "Алмалинский",
    "Ауэзовский",
    "Бостандыкский",
    "Жетысуский",
    "Медеуский",
    "Наурызбайский",
    "Турксибский",
  ];

  // Initialize districts
  useEffect(() => {
    if (!selectedDistrict || selectedDistrict.length === 0) {
      setSelectedDistrict(["Все районы"]);
    }
  }, [selectedDistrict, setSelectedDistrict]);

  // ✅ Initialize risk levels to ALL CHECKED on first load
  useEffect(() => {
    // Only set if riskLevels is not already initialized
    const hasAnyValue = Object.values(riskLevels).some(
      (v) => v === true || v === false
    );
    if (!hasAnyValue || Object.keys(riskLevels).length === 0) {
      setRiskLevels({
        high: true,
        medium: true,
        low: true,
      });
    }
  }, []);

  // ✅ Initialize infrastructure categories to ALL CHECKED
  useEffect(() => {
    const hasAnyValue = Object.values(infrastructureCategories).some(
      (v) => v === true || v === false
    );
    if (!hasAnyValue || Object.keys(infrastructureCategories).length === 0) {
      setInfrastructureCategories({
        landslides: true,
        tectonicFaults: true,
        mudflowPaths: true,
      });
    }
  }, []);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRiskLevelChange = (level) => {
    setRiskLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  // ✅ Added "Select All / Deselect All" for Risk Levels
  const handleRiskSelectAll = () => {
    const allChecked = Object.values(riskLevels).every((v) => v);
    setRiskLevels({
      high: !allChecked,
      medium: !allChecked,
      low: !allChecked,
    });
  };

  const handleInfrastructureChange = (category) => {
    setInfrastructureCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // ✅ Added "Select All / Deselect All" for Infrastructure
  const handleInfrastructureSelectAll = () => {
    const allChecked = Object.values(infrastructureCategories).every((v) => v);
    setInfrastructureCategories({
      landslides: !allChecked,
      tectonicFaults: !allChecked,
      mudflowPaths: !allChecked,
    });
  };

  const handleCityChange = (city) => {
    if (city === "Все районы") {
      setSelectedDistrict(["Все районы"]);
    } else {
      setSelectedDistrict((prev) => {
        let updated = prev.includes(city)
          ? prev.filter((c) => c !== city)
          : [...prev.filter((c) => c !== "Все районы"), city];
        return updated.length === 0 ? ["Все районы"] : updated;
      });
    }
  };

  // Calculate counts for display
  const riskCheckedCount = Object.values(riskLevels).filter(Boolean).length;
  const infraCheckedCount = Object.values(infrastructureCategories).filter(
    Boolean
  ).length;

  return (
    <>
      <div className="flex flex-col max-h-[90vh] w-80 bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden">
        {/* 🔹 Header + Collapse Button */}
        <div className="flex justify-between items-center px-4 pt-2 pb-2 border-b font-semibold text-gray-900 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h3>Фильтры</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 transition"
            title={isCollapsed ? "Показать фильтры" : "Скрыть фильтры"}
          >
            {isCollapsed ? (
              <ChevronDown size={18} strokeWidth={2} />
            ) : (
              <ChevronUp size={18} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* 🔹 District Selector (Always Visible) */}
        <div className="p-4 border-b">
          <div className="relative">
            <div
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition"
            >
              <span className="truncate">
                {selectedDistrict.length > 0
                  ? selectedDistrict.join(", ")
                  : "Выберите район"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  cityDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {cityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {allDistricts.map((city) => (
                    <label
                      key={city}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(city)}
                        onChange={() => handleCityChange(city)}
                        className="form-checkbox"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 Collapsible Section (Animated) */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-auto ${
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[600px] opacity-100"
          }`}
        >
          {/* --- Risk Level Section --- */}
          <div className="p-4 border-b">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("risk")}
            >
              <h3 className="font-semibold text-gray-900 text-sm">
                Уровень риска:{" "}
                <span className="text-gray-500 font-normal">
                  ({riskCheckedCount}/3)
                </span>
              </h3>
              <span className="text-gray-500">
                {openSections.risk ? "▾" : "▸"}
              </span>
            </div>
            {openSections.risk && (
              <div className="space-y-2 text-sm mt-2">
                {/* Select All Button */}
                <button
                  onClick={handleRiskSelectAll}
                  className="w-full text-left text-xs text-blue-600 hover:text-blue-800 mb-1"
                >
                  {Object.values(riskLevels).every((v) => v)
                    ? "Снять все"
                    : "Выбрать все"}
                </button>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskLevels.high ?? true}
                    onChange={() => handleRiskLevelChange("high")}
                    className="form-checkbox text-red-600"
                  />
                  <span>Высокий</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskLevels.medium ?? true}
                    onChange={() => handleRiskLevelChange("medium")}
                    className="form-checkbox text-yellow-600"
                  />
                  <span>Средний</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskLevels.low ?? true}
                    onChange={() => handleRiskLevelChange("low")}
                    className="form-checkbox text-green-600"
                  />
                  <span>Низкий</span>
                </label>
              </div>
            )}
          </div>

          {/* --- Geostructure Section --- */}
          <div className="p-4 border-b">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("geostructure")}
            >
              <h3 className="font-semibold text-gray-900 text-sm">
                Категория геоструктур:{" "}
                <span className="text-gray-500 font-normal">
                  ({infraCheckedCount}/3)
                </span>
              </h3>
              <span className="text-gray-500">
                {openSections.geostructure ? "▾" : "▸"}
              </span>
            </div>
            {openSections.geostructure && (
              <div className="space-y-2 text-sm mt-2">
                {/* Select All Button */}
                <button
                  onClick={handleInfrastructureSelectAll}
                  className="w-full text-left text-xs text-blue-600 hover:text-blue-800 mb-1"
                >
                  {Object.values(infrastructureCategories).every((v) => v)
                    ? "Снять все"
                    : "Выбрать все"}
                </button>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infrastructureCategories.landslides ?? true}
                    onChange={() => handleInfrastructureChange("landslides")}
                    className="form-checkbox"
                  />
                  <span>Оползни</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infrastructureCategories.tectonicFaults ?? true}
                    onChange={() =>
                      handleInfrastructureChange("tectonicFaults")
                    }
                    className="form-checkbox"
                  />
                  <span>Тектонические разломы</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infrastructureCategories.mudflowPaths ?? true}
                    onChange={() => handleInfrastructureChange("mudflowPaths")}
                    className="form-checkbox"
                  />
                  <span>Селевые пути</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Population Card (Bottom Left) */}
      <div className="fixed bottom-8 left-4 lg:w-80 z-10 bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden mt-5">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Население:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-red-600">Высокий</span>
              <span>57020 - 2.49%</span>
            </div>
            <div className="flex justify-between">
              <span>Средний</span>
              <span>454666 - 19.83%</span>
            </div>
            <div className="flex justify-between">
              <span>Низкий</span>
              <span>1780159 - 77.68%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
