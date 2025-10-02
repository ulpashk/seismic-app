import {useState } from "react";
export default function GeoRiskFilter({setRiskLevels, riskLevels, setInfrastructureCategories, infrastructureCategories, setSelectedDistrict, selectedDistrict}){
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
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
    
    const handleRiskLevelChange = (level) => {
        setRiskLevels((prev) => ({
            ...prev,
            [level]: !prev[level],
        }))
    }

    const handleInfrastructureChange = (category) => {
        setInfrastructureCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }))
    }

    const handleCityChange = (city) => {
        setSelectedDistrict((prev) => {
            if (prev.includes(city)) {
                return prev.filter((c) => c !== city)
            } else {
                return [...prev, city]
            }
        })
    }
    return (
        <div className="z-10 w-64 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg">
        {/* City Selector */}
        <div className="p-4 border-b">
          <div className="relative">
            <div
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
            >
              <span className="flex-1">
                {selectedDistrict.length > 0 ? selectedDistrict.join(", ") : "Выберите район"}
              </span>
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-4 h-4 transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {cityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-20">
                <div className="p-2 space-y-1">
                  {allDistricts.map((city) => (
                    <label
                      key={city}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(city)}
                        onChange={() => handleCityChange(city)}
                        className="rounded"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Уровень риска:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={riskLevels.high}
                onChange={() => handleRiskLevelChange("high")}
                className="rounded"
              />
              <span className="text-sm">Высокий</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={riskLevels.medium}
                onChange={() => handleRiskLevelChange("medium")}
                className="rounded"
              />
              <span className="text-sm">Средний</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={riskLevels.low}
                onChange={() => handleRiskLevelChange("low")}
                className="rounded"
              />
              <span className="text-sm">Низкий</span>
            </label>
          </div>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Категория геоструктур:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infrastructureCategories.landslides}
                onChange={() => handleInfrastructureChange("landslides")}
                className="rounded"
              />
              <span className="text-sm">Оползни</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infrastructureCategories.tectonicFaults}
                onChange={() => handleInfrastructureChange("tectonicFaults")}
                className="rounded"
              />
              <span className="text-sm">Тектонические разломы</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infrastructureCategories.mudflowPaths}
                onChange={() => handleInfrastructureChange("mudflowPaths")}
                className="rounded"
              />
              <span className="text-sm">Селевые пути</span>
            </label>
          </div>
        </div>

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