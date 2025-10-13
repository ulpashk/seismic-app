"use client"

import { BlockMath, InlineMath } from "react-katex"

export default function InfraReadinessMethodology() {
  return (
    <div className="space-y-6 text-sm leading-relaxed p-8 pt-2">
      <section>
        <p>
          <strong>Infrastructure Readiness Index (IRI)</strong> — интегральный показатель готовности городской
          территории (ячейки / полигона) к приёму и безопасному функционированию в условиях сейсмических воздействий.
          Индекс отражает способность среды выдерживать нагрузку и обеспечивать население базовой инфраструктурой при
          сохранении работоспособности критических объектов.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">1. Цель и назначение</h3>
        <p>IRI используется для:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>сравнительной оценки районов и микрорайонов по уровню инфраструктурной готовности;</li>
          <li>определения зон приоритетной реконструкции и модернизации;</li>
          <li>поддержки пространственного планирования и инвестиционного анализа.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">2. Концептуальная структура</h3>
        <p>Индекс интегрирует три основные компоненты:</p>

        <table className="text-xs mt-3 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Компонент</th>
              <th className="border px-2 py-1 text-left">Содержание</th>
              <th className="border px-2 py-1 text-left">Направление влияния</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">S (Structural Readiness)</td>
              <td className="border px-2 py-1">Устойчивость зданий и геосреды</td>
              <td className="border px-2 py-1">↑ лучше</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">E (Exposure / Intensity)</td>
              <td className="border px-2 py-1">Плотность и высотность застройки</td>
              <td className="border px-2 py-1">↓ хуже</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">I (Infrastructure Readiness)</td>
              <td className="border px-2 py-1">Обеспеченность инфраструктурой</td>
              <td className="border px-2 py-1">↑ лучше</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-gray-50 p-3 rounded text-center mt-3">
          <BlockMath math="IRI = w_S \cdot S + w_E \cdot E + w_I \cdot I" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">3. Входные данные</h3>
        <p>Для каждого полигона рассчитываются следующие показатели:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>
            Средний <InlineMath math="GRI_{avg}" /> — уровень геоопасности (чем выше, тем опаснее);
          </li>
          <li>
            Средний <InlineMath math="SRI_{avg}" /> — сейсмостойкость зданий;
          </li>
          <li>Доли уязвимых и аварийных зданий (bldg_unstable_share, bldg_emergency_share);</li>
          <li>Плотность застройки: FAR, доля высотных зданий, средняя этажность;</li>
          <li>Количество школ, медучреждений, ПППН и ДДО;</li>
          <li>Численность населения полигона (<InlineMath math="Pop" />).</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">4. Расчёт подиндексов</h3>

        <h4 className="font-semibold mt-2">Structural Readiness (S)</h4>
        <div className="bg-gray-50 p-3 rounded text-center mt-1">
          <BlockMath math="S = 0.4(1 - GRI_n) + 0.3 SRI_n + 0.2(1 - Unstable_n) + 0.1(1 - Emergency_n)" />
        </div>

        <h4 className="font-semibold mt-4">Exposure / Building Intensity (E)</h4>
        <div className="bg-gray-50 p-3 rounded text-center mt-1">
          <BlockMath math="E = 0.4(1 - FAR_n) + 0.3(1 - Highrise_n) + 0.3(1 - Floor_n)" />
        </div>

        <h4 className="font-semibold mt-4">Infrastructure Readiness (I)</h4>
        <p>Обеспеченность населения социальными объектами рассчитывается как:</p>
        <div className="bg-gray-50 p-3 rounded text-center mt-1">
          <BlockMath math="I_k = \frac{cnt_k}{Pop / 1000}" />
        </div>
        <p className="mt-2">
          где <InlineMath math="cnt_k" /> — количество объектов типа <em>k</em> (школы, больницы, ПППН, ДДО).
        </p>
        <div className="bg-gray-50 p-3 rounded text-center mt-2">
          <BlockMath math="I = 0.4 School_n + 0.3 Health_n + 0.2 PPPN_n + 0.1 DDO_n" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">5. Итоговый индекс</h3>
        <div className="bg-gray-50 p-3 rounded text-center">
          <BlockMath math="IRI_{raw} = 0.5 S + 0.2 E + 0.3 I" />
          <BlockMath math="IRI = \frac{IRI_{raw} - P_{1\%}}{P_{99\%} - P_{1\%}}" />
        </div>

        <p className="mt-2">
          где <InlineMath math="P_{1\%}" /> и <InlineMath math="P_{99\%}" /> — перцентили распределения, используемые для
          устранения выбросов.
        </p>

        <h4 className="font-semibold mt-3">Поправка на население</h4>
        <div className="bg-gray-50 p-3 rounded text-center mt-1">
          <BlockMath math="IRI_{adj} = IRI \times (1 - 0.2 \cdot Pop_n)" />
        </div>
        <p className="mt-2">
          Высокая плотность населения уменьшает итоговую готовность из-за большего риска потерь и нагрузки на
          инфраструктуру.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">6. Веса компонентов</h3>
        <table className="text-xs mt-2 border border-gray-300 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Компонент</th>
              <th className="border px-2 py-1 text-left">Вес</th>
              <th className="border px-2 py-1 text-left">Обоснование</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">
                <InlineMath math="w_S = 0.5" />
              </td>
              <td className="border px-2 py-1">Базовая устойчивость</td>
              <td className="border px-2 py-1">Ключевой фактор готовности</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">
                <InlineMath math="w_E = 0.2" />
              </td>
              <td className="border px-2 py-1">Нагрузка и морфология застройки</td>
              <td className="border px-2 py-1">Вторичный фактор</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">
                <InlineMath math="w_I = 0.3" />
              </td>
              <td className="border px-2 py-1">Обеспеченность инфраструктурой</td>
              <td className="border px-2 py-1">Компенсирующий фактор</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">7. Классификация</h3>
        <table className="text-xs mt-2 border border-gray-300 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Класс</th>
              <th className="border px-2 py-1 text-left">Диапазон IRI</th>
              <th className="border px-2 py-1 text-left">Интерпретация</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">A</td>
              <td className="border px-2 py-1">&gt; 0.66</td>
              <td className="border px-2 py-1">Высокая готовность</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">B</td>
              <td className="border px-2 py-1">0.33–0.66</td>
              <td className="border px-2 py-1">Средняя готовность</td>
            </tr>
            <tr>
              <td className="border px-2 py-1">C</td>
              <td className="border px-2 py-1">&lt; 0.33</td>
              <td className="border px-2 py-1">Низкая готовность</td>
            </tr>
          </tbody>
        </table>

        <ul className="list-disc pl-6 space-y-1 mt-3">
          <li>
            <span className="font-semibold">Высокий IRI (зелёный)</span> — современные, устойчивые районы с развитой
            инфраструктурой;
          </li>
          <li>
            <span className="font-semibold">Средний IRI (жёлтый)</span> — умеренно устойчивые, требуют адресного
            усиления инфраструктуры;
          </li>
          <li>
            <span className="font-semibold">Низкий IRI (красный)</span> — уязвимые районы с сочетанием георисков и
            старого фонда.
          </li>
        </ul>
      </section>
    </div>
  )
}
