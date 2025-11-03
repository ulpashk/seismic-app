import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import PopulationFilters from "./PopulationFilters";

export default function HeatMapPopulation() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Проверка доступности maplibre-gl
  useEffect(() => {
    if (!maplibregl) {
      setError("MapLibre GL не загружен");
      return;
    }
  }, []);

  // Фильтры состояния
  const [filters, setFilters] = useState({
    densityLevels: {
      low: true,
      medium: true,
      high: true,
    },
  });

  // Обработчики фильтров
  const toggleDensityLevel = useCallback((level) => {
    setFilters((prev) => ({
      ...prev,
      densityLevels: {
        ...prev.densityLevels,
        [level]: !prev.densityLevels[level],
      },
    }));
  }, []);

  // Конфигурация
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
  const VECTOR_TILES =
    "https://admin.smartalmaty.kz/api/v1/address/postgis/populated-geo-risk-tile/{z}/{x}/{y}.pbf";
  const SOURCE_ID = "population";
  const SOURCE_LAYER = "populated_geo_risk";
  const HEAT_ID = "population-heatmap";
  const POINTS_ID = "population-points";
  const MOD = 6; // для прореживания точек
  const SAMPLE_FIELD = "total_population";

  // Инициализация карты
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Проверим доступность maplibre-gl
    if (!maplibregl) {
      setError("MapLibre GL недоступен");
      return;
    }

    try {
      console.log("🚀 Initializing HeatMapPopulation");

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
        center: [76.906, 43.198],
        zoom: 11,
        antialias: true,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");
      mapRef.current = map;

      const onLoad = () => {
        console.log("✅ HeatMapPopulation map loaded");
        setMapLoaded(true);
      };

      const onError = (e) => {
        console.error("❌ HeatMapPopulation map error:", e);
        setError(
          `Ошибка загрузки карты: ${e.error?.message || "Неизвестная ошибка"}`
        );
      };

      map.on("load", onLoad);
      map.on("error", onError);

      return () => {
        try {
          map.off("load", onLoad);
          map.off("error", onError);
          map.remove();
          mapRef.current = null;
        } catch (cleanupError) {
          console.warn("⚠️ Cleanup error:", cleanupError);
        }
      };
    } catch (e) {
      console.error("❌ HeatMapPopulation init failed:", e);
      setError(`Ошибка инициализации карты: ${e.message}`);
    }
  }, []);

  // Добавление слоев с фильтрацией
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Проверим валидность карты
    if (!map || map._removed) {
      console.warn("⚠️ Map is not available or was removed");
      return;
    }

    const safeRemoveLayer = (id) => {
      try {
        if (map && map.getLayer && map.getLayer(id)) {
          map.removeLayer(id);
        }
      } catch (e) {
        console.warn(`Failed to remove layer ${id}:`, e);
      }
    };

    const safeRemoveSource = (id) => {
      try {
        if (map && map.getSource && map.getSource(id)) {
          map.removeSource(id);
        }
      } catch (e) {
        console.warn(`Failed to remove source ${id}:`, e);
      }
    };
    const addLayers = () => {
      try {
        if (!map.isStyleLoaded()) {
          setTimeout(addLayers, 100);
          return;
        }

        console.log("🗂️ Adding population layers");

        // Очистка
        safeRemoveLayer(POINTS_ID);
        safeRemoveLayer(HEAT_ID);
        safeRemoveSource(SOURCE_ID);

        // Добавление источника
        map.addSource(SOURCE_ID, {
          type: "vector",
          tiles: [VECTOR_TILES],
          minzoom: 0,
          maxzoom: 14,
        });

        console.log("✅ Population source added");

        // Создание фильтра
        const buildFilter = () => {
          const conditions = ["all"];

          conditions.push([
            ">",
            ["to-number", ["get", "total_population"], 0],
            0,
          ]);

          // Фильтрация по плотности
          const enabledDensities = Object.entries(filters.densityLevels)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => key);

          if (enabledDensities.length > 0 && enabledDensities.length < 3) {
            const densityConditions = ["any"];

            enabledDensities.forEach((level) => {
              const population = ["to-number", ["get", "total_population"], 0];
              switch (level) {
                case "low":
                  densityConditions.push(["<", population, 25]);
                  break;
                case "medium":
                  densityConditions.push([
                    "all",
                    [">=", population, 25],
                    ["<", population, 60],
                  ]);
                  break;
                case "high":
                  densityConditions.push([">=", population, 60]);
                  break;
                default:
                  break;
              }
            });

            conditions.push(densityConditions);
          }

          return conditions.length > 1 ? conditions : null;
        };

        const populationFilter = buildFilter();

        // Тепловая карта
        map.addLayer({
          id: HEAT_ID,
          type: "heatmap",
          source: SOURCE_ID,
          "source-layer": SOURCE_LAYER,
          maxzoom: 15,
          paint: {
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "total_population"], 0],
              0,
              0.0,
              5,
              0.2,
              15,
              0.5,
              40,
              0.8,
              80,
              1.0,
            ],
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              1.0,
              14,
              2.0,
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              10,
              12,
              18,
              14,
              24,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0.0,
              "rgba(0,0,255,0)",
              0.2,
              "#4cc9f0",
              0.4,
              "#4895ef",
              0.6,
              "#f1c453",
              0.8,
              "#f8961e",
              1.0,
              "#d00000",
            ],
            "heatmap-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              1,
              14,
              0,
            ],
          },
        });

        // Точки для крупного масштаба
        map.addLayer({
          id: POINTS_ID,
          type: "circle",
          source: SOURCE_ID,
          "source-layer": SOURCE_LAYER,
          minzoom: 13,
          paint: {
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13,
              0,
              14,
              1,
            ],
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "total_population"], 0],
              1,
              3,
              10,
              5,
              25,
              7,
              60,
              9,
              120,
              11,
            ],
            "circle-color": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "total_population"], 0],
              1,
              "#c7f9ff",
              10,
              "#86efac",
              25,
              "#22c55e",
              60,
              "#f59e0b",
              120,
              "#ef4444",
            ],
            "circle-stroke-width": 0.5,
            "circle-stroke-color": "#4b5563",
          },
        });

        // Применение фильтров
        const heatmapFilter = [
          "all",
          populationFilter || ["!=", ["get", "total_population"], null],
          ["==", ["%", ["to-number", ["get", SAMPLE_FIELD], 0], MOD], 0],
        ].filter(Boolean);

        const pointsFilter = [
          "all",
          populationFilter || ["!=", ["get", "total_population"], null],
          ["==", ["%", ["to-number", ["get", SAMPLE_FIELD], 0], MOD], 0],
        ].filter(Boolean);

        map.setFilter(HEAT_ID, heatmapFilter);
        map.setFilter(POINTS_ID, pointsFilter);

        // Обработчики кликов
        map.on("click", POINTS_ID, (e) => {
          if (e.features && e.features.length > 0) {
            const props = e.features[0].properties;
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">Данные населения</h3>
                <p style="margin: 4px 0;"><strong>Население:</strong> ${
                  props.total_population ?? "N/A"
                } чел.</p>
                <p style="margin: 4px 0;"><strong>Координаты:</strong> ${e.lngLat.lng.toFixed(
                  6
                )}, ${e.lngLat.lat.toFixed(6)}</p>
              </div>
              `
              )
              .addTo(map);
          }
        });

        map.on("mouseenter", POINTS_ID, () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", POINTS_ID, () => {
          map.getCanvas().style.cursor = "";
        });
      } catch (layerError) {
        console.error("❌ Error adding population layers:", layerError);
        setError(`Ошибка загрузки слоев: ${layerError.message}`);
      }
    };

    addLayers();

    return () => {
      try {
        if (mapRef.current) {
          safeRemoveLayer(POINTS_ID);
          safeRemoveLayer(HEAT_ID);
          safeRemoveSource(SOURCE_ID);
        }
      } catch (e) {
        console.warn("Cleanup error:", e);
      }
    };
  }, [mapLoaded, filters]);

  if (error) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Ошибка загрузки
          </h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Фильтры населения */}
      <PopulationFilters
        filters={filters}
        toggleDensityLevel={toggleDensityLevel}
      />

      {/* Легенда */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-lg rounded-xl p-4 shadow-2xl z-10 border border-gray-200">
        <h4 className="text-gray-900 font-semibold mb-3 text-sm">
          Плотность населения
        </h4>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-600 mb-1">Тепловая карта:</div>
            <div
              className="w-40 h-3 rounded"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,255,0), #4cc9f0, #4895ef, #f1c453, #f8961e, #d00000)",
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Низкая</span>
              <span>Высокая</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
            Приблизьте карту для точек. Фильтрация по районам недоступна.
          </div>
        </div>
      </div>
    </div>
  );
}
