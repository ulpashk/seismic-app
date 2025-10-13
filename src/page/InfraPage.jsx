import React, { useState } from "react";
import InfraMap from "../components/InfraPage/InfraMapInit";
import InfraFilter from "../components/InfraPage/InfraFilter";

export default function InfraPage({activeLayer, setActiveLayer}) {
    
  const [enginNodes, setEnginNodes] = useState({
    "Канализация": false,
    "Электроснабжение": false,
    "ИКТ инфраструктура города": false,
    "Теплоснабжение": false,
    "Газоснабжение": false,
  })

  const [socialCategories, setSocialCategories] = useState({
    school: false,
    ddo: false,
    health: false,
    pppn: false,
  })

  const [buildingCategories, setBuildingCategories] = useState({
    highrise: false,
    seismicSafety: false,
    emergency: false,
    seismic: false,
  })

  const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false)

  return (
        <div className="relative w-full h-screen">
          {/* Fullscreen Map */}
          <InfraMap
            selectedDistrict={selectedDistrict}
            enginNodes={enginNodes}
            socialCategories={socialCategories}
            buildingCategories={buildingCategories}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
          />

          <div className="absolute top-[80px] left-4 z-20 w-80">
            <InfraFilter
              setEnginNodes={setEnginNodes}
              setSocialCategories={setSocialCategories}
              setBuildingCategories={setBuildingCategories}
              setSelectedDistrict={setSelectedDistrict}
              setDistrictDropdownOpen={setDistrictDropdownOpen}
              districtDropdownOpen={districtDropdownOpen}
              selectedDistrict={selectedDistrict}
              enginNodes={enginNodes}
              socialCategories={socialCategories}
              buildingCategories={buildingCategories}
            />
          </div>
        </div>
    )
}