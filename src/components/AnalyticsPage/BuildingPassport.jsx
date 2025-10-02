import { Info } from "lucide-react";

export default function BuildingPassport({
    totalBuildings,
    totalBuildingsRisk,
}) {

    const getRatio = () => {
        const ratio = totalBuildings/totalBuildingsRisk
        return (ratio*100).toFixed(2)
    } 

    return (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-base font-medium">Здания</h2>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Circular chart */}
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90 transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${({totalBuildings} / {totalBuildingsRisk}) * 100}`}
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{totalBuildingsRisk}</span>
                  <span className="text-xs text-gray-500">здания в</span>
                  <span className="text-xs text-gray-500">г. Алматы</span>
                </div>
              </div>
              {/* Info */}
              <div className="flex-1">
                <div className="mb-2 text-sm font-medium">{totalBuildingsRisk}</div>
                <div className="text-xs text-gray-500">здания в г. Алматы</div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex p-2 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                    {getRatio()}%
                  </div>
                  <span className="text-sm">прошли паспортизацию</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 w-1/4 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>5 лет</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}