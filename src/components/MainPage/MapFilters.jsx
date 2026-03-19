import { useState } from "react";

export default function MapFilters({
  districts = [],
  filters = { districts: [], riskLevels: {}, categories: {} },
  toggleRiskLevel = () => {},
  toggleCategory = () => {},
  selectDistrict = () => {},
  resetToAllDistricts = () => {},
}) {
  const [filtersHidden, setFiltersHidden] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    categories: true,
    riskLevels: true,
  });

  const allDistricts = ["Все районы", ...districts];

  const handleDistrictChange = (district) => {
    if (district === "Все районы") {
      resetToAllDistricts();
    } else {
      selectDistrict(district);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Вспомогательный компонент для меток с адаптивным размером
  const labelWithArrow = (children) => (
    <span className="flex items-center space-x-1 truncate">
      <span className="text-gray-400">|</span>
      <span className="truncate">{children}</span>
    </span>
  );

  const selectedDistrictsDisplay =
    filters.districts.length === 0 ? ["Все районы"] : filters.districts;

  return (
    /* 
       Адаптивная ширина: 
       - По умолчанию (самые маленькие): w-60 (240px)
       - Маленькие экраны (sm): w-72 (288px)
       - Средние (md): w-80 (320px)
    */
    <div className="absolute top-[80px] left-2 md:left-4 z-20 w-60 sm:w-72 md:w-80 transition-all duration-300">
      <div className="flex flex-col max-h-[60vh] md:max-h-[80vh] bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl border shadow-md overflow-hidden">
        
        {/* Шапка */}
        <div className="sticky top-0 z-20 bg-white border-b">
          <div className="flex items-center justify-between px-2 md:px-4 py-2 font-semibold text-sm sm:text-base md:text-base">
            <span>Фильтры</span>
            <button
              onClick={() => setFiltersHidden(!filtersHidden)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transform transition-transform ${filtersHidden ? "" : "rotate-180"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Селектор района */}
          <div className="px-2 md:px-4 pb-2">
            <div className="relative">
              <div
                onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                className="flex items-center justify-between px-2 py-1 md:py-1.5 border rounded md:rounded-md text-[10px] sm:text-xs md:text-sm cursor-pointer hover:bg-gray-50"
              >
                <span className="flex-1 truncate mr-1">
                  {selectedDistrictsDisplay.join(", ")}
                </span>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {districtDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-30 max-h-40 overflow-y-auto">
                  <div className="p-1 space-y-0.5 text-[10px] sm:text-xs">
                    {allDistricts.map((district) => (
                      <label key={district} className="flex items-center space-x-1.5 p-1.5 hover:bg-blue-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={district === "Все районы" ? filters.districts.length === 0 : filters.districts.includes(district)}
                          onChange={() => handleDistrictChange(district)}
                          className="h-3 w-3 text-blue-600 rounded"
                        />
                        {labelWithArrow(district)}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Контент фильтров (Сворачиваемый) */}
        <div className={`transition-all duration-300 ${filtersHidden ? "max-h-0 opacity-0" : "max-h-[400px] opacity-100"}`}>
          <div className="px-2 md:px-4 pb-3 overflow-y-auto divide-y divide-gray-50">
            
            {/* Секция Категории */}
            <div className="py-2 border-b">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("categories")}>
                <h3 className="font-medium text-[10px] sm:text-xs md:text-sm">Категории рисков:</h3>
                <span className="text-[10px] text-gray-400">{openSections.categories ? "▼" : "▶"}</span>
              </div>
              {openSections.categories && (
                <div className="mt-1 space-y-0.5">
                  {Object.entries(filters.categories).map(([key, enabled]) => (
                    <label key={key} className="flex items-center space-x-1.5 p-1 hover:bg-gray-50 rounded text-[10px] sm:text-xs cursor-pointer">
                      <input type="checkbox" checked={enabled} onChange={() => toggleCategory(key)} className="h-3 w-3" />
                      {labelWithArrow(key === "mudflow" ? "Сели" : key === "landslide" ? "Оползни" : "Разломы")}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Секция Уровни риска */}
            <div className="py-2">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("riskLevels")}>
                <h3 className="font-medium text-[10px] sm:text-xs md:text-sm">Уровни риска:</h3>
                <span className="text-[10px] text-gray-400">{openSections.riskLevels ? "▼" : "▶"}</span>
              </div>
              {openSections.riskLevels && (
                <div className="mt-1 space-y-0.5">
                  {Object.entries(filters.riskLevels).map(([key, enabled]) => (
                    <label key={key} className="flex items-center space-x-1.5 p-1 hover:bg-gray-50 rounded text-[10px] sm:text-xs cursor-pointer">
                      <input type="checkbox" checked={enabled} onChange={() => toggleRiskLevel(key)} className="h-3 w-3" />
                      {labelWithArrow(key === "high" ? "Высокий" : key === "medium" ? "Средний" : "Низкий")}
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}