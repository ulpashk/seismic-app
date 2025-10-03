export default function Indicators({
    totalBuildings,
    a1Count,
}){
    const passportBuildings = totalBuildings;
    const countA1buildings = a1Count;
    return (
        <div className="grid grid-cols-2 gap-4">
            {[
                { number: passportBuildings, label: "Объекты паспортизации" },
                { number: "2153", label: "Несейсмостойких зданий" },
                { number: countA1buildings, label: "Высотных зданий в опасных участках" },
                { number: "1235", label: "Аварийных зданий" },
            ].map((stat, i) => (
                <div key={i} className="text-center rounded-lg border bg-white p-2 shadow-sm">
                <div className="text-lg font-bold text-blue-600">{stat.number}</div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
            ))}
        </div>
    )
}