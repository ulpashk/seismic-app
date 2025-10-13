"use client"

import { BlockMath, InlineMath } from "react-katex"

export default function BuildingRiskMethodology() {
  return (
    <div className="space-y-6 text-sm leading-relaxed p-8 pt-2">
      <section>
        <h3 className="text-lg font-semibold mb-2">1. Исходные данные</h3>
        <p>
          Перед началом расчёта модель получает набор характеристик для каждого здания, описывающих физические параметры
          и техническое состояние объекта.
        </p>
        <p className="mt-2">Используемые поля:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>street, homenum, microdistrict, floor, caption, geometry, district, building_id;</li>
          <li>GRI, area_m2, gfa_m2, seismic_eval, is_emergency_building, is_passport.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">2. Компоненты индекса SRI</h3>
        <p>Индекс SRI рассчитывается из трёх основных компонент:</p>
        <div className="bg-gray-50 p-3 rounded mt-2 text-center">
          <BlockMath math="SRI = f(H, V, E)" />
        </div>
        <p className="mt-2">
          где <InlineMath math="H" /> — уровень внешней опасности (геориск),{" "}
          <InlineMath math="V" /> — уязвимость здания,{" "}
          <InlineMath math="E" /> — экспозиция (масштаб и возможные потери).
        </p>
      </section>

      <section>
        <h4 className="font-semibold mb-1">2.1. Опасность (Hazard, H)</h4>
        <p>
          Эта часть показывает, насколько опасна территория, где находится здание. Используется индекс геориска{" "}
          <InlineMath math="GRI" />, нормализованный в диапазоне [0, 1]:
        </p>
        <div className="bg-gray-50 p-3 rounded mt-2 text-center">
          <BlockMath math="H_0 = \text{clip}_{0,1}(GRI)" />
        </div>
        <p className="mt-2">Для усиления влияния зон с высоким риском применяется степенное преобразование:</p>
        <div className="bg-gray-50 p-3 rounded mt-2 text-sm">
          <BlockMath
            math={`H = 
              \\begin{cases} 
              \\text{clip}_{0,1}(H_0^{1.6}), & GRI \\ge 0.70 \\\\
              0.6 \\cdot \\text{clip}_{0,1}(H_0^{1.2}), & GRI \\le 0.40 \\\\
              0.8 \\cdot \\text{clip}_{0,1}(H_0^{1.4}), & \\text{иначе}
              \\end{cases}`}
          />
        </div>
      </section>

      <section>
        <h4 className="font-semibold mb-1">2.2. Уязвимость (Vulnerability, V)</h4>
        <p>
          Показывает, насколько здание устойчиво к внешним воздействиям. Зависит от этажности, геометрии и конструктивного состояния.
        </p>

        <ul className="list-disc pl-6 space-y-3 mt-3">
          <li>
            <strong>(a) Этажность:</strong>
            <div className="bg-gray-50 p-3 rounded mt-2 text-center">
              <BlockMath math="V_{floor,lin} = \text{clip}_{0,1}\left(\frac{\min(\max(floor,1),20)-1}{19}\right)" />
              <BlockMath math="V_{floor} = (V_{floor,lin})^{0.8}" />
            </div>
          </li>

          <li>
            <strong>(b) Тонкость (Slenderness):</strong>
            <div className="bg-gray-50 p-3 rounded mt-2 text-center">
              <BlockMath math="S = 3 \cdot floor \, / \, \sqrt{\max(area_{m2}, 1)}" />
              <BlockMath math="V_{slender} = \text{clip}_{0,1}\left(\frac{S - P_{50}(S)}{P_{99}(S) - P_{50}(S) + \varepsilon}\right)" />
            </div>
          </li>

          <li>
            <strong>(c) Конструктивное состояние:</strong>
            <p className="mt-1">Определяется по оценке сейсмоустойчивости и признаку аварийности здания.</p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li><InlineMath math="V_{cond} = 1.0" /> если здание аварийное;</li>
              <li><InlineMath math="V_{cond} = 0.35" /> если оценка положительная;</li>
              <li><InlineMath math="V_{cond} = 0.90" /> если оценка отрицательная или отсутствует.</li>
            </ul>
          </li>
        </ul>

        <p className="mt-4 font-semibold">Итоговая уязвимость:</p>
        <div className="bg-gray-50 p-3 rounded mt-2 text-center">
          <BlockMath math="V = 0.30 \cdot V_{floor} + 0.35 \cdot V_{slender} + 0.35 \cdot V_{cond}" />
        </div>
      </section>

      <section>
        <h4 className="font-semibold mb-1">2.3. Экспозиция (Exposure, E)</h4>
        <div className="bg-gray-50 p-3 rounded mt-2 text-center">
          <BlockMath math={`S_z = 
            \\begin{cases}
            gfa_{m2}, & \\text{если указано} \\\\
            area_{m2}, & \\text{иначе}
            \\end{cases}`} />
          <BlockMath math="E_{raw} = \text{clip}_{0,1}\left(\frac{S_z}{P_{99}(S_z) + \varepsilon}\right)" />
          <BlockMath math="E = (E_{raw})^{0.85}" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">3. Интегральный риск и индекс SRI</h3>
        <div className="bg-gray-50 p-3 rounded text-center">
          <BlockMath math="Risk = \text{clip}_{0,1}(H \cdot V \cdot E)" />
          <BlockMath math="SRI = 1 - Risk" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">4. Корректировки и пороговые ограничения</h3>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li><InlineMath math="is_{emergency\_building} = 1 \Rightarrow SRI = 0" /></li>
          <li><InlineMath math="seismic_{eval} = 0 \Rightarrow SRI \le 0.20" /></li>
          <li><InlineMath math="GRI \ge 0.70 \Rightarrow SRI \le 0.30" /></li>
          <li><InlineMath math="GRI \ge 0.70 \wedge floor > 9 \Rightarrow SRI \le 0.10" /></li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">5. Классификация зданий по уровням устойчивости</h3>
        <table className="text-xs mt-2 border border-gray-300 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Класс</th>
              <th className="border px-2 py-1 text-left">Интервал SRI</th>
              <th className="border px-2 py-1 text-left">Характеристика</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border px-2 py-1">A</td><td className="border px-2 py-1">&gt; 0.80</td><td className="border px-2 py-1">Высокая устойчивость</td></tr>
            <tr><td className="border px-2 py-1">B</td><td className="border px-2 py-1">0.65–0.80</td><td className="border px-2 py-1">Хорошее состояние</td></tr>
            <tr><td className="border px-2 py-1">C</td><td className="border px-2 py-1">0.50–0.65</td><td className="border px-2 py-1">Средняя устойчивость</td></tr>
            <tr><td className="border px-2 py-1">D</td><td className="border px-2 py-1">0.35–0.50</td><td className="border px-2 py-1">Повышенный риск</td></tr>
            <tr><td className="border px-2 py-1">E</td><td className="border px-2 py-1">≤ 0.35</td><td className="border px-2 py-1">Критическая устойчивость</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">6. Проверка независимости компонент</h3>
        <p>
          Корреляционный анализ показал, что геориск (<InlineMath math="H" />) практически независим от уязвимости
          (<InlineMath math="V" />) и экспозиции (<InlineMath math="E" />). Между <InlineMath math="V" /> и{" "}
          <InlineMath math="E" /> наблюдается умеренная корреляция (<InlineMath math="r = 0.47" />).
        </p>
        <p className="mt-2">
          Таким образом, модель <InlineMath math="SRI = 1 - (H \cdot V \cdot E)" /> является статистически устойчивой и концептуально корректной.
        </p>
      </section>
    </div>
  )
}
