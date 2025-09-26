import { useState } from "react";
import Indicators from "../components/Indicators";
import PriorityTable from "../components/PriorityTable";
import Histogram from "../components/Histogram";
import UnstableObjectsHistogram from "../components/UnstableObjectsHistogram";
import PopulationTable from "../components/PopulationTable";
import MapLibre from "../components/Maplibre";

export default function MainDashboard({selectedDistrict, setSelectedDistrict}) {

    return (
        <div className="w-[100vw] h-[100vh] overflow-auto box-sizing-border-box">
            <div className="p-6">
                <div className="p-2 mt-0 w-full h-[100px]">
                    <Indicators/>
                </div>
                <div className="flex gap-5 mt-3">
                    <div className="flex flex-col w-full gap-1">
                        <div className="flex gap-4">
                            <div className="mb-3 w-2/3">
                                <MapLibre selectedDistrict={selectedDistrict}/>
                            </div>
                            <div className="w-1/3">
                                <Histogram selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict}/>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/3 h-[400px]">
                                {/* <LineGraph/> */}
                                {/* <PopulationPieChart/> */}
                                <PopulationTable/>
                            </div>
                            <div className="w-1/3">
                                <UnstableObjectsHistogram selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict}/>
                            </div>
                            <div className="w-1/3 h-[400px]">
                                <PriorityTable/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}