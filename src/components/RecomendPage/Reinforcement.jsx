import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

const PAGE_SIZE = 20;

// Функция для проверки валидности адреса
const isValidAddress = (address) => {
  if (!address) return false;
  const str = String(address).trim();
  const lower = str.toLowerCase();
  // Проверяем базовые невалидные значения
  if (
    str === "" ||
    lower === "nan" ||
    lower === "null" ||
    lower === "undefined" ||
    lower === "n/a"
  )
    return false;
  // Проверяем начало строки на NaN
  if (lower.startsWith("nan,") || lower.startsWith("nan ")) return false;
  // Проверяем начало строки на запятую или только цифру/пробел
  if (str.startsWith(",") || str.startsWith(" ")) return false;
  // Адрес не должен быть только числом
  if (/^\d+\s*[a-zа-яё]?$/i.test(str)) return false;
  return true;
};

export default function Reinforcement({ buildings = [], isLoading = false }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(0);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(0);
  };

  // Фильтруем здания без валидного адреса
  const filteredBuildings = useMemo(() => {
    return (buildings || []).filter((b) => isValidAddress(b.address));
  }, [buildings]);

  const sortedBuildings = useMemo(() => {
    return filteredBuildings.slice().sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (sortConfig.direction === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [filteredBuildings, sortConfig]);

  const totalPages = Math.ceil(sortedBuildings.length / PAGE_SIZE);

  const paginatedBuildings = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return sortedBuildings.slice(start, start + PAGE_SIZE);
  }, [sortedBuildings, currentPage]);

  if (isLoading) {
    return (
      <div className="bg-[#d4edda] rounded-lg p-6 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Рекомендованные здания на усиление
        </h3>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          <div className="text-gray-600 ml-2">Загрузка данных с карты...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#d4edda] rounded-lg p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Рекомендованные здания на усиление (
        {sortedBuildings.length.toLocaleString()})
      </h3>

      <div className="bg-white rounded-md mb-3 p-3 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <span>Адрес</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-green-600"
              onClick={() => handleSort("address")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>SRI</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-green-600"
              onClick={() => handleSort("sri")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>H</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-green-600"
              onClick={() => handleSort("h")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>E</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-green-600"
              onClick={() => handleSort("e")}
            />
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span>V</span>
            <ArrowUpDown
              className="w-3 h-3 cursor-pointer hover:text-green-600"
              onClick={() => handleSort("v")}
            />
          </div>
        </div>
      </div>

      {sortedBuildings.length === 0 ? (
        <div className="bg-white rounded-md p-6 text-center flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-sm">
            Переместите карту для загрузки данных о зданиях
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="space-y-1 overflow-y-auto flex-1">
            {paginatedBuildings.map((building, index) => (
              <div
                key={building.id || index}
                className="bg-white rounded-md p-2 shadow-sm"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 text-sm flex-shrink-0">
              <span className="text-gray-600">
                Стр. {currentPage + 1} из {totalPages.toLocaleString()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-1 rounded bg-white shadow-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  className="p-1 rounded bg-white shadow-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
