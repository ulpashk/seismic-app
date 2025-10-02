export default function Indicators(){
    return (
        <div className="grid grid-cols-2 gap-4">
            {[
                { number: "21 539", label: "Объекты паспортизации" },
                { number: "21 539", label: "Объекты паспортизации" },
                { number: "21 539", label: "Объекты паспортизации" },
                { number: "21 539", label: "Объекты паспортизации" },
            ].map((stat, i) => (
                <div key={i} className="text-center rounded-lg border bg-white p-2 shadow-sm">
                <div className="text-lg font-bold text-blue-600">{stat.number}</div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
            ))}
        </div>
    )
}