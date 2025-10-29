import { useState } from "react";
import { AlertTriangle, X, Filter, Eye, EyeOff } from "lucide-react";

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
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <>
      <div
        className={`absolute top-20 left-4 bottom-20 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl transition-transform duration-300 z-20 pointer-events-auto ${
          isPanelOpen ? "translate-x-0" : "-translate-x-[420px]"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="absolute -right-14 top-4 bg-white text-gray-700 p-2 rounded-r-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          {isPanelOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Filter className="w-5 h-5" />
          )}
        </button>

        <div className="flex flex-col h-full p-6 overflow-hidden">
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-gray-900 font-semibold mb-3">
                  Категории инфраструктуры
                </h3>
                <div className="space-y-3">
                  {Object.entries(filters.categories).map(([key, enabled]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleCategory(key)}
                        className="w-5 h-5 rounded accent-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-gray-900 font-medium">
                          {key === "mudflow"
                            ? "Селевые потоки"
                            : key === "landslide"
                            ? "Оползни"
                            : "Тектонические разломы"}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {categoryLabelMap[key]}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full ${
                          key === "mudflow"
                            ? "bg-blue-400"
                            : key === "landslide"
                            ? "bg-orange-400"
                            : "bg-red-400"
                        }`}
                      />
                    </label>
                  ))}
                </div>
              </div>
              {/* Risk Levels */}
              <div>
                <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Уровни риска
                </h3>
                <div className="space-y-2">
                  {Object.entries(filters.riskLevels).map(([key, enabled]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleRiskLevel(key)}
                        className="w-5 h-5 rounded accent-blue-500"
                      />
                      <span
                        className={`flex-1 font-medium ${
                          key === "high"
                            ? "text-red-600"
                            : key === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {key === "high"
                          ? "Высокий"
                          : key === "medium"
                          ? "Средний"
                          : "Низкий"}
                      </span>
                      {enabled ? (
                        <Eye className="w-4 h-4 text-gray-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-300" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Districts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 font-semibold">Районы</h3>
                  <button
                    onClick={resetToAllDistricts}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    Все районы
                  </button>
                </div>
                <div className="space-y-2">
                  {districts.map((district) => {
                    const isSelected = filters.districts.includes(district);
                    return (
                      <button
                        key={district}
                        onClick={() => selectDistrict(district)}
                        className={`w-full text-left p-3 rounded-lg transition-colors border ${
                          isSelected
                            ? "bg-blue-50 border-blue-300 text-blue-900"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? "bg-blue-500" : "bg-gray-400"
                            }`}
                          ></span>
                          <span className="text-sm font-medium">
                            {district}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
