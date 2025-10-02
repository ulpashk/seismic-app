import { useState } from "react"

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
    buildingCategories
}){

    
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
    setSelectedDistrict((prev) => {
      if (prev.includes(city)) {
        return prev.filter((c) => c !== city)
      } else {
        return [...prev, city]
      }
    })
  }

    return (
        <div className="z-10 w-64 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg overflow-auto-y">
        {/* City Selector */}
        <div className="p-4 border-b">
          <div className="relative">
            <div
              onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
            >
              <span className="flex-1">
                {selectedDistrict.length > 0 ? selectedDistrict.join(", ") : "Выберите район"}
              </span>
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-4 h-4 transition-transform ${districtDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {districtDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-20">
                <div className="p-2 space-y-1">
                  {allDistricts.map((district) => (
                    <label
                      key={district}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(district)}
                        onChange={() => handleDistrictChange(district)}
                        className="rounded"
                      />
                      <span className="text-sm">{district}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Levels */}
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Ключевые инженерные узлы:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enginNodes["Канализация"]}
                onChange={() => handleRiskLevelChange("Канализация")}
                className="rounded"
              />
              <span className="text-sm">Канализация</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enginNodes["ИКТ инфраструктура города"]}
                onChange={() => handleRiskLevelChange("ИКТ инфраструктура города")}
                className="rounded"
              />
              <span className="text-sm">ИКТ инфраструктура города</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enginNodes["Электроснабжение"]}
                onChange={() => handleRiskLevelChange("Электроснабжение")}
                className="rounded"
              />
              <span className="text-sm">Энергоснабжение</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enginNodes["Теплоснабжение"]}
                onChange={() => handleRiskLevelChange("Теплоснабжение")}
                className="rounded"
              />
              <span className="text-sm">Теплоснабжение</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enginNodes["Газоснабжение"]}
                onChange={() => handleRiskLevelChange("Газоснабжение")}
                className="rounded"
              />
              <span className="text-sm">Газоснабжение</span>
            </label>
          </div>
        </div>

        {/* Social Categories */}
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Ключевые социальные объекты:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={socialCategories.schools}
                onChange={() => handleSocialChange("schools")}
                className="rounded"
              />
              <span className="text-sm">Школы</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={socialCategories.ddo}
                onChange={() => handleSocialChange("ddo")}
                className="rounded"
              />
              <span className="text-sm">Детские сады</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={socialCategories.health}
                onChange={() => handleSocialChange("health")}
                className="rounded"
              />
              <span className="text-sm">Больницы</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={socialCategories.pppn}
                onChange={() => handleSocialChange("pppn")}
                className="rounded"
              />
              <span className="text-sm">ПППН</span>
            </label>
          </div>
        </div>

        {/* Building Categories */}
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Категория зданий:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={buildingCategories.highrise}
                onChange={() =>
                  setBuildingCategories((prev) => ({ ...prev, highrise: !prev.highrise }))
                }
                className="rounded"
              />
              <span className="text-sm">Здания выше 9 этажей между пр. Абая и пр. Аль-Фараби</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={buildingCategories.seismicSafety}
                onChange={() =>
                  setBuildingCategories((prev) => ({ ...prev, seismicSafety: !prev.seismicSafety }))
                }
                className="rounded"
              />
              <span className="text-sm">Здания прошедшие паспортизацию</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={buildingCategories.emergency}
                onChange={() =>
                  setBuildingCategories((prev) => ({ ...prev, emergency: !prev.emergency }))
                }
                className="rounded"
              />
              <span className="text-sm">Аварийные здания</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={buildingCategories.seismic}
                onChange={() =>
                  setBuildingCategories((prev) => ({ ...prev, seismic: !prev.seismic }))
                }
                className="rounded"
              />
              <span className="text-sm">Сейсмостойкие здания</span>
            </label>
          </div>
        </div>

        {/* Population Statistics */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Население:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-red-600 font-medium">Высокий</span>
              <span>57020 - 2.49%</span>
            </div>
            <div className="flex justify-between">
              <span>Средний</span>
              <span>454666 - 77.68%</span>
            </div>
            <div className="flex justify-between">
              <span>Низкий</span>
              <span>1780159 - 19.83%</span>
            </div>
          </div>
        </div>
      </div>
    )
}