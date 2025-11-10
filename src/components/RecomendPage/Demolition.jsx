import { ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchDemolitionRecommendations } from "../../services/recommendationsApi";

export default function Demolition({ filters = {} }) {
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

        const data = await fetchDemolitionRecommendations(
          filters.selectedDistrict
        );
        setBuildings(data || []); // API теперь возвращает массив напрямую
      } catch (err) {
        console.error("Error loading demolition recommendations:", err);
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
          На основе индекса SRI, рекомендованные здания на снос
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
          На основе индекса SRI, рекомендованные здания на снос
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#d3e2ff] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        На основе индекса SRI, рекомендованные здания на снос (
        {sortedBuildings.length})
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
            <span>Уровень риска</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("risk_level")}
            />
          </div>
          <div className="flex items-center gap-1">
            <span>Приоритет</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("priority")}
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
            <span>Срок</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort("deadline")}
            />
          </div>
          <div className="text-center">
            <span>Действие</span>
          </div>
        </div>
      </div>

      {sortedBuildings.length === 0 ? (
        <div className="bg-white rounded-md p-6 text-center text-gray-500">
          Нет данных для отображения
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedBuildings.map((building, index) => (
            <div
              key={building.id || index}
              className="bg-white rounded-md p-3 shadow-sm"
            >
              <div className="grid grid-cols-6 gap-2 text-sm">
                <span
                  className="font-medium text-gray-700 truncate"
                  title={building.address}
                >
                  {building.address}
                </span>
                <span className="text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      building.risk_level === "Высокий"
                        ? "bg-red-100 text-red-800"
                        : building.risk_level === "Средний"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {building.risk_level}
                  </span>
                </span>
                <span className="text-center">{building.priority}</span>
                <span className="text-center">
                  {building.estimated_cost?.toLocaleString()} ₸
                </span>
                <span className="text-center">{building.deadline}</span>
                <span className="text-center text-xs">
                  <button className="text-blue-600 hover:text-blue-800">
                    Детали
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
