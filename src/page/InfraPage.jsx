import React, { useEffect, useState } from "react";
import InfraMap from "../components/InfraPage/InfraMapInit";
import InfraFilter from "../components/InfraPage/InfraFilter";

export default function InfraPage() {
    
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
    return (
        <div className="grid grid-cols-6 p-4">
            <div className="p-4">
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
            <div className="col-span-5">
                <div className="p-4 pb-0">
                    <InfraMap  
                        selectedDistrict={selectedDistrict}
                        enginNodes={enginNodes}
                        socialCategories={socialCategories}
                        buildingCategories={buildingCategories}
                    />
                </div>
            </div>
        </div>
    )
}