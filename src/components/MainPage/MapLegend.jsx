export default function MapLegend() {
  return (
    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-lg rounded-xl p-4 shadow-2xl z-10 pointer-events-auto border border-gray-200 ">
      <h4 className="text-gray-900 font-semibold mb-3 text-sm">Легенда</h4>
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="text-gray-700 text-xs font-medium">Уровень риска</div>
          <div className="space-y-1">
            <div className="w-32 h-3 rounded-sm bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
            <div className="flex justify-between w-32 text-[9px] text-gray-600">
              <span>Низкий</span>
              <span>Средний</span>
              <span>Высокий</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-300 my-2"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-blue-400 rounded"></div>
          <span className="text-gray-700 text-xs">Сель</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-orange-400 rounded"></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <span className="text-gray-700 text-xs">Оползни</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-red-400/50 border border-red-400 rounded"></div>
          <span className="text-gray-700 text-xs">Разломы</span>
        </div>
      </div>
    </div>
  );
}
