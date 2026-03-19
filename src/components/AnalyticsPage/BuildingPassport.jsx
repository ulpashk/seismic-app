export default function BuildingPassport({
  totalBuildings,
  totalBuildingsRisk,
}) {
  const formatNumber = (num) => num?.toLocaleString("ru-RU");

  const getRatio = () => {
    if (!totalBuildingsRisk || totalBuildingsRisk === 0) return "0%";
    const ratio = (totalBuildings / totalBuildingsRisk) * 100;
    return `${ratio.toFixed(2)}%`;
  };

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
      ? "—"
      : formatNumber(totalBuildingsRisk);

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden w-full">
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
          
          <div className="relative w-36 h-36 md:w-48 md:h-48 flex-shrink-0">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90 transform w-full h-full"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#2B6CB0"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {displayValue}
              </span>
              <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                здания в г. Алматы
              </span>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col justify-center">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="flex px-3 py-1.5 items-center justify-center rounded-full bg-blue-600 text-xs md:text-sm font-bold text-white shadow-sm">
                {getRatio()}
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 leading-tight">
                прошли паспортизацию
              </span>
            </div>

            <div className="mt-6">
              <div className="h-2 w-full rounded-full bg-gray-100 shadow-inner">
                <div
                  className="h-2 rounded-full bg-amber-500 shadow-sm transition-all duration-1000"
                  style={{ width: '25%' }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>2018</span>
                <span className="text-blue-600">Текущий этап</span>
                <span>2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}