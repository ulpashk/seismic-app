import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import MapLegend from "./MapLegend";

export default function GeoRiskMapDashboard({
  // Constants from parent
  districts,
  districtCoordinates,
  riskLabelMap,
  categoryLabelMap,
  // State from parent
  filters,
  setFilters,
  // Filter handlers from parent
  toggleRiskLevel,
  toggleCategory,
  selectDistrict,
  resetToAllDistricts,
  // Legacy props (for backward compatibility)
  mode,
  setMode,
  selectedDistrict,
  densityLevels,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const isFirstRender = useRef(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geoStructsLoaded, setGeoStructsLoaded] = useState(false);

  // State management
  const [geoData, setGeoData] = useState(null);
  const [mapStyle] = useState("basic");

  const [, setStats] = useState({
    totalAreas: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
  });

  // Build API query
  const buildQuery = useCallback(() => {
    const params = [];

    // Districts
    if (filters.districts.length > 0) {
      const districtList = filters.districts.map((d) => `${d} район`).join(",");
      params.push(`district=${encodeURIComponent(districtList)}`);
    }

    // Risk levels
    const selectedRisks = Object.entries(filters.riskLevels)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => riskLabelMap[key]);

    const allRisks = Object.values(filters.riskLevels).every((v) => v);
    const noRisks = Object.values(filters.riskLevels).every((v) => !v);

    if (noRisks) {
      params.push(`GRI_class=${encodeURIComponent("_none_")}`);
    } else if (!allRisks && selectedRisks.length > 0) {
      params.push(`GRI_class=${encodeURIComponent(selectedRisks.join(","))}`);
    }

    return params.length
      ? `?${params.join("&")}&page_size=5000`
      : "?page_size=5000";
  }, [filters.districts, filters.riskLevels, riskLabelMap]);

  // Fetch geo data with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = buildQuery();
        const cacheKey = `geostructures_${query}`;
        const cacheTimestampKey = `${cacheKey}_timestamp`;
        const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

        // Check cache first
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(cacheTimestampKey);
        const now = Date.now();

        if (cachedData && cachedTimestamp) {
          const age = now - parseInt(cachedTimestamp);
          if (age < CACHE_DURATION) {
            console.log(
              "✅ Loading geostructures from cache (age:",
              Math.round(age / 1000),
              "seconds)"
            );
            const data = JSON.parse(cachedData);

            // Process cached data same way as fresh data
            if (data?.features) {
              const normalized = data.features
                .filter((f) =>
                  [
                    "Point",
                    "LineString",
                    "MultiLineString",
                    "Polygon",
                    "MultiPolygon",
                  ].includes(f.geometry?.type)
                )
                .map((f) => {
                  const raw = f.properties?.category?.toLowerCase?.() || "";
                  if (raw.includes("ополз")) f.properties.category = "оползни";
                  else if (raw.includes("разлом"))
                    f.properties.category = "разломы";
                  else if (raw.includes("сель")) f.properties.category = "сель";
                  return f;
                });

              setGeoData({ ...data, features: normalized });

              const high = normalized.filter(
                (f) => f.properties?.GRI_class === "высокий"
              ).length;
              const medium = normalized.filter(
                (f) => f.properties?.GRI_class === "средний"
              ).length;
              const low = normalized.filter(
                (f) => f.properties?.GRI_class === "низкий"
              ).length;

              setStats({
                totalAreas: normalized.length,
                highRisk: high,
                mediumRisk: medium,
                lowRisk: low,
              });

              console.log(
                "💾 Loaded",
                normalized.length,
                "features from cache"
              );
              return; // Exit early, use cached data
            }
          } else {
            console.log(
              "⏰ Cache expired (age:",
              Math.round(age / 1000),
              "seconds), fetching fresh data"
            );
          }
        }

        // No cache or expired - fetch from API
        console.log("🔄 Fetching fresh geostructures data from API...");
        const res = await fetch(
          `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures${query}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("📦 Raw geostructures response:", data);

        // Cache the response
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(cacheTimestampKey, now.toString());
          console.log("💾 Cached geostructures data for future use");
        } catch (e) {
          console.warn("⚠️ Failed to cache data (localStorage full?):", e);
        }

        if (data?.features) {
          const normalized = data.features
            .filter((f) =>
              [
                "Point",
                "LineString",
                "MultiLineString",
                "Polygon",
                "MultiPolygon",
              ].includes(f.geometry?.type)
            )
            .map((f) => {
              const raw = f.properties?.category?.toLowerCase?.() || "";
              if (raw.includes("ополз")) f.properties.category = "оползни";
              else if (raw.includes("разлом"))
                f.properties.category = "разломы";
              else if (raw.includes("сель")) f.properties.category = "сель";
              return f;
            });

          // Debug: Show category breakdown
          const categoryCounts = normalized.reduce((acc, f) => {
            const cat = f.properties?.category || "unknown";
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {});
          const geometryTypes = normalized.reduce((acc, f) => {
            const type = f.geometry?.type || "unknown";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          console.log(
            "✅ Loaded geostructures:",
            normalized.length,
            "features"
          );
          console.log("📊 Categories:", categoryCounts);
          console.log("📐 Geometry types:", geometryTypes);

          // Set geoData
          setGeoData({ ...data, features: normalized });
          console.log("💾 geoData state updated");

          // Update stats
          const high = normalized.filter(
            (f) => f.properties?.GRI_class === "высокий"
          ).length;
          const medium = normalized.filter(
            (f) => f.properties?.GRI_class === "средний"
          ).length;
          const low = normalized.filter(
            (f) => f.properties?.GRI_class === "низкий"
          ).length;

          setStats({
            totalAreas: normalized.length,
            highRisk: high,
            mediumRisk: medium,
            lowRisk: low,
          });
        } else {
          console.warn("⚠️ No features found in geostructures response");
          setGeoData({ type: "FeatureCollection", features: [] });
        }
      } catch (err) {
        console.error("❌ Failed to fetch geostructures data:", err);
        setGeoData({ type: "FeatureCollection", features: [] });
      }
    };

    fetchData();
  }, [buildQuery]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.906, 43.198],
      zoom: 11,
      pitch: 45,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;
    overlayRef.current = new MapboxOverlay({ interleaved: true, layers: [] });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      console.log("🗺️ Map loaded event fired");
      setMapLoaded(true);
      map.addControl(overlayRef.current);
      console.log(
        "✅ Map initialized, waiting for geostructures to load first"
      );
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

  // Update map style (only when user changes it, not on initial load)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Skip the first run (map already has a style from initialization)
    if (isFirstRender.current) {
      console.log("⏭️ Skipping initial style change");
      isFirstRender.current = false;
      return;
    }

    console.log("🎨 Changing map style to:", mapStyle);

    // Reset geoStructsLoaded flag so layers are recreated in correct order
    setGeoStructsLoaded(false);

    // Reset geo risk layer flag so it gets recreated with new style
    geoRiskLayerCreatedRef.current = false;

    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
    const styleUrls = {
      basic: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`,
    };

    mapRef.current.setStyle(styleUrls[mapStyle]);

    // Layers will be automatically recreated by effects:
    // 1. GeoStructs effect will recreate geoStruct layers
    // 2. Tiles effect will recreate tiles AFTER geoStructs (ensuring correct order)
    console.log(
      "🔄 Style changed, layers will be recreated automatically in correct order"
    );
  }, [mapStyle, mapLoaded, buildQuery]);

  // Add geoStruct layers to map
  const addGeoStructLayers = useCallback(
    (map) => {
      console.log(
        "🏗️ addGeoStructLayers called, styleLoaded:",
        map.isStyleLoaded()
      );
      if (!map.isStyleLoaded()) {
        console.log("❌ Style not loaded, cannot add layers");
        return false;
      }

      // Add source if it doesn't exist
      let hasSource = false;
      try {
        hasSource = !!(map.getSource && map.getSource("geoStruct"));
      } catch (e) {
        console.warn("Error checking source:", e);
      }
      console.log("📦 Source check:", { hasSource });

      if (!hasSource) {
        try {
          console.log("➕ Adding geoStruct source");
          map.addSource("geoStruct", {
            type: "geojson",
            data: geoData || { type: "FeatureCollection", features: [] },
          });
        } catch (e) {
          console.warn("Error adding source:", e);
          return false;
        }
      }

      // Add layers if they don't exist
      let hasFaultFill = false;
      try {
        hasFaultFill = !!(map.getLayer && map.getLayer("fault-fill"));
      } catch (e) {
        console.warn("Error checking fault-fill layer:", e);
      }
      console.log("🔍 Checking fault-fill layer:", hasFaultFill);

      if (!hasFaultFill) {
        try {
          console.log("➕ Adding fault-fill layer");
          map.addLayer({
            id: "fault-fill",
            type: "fill",
            source: "geoStruct",
            filter: [
              "all",
              [
                "in",
                ["geometry-type"],
                ["literal", ["Polygon", "MultiPolygon"]],
              ],
              ["==", ["get", "category"], "разломы"],
            ],
            paint: {
              "fill-color": "#ff6b35",
              "fill-opacity": 0.5,
            },
          });
        } catch (e) {
          console.warn("Error adding fault-fill layer:", e);
        }
      }

      let hasStructLines = false;
      try {
        hasStructLines = !!(map.getLayer && map.getLayer("struct-lines"));
      } catch (e) {
        console.warn("Error checking struct-lines layer:", e);
      }
      console.log("🔍 Checking struct-lines layer:", hasStructLines);

      if (!hasStructLines) {
        try {
          console.log("➕ Adding struct-lines layer");
          map.addLayer({
            id: "struct-lines",
            type: "line",
            source: "geoStruct",
            filter: [
              "in",
              ["geometry-type"],
              ["literal", ["LineString", "MultiLineString"]],
            ],
            paint: {
              "line-color": [
                "match",
                ["get", "category"],
                "сель",
                "#00b4d8",
                "разломы",
                "#ff6b35",
                "оползни",
                "#ffa500",
                "#888",
              ],
              "line-width": 3,
              "line-opacity": 0.8,
            },
          });
        } catch (e) {
          console.warn("Error adding struct-lines layer:", e);
        }
      }

      let hasStructPoints = false;
      try {
        hasStructPoints = !!(map.getLayer && map.getLayer("struct-points"));
      } catch (e) {
        console.warn("Error checking struct-points layer:", e);
      }
      console.log("🔍 Checking struct-points layer:", hasStructPoints);

      if (!hasStructPoints) {
        try {
          console.log("➕ Adding struct-points layer");
          map.addLayer({
            id: "struct-points",
            type: "circle",
            source: "geoStruct",
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
              "circle-radius": 8,
              "circle-color": "#ffa500",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
              "circle-opacity": 0.85,
            },
          });
        } catch (e) {
          console.warn("Error adding struct-points layer:", e);
        }
      }

      console.log("🎨 GeoStruct layers added/verified");
      return true;
    },
    [geoData]
  );

  // Update geoStruct data and ensure layers exist
  useEffect(() => {
    console.log("🔍 GeoStruct effect triggered", {
      hasMap: !!mapRef.current,
      hasData: !!geoData,
      mapLoaded,
      featureCount: geoData?.features?.length,
    });

    if (!mapRef.current || !geoData || !mapLoaded) {
      console.log("⏸️ Skipping - waiting for:", {
        map: !mapRef.current,
        data: !geoData,
        loaded: !mapLoaded,
      });
      return;
    }

    const map = mapRef.current;

    const updateData = () => {
      console.log("⚙️ updateData called, styleLoaded:", map.isStyleLoaded());
      if (!map.isStyleLoaded()) {
        console.log("⏳ Style not ready, scheduling retry...");
        setTimeout(updateData, 100);
        return;
      }

      // Ensure layers exist (recreate after style change)
      const layersCreated = addGeoStructLayers(map);

      let src = null;
      try {
        src = map.getSource && map.getSource("geoStruct");
      } catch (e) {
        console.warn("Error getting geoStruct source:", e);
      }

      if (src) {
        console.log(
          "🗺️ Updating geoStruct data, features:",
          geoData.features?.length
        );
        try {
          src.setData(geoData);
        } catch (e) {
          console.warn("Error setting data on source:", e);
          return;
        }

        // Debug: Check layer existence
        ["fault-fill", "struct-lines", "struct-points"].forEach((layerId) => {
          try {
            if (map.getLayer && map.getLayer(layerId)) {
              const visibility = map.getLayoutProperty(layerId, "visibility");
              console.log(`  Layer ${layerId}: ${visibility || "visible"}`);
            } else {
              console.log(`  Layer ${layerId}: NOT FOUND`);
            }
          } catch (e) {
            console.log(`  Layer ${layerId}: ERROR checking - ${e.message}`);
          }
        });

        // Mark geostructs as loaded so tiles can be added on top
        setGeoStructsLoaded(true);

        // Trigger filter update after layers are created
        if (layersCreated) {
          console.log("🔄 Layers just created, triggering filter update...");
          // Force a small delay to ensure layers are fully initialized
          setTimeout(() => {
            const visibilityEvent = new CustomEvent("layers-ready");
            window.dispatchEvent(visibilityEvent);
          }, 100);
        }

        console.log("✅ GeoStructs loaded, tiles will now be added on top");
      } else {
        console.log("❌ geoStruct source not found!");
      }
    };

    // Use timeout to give the map time to fully initialize
    const timeoutId = setTimeout(updateData, 50);

    return () => clearTimeout(timeoutId);
  }, [geoData, mapLoaded, addGeoStructLayers]);

  // State for geo risk data
  const [geoRiskData, setGeoRiskData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const loadStartTimeRef = useRef(null);
  const geoRiskLayerCreatedRef = useRef(false);

  // STREAMING: Load file and display progressively
  useEffect(() => {
    const loadData = async () => {
      loadStartTimeRef.current = performance.now();
      console.log("⏱️ Starting streaming load from file...");

      const allFeatures = [];
      let displayedCount = 0;
      const CHUNK_SIZE = 500; // Показываем каждые 500 features

      try {
        const response = await fetch("/geo_risk.geojson");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        console.log(
          `📥 Downloaded ${(text.length / 1024 / 1024).toFixed(1)} MB`
        );

        setLoadingMessage("Парсинг данных...");

        // Парсим JSON
        const data = JSON.parse(text);
        console.log(`✅ Parsed ${data.features?.length || 0} features`);

        if (!data.features) {
          throw new Error("No features in file");
        }

        const totalFeatures = data.features.length;

        // Постепенно добавляем features
        for (let i = 0; i < totalFeatures; i += CHUNK_SIZE) {
          const chunk = data.features.slice(i, i + CHUNK_SIZE);
          allFeatures.push(...chunk);

          // Обновляем карту каждые CHUNK_SIZE features
          setGeoRiskData({
            type: "FeatureCollection",
            features: [...allFeatures],
          });

          displayedCount += chunk.length;
          const progress = Math.round((displayedCount / totalFeatures) * 100);
          setLoadingProgress(progress);
          setLoadingMessage(`Отображено: ${displayedCount} / ${totalFeatures}`);

          console.log(
            `📊 Displayed ${displayedCount} / ${totalFeatures} (${progress}%)`
          );

          // Даем браузеру время на рендеринг
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        const totalTime = performance.now() - loadStartTimeRef.current;
        console.log(
          `🎉 Complete! ${totalFeatures} features in ${(
            totalTime / 1000
          ).toFixed(1)}s`
        );

        setLoadingProgress(0);
        setLoadingMessage("");
      } catch (error) {
        console.error("❌ Error:", error);
        setGeoRiskData({ type: "FeatureCollection", features: [] });
        setLoadingMessage("Ошибка загрузки");
      }
    };

    loadData();
  }, []);

  // Apply filters to geo risk data - OPTIMIZED
  const getFilteredGeoRiskData = useCallback(() => {
    if (!geoRiskData) return { type: "FeatureCollection", features: [] };

    let filtered = geoRiskData.features;

    // Проверяем нужна ли фильтрация вообще
    const hasDistrictFilter = filters.districts.length > 0;
    const allRisks = Object.values(filters.riskLevels).every((v) => v);
    const noRisks = Object.values(filters.riskLevels).every((v) => !v);

    // Быстрый выход если нет фильтров
    if (!hasDistrictFilter && allRisks) {
      console.log(
        "✅ No filters active, returning all data:",
        filtered.length,
        "features"
      );
      return {
        type: "FeatureCollection",
        features: filtered,
      };
    }

    // Быстрый выход если все риски выключены
    if (noRisks) {
      console.log("⚠️ No risk levels selected, returning empty data");
      return { type: "FeatureCollection", features: [] };
    }

    // Создаем Set для быстрого поиска (O(1) вместо O(n))
    const districtSet = hasDistrictFilter
      ? new Set(filters.districts.map((d) => `${d} район`))
      : null;

    const selectedRisks = !allRisks
      ? new Set(
          Object.entries(filters.riskLevels)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => riskLabelMap[key])
        )
      : null;

    // Одна итерация с множественными проверками
    filtered = filtered.filter((f) => {
      // Проверка района
      if (districtSet && !districtSet.has(f.properties?.district)) {
        return false;
      }
      // Проверка риска
      if (selectedRisks && !selectedRisks.has(f.properties?.GRI_class)) {
        return false;
      }
      return true;
    });

    console.log(
      "🔍 Filtered geo risk data:",
      filtered.length,
      "features (from",
      geoRiskData.features.length,
      "total)"
    );

    return {
      type: "FeatureCollection",
      features: filtered,
    };
  }, [geoRiskData, filters.districts, filters.riskLevels, riskLabelMap]);

  // Add geo risk layer from local GeoJSON AFTER geostructures are loaded
  useEffect(() => {
    // Упрощенный лог для меньшего шума
    if (!mapRef.current || !mapLoaded || !geoStructsLoaded || !geoRiskData) {
      return; // Тихо выходим если условия не выполнены
    }

    // Skip if layer already created (prevent recreation)
    if (geoRiskLayerCreatedRef.current) {
      return; // Тихо выходим если слой уже создан
    }

    // Mark as creating immediately to prevent duplicate calls
    geoRiskLayerCreatedRef.current = true;
    console.log("�️ Creating geo risk layer...");

    const map = mapRef.current;

    const addGeoRiskLayer = () => {
      if (!map.isStyleLoaded()) {
        console.log("⏳ Style not ready for geo risk layer, retrying...");
        setTimeout(addGeoRiskLayer, 100);
        return;
      }

      const renderStart = performance.now();
      console.log("⏱️ [TIMING] Starting geo risk layer rendering...");

      try {
        // Clean up existing layers/sources with safety checks
        const cleanupStart = performance.now();
        if (map.getLayer && map.getLayer("geoRisk-outline")) {
          map.removeLayer("geoRisk-outline");
        }
        if (map.getLayer && map.getLayer("geoRisk-fill")) {
          map.removeLayer("geoRisk-fill");
        }
        if (map.getSource && map.getSource("geoRisk")) {
          map.removeSource("geoRisk");
        }
        const cleanupEnd = performance.now();
        console.log(
          `⏱️ [TIMING] Layer cleanup: ${(cleanupEnd - cleanupStart).toFixed(
            2
          )}ms`
        );
      } catch (e) {
        console.warn("Error during layer cleanup:", e);
      }

      // Get filtered data
      const filterStart = performance.now();
      const filteredData = getFilteredGeoRiskData();
      const filterEnd = performance.now();
      console.log(
        `⏱️ [TIMING] Data filtering: ${(filterEnd - filterStart).toFixed(
          2
        )}ms (${filteredData.features.length} features)`
      );

      // DEBUG: Check data structure
      if (filteredData.features.length > 0) {
        const sample = filteredData.features[0];
        console.log("🗺️ SAMPLE FEATURE TO MAP:", {
          hasGeometry: !!sample.geometry,
          geometryType: sample.geometry?.type,
          hasProperties: !!sample.properties,
          hasColorGRI: !!sample.properties?.color_GRI,
          colorValue: sample.properties?.color_GRI,
          allProps: sample.properties,
        });
      }

      // Add GeoJSON source with AGGRESSIVE performance optimizations
      const sourceStart = performance.now();
      map.addSource("geoRisk", {
        type: "geojson",
        data: filteredData,
        buffer: 0, // No buffer for fastest performance
        tolerance: 2.5, // Более агрессивное упрощение (было 1.5, default 0.375)
        maxzoom: 16, // Generate tiles up to zoom 16
        lineMetrics: false, // Disable if not needed
        generateId: true, // Use auto-generated IDs for better performance
      });
      const sourceEnd = performance.now();
      console.log(
        `⏱️ [TIMING] Source creation: ${(sourceEnd - sourceStart).toFixed(2)}ms`
      );

      // Add tile layer BEFORE the first geoStruct layer (so geostructs render on top)
      const firstGeoStructLayer = map.getLayer("fault-fill")
        ? "fault-fill"
        : map.getLayer("struct-lines")
        ? "struct-lines"
        : map.getLayer("struct-points")
        ? "struct-points"
        : undefined;

      const layerStart = performance.now();
      map.addLayer(
        {
          id: "geoRisk-fill",
          type: "fill",
          source: "geoRisk",
          paint: {
            "fill-color": [
              "case",
              ["has", "color_GRI"],
              ["get", "color_GRI"],
              "#33a456",
            ],
            "fill-opacity": 0.7, // Constant 60% opacity - ALWAYS VISIBLE
          },
          // NO minzoom - visible at ALL zoom levels!
        },
        firstGeoStructLayer
      ); // Insert before first geoStruct layer

      // Add outline layer for better visibility
      map.addLayer(
        {
          id: "geoRisk-outline",
          type: "line",
          source: "geoRisk",
          paint: {
            "line-color": "#ffffff",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              6,
              0.3,
              10,
              0.6,
              14,
              1.0,
              18,
              1.5,
            ],
            "line-opacity": 0.4,
          },
          // NO minzoom - visible at ALL zoom levels!
        },
        firstGeoStructLayer
      );

      const layerEnd = performance.now();
      console.log(
        `⏱️ [TIMING] Layer creation: ${(layerEnd - layerStart).toFixed(2)}ms`
      );

      // Attach popup handlers
      map.on("click", "geoRisk-fill", (e) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties;
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">Геориск</h3>
                <p style="margin: 4px 0;"><strong>Класс риска:</strong> ${
                  props.GRI_class || "N/A"
                }</p>
                <p style="margin: 4px 0;"><strong>Район:</strong> ${
                  props.district || "N/A"
                }</p>
                <p style="margin: 4px 0;"><strong>Население:</strong> ${
                  props.total_population || 0
                }</p>
              </div>
            `
            )
            .addTo(map);
        }
      });

      map.on("mouseenter", "geoRisk-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "geoRisk-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      const renderEnd = performance.now();
      const totalRenderTime = renderEnd - renderStart;
      const totalTime = loadStartTimeRef.current
        ? renderEnd - loadStartTimeRef.current
        : null;

      console.log(
        `✅ Geo risk layer added from local GeoJSON UNDER geostructs`
      );
      console.log(
        `⏱️ [TIMING] Total render time: ${totalRenderTime.toFixed(2)}ms`
      );
      if (totalTime) {
        console.log(
          `⏱️ [TIMING] 🎉 TOTAL TIME (Load + Render): ${totalTime.toFixed(2)}ms`
        );
        console.log(`📊 [PERFORMANCE BREAKDOWN]`);
        console.log(
          `  - File loading: ${loadStartTimeRef.current ? "completed" : "N/A"}`
        );
        console.log(`  - Rendering: ${totalRenderTime.toFixed(2)}ms`);
        console.log(`  - Grand Total: ${totalTime.toFixed(2)}ms`);
      }

      console.log("✅ Layer creation completed successfully");
    };

    const timeoutId = setTimeout(addGeoRiskLayer, 100);

    return () => {
      clearTimeout(timeoutId);
      // Note: We don't reset geoRiskLayerCreatedRef here because
      // the layer should persist until style change or component unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, geoStructsLoaded, geoRiskData]); // Stable dependencies to prevent recreation

  // Update geo risk data when filters change OR when new chunks arrive
  useEffect(() => {
    // Skip if layer hasn't been created yet
    if (
      !geoRiskLayerCreatedRef.current ||
      !mapRef.current ||
      !mapLoaded ||
      !geoRiskData
    ) {
      return; // Тихо выходим
    }

    const map = mapRef.current;

    const updateGeoRiskData = () => {
      if (!map.isStyleLoaded()) {
        setTimeout(updateGeoRiskData, 100);
        return;
      }

      const source = map.getSource("geoRisk");
      if (source) {
        const updateStart = performance.now();

        const filteredData = getFilteredGeoRiskData();
        source.setData(filteredData);

        const updateEnd = performance.now();
        console.log(
          `🔄 Updated map: ${filteredData.features.length} features in ${(
            updateEnd - updateStart
          ).toFixed(0)}ms`
        );
      }
    };

    // Небольшая задержка для batching обновлений (дольше чтобы накопить несколько chunks)
    const timeoutId = setTimeout(updateGeoRiskData, 200);
    return () => clearTimeout(timeoutId);
  }, [
    filters.districts,
    filters.riskLevels,
    mapLoaded,
    geoRiskData,
    getFilteredGeoRiskData,
  ]);

  // Update layer visibility and filters
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !geoData) return;
    const map = mapRef.current;

    const updateVisibility = () => {
      console.log(
        "🔧 updateVisibility called, styleLoaded:",
        map.isStyleLoaded()
      );
      if (!map.isStyleLoaded()) {
        console.log("⏸️ Style not loaded, waiting...");
        return;
      }

      // Make sure layers exist before applying filters
      let hasStructLines, hasStructPoints, hasFaultFill;
      try {
        hasStructLines = !!(map.getLayer && map.getLayer("struct-lines"));
        hasStructPoints = !!(map.getLayer && map.getLayer("struct-points"));
        hasFaultFill = !!(map.getLayer && map.getLayer("fault-fill"));
      } catch (e) {
        console.warn("Error checking layer existence:", e);
        return;
      }

      console.log("🔍 Layer check:", {
        hasStructLines,
        hasStructPoints,
        hasFaultFill,
      });

      if (!hasStructLines || !hasStructPoints || !hasFaultFill) {
        console.log(
          "⏳ Layers not ready yet, will retry when layers-ready event fires"
        );
        return;
      }

      // Build category filter based on enabled categories
      const enabledCategories = [];
      if (filters.categories.mudflow) enabledCategories.push("сель");
      if (filters.categories.landslide) enabledCategories.push("оползни");
      if (filters.categories.fault) enabledCategories.push("разломы");

      console.log(
        "👁️ Updating filters, enabled categories:",
        enabledCategories
      );
      console.log("📋 Current filter state:", filters.categories);

      // Update fault-fill layer (only разломы polygons)
      try {
        if (map.getLayer && map.getLayer("fault-fill")) {
          if (filters.categories.fault) {
            map.setLayoutProperty("fault-fill", "visibility", "visible");
          } else {
            map.setLayoutProperty("fault-fill", "visibility", "none");
          }
        }
      } catch (e) {
        console.warn("Error updating fault-fill layer:", e);
      }

      // Update struct-lines layer (сель, оползні, разломы lines)
      try {
        if (map.getLayer && map.getLayer("struct-lines")) {
          if (enabledCategories.length > 0) {
            map.setLayoutProperty("struct-lines", "visibility", "visible");
            map.setFilter("struct-lines", [
              "all",
              [
                "in",
                ["geometry-type"],
                ["literal", ["LineString", "MultiLineString"]],
              ],
              ["in", ["get", "category"], ["literal", enabledCategories]],
            ]);
          } else {
            map.setLayoutProperty("struct-lines", "visibility", "none");
          }
        }
      } catch (e) {
        console.warn("Error updating struct-lines layer:", e);
      }

      // Update struct-points layer (only оползні points)
      try {
        if (map.getLayer && map.getLayer("struct-points")) {
          if (filters.categories.landslide) {
            map.setLayoutProperty("struct-points", "visibility", "visible");
            map.setFilter("struct-points", [
              "all",
              ["==", ["geometry-type"], "Point"],
              ["==", ["get", "category"], "оползни"],
            ]);
          } else {
            map.setLayoutProperty("struct-points", "visibility", "none");
          }
        }
      } catch (e) {
        console.warn("Error updating struct-points layer:", e);
      }

      console.log("✅ Filters applied:", {
        "fault-fill": filters.categories.fault ? "visible" : "hidden",
        "struct-lines":
          enabledCategories.length > 0
            ? `visible (${enabledCategories.join(", ")})`
            : "hidden",
        "struct-points": filters.categories.landslide ? "visible" : "hidden",
      });
    };

    // Listen for layers-ready event (triggered after layer creation)
    const handleLayersReady = () => {
      console.log("🎉 layers-ready event received");
      updateVisibility();
    };
    window.addEventListener("layers-ready", handleLayersReady);

    // Initial update with delay and retry mechanism
    const attemptUpdate = () => {
      if (map.isStyleLoaded()) {
        updateVisibility();
      } else {
        console.log(
          "⏳ Style not ready for visibility update, scheduling retry..."
        );
        setTimeout(attemptUpdate, 100);
      }
    };

    const timeoutId = setTimeout(attemptUpdate, 150);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("layers-ready", handleLayersReady);
    };
  }, [filters.categories, mapLoaded, geoData]);

  // Auto-fly to districts when filters change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const selectedDistricts = filters.districts;

    if (selectedDistricts.length === 1) {
      // Fly to specific district
      const district = selectedDistricts[0];
      if (districtCoordinates[district]) {
        mapRef.current.flyTo({
          center: districtCoordinates[district],
          zoom: 12,
          duration: 1500,
          essential: true,
        });
      }
    } else if (selectedDistricts.length === 0) {
      // Return to overview when no districts selected
      mapRef.current.flyTo({
        center: [76.906, 43.198],
        zoom: 11,
        duration: 1500,
        essential: true,
      });
    }
  }, [filters.districts, mapLoaded, districtCoordinates]);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: "100vh" }}
      />

      {/* Loading Progress Indicator */}
      {loadingProgress > 0 && loadingProgress < 100 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-6 py-3 z-50">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {loadingMessage}
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapLegend />
    </div>
  );
}
