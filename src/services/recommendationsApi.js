/**
 * API service for building recommendations
 * Работает с PBF тайлами Mapbox Vector Tiles
 *
 * ⚠️ ВАЖНО: Бэкенд предоставляет данные ТОЛЬКО через PBF тайлы
 * https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf
 * Фильтр: measure_category=demolition|passportization|strengthening
 *
 * JSON API для списка зданий НЕ СУЩЕСТВУЕТ!
 * Для таблиц нужно либо:
 * 1. Попросить бэкенд создать JSON endpoint
 * 2. Реализовать парсинг всех PBF тайлов (сложно)
 */

const BASE_API_URL = "https://admin.smartalmaty.kz/api/v1/address/clickhouse";
const BASE_TILE_URL = `${BASE_API_URL}/building-risk-tile`;

/**
 * Типы рекомендаций и соответствующие им measure_category
 */
export const MEASURE_CATEGORIES = {
  demolition: "Снос",
  passportization: "Паспортизация",
  strengthening: "Усиление",
};

/**
 * ⚠️ JSON API для списка зданий НЕ СУЩЕСТВУЕТ!
 *
 * Данные доступны ТОЛЬКО через PBF тайлы:
 * /api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf?measure_category=CATEGORY
 *
 * Для отображения в таблицах нужно попросить бэкенд создать JSON endpoint:
 * GET /building-risk?measure_category=CATEGORY&district=DISTRICT
 *
 * Который должен возвращать:
 * [{ id, address, district, sri, h, v, e, ... }]
 *
 * @param {string} measureCategory - категория мер (demolition, passportization, strengthening)
 * @param {string} district - район (опционально)
 * @returns {Promise<Array>} - массив объектов зданий (пока пустой)
 */
export const fetchBuildingsData = async (measureCategory, district = null) => {
  console.warn(`⚠️  JSON API НЕ СУЩЕСТВУЕТ!`);
  console.warn(
    `⚠️  Данные для "${measureCategory}" доступны ТОЛЬКО через PBF тайлы:`
  );
  console.warn(
    `📍 ${BASE_TILE_URL}/{z}/{x}/{y}.pbf?measure_category=${measureCategory}`
  );
  console.warn(
    `💡 Попросите бэкенд создать endpoint: GET /building-risk?measure_category=${measureCategory}`
  );

  // Возвращаем пустой массив, так как JSON API не существует
  return [];
};

/**
 * Получить URL для векторных тайлов с фильтрацией
 * @param {string} measureCategory - категория мер
 * @param {string} district - район (опционально)
 * @returns {string} URL для тайлов
 */
export function getTileUrl(measureCategory, district = null) {
  const params = new URLSearchParams({
    measure_category: measureCategory,
  });

  // Добавляем фильтр по району если указан
  if (district && district !== "Все районы") {
    params.append("district", `${district} район`);
  }

  return `${BASE_TILE_URL}/{z}/{x}/{y}.pbf?${params.toString()}`;
}

/**
 * Получить рекомендации по категории
 */
export async function fetchRecommendations(measureCategory, district = null) {
  console.log(`🔄 Запрос рекомендаций для категории: ${measureCategory}`);

  try {
    const data = await fetchBuildingsData(measureCategory, district);
    console.log(
      `✅ Получено ${data.length || 0} записей для ${measureCategory}`
    );
    return data;
  } catch (error) {
    console.error(`❌ Ошибка получения данных:`, error);
    throw error;
  }
}

/**
 * Получить рекомендации на снос
 */
export async function fetchDemolitionRecommendations(district = null) {
  return fetchRecommendations("demolition", district);
}

/**
 * Получить рекомендации на паспортизацию
 */
export async function fetchPassportizationRecommendations(district = null) {
  return fetchRecommendations("passportization", district);
}

/**
 * Получить рекомендации на усиление
 */
export async function fetchStrengtheningRecommendations(district = null) {
  return fetchRecommendations("strengthening", district);
}

/**
 * Получить все типы рекомендаций сразу
 */
export async function fetchAllRecommendations(district = null) {
  try {
    const [demolition, passportization, strengthening] = await Promise.all([
      fetchDemolitionRecommendations(district),
      fetchPassportizationRecommendations(district),
      fetchStrengtheningRecommendations(district),
    ]);

    return {
      demolition,
      passportization,
      strengthening,
      total:
        (demolition?.length || 0) +
        (passportization?.length || 0) +
        (strengthening?.length || 0),
    };
  } catch (error) {
    console.error("❌ Ошибка получения всех рекомендаций:", error);
    throw error;
  }
}
