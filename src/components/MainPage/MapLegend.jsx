export default function MapLegend() {
  return (
    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-md rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-xl z-10 pointer-events-auto border border-gray-200 transition-all duration-300 w-auto max-w-[140px] sm:max-w-none">
      
      {/* Заголовок легенды */}
      <h4 className="text-gray-900 font-bold mb-2 md:mb-3 text-[11px] sm:text-xs md:text-sm">
        Легенда
      </h4>

      <div className="space-y-1.5 md:space-y-2">
        {/* Секция Уровень риска */}
        <div className="space-y-1">
          <div className="text-gray-700 text-[10px] sm:text-xs font-medium">Уровень риска</div>
          <div className="space-y-1">
            {/* Адаптивная ширина полоски: w-24 (96px) на мобилках, w-32 (128px) на десктопе */}
            <div className="w-24 sm:w-32 h-2 md:h-3 rounded-sm bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"></div>
            <div className="flex justify-between w-24 sm:w-32 text-[8px] sm:text-[9px] text-gray-600 font-medium">
              <span>Низкий</span>
              <span>Высокий</span>
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-gray-200 my-1 md:my-2"></div>

        {/* Элементы списка (Сель, Оползни, Разломы) */}
        <div className="space-y-1 md:space-y-1.5">
          {/* Сель */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-4 h-0.5 md:w-6 md:h-1 bg-blue-400 rounded"></div>
            <span className="text-gray-700 text-[10px] sm:text-xs">Сель</span>
          </div>

          {/* Оползни */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="flex items-center gap-0.5 md:gap-1">
              <div className="w-2 md:w-3 h-0.5 md:h-1 bg-orange-400 rounded"></div>
              <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-400 rounded-full border border-white shadow-sm"></div>
            </div>
            <span className="text-gray-700 text-[10px] sm:text-xs">Оползни</span>
          </div>

          {/* Разломы */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-4 h-3 md:w-6 md:h-4 bg-red-400/50 border border-red-400 rounded"></div>
            <span className="text-gray-700 text-[10px] sm:text-xs">Разломы</span>
          </div>
        </div>
      </div>
    </div>
  );
}