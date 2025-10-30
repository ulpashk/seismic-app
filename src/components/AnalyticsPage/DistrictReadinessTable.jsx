export default function DistrictReadinessTable({
  districtAverages,
  districtRisk = {},
}) {
  const getReadinessColor = (readiness) => {
    const value = parseFloat(readiness);
    if (value >= 0.7) return "text-status-high"; // High readiness - muted blue
    if (value >= 0.4) return "text-status-medium"; // Medium readiness - muted gold
    return "text-status-low"; // Low readiness - muted red
  };

  const getRiskColor = (risk) => {
    if (risk === "—") return "text-gov-text-secondary";
    const value = parseFloat(risk);
    if (value >= 0.7) return "text-status-low"; // High risk - muted red
    if (value >= 0.4) return "text-status-medium"; // Medium risk - muted gold
    return "text-status-high"; // Low risk - muted blue
  };

  const rows = Object.entries(districtAverages).map(([district, avg]) => ({
    district,
    readiness: avg.toFixed(3),
    risk: districtRisk[district]?.toFixed(3) ?? "—",
  }));

  return (
    <div className="rounded-xl border border-gray-100 bg-gov-card shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gov-text-primary">
          Уровень готовности по районам
        </h2>
      </div>
      <div className="p-6 overflow-x-auto overflow-y-auto max-h-96">
        {rows.length > 0 ? (
          <table className="min-w-full border border-gray-100 text-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                  Район
                </th>
                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                  Средний уровень готовности
                </th>
                <th className="px-4 py-3 text-left border-b border-gray-100 font-semibold text-gov-text-primary">
                  Средний уровень риска
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-50 font-medium text-gov-text-primary">
                    {row.district}
                  </td>
                  <td
                    className={`px-4 py-3 border-b border-gray-50 font-semibold ${getReadinessColor(
                      row.readiness
                    )}`}
                  >
                    {row.readiness}
                  </td>
                  <td
                    className={`px-4 py-3 border-b border-gray-50 font-semibold ${getRiskColor(
                      row.risk
                    )}`}
                  >
                    {row.risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gov-text-secondary">
            Нет данных для отображения
          </p>
        )}
      </div>
    </div>
  );
}
