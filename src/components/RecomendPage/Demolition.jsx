import { ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchDemolitionRecommendations } from "../../services/recommendationsApi";

export default function Demolition() {
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

        const data = await fetchDemolitionRecommendations(null);
        setBuildings(data || []); // API теперь возвращает массив напрямую
      } catch (err) {
        console.error("Error loading demolition recommendations:", err);
        setError(err.message || "Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <div className="bg-white rounded-md p-6 text-center">
          <div className="text-blue-600 mb-3">
            📊 <strong>Данные обновлены!</strong>
          </div>
          <div className="text-gray-600 text-sm mb-4">
            Теперь система корректно обрабатывает все поля из PBF тайлов:
            <br />
            📍 Адрес (street, homenum), 🏗️ Характеристики здания, 📈
            Сейсмические показатели
          </div>
          <div className="text-orange-600 text-sm mb-4">
            ⚠️ <strong>Примечание:</strong> Для отображения в таблице
            по-прежнему нужен JSON endpoint
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border font-mono">
            🔗 Требуется: GET /api/v1/building-risk?measure_category=demolition
            <br />
            📋 Поля: id, street, homenum, district, h, v, e, risk, floor,
            area_m2, is_emergency_building, is_passport
          </div>
          <div className="mt-3 text-xs text-green-600">
            ✅ Карта уже готова для отображения PBF данных с новой структурой
            полей!
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedBuildings.map((building, index) => (
            <div
              key={building.id || index}
              className="bg-white rounded-md p-3 shadow-sm"
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
