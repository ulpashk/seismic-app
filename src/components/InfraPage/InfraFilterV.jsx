"use client"

import { useEffect, useState } from "react"

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
  })

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
  ]

  useEffect(() => {
    if (!selectedDistrict || selectedDistrict.length === 0) {
      setSelectedDistrict(["Все районы"])
    }
  }, [selectedDistrict, setSelectedDistrict])

  const handleRiskLevelChange = (level) => {
    setEnginNodes((prev) => ({
      ...prev,
      [level]: !prev[level],
    }))
  }

  const handleSocialChange = (category) => {
    setSocialCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleDistrictChange = (city) => {
    if (city === "Все районы") {
      setSelectedDistrict(["Все районы"])
    } else {
      setSelectedDistrict((prev) => {
        const updated = prev.includes(city)
          ? prev.filter((c) => c !== city)
          : [...prev.filter((c) => c !== "Все районы"), city]

        return updated.length === 0 ? ["Все районы"] : updated
      })
    }
  }

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="bg-background border border-border rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Фильтры</h3>
      </div>

      {/* District Selector */}
      <div className="px-6 py-5 border-b border-border">
        <label className="block text-sm font-medium text-foreground mb-3">Район</label>
        <div className="relative">
          <button
            onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground hover:bg-accent hover:border-accent-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="flex-1 truncate text-left">
              {selectedDistrict.length > 0 ? selectedDistrict.join(", ") : "Выберите район"}
            </span>
            <svg
              className={`w-4 h-4 ml-2 transition-transform duration-200 ${districtDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {districtDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              <div className="p-2">
                {allDistricts.map((district) => (
                  <label
                    key={district}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors duration-150 group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(district)}
                        onChange={() => handleDistrictChange(district)}
                        className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all"
                      />
                    </div>
                    <span className="text-sm text-foreground group-hover:text-accent-foreground">{district}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engineering Nodes Section */}
      <div className="px-6 py-5 border-b border-border">
        <button onClick={() => toggleSection("risk")} className="w-full flex justify-between group">
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            Ключевые инженерные узлы
          </h4>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              openSections.risk ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.risk && (
          <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {["Канализация", "ИКТ инфраструктура города", "Электроснабжение", "Теплоснабжение", "Газоснабжение"].map(
              (node) => (
                <label
                  key={node}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors duration-150 group"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={enginNodes[node]}
                      onChange={() => handleRiskLevelChange(node)}
                      className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all"
                    />
                  </div>
                  <span className="text-sm text-foreground group-hover:text-accent-foreground">{node}</span>
                </label>
              ),
            )}
          </div>
        )}
      </div>

      {/* Social Categories Section */}
      <div className="px-6 py-5 border-b border-border">
        <button onClick={() => toggleSection("social")} className="w-full flex items-center justify-between mb-4 group">
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            Ключевые социальные объекты
          </h4>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              openSections.social ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.social && (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {["schools", "ddo", "health", "pppn"].map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors duration-150 group"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={socialCategories[cat]}
                    onChange={() => handleSocialChange(cat)}
                    className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all"
                  />
                </div>
                <span className="text-sm text-foreground group-hover:text-accent-foreground">
                  {cat === "schools"
                    ? "Школы"
                    : cat === "ddo"
                      ? "Детские сады"
                      : cat === "health"
                        ? "Больницы"
                        : "ПППН"}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Building Categories Section */}
      <div className="px-6 py-5">
        <button
          onClick={() => toggleSection("building")}
          className="w-full flex items-center justify-between mb-4 group"
        >
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            Категория зданий
          </h4>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              openSections.building ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSections.building && (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(buildingCategories).map(([key, _]) => (
              <label
                key={key}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent rounded-md transition-colors duration-150 group"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={buildingCategories[key]}
                    onChange={() =>
                      setBuildingCategories((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all"
                  />
                </div>
                <span className="text-sm text-foreground group-hover:text-accent-foreground leading-relaxed">
                  {key === "highrise"
                    ? "Здания выше 9 этажей между пр. Абая и пр. Аль-Фараби"
                    : key === "seismicSafety"
                      ? "Здания прошедшие паспортизацию"
                      : key === "emergency"
                        ? "Аварийные здания"
                        : "Сейсмостойкие здания"}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
