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
}) {
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

  return (
    <div className="z-10 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg">
      <div className="px-4 pt-2 font-semibold">
        <h3>Фильтры</h3>
      </div>

      {/* City Selector */}
      <div className="p-4 border-b">
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-20 max-h-44 overflow-y-auto">
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

      {/* Risk Levels */}
      <div className="p-4 border-b">
        <h3
          onClick={() => toggleSection("risk")}
          className="font-medium text-gray-900 mb-2 cursor-pointer text-sm"
        >
          Ключевые инженерные узлы:
        </h3>
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
      <div className="p-4 border-b">
        <h3
          onClick={() => toggleSection("social")}
          className="font-medium text-gray-900 mb-2 cursor-pointer text-sm"
        >
          Ключевые социальные объекты:
        </h3>
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
      <div className="p-4 border-b">
        <h3
          onClick={() => toggleSection("building")}
          className="font-medium text-gray-900 mb-2 cursor-pointer text-sm"
        >
          Категория зданий:
        </h3>
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
                    : "Сейсмостойкие здания"
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
