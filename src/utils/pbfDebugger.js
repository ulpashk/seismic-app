/**
 * Утилита для отладки PBF Vector Tiles
 * Помогает определить правильные имена слоев в тайлах
 */

// Функция для проверки доступных слоев в PBF тайле
export const debugPBFLayers = async (tileUrl) => {
  console.log("🔍 Debugging PBF tile:", tileUrl);

  try {
    // Заменяем плейсхолдеры на конкретные координаты для Алматы
    const concreteUrl = tileUrl
      .replace("{z}", "12")
      .replace("{x}", "2730")
      .replace("{y}", "1364");

    console.log("📍 Concrete URL:", concreteUrl);

    const response = await fetch(concreteUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    console.log("📦 PBF Buffer size:", buffer.byteLength, "bytes");

    // Если у нас есть Mapbox GL JS на странице, можем попробовать парсить
    if (window.mapboxgl && window.mapboxgl.vectorTile) {
      const tile = new window.mapboxgl.vectorTile.VectorTile(
        new Uint8Array(buffer)
      );
      console.log("🗂️ Available layers:", Object.keys(tile.layers));

      Object.keys(tile.layers).forEach((layerName) => {
        const layer = tile.layers[layerName];
        console.log(`📋 Layer "${layerName}":`, {
          length: layer.length,
          name: layer.name,
          version: layer.version,
          extent: layer.extent,
        });

        // Показываем первую feature если есть
        if (layer.length > 0) {
          const feature = layer.feature(0);
          console.log(`🏠 Sample feature from "${layerName}":`, {
            id: feature.id,
            type: feature.type,
            properties: feature.properties,
          });
        }
      });
    } else {
      console.log("⚠️ Mapbox GL JS не найден, не можем парсить PBF");
    }

    return buffer;
  } catch (error) {
    console.error("❌ Ошибка при загрузке PBF тайла:", error);
    return null;
  }
};

// Функция для тестирования разных имен слоев
export const testCommonLayerNames = (map, sourceName) => {
  const commonLayerNames = [
    "default",
    "buildings",
    "building",
    "layer0",
    "layer1",
    "data",
    "features",
    "geom",
    "osm",
    "water",
    "building_risk",
  ];

  console.log("🧪 Testing common layer names...");

  commonLayerNames.forEach((layerName, index) => {
    const testLayerId = `test-layer-${index}`;

    try {
      // Удаляем предыдущий тестовый слой
      if (map.getLayer(testLayerId)) {
        map.removeLayer(testLayerId);
      }

      // Добавляем тестовый слой
      map.addLayer({
        id: testLayerId,
        type: "fill",
        source: sourceName,
        "source-layer": layerName,
        paint: {
          "fill-color": `hsl(${index * 36}, 70%, 60%)`,
          "fill-opacity": 0.3,
        },
      });

      // Проверяем, есть ли features
      setTimeout(() => {
        const features = map.queryRenderedFeatures({ layers: [testLayerId] });
        console.log(
          `🔍 Layer "${layerName}": ${features.length} features found`
        );

        if (features.length > 0) {
          console.log(`✅ FOUND WORKING LAYER: "${layerName}"`);
          console.log("Sample feature:", features[0]);
        }
      }, 1000);
    } catch (error) {
      console.log(`❌ Layer "${layerName}": failed -`, error.message);
    }
  });

  // Очистка через 10 секунд
  setTimeout(() => {
    commonLayerNames.forEach((layerName, index) => {
      const testLayerId = `test-layer-${index}`;
      if (map.getLayer(testLayerId)) {
        map.removeLayer(testLayerId);
      }
    });
    console.log("🧹 Test layers cleaned up");
  }, 10000);
};

// Добавляем функции в window для использования в консоли браузера
if (typeof window !== "undefined") {
  window.debugPBFLayers = debugPBFLayers;
  window.testCommonLayerNames = testCommonLayerNames;
}
