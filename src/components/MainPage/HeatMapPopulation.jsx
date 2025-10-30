// import { useEffect, useRef, useState } from "react";
// import maplibregl from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css";

// export default function HeatMapPopulation() {
//   console.log("🚀 HeatMapPopulation component rendered/mounted");

//   const mapContainer = useRef(null);
//   const mapRef = useRef(null);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [error, setError] = useState(null);

//   console.log("📊 HeatMapPopulation state:", { mapLoaded, error });

//   // --- 1) Init map ---
//   useEffect(() => {
//     console.log("🗺️ HeatMapPopulation useEffect for map init triggered");
//     console.log("📍 mapContainer.current:", mapContainer.current);
//     console.log("📍 mapRef.current:", mapRef.current);

//     if (!mapContainer.current || mapRef.current) {
//       console.log("❌ Exiting early - container missing or map already exists");
//       return;
//     }

//     console.log("✅ Proceeding with map initialization...");

//     const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";

//     try {
//       const map = new maplibregl.Map({
//         container: mapContainer.current,
//         style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
//         center: [76.906, 43.198],
//         zoom: 11,
//         pitch: 0,
//         bearing: 0,
//         antialias: true,
//       });

//       mapRef.current = map;

//       map.addControl(new maplibregl.NavigationControl(), "top-right");

//       const onLoad = () => {
//         console.log("🗺️ Heat Map loaded event fired");
//         setMapLoaded(true);
//       };

//       const onError = (e) => {
//         console.error("Map error:", e);
//         setError("Ошибка загрузки карты");
//       };

//       map.on("load", onLoad);
//       map.on("error", onError);

//       // cleanup for map instance
//       return () => {
//         if (mapRef.current) {
//           map.off("load", onLoad);
//           map.off("error", onError);
//           mapRef.current.remove();
//           mapRef.current = null;
//         }
//       };
//     } catch (err) {
//       console.error("Map initialization error:", err);
//       setError("Ошибка инициализации карты");
//     }
//   }, []);

//   // --- 2) Add population vector tiles + layers ---
//   useEffect(() => {
//     if (!mapRef.current || !mapLoaded) return;

//     const map = mapRef.current;

//     const tileUrl =
//       "https://admin.smartalmaty.kz/api/v1/address/postgis/populated-geo-risk-tile/{z}/{x}/{y}.pbf";
//     const sourceId = "population";
//     const sourceLayer = "populated_geo_risk"; // проверь точное имя слоя из вашего backend-стиля

//     console.log("🗺️ Adding population heat map tiles with URL:", tileUrl);
//     console.log("🗺️ Current map zoom:", map.getZoom());
//     console.log("🗺️ Current map center:", map.getCenter());

//     // Optional: тест одного тайла для быстрой диагностики
//     const testTileUrl =
//       "https://admin.smartalmaty.kz/api/v1/address/postgis/populated-geo-risk-tile/11/1347/671.pbf";
//     fetch(testTileUrl)
//       .then((response) => {
//         console.log(
//           "🧪 Test tile response:",
//           response.status,
//           response.statusText
//         );
//         if (!response.ok)
//           console.error("❌ Test tile failed:", response.status);
//         else console.log("✅ Test tile successful");
//       })
//       .catch((err) => console.error("❌ Test tile fetch error:", err));

//     // Helpers: remove layers/source if exist
//     const safeRemoveLayer = (id) => {
//       if (map.getLayer(id)) {
//         map.removeLayer(id);
//       }
//     };
//     const safeRemoveSource = (id) => {
//       if (map.getSource(id)) {
//         map.removeSource(id);
//       }
//     };

//     const addTilesAndLayers = () => {
//       if (!map.isStyleLoaded()) {
//         console.log("⏳ Style not ready for tiles, retrying...");
//         setTimeout(addTilesAndLayers, 100);
//         return;
//       }

//       try {
//         // Clean old layers/sources
//         safeRemoveLayer("population-points");
//         safeRemoveLayer("population-heatmap");
//         safeRemoveLayer("population-circles");
//         safeRemoveLayer("population-stroke");
//         safeRemoveLayer("population-fill");
//         safeRemoveSource(sourceId);

//         // Add vector source
//         map.addSource(sourceId, {
//           type: "vector",
//           tiles: [tileUrl],
//           minzoom: 0,
//           maxzoom: 14,
//         });
//         console.log("✅ Population source added");

//         // Heatmap layer
//         map.addLayer({
//           id: "population-heatmap",
//           type: "heatmap",
//           source: sourceId,
//           "source-layer": sourceLayer,
//           maxzoom: 15,
//           paint: {
//             "heatmap-weight": [
//               "interpolate",
//               ["linear"],
//               ["get", "total_population"],
//               1,
//               0.1,
//               10,
//               0.3,
//               25,
//               0.6,
//               50,
//               0.8,
//               100,
//               1.0,
//             ],
//             "heatmap-intensity": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               0,
//               1,
//               15,
//               3,
//             ],
//             "heatmap-color": [
//               "interpolate",
//               ["linear"],
//               ["heatmap-density"],
//               0,
//               "rgba(0,0,255,0)",
//               0.1,
//               "#00bfff",
//               0.3,
//               "#00ff00",
//               0.5,
//               "#ffff00",
//               0.7,
//               "#ff8000",
//               0.9,
//               "#ff0000",
//               1,
//               "#800000",
//             ],
//             "heatmap-radius": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               0,
//               2,
//               9,
//               10,
//               15,
//               20,
//             ],
//             // ВАЖНО: без лишнего "interpolate"
//             "heatmap-opacity": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               7,
//               1,
//               14,
//               1,
//               15,
//               0,
//             ],
//           },
//         });

//         // Circle layer for high zoom (points)
//         map.addLayer({
//           id: "population-points",
//           type: "circle",
//           source: sourceId,
//           "source-layer": sourceLayer,
//           minzoom: 13,
//           paint: {
//             "circle-radius": [
//               "interpolate",
//               ["linear"],
//               ["get", "total_population"],
//               1,
//               2,
//               10,
//               4,
//               25,
//               6,
//               50,
//               8,
//               100,
//               10,
//             ],
//             "circle-color": [
//               "interpolate",
//               ["linear"],
//               ["get", "total_population"],
//               1,
//               "#fef3c7", // ~1-10
//               10,
//               "#86efac", // 10-25
//               25,
//               "#16a34a", // 25+
//               50,
//               "#15803d",
//               100,
//               "#166534",
//             ],
//             "circle-stroke-width": 0.5,
//             "circle-stroke-color": "#4b5563",
//             "circle-opacity": 0.9,
//           },
//         });

//         console.log("✅ Population layers added successfully");

//         // Diagnostics once style+tiles settle
//         const onIdle = () => {
//           try {
//             const features = map.querySourceFeatures(sourceId, {
//               sourceLayer,
//             });
//             console.log("🔍 Available features count:", features.length);

//             if (features.length > 0) {
//               const sample = features.slice(0, 100);
//               const populationValues = sample
//                 .map((f) => f.properties?.total_population)
//                 .filter(
//                   (v) =>
//                     v !== null && v !== undefined && Number.isFinite(Number(v))
//                 )
//                 .map(Number);

//               if (populationValues.length > 0) {
//                 const min = Math.min(...populationValues);
//                 const max = Math.max(...populationValues);
//                 const avg =
//                   populationValues.reduce((a, b) => a + b, 0) /
//                   populationValues.length;

//                 console.log("🔍 Min population:", min);
//                 console.log("🔍 Max population:", max);
//                 console.log("🔍 Avg population:", avg.toFixed(2));
//               }

//               // Try to fit bounds if points
//               const bounds = new maplibregl.LngLatBounds();
//               let hasPoint = false;
//               sample.forEach((f) => {
//                 if (
//                   f.geometry?.type === "Point" &&
//                   Array.isArray(f.geometry.coordinates)
//                 ) {
//                   bounds.extend(f.geometry.coordinates);
//                   hasPoint = true;
//                 }
//               });
//               if (hasPoint && !bounds.isEmpty()) {
//                 console.log("🔍 Fitting map to points bounds");
//                 map.fitBounds(bounds, { padding: 50 });
//               }
//             } else {
//               console.log("❌ No features found in source-layer:", sourceLayer);
//             }

//             console.log(
//               "🔍 All map layers:",
//               map.getStyle().layers.map((l) => l.id)
//             );
//             console.log(
//               "🔍 Population heatmap layer exists:",
//               !!map.getLayer("population-heatmap")
//             );
//             console.log(
//               "🔍 Population points layer exists:",
//               !!map.getLayer("population-points")
//             );
//             console.log(
//               "🔍 Population source exists:",
//               !!map.getSource(sourceId)
//             );
//           } catch (diagErr) {
//             console.warn("Diagnostics error:", diagErr);
//           } finally {
//             map.off("idle", onIdle);
//           }
//         };
//         map.on("idle", onIdle);
//       } catch (err) {
//         console.error("Error adding population tiles:", err);
//         setError("Ошибка загрузки данных населения");
//       }
//     };

//     addTilesAndLayers();

//     // Popups for points
//     const onClickPoint = (e) => {
//       if (!e.features || e.features.length === 0) return;
//       const props = e.features[0].properties || {};
//       new maplibregl.Popup()
//         .setLngLat(e.lngLat)
//         .setHTML(
//           `
//             <div style="padding: 8px;">
//               <h3 style="margin: 0 0 8px 0; font-weight: bold;">Плотность населения</h3>
//               <p style="margin: 4px 0;"><strong>Население:</strong> ${
//                 props.total_population ?? "N/A"
//               } чел.</p>
//               <p style="margin: 4px 0;"><strong>Координаты:</strong> ${e.lngLat.lng.toFixed(
//                 6
//               )}, ${e.lngLat.lat.toFixed(6)}</p>
//             </div>
//           `
//         )
//         .addTo(map);
//     };
//     const onEnterPoint = () => (map.getCanvas().style.cursor = "pointer");
//     const onLeavePoint = () => (map.getCanvas().style.cursor = "");

//     map.on("click", "population-points", onClickPoint);
//     map.on("mouseenter", "population-points", onEnterPoint);
//     map.on("mouseleave", "population-points", onLeavePoint);

//     // Source-level diagnostics
//     const onSourceData = (e) => {
//       if (e.sourceId === sourceId) {
//         console.log("📊 Population source data event:", e);
//         if (e.isSourceLoaded) console.log("✅ Population source fully loaded");
//       }
//     };
//     const onAnyError = (e) =>
//       console.error("❌ Map error (possibly tiles):", e);

//     map.on("sourcedata", onSourceData);
//     map.on("error", onAnyError);

//     // Cleanup for this effect
//     return () => {
//       try {
//         map.off("click", "population-points", onClickPoint);
//         map.off("mouseenter", "population-points", onEnterPoint);
//         map.off("mouseleave", "population-points", onLeavePoint);
//         map.off("sourcedata", onSourceData);
//         map.off("error", onAnyError);

//         safeRemoveLayer("population-points");
//         safeRemoveLayer("population-heatmap");
//         safeRemoveLayer("population-circles");
//         safeRemoveLayer("population-stroke");
//         safeRemoveLayer("population-fill");
//         safeRemoveSource(sourceId);
//       } catch (cleanupErr) {
//         console.warn("Cleanup error:", cleanupErr);
//       }
//     };
//   }, [mapLoaded]);

//   if (error) {
//     console.log("❌ HeatMapPopulation showing error state:", error);
//     return (
//       <div className="relative w-full h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-red-600 mb-2">
//             Ошибка загрузки
//           </h2>
//           <p className="text-gray-500">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   console.log("🎯 HeatMapPopulation rendering main component");

//   return (
//     <div className="relative w-full h-screen">
//       {/* Map Container */}
//       <div ref={mapContainer} className="w-full h-full" />

//       {/* Legend */}
//       <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-lg rounded-xl p-4 shadow-2xl z-10 border border-gray-200">
//         <h4 className="text-gray-900 font-semibold mb-3 text-sm">
//           Плотность населения
//         </h4>

//         {/* Heatmap gradient */}
//         <div className="space-y-3">
//           <div>
//             <div className="text-xs text-gray-600 mb-1">Тепловая карта:</div>
//             <div className="flex items-center gap-1">
//               <div
//                 className="w-16 h-3 rounded"
//                 style={{
//                   background:
//                     "linear-gradient(to right, rgba(33,102,172,0.3), rgb(103,169,207), rgb(209,229,240), rgb(253,219,199), rgb(239,138,98), rgb(178,24,43), rgb(103,0,31))",
//                 }}
//               ></div>
//             </div>
//             <div className="flex justify-between text-xs text-gray-500 mt-1">
//               <span>Низкая</span>
//               <span>Высокая</span>
//             </div>
//           </div>

//           {/* Point symbols for high zoom */}
//           <div>
//             <div className="text-xs text-gray-600 mb-1">При увеличении:</div>
//             <div className="space-y-1">
//               <div className="flex items-center gap-2 text-xs">
//                 <div className="w-2 h-2 rounded-full bg-yellow-200 border border-gray-400"></div>
//                 <span className="text-gray-700">1-10 чел.</span>
//               </div>
//               <div className="flex items-center gap-2 text-xs">
//                 <div className="w-3 h-3 rounded-full bg-green-300 border border-gray-400"></div>
//                 <span className="text-gray-700">10-25 чел.</span>
//               </div>
//               <div className="flex items-center gap-2 text-xs">
//                 <div className="w-4 h-4 rounded-full bg-green-600 border border-gray-400"></div>
//                 <span className="text-gray-700">25+ чел.</span>
//               </div>
//             </div>
//           </div>

//           <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
//             Приблизьте карту для детального просмотра
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function HeatMapPopulation() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  // ── Конфиг ───────────────────────────────────────────────────────────────────
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
  const VECTOR_TILES =
    "https://admin.smartalmaty.kz/api/v1/address/postgis/populated-geo-risk-tile/{z}/{x}/{y}.pbf";
  const SOURCE_ID = "population";
  const SOURCE_LAYER = "populated_geo_risk"; // проверь точное имя
  const HEAT_ID = "population-heatmap";
  const POINTS_ID = "population-points";

  // «Прореживание»: берём только те фичи, где (value % MOD) === 0
  // Увеличивай MOD, если всё ещё «ковёр»
  const MOD = 6; // 4–10 обычно ок
  const SAMPLE_FIELD = "total_population"; // лучше заменить на стабильный id/gid

  // ── init map ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
        center: [76.906, 43.198],
        zoom: 11,
        antialias: true,
      });
      map.addControl(new maplibregl.NavigationControl(), "top-right");
      mapRef.current = map;

      const onLoad = () => setMapLoaded(true);
      const onError = (e) => {
        console.error("Map error:", e);
        setError("Ошибка загрузки карты");
      };

      map.on("load", onLoad);
      map.on("error", onError);

      return () => {
        map.off("load", onLoad);
        map.off("error", onError);
        map.remove();
        mapRef.current = null;
      };
    } catch (e) {
      console.error("Map init failed:", e);
      setError("Ошибка инициализации карты");
    }
  }, []);

  // ── layers ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const safeRemoveLayer = (id) => map.getLayer(id) && map.removeLayer(id);
    const safeRemoveSource = (id) => map.getSource(id) && map.removeSource(id);

    const add = () => {
      if (!map.isStyleLoaded()) {
        setTimeout(add, 100);
        return;
      }

      // cleanup
      safeRemoveLayer(POINTS_ID);
      safeRemoveLayer(HEAT_ID);
      safeRemoveSource(SOURCE_ID);

      // vector source
      map.addSource(SOURCE_ID, {
        type: "vector",
        tiles: [VECTOR_TILES],
        minzoom: 0,
        maxzoom: 14,
      });

      // HEATMAP по векторному источнику
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

      // выборка (даунсэмпл) по модулю значения поля
      map.setFilter(HEAT_ID, [
        "all",
        [">", ["to-number", ["get", SAMPLE_FIELD], 0], 0],
        ["==", ["%", ["to-number", ["get", SAMPLE_FIELD], 0], MOD], 0],
      ]);

      // POINTS для крупного масштаба
      map.addLayer({
        id: POINTS_ID,
        type: "circle",
        source: SOURCE_ID,
        "source-layer": SOURCE_LAYER,
        minzoom: 13,
        paint: {
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 1],
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

      // такой же фильтр для точек (тот же даунсэмпл)
      map.setFilter(POINTS_ID, [
        "all",
        [">", ["to-number", ["get", SAMPLE_FIELD], 0], 0],
        ["==", ["%", ["to-number", ["get", SAMPLE_FIELD], 0], MOD], 0],
      ]);
    };

    add();

    return () => {
      safeRemoveLayer(POINTS_ID);
      safeRemoveLayer(HEAT_ID);
      safeRemoveSource(SOURCE_ID);
    };
  }, [mapLoaded]);

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
            Приблизьте карту для точек
          </div>
        </div>
      </div>
    </div>
  );
}
