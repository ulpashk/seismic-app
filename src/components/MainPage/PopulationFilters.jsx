import { useState } from "react";

export default function PopulationFilters({
  // State from parent
  filters = { densityLevels: {} },
  // Handlers from parent
  toggleDensityLevel = () => {},
}) {
  const [filtersHidden, setFiltersHidden] = useState(false);
  const [openSections, setOpenSections] = useState({
    densityLevels: true,
  });

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

  return (
    <div className="absolute top-[80px] left-4 z-20 w-80">
      <div className="flex flex-col max-h-[50vh] bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 font-semibold text-base border-b-0">
            <span>Фильтры населения</span>

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

          {/* Info message about available filters */}
          <div className="px-4 pb-3">
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              <strong>Примечание:</strong> Данные содержат только информацию о
              численности населения. Фильтрация по районам и типам зданий
              недоступна.
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
            {/* Density Levels */}
            <div className="py-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("densityLevels")}
              >
                <h3 className="font-medium text-gray-900 cursor-pointer text-sm">
                  Плотность населения:
                </h3>
                <span className="text-gray-500">
                  {openSections.densityLevels ? "▾" : "▸"}
                </span>
              </div>
              {openSections.densityLevels && (
                <div className={sectionStyle}>
                  {Object.entries(filters.densityLevels || {}).map(
                    ([key, enabled]) => (
                      <label
                        key={key}
                        className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleDensityLevel(key)}
                          className="form-checkbox scale-90"
                        />
                        {labelWithArrow(
                          key === "low"
                            ? "Низкая (< 25 чел.)"
                            : key === "medium"
                            ? "Средняя (25-59 чел.)"
                            : "Высокая (≥ 60 чел.)"
                        )}
                      </label>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
