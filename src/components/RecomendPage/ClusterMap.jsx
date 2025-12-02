import { useState, useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  getTileUrl,
  MEASURE_CATEGORIES,
} from "../../services/recommendationsApi";

export default function ClusterMap({ filters = {} }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("demolition");
  const [mapLoaded, setMapLoaded] = useState(false);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      demolition: "#ef4444", // красный
      passportization: "#3b82f6", // синий
      strengthening: "#10b981", // зеленый
    };
    return colors[category] || "#6b7280";
  }, []);

  // Инициализация карты
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.906, 43.198], // Алматы
      zoom: 11,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      console.log("🗺️ ClusterMap loaded");
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Добавление слоев зданий
  const addBuildingLayers = useCallback(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;
    const tileUrl = getTileUrl(selectedCategory, filters.selectedDistrict);

    console.log("🔄 Adding building layers...");
    console.log("📍 Tile URL:", tileUrl);

    try {
      // Удаляем существующие слои если есть
      ["buildings-fill", "buildings-outline"].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      // Проверяем, есть ли уже источник
      if (map.getSource("building-recommendations")) {
        map.removeSource("building-recommendations");
      }

      // Добавляем источник PBF тайлов
      map.addSource("building-recommendations", {
        type: "vector",
        tiles: [tileUrl],
        minzoom: 0,
        maxzoom: 18,
      });

      // Пробуем разные варианты source-layer
      // Часто в PBF тайлах слой называется "default" или совпадает с именем таблицы
      const possibleLayers = [
        "building_risk",
        "default",
        "buildings",
        "building-risk",
        "recommendations",
      ];

      console.log("🔍 Trying source layers:", possibleLayers);

      // Используем первый вариант, но добавим обработчик ошибок
      const sourceLayer = "default"; // Попробуем "default" - часто используется

      // Добавляем слой заливки зданий
      map.addLayer({
        id: "buildings-fill",
        type: "circle",
        source: "building-recommendations",
        "source-layer": sourceLayer,
        paint: {
          "circle-radius": {
            base: 1.5,
            stops: [
              [10, 3],
              [15, 8],
              [20, 25],
            ],
          },
          "circle-color": getCategoryColor(selectedCategory),
          "circle-opacity": 0.7,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Добавляем обводку
      map.addLayer({
        id: "buildings-outline",
        type: "circle",
        source: "building-recommendations",
        "source-layer": sourceLayer,
        paint: {
          "circle-radius": {
            base: 1.5,
            stops: [
              [10, 3],
              [15, 8],
              [20, 25],
            ],
          },
          "circle-color": "transparent",
          "circle-stroke-width": 2,
          "circle-stroke-color": getCategoryColor(selectedCategory),
          "circle-opacity": 0,
        },
      });

      // Добавляем popup при клике
      map.on("click", "buildings-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const coordinates = e.lngLat;
          const properties = feature.properties;

          const popupContent = `
            <div style="font-size: 12px; max-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">
                ${MEASURE_CATEGORIES[selectedCategory]}
              </h4>
              ${Object.entries(properties || {})
                .filter(([key]) => !key.startsWith("_"))
                .map(
                  ([key, value]) =>
                    `<div style="margin: 4px 0;"><strong>${key}:</strong> ${value}</div>`
                )
                .join("")}
            </div>
          `;

          new maplibregl.Popup({ offset: [0, -10] })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
        }
      });

      // Меняем курсор при наведении
      map.on("mouseenter", "buildings-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "buildings-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      // Добавляем обработчик загрузки источника для отладки
      map.on("sourcedata", (e) => {
        if (e.sourceId === "building-recommendations" && e.isSourceLoaded) {
          console.log("✅ Source loaded:", e.sourceId);

          // Проверяем, есть ли данные в тайле
          const source = map.getSource("building-recommendations");
          if (source) {
            console.log("📦 Source details:", source);

            // Пытаемся получить фичи с карты для всех возможных слоев
            const layers = [
              "building_risk",
              "default",
              "buildings",
              "building-risk",
              "recommendations",
            ];
            console.log("🔍 Checking for features in layers...");

            // Проверяем фичи в каждом возможном слое
            layers.forEach((layerName) => {
              try {
                const features = map.querySourceFeatures(
                  "building-recommendations",
                  {
                    sourceLayer: layerName,
                  }
                );

                if (features && features.length > 0) {
                  console.log(
                    `✅ FOUND ${features.length} features in layer: "${layerName}"`
                  );
                  console.log("Sample feature:", features[0]);
                } else {
                  console.log(`❌ No features in layer: "${layerName}"`);
                }
              } catch (err) {
                console.warn(
                  `⚠️ Error checking layer "${layerName}":`,
                  err.message
                );
              }
            });
          }
        }
      });

      // Обработчик ошибок загрузки тайлов
      map.on("error", (e) => {
        console.error("❌ Map error:", e);
        if (e.error) {
          console.error("Error details:", e.error);
        }
      });

      console.log("✅ Building layers added for category:", selectedCategory);
      console.log("🔍 Source layer used:", sourceLayer);
    } catch (error) {
      console.error("❌ Error adding building layers:", error);
    }
  }, [selectedCategory, filters.selectedDistrict, mapLoaded, getCategoryColor]);

  // Обновление слоев при изменении категории или фильтров
  useEffect(() => {
    if (mapLoaded) {
      addBuildingLayers();
    }
  }, [addBuildingLayers, mapLoaded]);

  return (
    <div className="bg-[#d3e2ff] rounded-lg p-6">
      {/* Временное уведомление о пустых тайлах */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3 mb-4 text-sm text-yellow-800">
        ⚠️ <strong>Тайлы загружаются (200 OK), но содержат 0 объектов.</strong>{" "}
        Проверьте данные на бэкенде.
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Карта рекомендаций
        </h3>

        {/* Фильтр по категориям */}
        <div className="flex gap-2">
          {Object.entries(MEASURE_CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedCategory === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-blue-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Контейнер карты */}
      <div
        className="bg-white rounded-md overflow-hidden relative"
        style={{ height: "400px" }}
      >
        <div ref={mapContainer} className="w-full h-full" />

        {/* Индикатор загрузки */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm">Загрузка карты...</p>
            </div>
          </div>
        )}
      </div>

      {/* Легенда */}
      <div className="mt-4 p-3 bg-white rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Легенда</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(MEASURE_CATEGORIES).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(key) }}
              ></div>
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Информация о текущем URL */}
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer hover:text-gray-700">
            Информация о PBF тайлах
          </summary>
          <div className="mt-2">
            <p className="mb-1">Текущий URL:</p>
            <code className="block bg-white p-2 rounded text-xs border">
              {getTileUrl(selectedCategory, filters.selectedDistrict)}
            </code>
            {filters.selectedDistrict && (
              <p className="mt-1">
                📍 Фильтрация по району:{" "}
                <strong>{filters.selectedDistrict}</strong>
              </p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
