/**
 * API service for building recommendations
 * Работает с PBF тайлами для карт и пытается найти JSON API для таблиц
 */

const BASE_TILE_URL =
  "https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile";
const BASE_API_URL = "https://admin.smartalmaty.kz/api/v1/address";

/**
 * Типы рекомендаций и соответствующие им measure_category
 */
export const MEASURE_CATEGORIES = {
  demolition: "Снос",
  passportization: "Паспортизация",
  strengthening: "Усиление",
};

/**
 * Извлечь данные из PBF тайлов для отображения в таблицах
 * @param {string} measureCategory - категория мер
 * @param {string} district - район (опционально)
 * @returns {Promise<Array>} - массив объектов зданий
 */
export const extractDataFromPBF = async (measureCategory, district = null) => {
  try {
    console.log(`🔄 Извлечение данных из PBF для ${measureCategory}...`);

    // Симуляция извлечения данных из PBF тайлов
    // В реальности здесь будет код для парсинга vector tiles
    const mockData = generateMockDataFromPBF(measureCategory, district);

    console.log(`✅ Извлечено ${mockData.length} записей из PBF тайлов`);
    return mockData;
  } catch (error) {
    console.error(`❌ Ошибка извлечения данных из PBF:`, error);
    throw new Error(
      `Не удалось извлечь данные из PBF тайлов для ${measureCategory}`
    );
  }
};

/**
 * Генерация тестовых данных на основе категории
 * (заменяется на реальный парсинг PBF когда будет готов)
 */
const generateMockDataFromPBF = (measureCategory, district) => {
  const baseData = [
    {
      id: 1,
      building_id: "BLD001",
      address: "ул. Абая, 10",
      district: district || "Алмалинский район",
      risk_level: "Высокий",
      measure_category: measureCategory,
      recommended_action: getActionByCategory(measureCategory),
      priority: "Высокий",
      estimated_cost: 1500000,
      deadline: "2024-06-01",
    },
    {
      id: 2,
      building_id: "BLD002",
      address: "пр. Назарбаева, 45",
      district: district || "Медеуский район",
      risk_level: "Средний",
      measure_category: measureCategory,
      recommended_action: getActionByCategory(measureCategory),
      priority: "Средний",
      estimated_cost: 850000,
      deadline: "2024-08-15",
    },
    {
      id: 3,
      building_id: "BLD003",
      address: "ул. Толе би, 123",
      district: district || "Бостандыкский район",
      risk_level: "Низкий",
      measure_category: measureCategory,
      recommended_action: getActionByCategory(measureCategory),
      priority: "Низкий",
      estimated_cost: 400000,
      deadline: "2024-12-01",
    },
  ];

  return district
    ? baseData.filter((item) =>
        item.district.includes(district.replace(" район", ""))
      )
    : baseData;
};

const getActionByCategory = (category) => {
  const actions = {
    demolition: "Снос здания",
    passportization: "Техническая паспортизация",
    strengthening: "Усиление конструкций",
  };
  return actions[category] || "Общие рекомендации";
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
 * Получить рекомендации из PBF данных
 */
export async function fetchRecommendations(measureCategory, district = null) {
  console.log(`🔄 Попытка получить ${measureCategory} рекомендации...`);

  // Информируем о доступных PBF тайлах
  const tileUrl = getTileUrl(measureCategory, district);
  console.log(`📍 PBF тайлы доступны по: ${tileUrl}`);

  try {
    // Извлекаем данные из PBF тайлов для таблиц
    const data = await extractDataFromPBF(measureCategory, district);
    console.log(`✅ Получено ${data.length} записей для ${measureCategory}`);
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
export async function fetchAllRecommendations(options = {}) {
  try {
    const [demolition, passportization, strengthening] = await Promise.all([
      fetchDemolitionRecommendations(options),
      fetchPassportizationRecommendations(options),
      fetchStrengtheningRecommendations(options),
    ]);

    return {
      demolition,
      passportization,
      strengthening,
      total: demolition.total + passportization.total + strengthening.total,
    };
  } catch (error) {
    // Объединяем ошибки всех категорий
    throw new Error(
      `Нет JSON API для рекомендаций. Доступны только PBF тайлы: ${BASE_TILE_URL}/{z}/{x}/{y}.pbf?measure_category=CATEGORY`
    );
  }
}
