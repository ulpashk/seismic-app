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
        <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <span>Адрес</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("address")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span>Район</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("district")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span>Уровень риска</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("risk_level")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span>Действие</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("recommended_action")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span>Стоимость</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("estimated_cost")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span>Приоритет</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("priority")}
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
              <div className="grid grid-cols-6 gap-2 text-sm">
                <span
                  className="font-medium text-gray-700 truncate"
                  title={building.address}
                >
                  {building.address}
                </span>
                <span
                  className="text-gray-600 truncate"
                  title={building.district}
                >
                  {building.district}
                </span>
                <span
                  className={`text-center font-medium ${
                    building.risk_level === "Высокий"
                      ? "text-red-600"
                      : building.risk_level === "Средний"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {building.risk_level}
                </span>
                <span
                  className="text-gray-600 truncate"
                  title={building.recommended_action}
                >
                  {building.recommended_action}
                </span>
                <span className="text-right text-gray-700">
                  {building.estimated_cost?.toLocaleString()} ₸
                </span>
                <span
                  className={`text-center font-medium ${
                    building.priority === "Высокий"
                      ? "text-red-600"
                      : building.priority === "Средний"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {building.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
