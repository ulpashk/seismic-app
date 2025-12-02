import { useState, useEffect } from "react";
import { fetchPassportizationRecommendations } from "../../services/recommendationsApi";

export default function Certification({ filters = {} }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPassportizationRecommendations(
          filters.selectedDistrict
        );
        setBuildings(data);
      } catch (err) {
        console.error("Error loading passportization recommendations:", err);
        setError(err.message || "Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

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
        <div className="bg-white rounded-md p-6 text-center text-gray-500">
          Нет данных для отображения
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
