import { useState } from "react";
import MapGeoRisk from "../components/MainPage/MapGeoRiskG";
import GeoRiskFilter from "../components/MainPage/GeoRiskFilter";

export default function MainPage() {
    const [riskLevels, setRiskLevels] = useState({
        high: true,
        medium: true,
        low: true,
    })
    const [densityLevels, setDensityLevels] = useState({
        high: true,
        medium: true,
        low: true,
    })
    const [infrastructureCategories, setInfrastructureCategories] = useState({
        landslides: true,
        // greedy: true,
        tectonicFaults: true,
        mudflowPaths: true,
    })
    const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
    const [mode, setMode] = useState("grid");

    return (
        <div className="relative w-full h-screen">
            <MapGeoRisk 
                mode={mode}
                setMode={setMode}
                selectedDistrict={selectedDistrict} 
                riskLevels={riskLevels}
                infrastructureCategories={infrastructureCategories}
                densityLevels={densityLevels} 
            />
            <div className="absolute top-[80px] left-4 z-20 w-80">
                <GeoRiskFilter 
                    mode={mode}
                    setMode={setMode}
                    setRiskLevels={setRiskLevels} 
                    riskLevels={riskLevels} 
                    setInfrastructureCategories={setInfrastructureCategories} 
                    infrastructureCategories={infrastructureCategories}
                    setSelectedDistrict={setSelectedDistrict}
                    selectedDistrict={selectedDistrict} 
                    setDensityLevels={setDensityLevels}
                    densityLevels={densityLevels}
                />
            </div>
        </div>
    )
}