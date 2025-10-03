import { useState } from "react";
import MapGeoRisk from "../components/MainPage/MapGeoRisk";
import GeoRiskFilter from "../components/MainPage/GeoRiskFilter";

export default function MainPage() {
    const [riskLevels, setRiskLevels] = useState({
        high: true,
        medium: true,
        low: true,
    })
    const [infrastructureCategories, setInfrastructureCategories] = useState({
        landslides: true,
        tectonicFaults: true,
        mudflowPaths: true,
    })
    const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
    const [mode, setMode] = useState("grid");

    return (
        <div className="grid grid-cols-6 p-4">
            <div className="p-4">
                <GeoRiskFilter 
                    setRiskLevels={setRiskLevels} 
                    riskLevels={riskLevels} 
                    setInfrastructureCategories={setInfrastructureCategories} 
                    infrastructureCategories={infrastructureCategories}
                    setSelectedDistrict={setSelectedDistrict}
                    selectedDistrict={selectedDistrict} 
                />
            </div>
            <div className="col-span-5">
                <div className="p-4 pb-0">
                    <MapGeoRisk 
                        mode={mode}
                        setMode={setMode}
                        selectedDistrict={selectedDistrict} 
                        riskLevels={riskLevels} 
                        infrastructureCategories={infrastructureCategories}
                    />
                </div>
            </div>
        </div>
    )
}