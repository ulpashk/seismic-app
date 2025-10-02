import { useState } from "react";

export default function GeoRisksPage() {
  const [districts, setDistricts] = useState({
    Алатауский: false,
    Алмалинский: false,
    Ауэзовский: false,
    Бостандыкский: false,
    Жетысуский: false,
    Турксибский: false,
    Медеуский: false,
  });

  const toggleDistrict = (name) => {
    setDistricts((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar Filters */}
      <aside className="w-64 border-r bg-white p-4 overflow-y-auto">
        <h2 className="font-semibold mb-2">Фильтр</h2>

        <div className="mb-4">
          <h3 className="text-sm font-medium">Районы:</h3>
          <div className="space-y-1">
            {Object.keys(districts).map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={districts[d]}
                  onChange={() => toggleDistrict(d)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium">Уровень риска:</h3>
          <div className="space-y-1">
            {["Высокий", "Средний", "Низкий"].map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm">
                <input type="checkbox" /> {r}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium">Категории инфраструктур:</h3>
          <div className="space-y-1">
            {["Опорные", "Тектонические разломы", "Селевые пути"].map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="checkbox" /> {c}
              </label>
            ))}
          </div>
        </div>

        <button className="w-full rounded-md border px-3 py-2 text-sm hover:bg-gray-100">
          Сбросить фильтр
        </button>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-gray-50">
        {/* Replace this with your Map component (e.g., Mapbox/Leaflet) */}
        <div className="w-full h-full">
          <h2 className="p-4 text-gray-500">[Тут будет карта]</h2>
        </div>

        {/* Legend (bottom left) */}
        <div className="absolute bottom-4 left-4 rounded-md border bg-white p-3 text-sm shadow">
          <h3 className="font-medium mb-2">Население:</h3>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500"></span> Высокий
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-400"></span> Средний
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500"></span> Низкий
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
