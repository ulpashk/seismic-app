import { useState, useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getTileUrl } from "../../services/recommendationsApi";
// import { debugPBFLayers, testCommonLayerNames } from "../../utils/pbfDebugger";

export default function ClusterMap({ onBuildingsUpdate }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Функция для извлечения видимых зданий с карты
  const extractVisibleBuildings = useCallback(() => {
    if (!mapRef.current || !mapRef.current.getLayer("buildings-fill")) return;

    const map = mapRef.current;

    try {
      // Получаем все видимые features из слоя buildings-fill
      const features = map.queryRenderedFeatures({
        layers: ["buildings-fill"],
      });

      if (!features || features.length === 0) {
        console.log("📭 Нет видимых зданий на карте");
        return;
      }

      // Преобразуем features в формат для таблиц
      const buildingsMap = new Map(); // Для дедупликации по id

      features.forEach((feature, index) => {
        const p = feature.properties || {};
        const id = p.id || p.building_id || feature.id;

        // Логируем первый feature для отладки
        if (index === 0) {
          console.log("📋 Пример properties из карты:", p);
          console.log("📋 Все ключи:", Object.keys(p));
          // Показываем все значения адресных полей
          console.log("📋 Адресные поля:", {
            street: p.street,
            homenum: p.homenum,
            caption: p.caption,
            address: p.address,
            name: p.name,
            addr_street: p.addr_street,
            building_address: p.building_address,
            full_address: p.full_address,
          });
          console.log(
            "📋 Категория мероприятия:",
            p.measure_category || p.category
          );
        }

        // Пропускаем если уже есть
        if (buildingsMap.has(id)) return;

        // Формируем адрес из разных возможных полей
        let address = "";
        if (p.street && p.homenum) {
          address = `${p.street}, ${p.homenum}`;
        } else if (p.caption) {
          address = p.caption;
        } else if (p.address) {
          address = p.address;
        } else if (p.name) {
          address = p.name;
        } else if (p.full_address) {
          address = p.full_address;
        } else if (p.addr_street) {
          address = p.addr_street;
        } else if (p.building_address) {
          address = p.building_address;
        } else {
          // Если нет адреса - пробуем сформировать из улицы
          if (p.street) {
            address = p.homenum ? `${p.street}, ${p.homenum}` : p.street;
          } else {
            address = `Здание #${id}`;
          }
        }

        buildingsMap.set(id, {
          id,
          address,
          street: p.street || null,
          homenum: p.homenum || null,
          district: p.district || null,
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
          floor: p.floor || null,
          area_m2: p.area_m2 !== undefined ? Number(p.area_m2) : null,
          is_emergency_building: !!p.is_emergency_building,
          is_passport: !!p.is_passport,
          measure_category: p.measure_category || p.category || null,
        });
      });

      const buildings = Array.from(buildingsMap.values());
      console.log(`🏢 Извлечено ${buildings.length} уникальных зданий с карты`);

      if (onBuildingsUpdate) {
        onBuildingsUpdate(buildings);
      }
    } catch (error) {
      console.error("❌ Ошибка извлечения зданий:", error);
    }
  }, [onBuildingsUpdate]);

  // Инициализация карты
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.906, 43.198], // Алматы
      zoom: 11, // Дефолтный зум
      minZoom: 8, // Минимальный зум
      maxZoom: 18, // Максимальный зум
      pitch: 0,
      bearing: 0,
      antialias: false, // Отключаем для лучшей производительности
      // Оптимизации производительности
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
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
    const tileUrl = getTileUrl(null, null);

    console.log("🔄 Adding building layers...");

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
        minzoom: 11,
        maxzoom: 16,
        buffer: 0,
      });

      // Отладка PBF тайлов (только логирование)
      console.log("🔍 Using PBF layer: building_risk");
      // debugPBFLayers(tileUrl); // Отключаем для стабильности

      // Убираем автоматическое тестирование слоев
      // setTimeout(() => testCommonLayerNames(map, "building-recommendations"), 2000);      // Добавляем слой заливки зданий (полигоны)
      map.addLayer({
        id: "buildings-fill",
        type: "fill",
        source: "building-recommendations",
        "source-layer": "building_risk", // НАЙДЕНО! Правильное имя слоя
        minzoom: 11,
        maxzoom: 22,
        paint: {
          // Используем данные из PBF для цветовой схемы
          "fill-color": [
            "case",
            ["has", "sri_color"],
            ["get", "sri_color"],
            ["has", "cluster_color"],
            ["get", "cluster_color"],
            // Fallback: цвет по риску
            [
              "case",
              [">=", ["get", "risk"], 0.8],
              "#dc2626", // красный для высокого риска
              [">=", ["get", "risk"], 0.5],
              "#f59e0b", // оранжевый для среднего
              [">=", ["get", "risk"], 0.3],
              "#eab308", // желтый для низко-среднего
              "#ef4444", // красный по умолчанию
            ],
          ],
          "fill-opacity": 0.7,
        },
      });

      // Добавляем обводку полигонов
      map.addLayer({
        id: "buildings-outline",
        type: "line",
        source: "building-recommendations",
        "source-layer": "building_risk", // НАЙДЕНО! Правильное имя слоя
        minzoom: 13,
        maxzoom: 22,
        paint: {
          "line-color": "#dc2626",
          "line-width": {
            base: 1.5,
            stops: [
              [13, 0.5],
              [15, 1],
              [20, 2],
            ],
          },
          "line-opacity": 0.8,
        },
      });

      // Добавляем popup при клике на полигоны
      map.on("click", "buildings-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const coordinates = e.lngLat;
          const props = feature.properties;

          // Форматируем адрес
          const address =
            props.street && props.homenum
              ? `${props.street}, ${props.homenum}`
              : props.caption ||
                `ID: ${props.id || props.building_id || "N/A"}`;

          // Группируем данные по категориям для лучшего отображения
          const popupContent = `
            <div style="font-size: 12px; max-width: 300px; line-height: 1.4;">
              <div style="background: #ef4444; color: white; padding: 8px; margin: -8px -8px 8px -8px; border-radius: 4px 4px 0 0;">
                <strong>Информация об объекте</strong>
              </div>
              
              <!-- Адрес -->
              <div style="margin-bottom: 8px;">
                <div style="font-weight: 600; color: #1f2937;">${address}</div>
                ${
                  props.district
                    ? `<div style="color: #6b7280; font-size: 11px;">${props.district}</div>`
                    : ""
                }
              </div>

              <!-- Сейсмические показатели -->
              <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; margin-bottom: 6px;">
                <div style="font-weight: 600; margin-bottom: 4px; color: #495057;">Сейсмические показатели:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                  ${
                    props.h !== undefined
                      ? `<div><strong>H:</strong> ${Number(props.h).toFixed(
                          2
                        )}</div>`
                      : ""
                  }
                  ${
                    props.v !== undefined
                      ? `<div><strong>V:</strong> ${Number(props.v).toFixed(
                          2
                        )}</div>`
                      : ""
                  }
                  ${
                    props.e !== undefined
                      ? `<div><strong>E:</strong> ${Number(props.e).toFixed(
                          2
                        )}</div>`
                      : ""
                  }
                  ${
                    props.risk !== undefined
                      ? `<div><strong>Риск:</strong> ${Number(
                          props.risk
                        ).toFixed(2)}</div>`
                      : ""
                  }
                </div>
              </div>

              <!-- Характеристики здания -->
              <div style="background: #f8f9fa; padding: 6px; border-radius: 4px; margin-bottom: 6px;">
                <div style="font-weight: 600; margin-bottom: 4px; color: #495057;">Характеристики:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
                  ${
                    props.floor !== undefined
                      ? `<div><strong>Этажей:</strong> ${props.floor}</div>`
                      : ""
                  }
                  ${
                    props.area_m2 !== undefined
                      ? `<div><strong>Площадь:</strong> ${Number(
                          props.area_m2
                        ).toFixed(0)} м²</div>`
                      : ""
                  }
                  ${
                    props.is_emergency_building !== undefined
                      ? `<div><strong>Аварийное:</strong> ${
                          props.is_emergency_building ? "Да" : "Нет"
                        }</div>`
                      : ""
                  }
                  ${
                    props.is_passport !== undefined
                      ? `<div><strong>Паспорт:</strong> ${
                          props.is_passport ? "Есть" : "Нет"
                        }</div>`
                      : ""
                  }
                </div>
              </div>

              <!-- Информация о кластере -->
              <div style="background: #e3f2fd; padding: 6px; border-radius: 4px; font-size: 11px;">
                <div style="font-weight: 600; margin-bottom: 4px; color: #1565c0;">Кластер:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  ${
                    props.cluster_id !== undefined
                      ? `<div><strong>ID:</strong> ${props.cluster_id}</div>`
                      : ""
                  }
                  ${
                    props.cluster_label !== undefined
                      ? `<div><strong>Метка:</strong> ${props.cluster_label}</div>`
                      : ""
                  }
                </div>
              </div>
            </div>
          `;

          new maplibregl.Popup({ offset: [0, -10] })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
        }
      });

      // Меняем курсор при наведении на полигоны
      map.on("mouseenter", "buildings-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "buildings-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      // Добавляем события для извлечения данных при изменении области видимости
      map.on("moveend", extractVisibleBuildings);
      map.on("sourcedata", (e) => {
        if (e.sourceId === "building-recommendations" && e.isSourceLoaded) {
          // Небольшая задержка чтобы тайлы успели отрендериться
          setTimeout(extractVisibleBuildings, 300);
        }
      });

      // Первичное извлечение данных после добавления слоёв
      setTimeout(extractVisibleBuildings, 500);

      console.log("✅ Building layers added");
    } catch (error) {
      console.error("❌ Error adding building layers:", error);
    }
  }, [mapLoaded, extractVisibleBuildings]);

  // Обновление слоев при изменении категории или фильтров
  useEffect(() => {
    if (mapLoaded) {
      addBuildingLayers();
    }
  }, [addBuildingLayers, mapLoaded]);

  return (
    <div className="bg-[#d3e2ff] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Карта рекомендаций
        </h3>
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
    </div>
  );
}
