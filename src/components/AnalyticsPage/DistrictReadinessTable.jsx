import { Info } from "lucide-react"

export default function DistrictReadinessTable({ districtAverages, districtRisk = {} }) {
  const rows = Object.entries(districtAverages).map(([district, avg]) => ({
    district,
    readiness: avg.toFixed(3),
    risk: districtRisk[district]?.toFixed(3) ?? "—",
  }))

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50">
        <h2 className="text-base font-semibold text-gray-900">Уровень готовности по районам</h2>
        <Info className="h-5 w-5 text-slate-500" />
      </div>
      <div className="p-6 overflow-x-auto overflow-y-auto max-h-96">
        {rows.length > 0 ? (
          <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gray-700">Район</th>
                <th className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gray-700">Средний уровень готовности</th>
                <th className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gray-700">Средний уровень риска</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900">{row.district}</td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-600">{row.readiness}</td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-600">{row.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">Нет данных для отображения</p>
        )}
      </div>
    </div>
  )
}
