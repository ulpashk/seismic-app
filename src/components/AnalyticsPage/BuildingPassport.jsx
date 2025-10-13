export default function BuildingPassport({
  totalBuildings,
  totalBuildingsRisk,
}) {
  const getRatio = () => {
    const ratio = totalBuildings / totalBuildingsRisk;
    return (ratio * 100).toFixed(2);
  };

  const formatNumber = (num) => num?.toLocaleString("ru-RU");

  // Circle settings
  const size = 200; // SVG size
  const strokeWidth = 16;
  const radius = (size / 2) - strokeWidth; // radius so stroke stays inside viewBox
  const circumference = 2 * Math.PI * radius;
  const progress = (totalBuildings / totalBuildingsRisk) * circumference;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-6">
          {/* Circular chart */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size} 
              height={size}
              className="-rotate-90 transform"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                className="text-blue-600 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">
                {formatNumber(totalBuildingsRisk)}
              </span>
              <span className="text-sm text-gray-500">здания в</span>
              <span className="text-sm text-gray-500">г. Алматы</span>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1">
            <div className="mt-4 flex items-center gap-3">
              <div className="flex p-3 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-base font-bold text-white shadow-md">
                {getRatio()}%
              </div>
              <span className="text-sm font-medium text-gray-700">прошли паспортизацию</span>
            </div>
            <div className="mt-6 h-2.5 w-full rounded-full bg-gray-200 shadow-inner">
              <div className="h-2.5 w-1/4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-sm" />
            </div>
            <div className="mt-3 flex justify-between text-xs font-medium text-gray-500">
              <span>2018</span>
              <span className="text-gray-600">5 лет</span>
              <span>2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
