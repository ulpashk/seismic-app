"use client"

import { BlockMath, InlineMath } from "react-katex"

export default function GRIMethodology() {
  return (
    <div className="space-y-6 text-sm leading-relaxed p-8 pt-2">
      <section>
        <p>
          <strong>Geo-Risk Index (GRI)</strong> — безразмерный индекс относительной геоопасности для ячейки или полигона,
          объединяющий близость к источникам опасностей (разломы, оползни, селевые русла) и влияние высоты рельефа.
          Индекс нормирован в диапазон [0, 1] и далее классифицируется на уровни риска.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Входные данные</h3>
        <p>Для каждой ячейки (центроид либо сам полигон) требуются:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <InlineMath math="d_{разломы}" /> — расстояние до ближайшего разлома (км);
          </li>
          <li>
            <InlineMath math="d_{оползни}" /> — расстояние до ближайшей оползневой зоны (км);
          </li>
          <li>
            <InlineMath math="d_{сель}" /> — расстояние до ближайшего селевого русла (км);
          </li>
          <li>
            <InlineMath math="avg\\_height" /> — средняя высота рельефа (м).
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Параметры модели</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Характерные масштабы затухания (“радиусы влияния”):</li>
          <ul className="list-disc pl-6">
            <li><InlineMath math="\\tau_{разломы} = 5.0\\text{ км}" /></li>
            <li><InlineMath math="\\tau_{оползни} = 2.0\\text{ км}" /></li>
            <li><InlineMath math="\\tau_{сель} = 1.0\\text{ км}" /></li>
          </ul>
          <li>Веса факторов (сумма равна 1):</li>
          <ul className="list-disc pl-6">
            <li><InlineMath math="W_{разломы} = 0.45" /></li>
            <li><InlineMath math="W_{оползни} = 0.35" /></li>
            <li><InlineMath math="W_{сель} = 0.20" /></li>
          </ul>
          <li>Коэффициент усиления высотой: <InlineMath math="\\alpha = 0.5" /></li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Нормализация (robust Min–Max)</h3>
        <p>Используется робастная линейная нормализация по перцентилям 1–99:</p>
        <div className="bg-gray-50 p-3 rounded text-center mt-2">
          <BlockMath math="minmax_{1\%,99\%}(x) = \frac{clip(x; x_{1\%}, x_{99\%}) - x_{1\%}}{x_{99\%} - x_{1\%} + \varepsilon}" />
        </div>
        <p className="mt-2">где <InlineMath math="\\varepsilon" /> — малое число для предотвращения деления на ноль.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Шаги расчёта</h3>
        <ol className="list-decimal pl-6 space-y-3">
          <li>
            <strong>Проксимити (близость) к опасностям.</strong> Для каждой категории{" "}
            <InlineMath math="c \in \{разломы, оползни, сель\}" />:
            <div className="bg-gray-50 p-3 rounded text-center mt-2">
              <BlockMath math="prox_c = e^{-d_c / \tau_c}, \quad d_c \ge 0" />
            </div>
            <p>Значение лежит в (0, 1]: чем ближе объект, тем выше значение <InlineMath math="prox" />.</p>
          </li>

          <li>
            <strong>Базовый риск как взвешенная сумма.</strong>
            <div className="bg-gray-50 p-3 rounded text-center mt-2">
              <BlockMath math="risk_{base} = 0.45 \cdot prox_{разломы} + 0.35 \cdot prox_{оползни} + 0.20 \cdot prox_{сель}" />
            </div>
            <p>
              Значение <InlineMath math="risk_{base} \in [0, 1]" />.
            </p>
          </li>

          <li>
            <strong>Усиление риска высотой и нормализация.</strong>
            <div className="bg-gray-50 p-3 rounded text-center mt-2">
              <BlockMath math="h_{norm} = minmax_{1\%,99\%}(avg\_height)" />
              <BlockMath math="GRI_{raw} = risk_{base} \cdot (1 + \alpha \cdot h_{norm})" />
              <BlockMath math="GRI = minmax_{1\%,99\%}(GRI_{raw})" />
            </div>
          </li>

          <li>
            <strong>Классификация индекса.</strong> Пусть{" "}
            <InlineMath math="q_{0.7}" /> и <InlineMath math="q_{0.9}" /> — 70-й и 90-й перцентили GRI:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                низкий риск — <InlineMath math="GRI < q_{0.7}" />;
              </li>
              <li>
                средний риск — <InlineMath math="q_{0.7} \le GRI < q_{0.9}" />;
              </li>
              <li>
                высокий риск — <InlineMath math="GRI \ge q_{0.9}" />.
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Интерпретация</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Экспоненциальное затухание отражает резкое снижение влияния при удалении от опасной зоны.</li>
          <li>Робастная нормализация (1–99%) снижает влияние выбросов по высоте и в итоговом индексе.</li>
          <li>Квантильные пороги обеспечивают устойчивую классификацию и корректную сравнимость между территориями.</li>
        </ul>
      </section>
    </div>
  )
}
