export default function BuildingPassport({
  totalBuildings,
  totalBuildingsRisk,
}) {
  const formatNumber = (num) => num?.toLocaleString("ru-RU");

  const getRatio = () => {
    if (!totalBuildingsRisk || totalBuildingsRisk === 0) return "Нет данных";
    const ratio = (totalBuildings / totalBuildingsRisk) * 100;
    if (!isFinite(ratio) || isNaN(ratio)) return "Нет данных";
    return `${ratio.toFixed(2)}%`;
  };

  // Circle settings
  const size = 200;
  const strokeWidth = 16;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress =
    totalBuildingsRisk && totalBuildingsRisk !== 0
      ? (totalBuildings / totalBuildingsRisk) * circumference
      : 0;

  const displayValue =
    !totalBuildingsRisk || totalBuildingsRisk === 0
      ? "Нет данных"
      : formatNumber(totalBuildingsRisk);

  return (
    <div className="rounded-xl border border-gray-100 bg-gov-card shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-6">
          {/* Circular chart */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90 transform">
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
                className="transition-all duration-500"
                style={{ stroke: "#2B6CB0" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gov-text-primary">
                {displayValue}
              </span>
              <span className="text-sm text-gov-text-secondary">здания в</span>
              <span className="text-sm text-gov-text-secondary">г. Алматы</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="mt-4 flex items-center gap-3">
              <div className="flex p-3 items-center justify-center rounded-full bg-gov-blue text-base font-bold text-white shadow-sm">
                {getRatio()}
              </div>
              <span className="text-sm font-medium text-gov-text-primary">
                прошли паспортизацию
              </span>
            </div>
            <div className="mt-6 h-2.5 w-full rounded-full bg-gray-200 shadow-inner">
              <div
                className="h-2.5 w-1/4 rounded-full shadow-sm"
                style={{ background: "#C49B0B" }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs font-medium text-gov-text-secondary">
              <span>2018</span>
              <span className="text-gov-text-primary">5 лет</span>
              <span>2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
