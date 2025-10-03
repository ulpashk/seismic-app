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
                {/* <div className="flex items-center gap-2 z-10 p-4 pb-0">
                    <button 
                        onClick={() => setMode("grid")}
                        className={`px-2 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-md
                            ${
                                mode === "grid"
                                // ? "bg-white text-blue-600 border border-blue-600"
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-300 text-black hover:bg-gray-400"
                            }`}
                    >
                        Гео-риски
                    </button>
                    <button
                        onClick={() => setMode("population")}
                        className={`px-2 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-md
                            ${
                            mode === "population"
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-300 text-black hover:bg-gray-400"
                            }`}
                    >
                        Плотность населения
                    </button>
                </div> */}
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