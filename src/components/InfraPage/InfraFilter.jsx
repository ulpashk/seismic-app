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
    "Все районы",
    "Алатауский",
    "Алмалинский",
    "Ауэзовский",
    "Бостандыкский",
    "Жетысуский",
    "Медеуский",
    "Наурызбайский",
    "Турксибский",
  ];

  useEffect(() => {
    if (!selectedDistrict || selectedDistrict.length === 0) {
      setSelectedDistrict(["Все районы"]);
    }
  }, [selectedDistrict, setSelectedDistrict]);

  const handleRiskLevelChange = (level) => {
    setEnginNodes((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  const handleSocialChange = (category) => {
    setSocialCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDistrictChange = (city) => {
    if (city === "Все районы") {
      setSelectedDistrict(["Все районы"]);
    } else {
      setSelectedDistrict((prev) => {
        let updated = prev.includes(city)
          ? prev.filter((c) => c !== city)
          : [...prev.filter((c) => c !== "Все районы"), city];

        return updated.length === 0 ? ["Все районы"] : updated;
      });
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // small text + scrollable div style
  const sectionStyle = "space-y-1 text-xs max-h-44 overflow-y-auto";

  const labelWithArrow = (children) => (
    <span className="flex items-center space-x-1">
      <span className="text-gray-400">|</span> {/* vertical symbol */}
      <span>{children}</span>
    </span>
  );

  const formatNumber = (num) => num?.toLocaleString("ru-RU");

  return (
    <>
      <div className="flex flex-col max-h-[50vh] bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden">
        {/* Sticky Header + District Selector */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 font-semibold text-base border-b-0">
            <span>Фильтры</span>

            {/* 🔹 Иконка для сворачивания фильтров */}
            <button
              onClick={() => setFiltersHidden(!filtersHidden)}
              className="text-gray-600 hover:text-gray-900 transition-transform"
              title={filtersHidden ? "Показать фильтры" : "Скрыть фильтры"}
            >
              <svg
                className={`w-4 h-4 transform transition-transform duration-300 ${
                  filtersHidden ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Районы — всегда видимая часть */}
          <div className="px-4 pb-3">
            <div className="relative">
              <div
                onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                className="flex items-center justify-between px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
              >
                <span className="flex-1 truncate">
                  {selectedDistrict.length > 0
                    ? selectedDistrict.join(", ")
                    : "Выберите район"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    districtDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {districtDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-30 max-h-44 overflow-y-auto">
                  <div className="p-2 space-y-1 text-xs">
                    {allDistricts.map((district) => (
                      <label
                        key={district}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDistrict.includes(district)}
                          onChange={() => handleDistrictChange(district)}
                          className="form-checkbox scale-90"
                        />
                        {labelWithArrow(district)}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 Скрываемая часть (с анимацией) */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            filtersHidden
              ? "max-h-0 opacity-0 overflow-hidden"
              : "max-h-[600px] opacity-100 overflow-y-auto"
          }`}
        >
          <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Risk Class Filter - Фильтр по классам риска */}
            {riskClassFilter && setRiskClassFilter && (
              <div className="py-3 border-t">
                <h3 className="font-medium text-gray-900 text-sm mb-2">
                  Класс риска зданий:
                </h3>
                <div className={sectionStyle}>
                  <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={riskClassFilter.showHighRisk}
                      onChange={() =>
                        setRiskClassFilter((prev) => ({
                          ...prev,
                          showHighRisk: !prev.showHighRisk,
                        }))
                      }
                      className="form-checkbox scale-90"
                    />
                    {labelWithArrow("Высокий риск (E, D)")}
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={riskClassFilter.showLowRisk}
                      onChange={() =>
                        setRiskClassFilter((prev) => ({
                          ...prev,
                          showLowRisk: !prev.showLowRisk,
                        }))
                      }
                      className="form-checkbox scale-90"
                    />
                    {labelWithArrow("Низкий риск (A, B, C)")}
                  </label>
                </div>
              </div>
            )}

            {/* Engineering Nodes */}
            <div className="py-3 border-b">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("risk")}
              >
                <h3 className="font-medium text-gray-900 cursor-pointer text-sm">
                  Инженерные узлы:
                </h3>
                <span className="text-gray-500">
                  {openSections.risk ? "▾" : "▸"}
                </span>
              </div>
              {openSections.risk && (
                <div className={sectionStyle}>
                  {[
                    "Канализация",
                    "ИКТ инфраструктура города",
                    "Электроснабжение",
                    "Теплоснабжение",
                    "Газоснабжение",
                  ].map((node) => (
                    <label
                      key={node}
                      className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={enginNodes[node]}
                        onChange={() => handleRiskLevelChange(node)}
                        className="form-checkbox scale-90"
                      />
                      {labelWithArrow(node)}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Social Categories */}
            <div className="py-3 border-b">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("social")}
              >
                <h3 className="font-medium text-gray-900 cursor-pointer text-sm">
                  Социальные объекты:
                </h3>
                <span className="text-gray-500">
                  {openSections.social ? "▾" : "▸"}
                </span>
              </div>
              {openSections.social && (
                <div className={sectionStyle}>
                  {["school", "ddo", "health", "pppn"].map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={socialCategories[cat]}
                        onChange={() => handleSocialChange(cat)}
                        className="form-checkbox scale-90"
                      />
                      {labelWithArrow(
                        cat === "school"
                          ? "Школы"
                          : cat === "ddo"
                          ? "Детские сады"
                          : cat === "health"
                          ? "Больницы"
                          : "ПППН"
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Building Categories */}
            <div className="py-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("building")}
              >
                <h3 className="font-medium text-gray-900 cursor-pointer text-sm">
                  Категория зданий:
                </h3>
                <span className="text-gray-500">
                  {openSections.building ? "▾" : "▸"}
                </span>
              </div>
              {openSections.building && (
                <div className={sectionStyle}>
                  {Object.entries(buildingCategories).map(([key, _]) => (
                    <label
                      key={key}
                      className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={buildingCategories[key]}
                        onChange={() =>
                          setBuildingCategories((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        className="form-checkbox scale-90"
                      />
                      {labelWithArrow(
                        key === "highrise"
                          ? "Здания выше 9 этажей между пр. Абая и пр. Аль-Фараби"
                          : key === "seismicSafety"
                          ? "Здания прошедшие паспортизацию"
                          : key === "emergency"
                          ? "Аварийные здания"
                          : "Несейсмостойкие здания"
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Статическая нижняя часть */}
      <div className="fixed bottom-8 left-4 lg:w-80 border-t bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden mt-5 p-4">
        {/* Population */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Население:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-red-600">Высокий</span>
              <span>57 020 - 2.49%</span>
            </div>
            <div className="flex justify-between">
              <span>Средний</span>
              <span>454 666 - 19.83%</span>
            </div>
            <div className="flex justify-between">
              <span>Низкий</span>
              <span>1 780 159 - 77.68%</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              number: 1088,
              label: "Несейсмостойких зданий",
              color: "text-red-600",
            },
            {
              number: 21539,
              label: "Объекты паспортизации",
              color: "text-black-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center rounded-lg border bg-white shadow p-2"
            >
              <div className={`text-m font-bold ${stat.color}`}>
                {formatNumber(stat.number)}
              </div>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
