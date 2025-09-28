import React, { useEffect, useState } from "react";
import InfraMap from "../components/InfraPage/InfraMapV";

export default function InfraPage({selectedDistrict}) {
    return (
        <div>
            <InfraMap  selectedDistrict={selectedDistrict}/>
        </div>
    )
}