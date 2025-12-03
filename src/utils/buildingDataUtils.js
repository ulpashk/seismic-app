/**
 * Утилиты для работы с данными рекомендаций зданий
 */

/**
 * Форматирует адрес из свойств объекта
 * @param {Object} props - свойства объекта
 * @returns {string} - отформатированный адрес
 */
export function formatAddress(props) {
  if (props.street && props.homenum) {
    return `${props.street}, ${props.homenum}`;
  }
  if (props.caption) {
    return props.caption;
  }
  return `ID: ${props.id || props.building_id || "N/A"}`;
}

/**
 * Форматирует числовое значение
 * @param {number} value - значение
 * @param {number} decimals - количество знаков после запятой
 * @returns {string} - отформатированное значение
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  return Number(value).toFixed(decimals);
}

/**
 * Форматирует площадь с локализацией
 * @param {number} area - площадь в м²
 * @returns {string} - отформатированная площадь
 */
export function formatArea(area) {
  if (!area || isNaN(area)) return "N/A";
  return `${Number(area).toLocaleString()} м²`;
}

/**
 * Форматирует булево значение
 * @param {boolean} value - булево значение
 * @returns {string} - Да/Нет или N/A
 */
export function formatBoolean(value) {
  if (typeof value !== "boolean") return "N/A";
  return value ? "Да" : "Нет";
}

/**
 * Получает цвет для уровня риска
 * @param {number} risk - уровень риска
 * @returns {string} - CSS цвет
 */
export function getRiskColor(risk) {
  if (risk === null || risk === undefined) return "#6b7280";

  if (risk >= 0.8) return "#ef4444"; // красный - высокий риск
  if (risk >= 0.5) return "#f59e0b"; // желтый - средний риск
  return "#10b981"; // зеленый - низкий риск
}

/**
 * Получает цвет для SRI класса
 * @param {string} sriClass - SRI класс
 * @returns {string} - CSS цвет
 */
export function getSRIColor(sriClass) {
  const colors = {
    A: "#10b981", // зеленый
    B: "#3b82f6", // синий
    C: "#f59e0b", // желтый
    D: "#ef4444", // красный
  };
  return colors[sriClass] || "#6b7280";
}

/**
 * Группирует свойства объекта по категориям
 * @param {Object} props - свойства объекта
 * @returns {Object} - сгруппированные свойства
 */
export function groupBuildingProperties(props) {
  const grouped = {
    address: {
      street: props.street,
      homenum: props.homenum,
      caption: props.caption,
      district: props.district,
    },
    seismic: {
      h: props.h,
      v: props.v,
      e: props.e,
      risk: props.risk,
      seismic_eval: props.seismic_eval,
      sri_class: props.sri_class,
    },
    building: {
      id: props.id || props.building_id,
      floor: props.floor,
      area_m2: props.area_m2,
      gfa_m2: props.gfa_m2,
      is_emergency_building: props.is_emergency_building,
      is_passport: props.is_passport,
      is_highrise_in_poly: props.is_highrise_in_poly,
    },
    cluster: {
      cluster: props.cluster,
      cluster_id: props.cluster_id,
      cluster_rank: props.cluster_rank,
      priority: props.priority,
      cluster_priority: props.cluster_priority,
      group: props.group,
    },
    measures: {
      measure_category: props.measure_category,
      benefit: props.benefit,
      base_cost: props.base_cost,
      exposure_m2: props.exposure_m2,
    },
    technical: {}, // все остальные свойства
  };

  // Добавляем все остальные свойства в technical
  Object.entries(props).forEach(([key, value]) => {
    const isInCategory = Object.values(grouped).some(
      (category) => typeof category === "object" && key in category
    );

    if (!isInCategory && !key.startsWith("_")) {
      grouped.technical[key] = value;
    }
  });

  return grouped;
}

/**
 * Создает данные для таблицы из PBF свойств
 * @param {Array} features - массив features из PBF тайла
 * @returns {Array} - массив объектов для таблицы
 */
export function createTableData(features) {
  if (!Array.isArray(features) || features.length === 0) {
    return [];
  }

  return features.map((feature, index) => {
    const props = feature.properties || {};

    return {
      id: props.id || props.building_id || index,
      address: formatAddress(props),
      district: props.district || "N/A",
      sri: props.risk !== undefined ? formatNumber(props.risk) : "N/A",
      h: props.h !== undefined ? formatNumber(props.h) : "N/A",
      v: props.v !== undefined ? formatNumber(props.v) : "N/A",
      e: props.e !== undefined ? formatNumber(props.e) : "N/A",
      floor: props.floor || "N/A",
      area: formatArea(props.area_m2),
      emergency: formatBoolean(props.is_emergency_building),
      passport: formatBoolean(props.is_passport),
      seismicEval:
        props.seismic_eval !== undefined
          ? formatNumber(props.seismic_eval, 1)
          : "N/A",
      cluster: props.cluster || props.cluster_id || "N/A",
      priority:
        props.priority !== undefined ? formatNumber(props.priority, 0) : "N/A",
      // Оригинальные свойства для дополнительной обработки
      originalProps: props,
    };
  });
}

/**
 * Сортирует данные таблицы по указанному полю
 * @param {Array} data - данные для сортировки
 * @param {string} field - поле для сортировки
 * @param {string} direction - направление сортировки ('asc' | 'desc')
 * @returns {Array} - отсортированные данные
 */
export function sortTableData(data, field, direction = "asc") {
  if (!Array.isArray(data) || data.length === 0) return data;

  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Обработка числовых значений
    if (typeof aVal === "string" && !isNaN(parseFloat(aVal))) {
      aVal = parseFloat(aVal);
    }
    if (typeof bVal === "string" && !isNaN(parseFloat(bVal))) {
      bVal = parseFloat(bVal);
    }

    // Обработка N/A значений
    if (aVal === "N/A") aVal = direction === "asc" ? Infinity : -Infinity;
    if (bVal === "N/A") bVal = direction === "asc" ? Infinity : -Infinity;

    if (direction === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
}
