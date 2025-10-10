export default function Indicators({
    totalBuildings,
    a1Count, 
    emergencyBuildings,
    seismicEvalCount
}){
    const passportBuildings = totalBuildings;
    const countA1buildings = a1Count;
    const countEmergencyBuildings = emergencyBuildings;
    const countSeismicEvalCount = seismicEvalCount;
    
    const formatNumber = (num) => num?.toLocaleString("ru-RU");

    return (
        <div className="grid grid-cols-2 gap-4">
            {[
                { number: passportBuildings, label: "Объекты паспортизации" },
                { number: countSeismicEvalCount, label: "Несейсмостойких зданий" },
                { number: 621, label: "Высотных зданий в опасных участках" },
                { number: countEmergencyBuildings, label: "Аварийных зданий" },
            ].map((stat, i) => (
                <div key={i} className="text-center rounded-lg border bg-white p-2 shadow-sm">
                <div className="text-lg font-bold text-blue-600">{formatNumber(stat.number)}</div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
            ))}
        </div>
    )
}