import React, { useEffect, useState } from "react";
import InfraMap from "../components/InfraPage/InfraMapV";

export default function InfraPage({selectedDistrict}) {
    return(
        <div className="p-4">
            <InfraMap  selectedDistrict={selectedDistrict}/>
        </div>
    )
}