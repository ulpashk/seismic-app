import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  Download,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Filters({
  districts = [],
  filters = { districts: [] },
  selectDistrict = () => {},
  resetToAllDistricts = () => {},
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const handleExport = () => {
    // TODO: Implement Excel export functionality
    console.log("Export functionality will be implemented later");
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm relative">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1 text-left hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Выберите район
          </h2>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setShowInfoPopup(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Информация о колонках"
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors"
            title="Экспорт в Excel"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Экспорт</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {districts.map((district) => {
            const isSelected = filters.districts.includes(district);
            return (
              <button
                key={district}
                onClick={() => selectDistrict(district)}
                className={`px-3 py-2 text-sm rounded-md transition-colors border ${
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
                  <span className="font-medium">{district}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Information Popup */}
      {showInfoPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Описание колонок
              </h3>
              <button
                onClick={() => setShowInfoPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="text-md">
                <span className="font-semibold text-gray-800">SRI</span> -
                индекс сейсмоустойчивости здания, показывающий, насколько объект
                защищён от сейсмической опасности.
              </div>
              <div className="text-md">
                <span className="font-semibold text-gray-800">H</span> -
                отражает внешний геориск территории, где находится здание.
              </div>
              <div className="text-md">
                <span className="font-semibold text-gray-800">V</span> -
                показывает, насколько само здание подвержено разрушению.
              </div>
              <div className="text-md">
                <span className="font-semibold text-gray-800">E</span> -
                характеризует масштаб возможных потерь, т.е. размер здания
                (площадь).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
