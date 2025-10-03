import { Info } from "lucide-react"

export default function DistrictReadinessTable({ districtAverages }) {
  // Convert object { district: avg } into array
  const rows = Object.entries(districtAverages).map(([district, avg]) => ({
    district,
    avg: avg.toFixed(3), // format to 3 decimals
  }))

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-medium">Уровень готовности по районам</h2>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <div className="p-6 overflow-x-auto">
        {rows.length > 0 ? (
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border-b">Район</th>
                <th className="px-4 py-2 text-left border-b">Средний уровень готовности</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{row.district}</td>
                  <td className="px-4 py-2 border-b text-gray-600">{row.avg}</td>
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
