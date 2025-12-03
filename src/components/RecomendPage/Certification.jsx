import { useState, useEffect } from "react";
import { fetchPassportizationRecommendations } from "../../services/recommendationsApi";

export default function Certification() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPassportizationRecommendations(null);
        setBuildings(data);
      } catch (err) {
        console.error("Error loading passportization recommendations:", err);
        setError(err.message || "Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#d3e2ff] rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Рекомендованные здания на паспортизацию
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
          Рекомендованные здания на паспортизацию
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#d3e2ff] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Рекомендованные здания на паспортизацию ({buildings.length})
      </h3>

      {/* Table Header */}
      <div className="bg-white rounded-md mb-3 p-3 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <span>Адрес</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>SRI</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>H</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>E</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>V</span>
          </div>
        </div>
      </div>

      {buildings.length === 0 ? (
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
            🔗 Требуется: GET
            /api/v1/building-risk?measure_category=passportization
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
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {buildings.map((building, index) => (
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
