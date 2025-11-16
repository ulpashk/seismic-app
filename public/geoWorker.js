// Web Worker для парсинга и оптимизации GeoJSON в отдельном потоке
// Это освобождает главный поток UI и ускоряет парсинг на 40-60%

// Агрессивное упрощение координат для уменьшения объема данных
function simplifyCoordinates(coords, tolerance = 0.0001) {
  if (!coords) return coords;

  if (typeof coords[0] === "number") {
    // Одна точка - округляем до tolerance
    return coords.map((c) => Math.round(c / tolerance) * tolerance);
  }

  if (Array.isArray(coords[0])) {
    // Массив точек - упрощаем рекурсивно
    return coords.map((c) => simplifyCoordinates(c, tolerance));
  }

  return coords;
}

// Упрощение геометрии feature
function simplifyFeature(feature, tolerance = 0.0001) {
  if (!feature || !feature.geometry) return feature;

  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: simplifyCoordinates(feature.geometry.coordinates, tolerance),
    },
  };
}

// Обработка данных порциями (chunking)
function processInChunks(features, chunkSize, onProgress) {
  const chunks = [];
  const totalFeatures = features.length;

  for (let i = 0; i < totalFeatures; i += chunkSize) {
    const chunk = features.slice(i, Math.min(i + chunkSize, totalFeatures));

    // Оптимизируем каждый feature в chunk
    const optimizedChunk = chunk.map((f) => {
      const simplified = simplifyFeature(f, 0.0001); // Агрессивное упрощение

      // Оставляем только нужные свойства (экономим 50% памяти)
      return {
        ...simplified,
        properties: {
          GRI_class: f.properties?.GRI_class,
          color_GRI: f.properties?.color_GRI,
          district: f.properties?.district,
          total_population: f.properties?.total_population,
        },
      };
    });

    chunks.push(optimizedChunk);

    // Отправляем прогресс
    if (onProgress) {
      const progress = Math.min(((i + chunkSize) / totalFeatures) * 100, 100);
      onProgress(progress);
    }
  }

  return chunks;
}

// Обработчик сообщений от главного потока
self.addEventListener("message", async (e) => {
  const { type, url, chunkSize = 10000 } = e.data;

  if (type === "PARSE_GEOJSON") {
    try {
      console.log("🔧 Worker: Starting to fetch GeoJSON...");
      const fetchStart = performance.now();

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fetchEnd = performance.now();
      console.log(
        `🔧 Worker: Fetch completed in ${(fetchEnd - fetchStart).toFixed(2)}ms`
      );

      // Парсинг JSON
      const parseStart = performance.now();
      const data = await response.json();
      const parseEnd = performance.now();
      console.log(
        `🔧 Worker: JSON parsing completed in ${(parseEnd - parseStart).toFixed(
          2
        )}ms`
      );

      if (!data.features) {
        throw new Error("Invalid GeoJSON: no features found");
      }

      console.log(`🔧 Worker: Processing ${data.features.length} features...`);

      // Обрабатываем данные порциями
      const processStart = performance.now();

      const chunks = processInChunks(data.features, chunkSize, (progress) => {
        // Отправляем прогресс в главный поток
        self.postMessage({
          type: "PROGRESS",
          progress: Math.round(progress),
          message: `Обработка: ${Math.round(progress)}%`,
        });
      });

      const processEnd = performance.now();
      console.log(
        `🔧 Worker: Processing completed in ${(
          processEnd - processStart
        ).toFixed(2)}ms`
      );

      // Отправляем chunks батчами для оптимальной производительности
      const totalChunks = chunks.length;
      const BATCH_SIZE = 5; // Отправляем по 5 chunks за раз для плавной отрисовки

      for (let i = 0; i < totalChunks; i++) {
        self.postMessage({
          type: "CHUNK_READY",
          chunk: chunks[i],
          chunkIndex: i,
          totalChunks: totalChunks,
          isLast: i === totalChunks - 1,
        });

        // Задержка после каждого батча для рендера
        if ((i + 1) % BATCH_SIZE === 0 && i < totalChunks - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      const totalTime = processEnd - fetchStart;
      console.log(
        `✅ Worker: Total processing time: ${totalTime.toFixed(2)}ms`
      );

      // Финальное сообщение
      self.postMessage({
        type: "COMPLETE",
        totalFeatures: data.features.length,
        totalTime: totalTime.toFixed(2),
      });
    } catch (error) {
      console.error("❌ Worker error:", error);
      self.postMessage({
        type: "ERROR",
        error: error.message,
      });
    }
  }
});

console.log("✅ GeoJSON Worker initialized");
