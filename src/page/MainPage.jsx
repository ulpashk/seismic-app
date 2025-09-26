import MapGeoRisk from "../components/MainPage/MapGeoRisk";

export default function MainPage({selectedDistrict, setSelectedDistrict}) {

    return (
        <div className="w-full">
            <MapGeoRisk selectedDistrict={selectedDistrict}/>
        </div>
    )
}