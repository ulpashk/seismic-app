// services/recommendationsApi.js

import { VectorTile } from "@mapbox/vector-tile";
import Protobuf from "pbf";

/**
 * API service for building recommendations
 * Работает с PBF тайлами Mapbox Vector Tiles
 *
 * ⚠️ ВАЖНО: Бэкенд предоставляет данные ТОЛЬКО через PBF тайлы
 * https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf
 * Фильтр: measure_category=demolition|passportization|strengthening
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
 * Получить URL для векторных тайлов с фильтрацией
 * @param {string|null} measureCategory - категория мер (если null, то без фильтра)
 * @param {string|null} district - район (опционально)
 * @returns {string} URL для тайлов
 */
export function getTileUrl(measureCategory, district = null) {
  const params = new URLSearchParams();

  // Добавляем фильтр по категории только если указан
  if (measureCategory) {
    params.append("measure_category", measureCategory);
  }
  // Если measureCategory === null, то НЕ добавляем никаких фильтров → грузим все данные

  // Добавляем фильтр по району если указан
  if (district && district !== "Все районы") {
    params.append("district", `${district} район`);
  }

  const paramsString = params.toString();
  const url = paramsString
    ? `${BASE_TILE_URL}/{z}/{x}/{y}.pbf?${paramsString}`
    : `${BASE_TILE_URL}/{z}/{x}/{y}.pbf`;

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

  const testUrls = withFilter
    ? [
        `${BASE_TILE_URL}/11/1365/682.pbf?measure_category=demolition`,
        `${BASE_TILE_URL}/11/1365/682.pbf?measure_category=passportization`,
        `${BASE_TILE_URL}/11/1365/682.pbf?measure_category=strengthening`,
      ]
    : [
        `${BASE_TILE_URL}/11/1365/682.pbf`,
        `${BASE_TILE_URL}/12/2730/1364.pbf`,
        `${BASE_TILE_URL}/10/682/341.pbf`,
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

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n🏁 === ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===");
}

/**
 * Генерация тайлов для покрытия области Алматы
 * @param {number} zoom - уровень зума
 * @param {Object} bounds - границы области {minLng, maxLng, minLat, maxLat}
 * @returns {Array} - массив координат тайлов
 */
function generateTilesForBounds(zoom, bounds) {
  const tiles = [];

  // Функция конвертации координат в номер тайла
  const lngToTileX = (lng, z) =>
    Math.floor(((lng + 180) / 360) * Math.pow(2, z));
  const latToTileY = (lat, z) =>
    Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, z)
    );

  const minX = lngToTileX(bounds.minLng, zoom);
  const maxX = lngToTileX(bounds.maxLng, zoom);
  const minY = latToTileY(bounds.maxLat, zoom); // Note: Y is inverted
  const maxY = latToTileY(bounds.minLat, zoom);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ z: zoom, x, y });
    }
  }

  return tiles;
}

/**
 * Извлечение данных из PBF тайлов для таблиц
 * Загружает несколько тайлов и парсит данные из них
 * @param {string|null} measureCategory - категория мер или null для всех
 * @param {string|null} district - район (опционально)
 * @returns {Promise<Array>} - массив объектов зданий
 */
export async function extractDataFromPbfTiles(
  measureCategory = null,
  district = null
) {
  console.log("🔍 Извлекаем данные из PBF тайлов для таблицы...");
  console.log(
    `📋 Фильтр: measureCategory=${measureCategory}, district=${district}`
  );

  // Границы Алматы (расширенные)
  const almatyBounds = {
    minLng: 76.75, // западная граница
    maxLng: 77.15, // восточная граница
    minLat: 43.15, // южная граница
    maxLat: 43.35, // северная граница
  };

  // Генерируем тайлы для зума 11 (минимальный зум для данных, меньше тайлов)
  const tilesToFetch = generateTilesForBounds(11, almatyBounds);

  console.log(
    `📍 Сгенерировано ${tilesToFetch.length} тайлов для загрузки (zoom=11)`
  );
  console.log(`📍 Тайлы:`, tilesToFetch);

  const allBuildings = [];

  // Параллельная загрузка тайлов группами по 5 для оптимизации
  const BATCH_SIZE = 5;

  for (let i = 0; i < tilesToFetch.length; i += BATCH_SIZE) {
    const batch = tilesToFetch.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (tile) => {
        try {
          // ВАЖНО: Загружаем БЕЗ фильтра measure_category в URL, т.к. сервер может возвращать пустые данные с фильтром
          const tileUrl = getTileUrl(null, district).replace(
            "{z}/{x}/{y}",
            `${tile.z}/${tile.x}/${tile.y}`
          );

          const response = await fetch(tileUrl);

          if (!response.ok) {
            console.warn(
              `❌ Ошибка загрузки тайла ${tile.z}/${tile.x}/${tile.y}: ${response.status}`
            );
            return [];
          }

          const arrayBuffer = await response.arrayBuffer();

          if (arrayBuffer.byteLength === 0) {
            return [];
          }

          const uint8 = new Uint8Array(arrayBuffer);
          const vectorTile = new VectorTile(new Protobuf(uint8));

          const layerNames = Object.keys(vectorTile.layers || {});

          // Берём слой building_risk или первый доступный
          const layer =
            vectorTile.layers["building_risk"] ||
            (layerNames.length > 0 ? vectorTile.layers[layerNames[0]] : null);

          if (!layer) {
            return [];
          }

          const buildings = [];
          for (let j = 0; j < layer.length; j++) {
            const feature = layer.feature(j);
            const p = feature.properties || {};

            // Логируем первую запись из первого тайла для отладки
            if (j === 0 && allBuildings.length === 0) {
              console.log("📋 Пример properties из PBF:", p);
              console.log("📋 Все ключи:", Object.keys(p));
            }

            // Фильтрация по району (если указан)
            if (
              district &&
              district !== "Все районы" &&
              p.district &&
              !p.district.includes(district)
            ) {
              continue;
            }

            const address =
              p.street && p.homenum
                ? `${p.street}, ${p.homenum}`
                : p.caption || "";

            buildings.push({
              id: p.id ?? p.building_id ?? `${tile.z}-${tile.x}-${tile.y}-${j}`,
              address,
              street: p.street ?? null,
              homenum: p.homenum ?? null,
              district: p.district ?? null,

              sri:
                p.sri_viz !== undefined
                  ? Number(p.sri_viz)
                  : p.sri_x !== undefined
                  ? Number(p.sri_x)
                  : p.sri !== undefined
                  ? Number(p.sri)
                  : null,

              h: p.h !== undefined ? Number(p.h) : null,
              e: p.e !== undefined ? Number(p.e) : null,
              v: p.v !== undefined ? Number(p.v) : null,
              risk: p.risk !== undefined ? Number(p.risk) : null,

              floor: p.floor ?? null,
              area_m2: p.area_m2 !== undefined ? Number(p.area_m2) : null,

              is_emergency_building: !!p.is_emergency_building,
              is_passport: !!p.is_passport,
              measure_category: p.measure_category ?? null,
            });
          }
          return buildings;
        } catch (error) {
          console.error(
            `❌ Ошибка обработки тайла ${tile.z}/${tile.x}/${tile.y}:`,
            error
          );
          return [];
        }
      })
    );

    // Собираем результаты батча
    for (const buildings of batchResults) {
      allBuildings.push(...buildings);
    }
  }

  console.log(`📊 Всего фич собрано из всех тайлов: ${allBuildings.length}`);

  const byId = new Map();
  for (const b of allBuildings) {
    if (!b.id) continue;
    if (!byId.has(b.id)) {
      byId.set(b.id, b);
    }
  }

  const uniqueBuildings = Array.from(byId.values());
  console.log(`📊 После удаления дублей: ${uniqueBuildings.length}`);

  return uniqueBuildings;
}

/**
 * Получить табличные данные по зданиям
 * @param {string|null} measureCategory
 * @param {string|null} district
 * @returns {Promise<Array>}
 */
export const fetchBuildingsData = async (measureCategory, district = null) => {
  console.log(
    `🔄 Получаем данные зданий для категории: ${measureCategory || "ВСЕ"}`
  );

  try {
    const buildings = await extractDataFromPbfTiles(measureCategory, district);

    console.log(`✅ Получено ${buildings.length} зданий из PBF`);
    return buildings;
  } catch (error) {
    console.error("❌ Ошибка извлечения из PBF тайлов:", error);
    return [];
  }
};

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
 * Пока возвращаем все здания, т.к. сервер не поддерживает фильтр measure_category
 */
export async function fetchDemolitionRecommendations(district = null) {
  return fetchRecommendations(null, district);
}

/**
 * Получить рекомендации на паспортизацию
 * Пока возвращаем все здания, т.к. сервер не поддерживает фильтр measure_category
 */
export async function fetchPassportizationRecommendations(district = null) {
  return fetchRecommendations(null, district);
}

/**
 * Получить рекомендации на усиление
 * Пока возвращаем все здания, т.к. сервер не поддерживает фильтр measure_category
 */
export async function fetchStrengtheningRecommendations(district = null) {
  return fetchRecommendations(null, district);
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
