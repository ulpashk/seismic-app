export default function MapLegend() {
  return (
    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-lg rounded-xl p-4 shadow-2xl z-10 pointer-events-auto border border-gray-200">
      <h4 className="text-gray-900 font-semibold mb-3 text-sm">Легенда</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700 text-xs">Высокий риск</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-700 text-xs">Средний риск</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700 text-xs">Низкий риск</span>
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
