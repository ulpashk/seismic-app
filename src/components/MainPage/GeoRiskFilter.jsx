import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react"; 

export default function GeoRiskFilter({
  mode, 
  setMode,
  setRiskLevels,
  riskLevels,
  setInfrastructureCategories,
  infrastructureCategories,
  setSelectedDistrict,
  selectedDistrict,
  setDensityLevels,
  densityLevels
}) {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [openSections, setOpenSections] = useState({
    risk: true,
    density: true,
    geostructure: true,
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
  
    const toggleSection = (section) => {
      setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };
  
  const handleRiskLevelChange = (level) => {
    setRiskLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  // const handleDensityLevelChange = (level) => {
  //   setDensityLevels((prev) => ({
  //     ...prev,
  //     [level]: !prev[level],
  //   }));
  // };

  const handleInfrastructureChange = (category) => { 
    setInfrastructureCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleCityChange = (city) => {
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

  // return (
  //   <>
  //   <div className="flex flex-col max-h-[90vh] bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden">
  //   {/* <div className="z-10 bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg"> */}
  //     <div className="px-4 pt-2 font-semibold">
  //       <h3>
  //         Фильтры
  //       </h3>
  //     </div>
  //     {/* City Selector */}
  //     <div className="p-4 pt-2 border-b">
  //       <div className="relative">
  //         <div
  //           onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
  //           className="flex items-center justify-between px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition"
  //         >
  //           <span className="truncate">
  //             {selectedDistrict.length > 0
  //               ? selectedDistrict.join(", ")
  //               : "Выберите район"}
  //           </span>
  //           <svg
  //             className={`w-4 h-4 transition-transform ${
  //               cityDropdownOpen ? "rotate-180" : ""
  //             }`}
  //             fill="none"
  //             stroke="currentColor"
  //             viewBox="0 0 24 24"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M19 9l-7 7-7-7"
  //             />
  //           </svg>
  //         </div>

  //         {cityDropdownOpen && (
  //           <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
  //             <div className="p-2 space-y-1">
  //               {allDistricts.map((city) => (
  //                 <label
  //                   key={city}
  //                   className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition"
  //                 >
  //                   <input
  //                     type="checkbox"
  //                     checked={selectedDistrict.includes(city)}
  //                     onChange={() => handleCityChange(city)}
  //                     className="form-checkbox"
  //                   />
  //                   <span className="text-sm">{city}</span>
  //                 </label>
  //               ))}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>

  //     {/* Risk Levels */}
  //     <div className="p-4 border-b">
  //       <div
  //         className="flex justify-between items-center cursor-pointer"
  //         onClick={() => toggleSection("risk")}
  //       >
  //         <h3 className="font-semibold text-gray-900 cursor-pointer text-sm">Уровень риска:</h3>
  //         <span className="text-gray-500">
  //           {openSections.risk ? "▾" : "▸"}
  //         </span>
  //       </div>
  //       {openSections.risk && (
  //       <div className="space-y-2 text-sm">
  //         <label className="flex items-center space-x-2 cursor-pointer">
  //           <input
  //             type="checkbox"
  //             checked={riskLevels.high}
  //             onChange={() => handleRiskLevelChange("high")}
  //             className="form-checkbox"
  //           />
  //           <span>Высокий</span>
  //         </label>
  //         <label className="flex items-center space-x-2 cursor-pointer">
  //           <input
  //             type="checkbox"
  //             checked={riskLevels.medium}
  //             onChange={() => handleRiskLevelChange("medium")}
  //             className="form-checkbox"
  //           />
  //           <span>Средний</span>
  //         </label>
  //         <label className="flex items-center space-x-2 cursor-pointer">
  //           <input
  //             type="checkbox"
  //             checked={riskLevels.low}
  //             onChange={() => handleRiskLevelChange("low")}
  //             className="form-checkbox"
  //           />
  //           <span>Низкий</span>
  //         </label>
  //       </div>
  //       )}
  //     </div>

  //     {/* Infrastructure */}
  //     <div className="p-4 border-b">
  //       <div
  //         className="flex justify-between items-center cursor-pointer"
  //         onClick={() => toggleSection("geostructure")}
  //       >
  //         <h3 className="font-semibold text-gray-900 cursor-pointer text-sm">Категория геоструктур:</h3>
  //         <span className="text-gray-500">
  //           {openSections.geostructure ? "▾" : "▸"}
  //         </span>
  //       </div>
  //       {openSections.geostructure && (
  //       <div className="space-y-2 text-sm">
  //         <label className="flex items-center space-x-2 cursor-pointer">
  //           <input
  //             type="checkbox"
  //             checked={infrastructureCategories.landslides}
  //             onChange={() => handleInfrastructureChange("landslides")}
  //             className="form-checkbox"
  //           />
  //           <span>Оползни</span>
  //         </label>
  //         <label className="flex items-center space-x-2 cursor-pointer">
  //           <input
  //             type="checkbox"
  //             checked={infrastructureCategories.tectonicFaults}
  //             onChange={() => handleInfrastructureChange("tectonicFaults")}
  //             className="form-checkbox"
  //           />
  //           <span>Тектонические разломы</span>
  //         </label>
  //         <label className="flex items-center space-x-2 cursor-pointer">
  //           <input
  //             type="checkbox"
  //             checked={infrastructureCategories.mudflowPaths}
  //             onChange={() => handleInfrastructureChange("mudflowPaths")}
  //             className="form-checkbox"
  //           />
  //           <span>Селевые пути</span>
  //         </label>
  //       </div>
  //       )}
  //     </div>
  //   {/* </div> */}
    
  //   </div>
  //   <div className="fixed bottom-8 left-4 lg:w-80 z-10 bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden mt-5">
  //     {/* Population */}
  //     <div className="p-4">
  //       <h3 className="font-semibold text-gray-900 mb-3">Население:</h3>
  //       <div className="space-y-1 text-sm">
  //         <div className="flex justify-between">
  //           <span className="font-medium text-red-600">Высокий</span>
  //           <span>57020 - 2.49%</span>
  //         </div>
  //         <div className="flex justify-between">
  //           <span>Средний</span>
  //           <span>454666 - 77.68%</span>
  //         </div>
  //         <div className="flex justify-between">
  //           <span>Низкий</span>
  //           <span>1780159 - 19.83%</span>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  //   </>
  // );
  return (
    <>
      <div className="flex flex-col max-h-[90vh] w-80 bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden">
        {/* 🔹 Заголовок + кнопка-иконка */}
        <div className="flex justify-between items-center px-4 pt-2 pb-2 border-b font-semibold text-gray-900 sticky top-0 bg-white/90 backdrop-blur-sm z-10 border-b-0">
          <h3>Фильтры</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 transition"
            title={isCollapsed ? "Показать фильтры" : "Скрыть фильтры"}
          >
            {isCollapsed ? (
              <ChevronDown size={18} strokeWidth={2} />
            ) : (
              <ChevronUp size={18} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* 🔹 Селектор районов (всегда видим) */}
        <div className="p-4 border-b">
          <div className="relative">
            <div
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition"
            >
              <span className="truncate">
                {selectedDistrict.length > 0
                  ? selectedDistrict.join(", ")
                  : "Выберите район"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  cityDropdownOpen ? "rotate-180" : ""
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

            {cityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {allDistricts.map((city) => (
                    <label
                      key={city}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(city)}
                        onChange={() => handleCityChange(city)}
                        className="form-checkbox"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 Скрываемая часть (с анимацией) */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            isCollapsed ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[600px] opacity-100"
          }`}
        >
          {/* --- Уровень риска --- */}
          <div className="p-4 border-b">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("risk")}
            >
              <h3 className="font-semibold text-gray-900 cursor-pointer text-sm">
                Уровень риска:
              </h3>
              <span className="text-gray-500">
                {openSections.risk ? "▾" : "▸"}
              </span>
            </div>
            {openSections.risk && (
              <div className="space-y-2 text-sm mt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskLevels.high}
                    onChange={() => handleRiskLevelChange("high")}
                    className="form-checkbox"
                  />
                  <span>Высокий</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskLevels.medium}
                    onChange={() => handleRiskLevelChange("medium")}
                    className="form-checkbox"
                  />
                  <span>Средний</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskLevels.low}
                    onChange={() => handleRiskLevelChange("low")}
                    className="form-checkbox"
                  />
                  <span>Низкий</span>
                </label>
              </div>
            )}
          </div>

          {/* --- Геоструктуры --- */}
          <div className="p-4 border-b">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("geostructure")}
            >
              <h3 className="font-semibold text-gray-900 cursor-pointer text-sm">
                Категория геоструктур:
              </h3>
              <span className="text-gray-500">
                {openSections.geostructure ? "▾" : "▸"}
              </span>
            </div>
            {openSections.geostructure && (
              <div className="space-y-2 text-sm mt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infrastructureCategories.landslides}
                    onChange={() => handleInfrastructureChange("landslides")}
                    className="form-checkbox"
                  />
                  <span>Оползни</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infrastructureCategories.tectonicFaults}
                    onChange={() =>
                      handleInfrastructureChange("tectonicFaults")
                    }
                    className="form-checkbox"
                  />
                  <span>Тектонические разломы</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infrastructureCategories.mudflowPaths}
                    onChange={() => handleInfrastructureChange("mudflowPaths")}
                    className="form-checkbox"
                  />
                  <span>Селевые пути</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Карточка "Население" */}
      <div className="fixed bottom-8 left-4 lg:w-80 z-10 bg-white/95 backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden mt-5">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Население:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-red-600">Высокий</span>
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
    </>
  );
}
