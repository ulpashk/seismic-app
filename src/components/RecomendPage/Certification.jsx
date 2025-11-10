import { ArrowUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchPassportizationRecommendations } from '../../services/recommendationsApi';

export default function Certification({ filters = {} }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPassportizationRecommendations(filters.selectedDistrict);
        setBuildings(data);
      } catch (err) {
        console.error('Error loading passportization recommendations:', err);
        setError(err.message || 'Ошибка при загрузке данных');
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

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {buildings.map((building, index) => (
          <div key={building.id || index} className="bg-white rounded-md p-3 shadow-sm">
            <div className="grid grid-cols-4 gap-2 text-sm">
              <span className="font-medium text-gray-700">{building.address}</span>
              <span className="text-gray-600">{building.district}</span>
              <span className="text-gray-600">{building.risk_level}</span>
              <span className="text-gray-600">{building.recommended_action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
