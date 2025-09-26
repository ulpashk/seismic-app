import GeoRiskMap from "../components/RiskPage/GeoRiskMap";

export default function RiskPage({selectedDistrict}) {
    return(
        <div className="p-4">
            <GeoRiskMap  selectedDistrict={selectedDistrict}/>
        </div>
    )
}