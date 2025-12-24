"use client";

import { BlockMath, InlineMath } from "react-katex";

export default function RecommendationsMethodology() {
  return (
    <div className="space-y-6 text-sm leading-relaxed p-8 pt-2">
      <section>
        <h3 className="text-lg font-semibold mb-2">Введение</h3>
        <p>
          Методология формирования рекомендаций основана на комплексном анализе
          сейсмической устойчивости зданий. Для каждого объекта рассчитывается
          индекс <strong>SRI (Seismic Risk Index)</strong>, который учитывает
          внешнюю геоопасность территории, конструктивную уязвимость здания и
          масштаб возможных последствий.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Основные показатели</h3>
        <p>
          В таблице рекомендаций отображаются четыре ключевых показателя,
          которые характеризуют сейсмический риск здания:
        </p>

        <div className="mt-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-700 mb-2">
              <InlineMath math="SRI" /> — Индекс сейсмоустойчивости (Seismic
              Risk Index)
            </h4>
            <p>
              Комплексный индекс сейсмоустойчивости здания, показывающий,
              насколько объект защищён от сейсмической опасности. Чем выше
              значение SRI, тем выше потенциальный риск для здания при
              сейсмическом событии.
            </p>
            <div className="bg-white p-3 rounded mt-2 text-center">
              <BlockMath math="SRI = f(H, V, E)" />
            </div>
            <p className="mt-2 text-gray-600 text-xs">
              Значение SRI рассчитывается как функция от трёх компонент:
              опасности (H), уязвимости (V) и экспозиции (E).
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded border-l-4 border-red-500">
            <h4 className="font-semibold text-red-700 mb-2">
              <InlineMath math="H" /> — Опасность (Hazard)
            </h4>
            <p>
              Показатель внешнего геориска территории, где расположено здание.
              Отражает уровень сейсмической опасности местоположения с учётом
              близости к геологическим разломам, оползневым зонам и селевым
              руслам.
            </p>
            <div className="bg-white p-3 rounded mt-2 text-center">
              <BlockMath math="H = f(GRI)" />
            </div>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
              <li>
                Высокое значение <InlineMath math="H" /> указывает на опасную
                территорию
              </li>
              <li>
                Основан на индексе геориска <InlineMath math="GRI" /> (Geo-Risk
                Index)
              </li>
              <li>Учитывает расстояние до источников природных опасностей</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-700 mb-2">
              <InlineMath math="V" /> — Уязвимость (Vulnerability)
            </h4>
            <p>
              Показатель конструктивной уязвимости здания, характеризующий,
              насколько само здание подвержено разрушению при сейсмическом
              воздействии. Зависит от физических и технических характеристик
              объекта.
            </p>
            <div className="bg-white p-3 rounded mt-2 text-center">
              <BlockMath math="V = 0.30 \cdot V_{floor} + 0.35 \cdot V_{slender} + 0.35 \cdot V_{cond}" />
            </div>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
              <li>
                <InlineMath math="V_{floor}" /> — уязвимость по этажности
                (высотные здания более уязвимы)
              </li>
              <li>
                <InlineMath math="V_{slender}" /> — тонкость конструкции
                (соотношение высоты к площади основания)
              </li>
              <li>
                <InlineMath math="V_{cond}" /> — техническое состояние
                (аварийность, результаты оценки)
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded border-l-4 border-green-500">
            <h4 className="font-semibold text-green-700 mb-2">
              <InlineMath math="E" /> — Экспозиция (Exposure)
            </h4>
            <p>
              Характеризует масштаб возможных потерь, то есть размер здания.
              Учитывает общую площадь объекта, что напрямую связано с
              количеством людей и имущества, которые могут пострадать.
            </p>
            <div className="bg-white p-3 rounded mt-2 text-center">
              <BlockMath math="E = f(area_{m2}, gfa_{m2})" />
            </div>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
              <li>Большие здания имеют более высокую экспозицию</li>
              <li>Учитывается площадь застройки и общая площадь этажей</li>
              <li>Отражает потенциальный масштаб последствий</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Интерпретация значений</h3>
        <p>Все показатели нормализованы в диапазоне от 0 до 1:</p>
        <div className="overflow-x-auto mt-3">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border text-left">Значение</th>
                <th className="px-4 py-2 border text-left">Уровень риска</th>
                <th className="px-4 py-2 border text-left">Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border">0.00 – 0.30</td>
                <td className="px-4 py-2 border text-green-600 font-medium">
                  Низкий
                </td>
                <td className="px-4 py-2 border">
                  Минимальный риск, здание в хорошем состоянии
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border">0.30 – 0.60</td>
                <td className="px-4 py-2 border text-yellow-600 font-medium">
                  Средний
                </td>
                <td className="px-4 py-2 border">
                  Умеренный риск, рекомендуется мониторинг
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">0.60 – 0.80</td>
                <td className="px-4 py-2 border text-orange-600 font-medium">
                  Повышенный
                </td>
                <td className="px-4 py-2 border">
                  Требуется внимание, рекомендуется усиление
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 border">0.80 – 1.00</td>
                <td className="px-4 py-2 border text-red-600 font-medium">
                  Высокий
                </td>
                <td className="px-4 py-2 border">
                  Критический риск, необходимы срочные меры
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">
          Формирование рекомендаций
        </h3>
        <p>
          На основе значений SRI и его компонент формируются три типа
          рекомендаций:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Усиление (Reinforcement)</strong> — для зданий со средним
            уровнем риска, где конструктивные улучшения могут существенно
            повысить сейсмоустойчивость.
          </li>
          <li>
            <strong>Снос (Demolition)</strong> — для аварийных зданий с
            критическим уровнем риска, где усиление экономически нецелесообразно
            или технически невозможно.
          </li>
          <li>
            <strong>Сертификация (Certification)</strong> — для зданий,
            требующих проведения детального обследования и получения заключения
            о сейсмоустойчивости.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Примечания</h3>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>
            Значения показателей обновляются при изменении исходных данных о
            зданиях или геоопасности территории.
          </li>
          <li>
            Рекомендации носят информационный характер и требуют подтверждения
            квалифицированными специалистами.
          </li>
          <li>
            Для получения детальной методологии расчёта каждого компонента см.
            разделы «Индекс риска зданий» и «Индекс геориска».
          </li>
        </ul>
      </section>
    </div>
  );
}
