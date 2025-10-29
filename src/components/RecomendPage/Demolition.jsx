import { ArrowUpDown } from "lucide-react";

export default function Demolition() {
  const mockData = [
    { address: "ул. Абая 150", sri: "A1", h: "B", e: "C", v: "A" },
    { address: "пр. Достык 78", sri: "B2", h: "A", e: "B", v: "B" },
    { address: "ул. Фурманова 23", sri: "C3", h: "C", e: "A", v: "C" },
  ];

  return (
    <div className="bg-[#d3e2ff] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        На основе индекса SRI, рекомендованные здания на снос
      </h3>

      {/* Table Header */}
      <div className="bg-white rounded-md mb-3 p-3 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <span>Адрес</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1">
            <span>SRI</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1">
            <span>H</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1">
            <span>E</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1">
            <span>V</span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {mockData.map((building, index) => (
          <div key={index} className="bg-white rounded-md p-3 shadow-sm">
            <div className="grid grid-cols-5 gap-2 text-sm">
              <span className="font-medium text-gray-700 truncate">
                {building.address}
              </span>
              <span className="text-center">{building.sri}</span>
              <span className="text-center">{building.h}</span>
              <span className="text-center">{building.e}</span>
              <span className="text-center">{building.v}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
