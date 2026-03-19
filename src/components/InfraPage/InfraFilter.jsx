import { useEffect, useState } from "react";

export default function InfraFilter({
  setEnginNodes,
  setSocialCategories,
  setBuildingCategories,
  setSelectedDistrict,
  setDistrictDropdownOpen,
  districtDropdownOpen,
  selectedDistrict,
  enginNodes,
  socialCategories,
  buildingCategories,
  riskClassFilter,
  setRiskClassFilter,
}) {
  const [filtersHidden, setFiltersHidden] = useState(false);
  const [openSections, setOpenSections] = useState({
    risk: true,
    social: true,
    building: true,
  });

  const allDistricts = [
    "Все районы", "Алатауский", "Алмалинский", "Ауэзовский", 
    "Бостандыкский", "Жетысуский", "Медеуский", "Наурызбайский", "Турксибский",
  ];

  useEffect(() => {
    if (!selectedDistrict || selectedDistrict.length === 0) {
      setSelectedDistrict(["Все районы"]);
    }
  }, [selectedDistrict, setSelectedDistrict]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const labelWithArrow = (children) => (
    <span className="flex items-center space-x-1 truncate">
      <span className="text-gray-400">|</span>
      <span className="truncate">{children}</span>
    </span>
  );

  const formatNumber = (num) => num?.toLocaleString("ru-RU");

  return (
    // Единый контейнер для всей боковой панели
    <div className="absolute top-[80px] left-2 sm:left-4 z-20 w-64 sm:w-72 md:w-80 flex flex-col transition-all duration-300">
      <div className="flex flex-col bg-white/95 backdrop-blur-sm rounded-xl border shadow-xl overflow-hidden">
        
        {/* ЗАГОЛОВОК (Всегда виден) */}
        <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b bg-white">
          <span className="font-bold text-xs sm:text-sm md:text-base text-gray-800">Фильтры</span>
          <button
            onClick={() => setFiltersHidden(!filtersHidden)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg
              className={`w-4 h-4 transform transition-transform duration-300 ${filtersHidden ? "" : "rotate-180"}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* СКРОЛЛЯЕМАЯ ОБЛАСТЬ ФИЛЬТРОВ */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${filtersHidden ? "max-h-0" : "max-h-[50vh]"}`}>
          <div className="p-3 md:p-4 space-y-4">
            
            {/* Выбор района */}
            <div className="relative">
              <div
                onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                className="flex items-center justify-between px-3 py-2 border rounded-md text-[10px] sm:text-xs md:text-sm cursor-pointer hover:bg-gray-50"
              >
                <span className="truncate mr-1">{selectedDistrict.join(", ")}</span>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {districtDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-2xl z-50 max-h-40 overflow-y-auto">
                  {allDistricts.map((district) => (
                    <label key={district} className="flex items-center space-x-2 p-2 hover:bg-blue-50 text-[10px] sm:text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(district)}
                        onChange={() => {
                          if (district === "Все районы") setSelectedDistrict(["Все районы"]);
                          else {
                            setSelectedDistrict(prev => prev.includes(district) ? prev.filter(d => d !== district) : [...prev.filter(d => d !== "Все районы"), district]);
                          }
                        }}
                        className="h-3 w-3"
                      />
                      <span>{district}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Класс риска */}
            <div className="space-y-1">
              <h3 className="font-medium text-[10px] sm:text-xs md:text-sm">Класс риска зданий:</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2 text-[10px] sm:text-xs cursor-pointer">
                  <input type="checkbox" checked={riskClassFilter.showHighRisk} onChange={() => setRiskClassFilter(p => ({...p, showHighRisk: !p.showHighRisk}))} className="h-3 w-3" />
                  {labelWithArrow("Высокий риск (E, D)")}
                </label>
                <label className="flex items-center space-x-2 text-[10px] sm:text-xs cursor-pointer">
                  <input type="checkbox" checked={riskClassFilter.showLowRisk} onChange={() => setRiskClassFilter(p => ({...p, showLowRisk: !p.showLowRisk}))} className="h-3 w-3" />
                  {labelWithArrow("Низкий риск (A-C)")}
                </label>
              </div>
            </div>

            {/* Секции: Инженерные узлы и Социальные объекты */}
            {[
              { id: 'risk', label: 'Инженерные узлы:', items: ["Канализация", "ИКТ инфраструктура", "Электроснабжение", "Теплоснабжение", "Газоснабжение"], state: enginNodes, handler: setEnginNodes },
              { id: 'social', label: 'Социальные объекты:', items: ["Школы", "ДДО", "Больницы", "ПППН"], state: socialCategories, handler: setSocialCategories }
            ].map(section => (
              <div key={section.id} className="border-t pt-2">
                <div className="flex justify-between items-center cursor-pointer mb-1" onClick={() => toggleSection(section.id)}>
                  <h3 className="font-medium text-[10px] sm:text-xs md:text-sm">{section.label}</h3>
                  <span className="text-[10px]">{openSections[section.id] ? "▼" : "▶"}</span>
                </div>
                {openSections[section.id] && (
                  <div className="space-y-1">
                    {section.items.map(item => (
                      <label key={item} className="flex items-center space-x-2 text-[10px] sm:text-xs cursor-pointer">
                        <input type="checkbox" checked={section.state[item]} onChange={() => section.handler(p => ({...p, [item]: !p[item]}))} className="h-3 w-3" />
                        {labelWithArrow(item === "ДДО" ? "Детские сады" : item)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* НИЖНЯЯ ПАНЕЛЬ СТАТИСТИКИ (Всегда внизу этого же блока) */}
        <div className="border-t bg-gray-50/50 p-3 md:p-4">
          <h3 className="font-medium text-[10px] sm:text-xs md:text-sm mb-2">Население:</h3>
          <div className="space-y-1 text-[10px] sm:text-xs mb-3">
            <div className="flex justify-between"><span className="text-red-600 font-medium">Высокий риск</span><span>57 020 (2.5%)</span></div>
            <div className="flex justify-between text-gray-500"><span>Средний</span><span>454 666 (19.8%)</span></div>
            <div className="flex justify-between text-gray-500"><span>Низкий</span><span>1 780 159 (77.7%)</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border rounded-lg p-1.5 md:p-2 text-center shadow-sm">
              <div className="text-[10px] sm:text-xs md:text-sm font-bold text-red-600">1 088</div>
              <p className="text-[8px] sm:text-[9px] text-gray-500 leading-tight">Несейсмостойкие</p>
            </div>
            <div className="bg-white border rounded-lg p-1.5 md:p-2 text-center shadow-sm">
              <div className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-900">21 539</div>
              <p className="text-[8px] sm:text-[9px] text-gray-500 leading-tight">Паспортизация</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}