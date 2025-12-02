import { ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchStrengtheningRecommendations } from "../../services/recommendationsApi";

export default function Reinforcement({ filters = {} }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Загрузка данных при изменении фильтров
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchStrengtheningRecommendations(
          filters.selectedDistrict
        );
        setBuildings(data); // Данные приходят напрямую массивом
      } catch (err) {
        console.error("Error loading strengthening recommendations:", err);
        setError(err.message || "Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Сортировка данных
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedBuildings = (buildings || []).slice().sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (sortConfig.direction === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  if (loading) {
    return (
      <div className="bg-[#d3e2ff] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Рекомендованные здания на усиление
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Загрузка данных...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#d3e2ff] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Рекомендованные здания на усиление
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
          <p className="text-xs text-yellow-600 mt-2">
            Данные извлекаются из PBF тайлов: strengthening
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#d3e2ff] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Рекомендованные здания на усиление ({sortedBuildings.length})
      </h3>

      {/* Table Header */}
      <div className="bg-white rounded-md mb-3 p-3 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <span>Адрес</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("address")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>SRI</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("sri")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>H</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("h")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>E</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("e")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>V</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("v")}
            />
          </div>
        </div>
      </div>

      {sortedBuildings.length === 0 ? (
        <div className="bg-white rounded-md p-6 text-center text-gray-500">
          Нет данных для отображения
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedBuildings.map((building, index) => (
            <div
              key={building.id || index}
              className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-5 gap-2 text-sm">
                <span
                  className="font-medium text-gray-700 truncate"
                  title={building.address}
                >
                  {building.address}
                </span>
                <span className="text-center text-gray-700">
                  {building.sri?.toFixed(2) || "N/A"}
                </span>
                <span className="text-center text-gray-700">
                  {building.h?.toFixed(2) || "N/A"}
                </span>
                <span className="text-center text-gray-700">
                  {building.e?.toFixed(2) || "N/A"}
                </span>
                <span className="text-center text-gray-700">
                  {building.v?.toFixed(2) || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
