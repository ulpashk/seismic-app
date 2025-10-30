import { useState } from "react";

export default function MapFilters({
  // Data from parent
  districts = [],
  districtCoordinates = {},
  riskLabelMap = {},
  categoryLabelMap = {},
  // State from parent
  filters = { districts: [], riskLevels: {}, categories: {} },
  // Handlers from parent
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

  // Все районы для dropdown
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

  const sectionStyle = "space-y-1 text-xs max-h-44 overflow-y-auto";

  const labelWithArrow = (children) => (
    <span className="flex items-center space-x-1">
      <span className="text-gray-400">|</span>
      <span>{children}</span>
    </span>
  );

  // Определяем выбранные районы для отображения
  const selectedDistrictsDisplay =
    filters.districts.length === 0 ? ["Все районы"] : filters.districts;

  return (
    <div className="absolute top-[80px] left-4 z-20 w-80">
      <div className="flex flex-col max-h-[50vh] bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden">
        {/* Sticky Header + District Selector */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 font-semibold text-base border-b-0">
            <span>Фильтры</span>

            {/* Иконка для сворачивания фильтров */}
            <button
              onClick={() => setFiltersHidden(!filtersHidden)}
              className="text-gray-600 hover:text-gray-900 transition-transform"
              title={filtersHidden ? "Показать фильтры" : "Скрыть фильтры"}
            >
              <svg
                className={`w-4 h-4 transform transition-transform duration-300 ${
                  filtersHidden ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Районы — всегда видимая часть */}
          <div className="px-4 pb-3">
            <div className="relative">
              <div
                onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                className="flex items-center justify-between px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
              >
                <span className="flex-1 truncate">
                  {selectedDistrictsDisplay.join(", ")}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    districtDropdownOpen ? "rotate-180" : ""
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

              {districtDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-30 max-h-44 overflow-y-auto">
                  <div className="p-2 space-y-1 text-xs">
                    {allDistricts.map((district) => (
                      <label
                        key={district}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={
                            district === "Все районы"
                              ? filters.districts.length === 0
                              : filters.districts.includes(district)
                          }
                          onChange={() => handleDistrictChange(district)}
                          className="form-checkbox scale-90"
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

        {/* Скрываемая часть (с анимацией) */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            filtersHidden
              ? "max-h-0 opacity-0 overflow-hidden"
              : "max-h-[600px] opacity-100 overflow-y-auto"
          }`}
        >
          <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Categories */}
            <div className="py-3 border-b">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("categories")}
              >
                <h3 className="font-medium text-gray-900 cursor-pointer text-sm">
                  Категории рисков:
                </h3>
                <span className="text-gray-500">
                  {openSections.categories ? "▾" : "▸"}
                </span>
              </div>
              {openSections.categories && (
                <div className={sectionStyle}>
                  {Object.entries(filters.categories).map(([key, enabled]) => (
                    <label
                      key={key}
                      className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleCategory(key)}
                        className="form-checkbox scale-90"
                      />
                      {labelWithArrow(
                        key === "mudflow"
                          ? "Селевые потоки"
                          : key === "landslide"
                          ? "Оползни"
                          : "Тектонические разломы"
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Levels */}
            <div className="py-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("riskLevels")}
              >
                <h3 className="font-medium text-gray-900 cursor-pointer text-sm">
                  Уровни риска:
                </h3>
                <span className="text-gray-500">
                  {openSections.riskLevels ? "▾" : "▸"}
                </span>
              </div>
              {openSections.riskLevels && (
                <div className={sectionStyle}>
                  {Object.entries(filters.riskLevels).map(([key, enabled]) => (
                    <label
                      key={key}
                      className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleRiskLevel(key)}
                        className="form-checkbox scale-90"
                      />
                      {labelWithArrow(
                        key === "high"
                          ? "Высокий"
                          : key === "medium"
                          ? "Средний"
                          : "Низкий"
                      )}
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
