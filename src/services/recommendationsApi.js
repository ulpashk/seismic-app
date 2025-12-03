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
 * ВРЕМЕННОЕ РЕШЕНИЕ: создаем имитацию данных для демонстрации
 *
 * @param {string} measureCategory - категория мер (demolition, passportization, strengthening)
 * @param {string} district - район (опционально)
 * @returns {Promise<Array>} - массив объектов зданий
 */
export const fetchBuildingsData = async (measureCategory, district = null) => {
  console.log(
    `🔄 Получаем данные зданий для категории: ${measureCategory || "ВСЕ"}`
  );

  // Пытаемся извлечь данные из PBF тайлов
  try {
    const buildings = await extractDataFromPbfTiles(measureCategory, district);

    if (buildings.length > 0) {
      console.log(`✅ Получено ${buildings.length} зданий из PBF тайлов`);
      return buildings;
    } else {
      console.warn(`⚠️ PBF тайлы не содержат данных или парсинг не реализован`);
    }
  } catch (error) {
    console.error("❌ Ошибка извлечения из PBF тайлов:", error);
  }

  // Если PBF не работает, показываем информативное сообщение
  console.warn(
    `⚠️ Данные для "${
      measureCategory || "ВСЕ КАТЕГОРИИ"
    }" доступны ТОЛЬКО через PBF тайлы на карте`
  );
  console.warn(`📍 URL тайлов: ${getTileUrl(measureCategory, district)}`);
  console.warn(`💡 Для таблиц нужно либо:`);
  console.warn(
    `   1. Реализовать PBF парсинг (npm install @mapbox/vector-tile pbf)`
  );
  console.warn(`   2. Попросить бэкенд создать JSON API`);

  // Возвращаем пустой массив с информацией о доступности данных
  return [];
};

/**
 * Получить URL для векторных тайлов с фильтрацией
 * @param {string} measureCategory - категория мер (если null, то без фильтра)
 * @param {string} district - район (опционально)
 * @returns {string} URL для тайлов
 */
export function getTileUrl(measureCategory, district = null) {
  const params = new URLSearchParams();

  // Добавляем фильтр по категории только если указан
  if (measureCategory) {
    params.append("measure_category", measureCategory);
  }
  // ВАЖНО: если measureCategory === null, то НЕ добавляем никаких фильтров
  // чтобы загрузить ВСЕ данные

  // Добавляем фильтр по району если указан
  if (district && district !== "Все районы") {
    params.append("district", `${district} район`);
  }

  const paramsString = params.toString();
  const url = paramsString
    ? `${BASE_TILE_URL}/{z}/{x}/{y}.pbf?${paramsString}`
    : `${BASE_TILE_URL}/{z}/{x}/{y}.pbf`;

  // Диагностическая информация
  console.log("🔗 Generated tile URL:", url);
  if (measureCategory || district) {
    console.log("📋 Active filters:", {
      measureCategory: measureCategory || "none",
      district: district && district !== "Все районы" ? district : "none",
    });
  } else {
    console.log("📋 No filters applied - loading ALL data");
  }

  return url;
}
/**
 * Прямое тестирование PBF тайлов - загружаем и проверяем содержимое
 * @param {boolean} withFilter - использовать ли фильтр measure_category
 */
export async function testPbfTileDirectly(withFilter = false) {
  console.log("🧪 === ПРЯМОЕ ТЕСТИРОВАНИЕ PBF ТАЙЛОВ ===");

  // Тестируем разные варианты URL
  const testUrls = withFilter
    ? [
        `${BASE_TILE_URL}/11/1365/682.pbf?measure_category=demolition`,
        `${BASE_TILE_URL}/11/1365/682.pbf?measure_category=passportization`,
        `${BASE_TILE_URL}/11/1365/682.pbf?measure_category=strengthening`,
      ]
    : [
        `${BASE_TILE_URL}/11/1365/682.pbf`, // БЕЗ ФИЛЬТРА
        `${BASE_TILE_URL}/12/2730/1364.pbf`, // Более детальный зум
        `${BASE_TILE_URL}/10/682/341.pbf`, // Менее детальный зум
      ];

  for (const testUrl of testUrls) {
    console.log(`\n🔍 Тестируем: ${testUrl}`);

    try {
      const response = await fetch(testUrl);

      console.log(`📊 Статус: ${response.status} ${response.statusText}`);
      console.log(`📊 Content-Type: ${response.headers.get("content-type")}`);
      console.log(
        `📊 Content-Length: ${response.headers.get("content-length")}`
      );

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        console.log(`📦 Размер данных: ${arrayBuffer.byteLength} bytes`);

        if (arrayBuffer.byteLength > 0) {
          console.log("✅ Тайл содержит данные!");

          // Если есть данные, можно попробовать проанализировать их
          const uint8Array = new Uint8Array(arrayBuffer);
          console.log(
            "📋 Первые 20 байт:",
            Array.from(uint8Array.slice(0, 20))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join(" ")
          );
        } else {
          console.log("⚠️ Тайл пустой (0 bytes)");
        }
      } else {
        console.log(`❌ Ошибка: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Исключение: ${error.message}`);
    }

    // Пауза между запросами
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n🏁 === ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===");
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

/**
 * Извлечение данных из PBF тайлов для таблиц
 * Загружает несколько тайлов и парсит данные из них
 * @param {string} measureCategory - категория мер или null для всех
 * @param {string} district - район (опционально)
 * @returns {Promise<Array>} - массив объектов зданий
 */
export async function extractDataFromPbfTiles(
  measureCategory = null,
  district = null
) {
  console.log("🔍 Извлекаем данные из PBF тайлов для таблицы...");

  // Алматинские координаты - охватываем центральную часть города
  const tilesToFetch = [
    { z: 12, x: 2730, y: 1364 }, // Центр
    { z: 12, x: 2731, y: 1364 }, // Восток
    { z: 12, x: 2730, y: 1365 }, // Юг
    { z: 12, x: 2729, y: 1364 }, // Запад
    { z: 12, x: 2730, y: 1363 }, // Север
  ];

  const allBuildings = [];

  for (const tile of tilesToFetch) {
    try {
      const tileUrl = getTileUrl(measureCategory, district).replace(
        "{z}/{x}/{y}",
        `${tile.z}/${tile.x}/${tile.y}`
      );

      console.log(`📦 Загружаем тайл: ${tile.z}/${tile.x}/${tile.y}`);

      const response = await fetch(tileUrl);

      if (!response.ok) {
        console.warn(
          `❌ Ошибка загрузки тайла ${tile.z}/${tile.x}/${tile.y}: ${response.status}`
        );
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
        console.warn(`⚠️ Пустой тайл: ${tile.z}/${tile.x}/${tile.y}`);
        continue;
      }

      console.log(
        `✅ Тайл ${tile.z}/${tile.x}/${tile.y} загружен: ${arrayBuffer.byteLength} bytes`
      );

      // ВАЖНО: Здесь нужна библиотека для парсинга PBF (например, @mapbox/vector-tile)
      // Пока что имитируем извлечение данных

      // TODO: Добавить реальный парсинг PBF
      // const tile = new VectorTile(new Protobuf(arrayBuffer));
      // const layer = tile.layers['default'] || tile.layers['building_risk'];
      // if (layer) {
      //   for (let i = 0; i < layer.length; i++) {
      //     const feature = layer.feature(i);
      //     allBuildings.push(feature.properties);
      //   }
      // }
    } catch (error) {
      console.error(
        `❌ Ошибка обработки тайла ${tile.z}/${tile.x}/${tile.y}:`,
        error
      );
    }
  }

  console.log(`📊 Извлечено зданий из PBF тайлов: ${allBuildings.length}`);

  // Пока PBF парсинг не реализован, возвращаем имитацию данных с предупреждением
  console.warn(
    "⚠️ PBF парсинг пока не реализован. Нужна библиотека @mapbox/vector-tile"
  );
  console.warn(
    "💡 Для реализации добавьте: npm install @mapbox/vector-tile pbf"
  );

  return allBuildings;
}
