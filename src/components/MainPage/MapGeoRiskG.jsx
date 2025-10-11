import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { Search, Layers, AlertTriangle, MapPin, X, ChevronDown, Filter, Eye, EyeOff } from "lucide-react";

export default function GeoRiskMapDashboard() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // State management
  const [geoData, setGeoData] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("filters");
  const [mapStyle, setMapStyle] = useState("basic");
  
  // Filter states
  const [filters, setFilters] = useState({
    districts: [],
    riskLevels: {
      high: true,
      medium: true,
      low: true
    },
    categories: {
      mudflow: true,
      landslide: true,
      fault: true
    }
  });

  const [stats, setStats] = useState({
    totalAreas: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });

  // Available districts
  const districts = [
    "Алатауский", "Алмалинский", "Ауэзовский", "Бостандыкский",
    "Жетысуский", "Медеуский", "Наурызбайский", "Турксибский"
  ];

  const riskLabelMap = {
    high: "высокий",
    medium: "средний",
    low: "низкий"
  };

  const categoryLabelMap = {
    mudflow: "сель",
    landslide: "оползни",
    fault: "разломы"
  };

  // Build API query
  const buildQuery = useCallback(() => {
    const params = [];

    // Districts
    if (filters.districts.length > 0) {
      const districtList = filters.districts.map(d => `${d} район`).join(",");
      params.push(`district=${encodeURIComponent(districtList)}`);
    }

    // Risk levels
    const selectedRisks = Object.entries(filters.riskLevels)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => riskLabelMap[key]);

    const allRisks = Object.values(filters.riskLevels).every(v => v);
    const noRisks = Object.values(filters.riskLevels).every(v => !v);

    if (noRisks) {
      params.push(`GRI_class=${encodeURIComponent("_none_")}`);
    } else if (!allRisks && selectedRisks.length > 0) {
      params.push(`GRI_class=${encodeURIComponent(selectedRisks.join(","))}`);
    }

    return params.length ? `?${params.join("&")}&page_size=5000` : "?page_size=5000";
  }, [filters.districts, filters.riskLevels]);

  // Fetch geo data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = buildQuery();
        const res = await fetch(
          `http://localhost:8000/api/v1/address/clickhouse/geostructures/${query}`
        );
        const data = await res.json();

        if (data?.features) {
          const normalized = data.features
            .filter(f => ["Point", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(f.geometry?.type))
            .map(f => {
              const raw = f.properties?.category?.toLowerCase?.() || "";
              if (raw.includes("ополз")) f.properties.category = "оползни";
              else if (raw.includes("разлом")) f.properties.category = "разломы";
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
          console.log("✅ Loaded geostructures:", normalized.length, "features");
          console.log("📊 Categories:", categoryCounts);
          console.log("📐 Geometry types:", geometryTypes);

          // Set geoData - THIS WAS MISSING!
          setGeoData({ ...data, features: normalized });
          console.log("💾 geoData state updated");

          // Update stats
          const high = normalized.filter(f => f.properties?.GRI_class === "высокий").length;
          const medium = normalized.filter(f => f.properties?.GRI_class === "средний").length;
          const low = normalized.filter(f => f.properties?.GRI_class === "низкий").length;

          setStats({
            totalAreas: normalized.length,
            highRisk: high,
            mediumRisk: medium,
            lowRisk: low
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
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
      center: [76.886, 43.238],
      zoom: 11,
      pitch: 45,
      bearing: 0,
      antialias: true
    });

    mapRef.current = map;
    overlayRef.current = new MapboxOverlay({ interleaved: true, layers: [] });
    
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      console.log("🗺️ Map loaded event fired");
      setMapLoaded(true);

      map.addControl(overlayRef.current);

      // ========== TILES DISABLED ==========
      // Focusing on geostructures only for now
      console.log("🎯 Tiles disabled - geostructures only mode");

      // GeoStruct layers will be added by the addGeoStructLayers function
      // (This ensures they persist after style changes)

      // Popup handlers disabled (geoRisk layers removed)
      // map.on("click", "geoRisk-fill", (e) => { ... });
      // map.on("mouseenter", "geoRisk-fill", () => { ... });
      // map.on("mouseleave", "geoRisk-fill", () => { ... });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map style (only when user changes it, not on initial load)
  const [initialStyleSet, setInitialStyleSet] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Skip the first run (map already has a style from initialization)
    if (!initialStyleSet) {
      console.log("⏭️ Skipping initial style change");
      setInitialStyleSet(true);
      return;
    }

    console.log("🎨 Changing map style to:", mapStyle);

    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
    const styleUrls = {
      basic: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=${API_KEY}`
    };

    mapRef.current.setStyle(styleUrls[mapStyle]);
  }, [mapStyle, mapLoaded, initialStyleSet]);

  // Add geoStruct layers to map
  const addGeoStructLayers = useCallback((map) => {
    console.log("🏗️ addGeoStructLayers called, styleLoaded:", map.isStyleLoaded());
    if (!map.isStyleLoaded()) {
      console.log("❌ Style not loaded, cannot add layers");
      return false;
    }

    // Add source if it doesn't exist
    const hasSource = !!map.getSource("geoStruct");
    console.log("📦 Source check:", { hasSource });

    if (!hasSource) {
      console.log("➕ Adding geoStruct source");
      map.addSource("geoStruct", {
        type: "geojson",
        data: geoData || { type: "FeatureCollection", features: [] }
      });
    }

    // Add layers if they don't exist
    const hasFaultFill = !!map.getLayer("fault-fill");
    console.log("🔍 Checking fault-fill layer:", hasFaultFill);

    if (!hasFaultFill) {
      console.log("➕ Adding fault-fill layer");
      map.addLayer({
        id: "fault-fill",
        type: "fill",
        source: "geoStruct",
        filter: ["all", ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]], ["==", ["get", "category"], "разломы"]],
        paint: {
          "fill-color": "#ff6b35",
          "fill-opacity": 0.5
        }
      });
    }

    const hasStructLines = !!map.getLayer("struct-lines");
    console.log("🔍 Checking struct-lines layer:", hasStructLines);

    if (!hasStructLines) {
      console.log("➕ Adding struct-lines layer");
      map.addLayer({
        id: "struct-lines",
        type: "line",
        source: "geoStruct",
        filter: ["in", ["geometry-type"], ["literal", ["LineString", "MultiLineString"]]],
        paint: {
          "line-color": [
            "match", ["get", "category"],
            "сель", "#00b4d8",
            "разломы", "#ff6b35",
            "оползни", "#ffa500",
            "#888"
          ],
          "line-width": 3,
          "line-opacity": 0.8
        }
      });
    }

    const hasStructPoints = !!map.getLayer("struct-points");
    console.log("🔍 Checking struct-points layer:", hasStructPoints);

    if (!hasStructPoints) {
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
          "circle-opacity": 0.85
        }
      });
    }

    console.log("🎨 GeoStruct layers added/verified");
    return true;
  }, [geoData]);

  // Update geoStruct data and ensure layers exist
  useEffect(() => {
    console.log("🔍 GeoStruct effect triggered", {
      hasMap: !!mapRef.current,
      hasData: !!geoData,
      mapLoaded,
      featureCount: geoData?.features?.length
    });

    if (!mapRef.current || !geoData || !mapLoaded) {
      console.log("⏸️ Skipping - waiting for:", {
        map: !mapRef.current,
        data: !geoData,
        loaded: !mapLoaded
      });
      return;
    }

    const map = mapRef.current;

    const updateData = () => {
      console.log("⚙️ updateData called, styleLoaded:", map.isStyleLoaded());
      if (!map.isStyleLoaded()) {
        console.log("⏳ Style not loaded, waiting...");
        return;
      }

      // Ensure layers exist (recreate after style change)
      addGeoStructLayers(map);

      const src = map.getSource("geoStruct");
      if (src) {
        console.log("🗺️ Updating geoStruct data, features:", geoData.features?.length);
        src.setData(geoData);

        // Debug: Check layer existence
        ["fault-fill", "struct-lines", "struct-points"].forEach(layerId => {
          if (map.getLayer(layerId)) {
            const visibility = map.getLayoutProperty(layerId, "visibility");
            console.log(`  Layer ${layerId}: ${visibility || "visible"}`);
          } else {
            console.log(`  Layer ${layerId}: NOT FOUND`);
          }
        });

        // Filters will be applied by the visibility effect
        console.log("✅ Data loaded, visibility effect will apply filters");
      } else {
        console.log("❌ geoStruct source not found!");
      }
    };

    if (map.isStyleLoaded()) {
      updateData();
    } else {
      console.log("⏳ Waiting for styledata event...");
      map.once("styledata", updateData);
    }
  }, [geoData, mapLoaded, addGeoStructLayers]);

  // TILES DISABLED - Update tiles when filters change
  // useEffect(() => {
  //   if (!mapRef.current || !mapLoaded) return;
  //   const map = mapRef.current;

  //   const baseUrl = "https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk-tile";
  //   const query = buildQuery();
  //   const tileUrl = `${baseUrl}/{z}/{x}/{y}.pbf${query}`;

  //   const updateTiles = () => {
  //     if (!map.isStyleLoaded()) {
  //       map.once("styledata", updateTiles);
  //       return;
  //     }

  //     if (map.getSource("geoRisk")) {
  //       if (map.getLayer("geoRisk-outline")) map.removeLayer("geoRisk-outline");
  //       if (map.getLayer("geoRisk-fill")) map.removeLayer("geoRisk-fill");
  //       map.removeSource("geoRisk");
  //     }

  //     map.addSource("geoRisk", {
  //       type: "vector",
  //       tiles: [tileUrl],
  //       minzoom: 0,
  //       maxzoom: 14
  //     });

  //     map.addLayer({
  //       id: "geoRisk-fill",
  //       type: "fill",
  //       source: "geoRisk",
  //       "source-layer": "geo_risk",
  //       paint: {
  //         "fill-color": ["case", ["has", "color_GRI"], ["get", "color_GRI"], "#33a456"],
  //         "fill-opacity": 0.45
  //       }
  //     });

  //     map.addLayer({
  //       id: "geoRisk-outline",
  //       type: "line",
  //       source: "geoRisk",
  //       "source-layer": "geo_risk",
  //       paint: {
  //         "line-color": "#ffffff",
  //         "line-width": 1,
  //         "line-opacity": 0.3
  //       }
  //     });
  //   };

  //   updateTiles();
  // }, [filters.districts, filters.riskLevels, buildQuery, mapLoaded]);

  // Update layer visibility and filters
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !geoData) return; // Wait for data to be loaded first
    const map = mapRef.current;

    const updateVisibility = () => {
      console.log("🔧 updateVisibility called, styleLoaded:", map.isStyleLoaded());
      if (!map.isStyleLoaded()) {
        console.log("⏸️ Style not loaded, waiting...");
        return;
      }

      // Make sure layers exist before applying filters
      const hasStructLines = !!map.getLayer("struct-lines");
      const hasStructPoints = !!map.getLayer("struct-points");
      const hasFaultFill = !!map.getLayer("fault-fill");

      console.log("🔍 Layer check:", { hasStructLines, hasStructPoints, hasFaultFill });

      if (!hasStructLines) {
        console.log("⏳ Layers not ready yet, skipping filter update");
        return;
      }

      // Build category filter based on enabled categories
      const enabledCategories = [];
      if (filters.categories.mudflow) enabledCategories.push("сель");
      if (filters.categories.landslide) enabledCategories.push("оползни");
      if (filters.categories.fault) enabledCategories.push("разломы");

      console.log("👁️ Updating filters, enabled categories:", enabledCategories);
      console.log("📋 Current filter state:", filters.categories);

      // Update fault-fill layer (only разломы polygons)
      if (map.getLayer("fault-fill")) {
        if (filters.categories.fault) {
          map.setLayoutProperty("fault-fill", "visibility", "visible");
        } else {
          map.setLayoutProperty("fault-fill", "visibility", "none");
        }
      }

      // Update struct-lines layer (сель, оползні, разломы lines)
      if (map.getLayer("struct-lines")) {
        if (enabledCategories.length > 0) {
          map.setLayoutProperty("struct-lines", "visibility", "visible");
          // Set filter to only show enabled categories
          map.setFilter("struct-lines", [
            "all",
            ["in", ["geometry-type"], ["literal", ["LineString", "MultiLineString"]]],
            ["in", ["get", "category"], ["literal", enabledCategories]]
          ]);
        } else {
          map.setLayoutProperty("struct-lines", "visibility", "none");
        }
      }

      // Update struct-points layer (only оползні points)
      if (map.getLayer("struct-points")) {
        if (filters.categories.landslide) {
          map.setLayoutProperty("struct-points", "visibility", "visible");
          map.setFilter("struct-points", [
            "all",
            ["==", ["geometry-type"], "Point"],
            ["==", ["get", "category"], "оползни"]
          ]);
        } else {
          map.setLayoutProperty("struct-points", "visibility", "none");
        }
      }

      console.log("✅ Filters applied:", {
        "fault-fill": filters.categories.fault ? "visible" : "hidden",
        "struct-lines": enabledCategories.length > 0 ? `visible (${enabledCategories.join(", ")})` : "hidden",
        "struct-points": filters.categories.landslide ? "visible" : "hidden"
      });
    };

    // Use a slight delay to ensure layers are fully ready
    const timeoutId = setTimeout(() => {
      if (map.isStyleLoaded()) {
        updateVisibility();
      } else {
        console.log("⏳ Waiting for styledata event for visibility update...");
        map.once("styledata", updateVisibility);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filters.categories, mapLoaded, geoData]);

  const toggleRiskLevel = (level) => {
    setFilters(prev => ({
      ...prev,
      riskLevels: { ...prev.riskLevels, [level]: !prev.riskLevels[level] }
    }));
  };

  const toggleCategory = (cat) => {
    setFilters(prev => ({
      ...prev,
      categories: { ...prev.categories, [cat]: !prev.categories[cat] }
    }));
  };

  const toggleDistrict = (district) => {
    setFilters(prev => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
    }));
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '100vh' }} />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-900/95 to-transparent p-4 z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Геориски Алматы</h1>
              <p className="text-gray-300 text-sm">Интерактивная карта рисков</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="basic">Базовая</option>
              <option value="streets">Улицы</option>
              <option value="satellite">Спутник</option>
            </select>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className={`absolute top-20 left-4 bottom-4 w-96 bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl transition-transform duration-300 z-20 pointer-events-auto ${isPanelOpen ? "translate-x-0" : "-translate-x-[420px]"}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="absolute -right-10 top-4 bg-gray-800 text-white p-2 rounded-r-lg hover:bg-gray-700 transition-colors"
        >
          {isPanelOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
        </button>

        <div className="flex flex-col h-full p-6 overflow-hidden">

          {/* Tabs */}
          <div className="flex gap-2 mb-4 flex-shrink-0">
            <button
              onClick={() => setActiveTab("filters")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === "filters" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Фильтры
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "filters" && (
              <div className="space-y-6">
                {/* Districts */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Районы</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {districts.map(district => (
                      <label key={district} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.districts.includes(district)}
                          onChange={() => toggleDistrict(district)}
                          className="w-4 h-4 rounded accent-blue-500"
                        />
                        <span className="text-gray-200 text-sm">{district}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Risk Levels */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Уровни риска
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(filters.riskLevels).map(([key, enabled]) => (
                      <label key={key} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleRiskLevel(key)}
                          className="w-5 h-5 rounded accent-blue-500"
                        />
                        <span className={`flex-1 font-medium ${
                          key === "high" ? "text-red-400" :
                          key === "medium" ? "text-yellow-400" :
                          "text-green-400"
                        }`}>
                          {key === "high" ? "Высокий" : key === "medium" ? "Средний" : "Низкий"}
                        </span>
                        {enabled ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                      </label>
                    ))}
                  </div>
                </div>

                
                <div className="space-y-4">
                  <h3 className="text-white font-semibold mb-3">Категории инфраструктуры</h3>
                  <div className="space-y-3">
                    {Object.entries(filters.categories).map(([key, enabled]) => (
                      <label key={key} className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleCategory(key)}
                          className="w-5 h-5 rounded accent-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {key === "mudflow" ? "Селевые потоки" : 
                             key === "landslide" ? "Оползни" : 
                             "Тектонические разломы"}
                          </div>
                          <div className="text-gray-400 text-xs mt-0.5">
                            {categoryLabelMap[key]}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full ${
                          key === "mudflow" ? "bg-blue-400" :
                          key === "landslide" ? "bg-orange-400" :
                          "bg-red-400"
                        }`} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "layers" && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Категории инфраструктуры</h3>
                <div className="space-y-3">
                  {Object.entries(filters.categories).map(([key, enabled]) => (
                    <label key={key} className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleCategory(key)}
                        className="w-5 h-5 rounded accent-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {key === "mudflow" ? "Селевые потоки" : 
                           key === "landslide" ? "Оползни" : 
                           "Тектонические разломы"}
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          {categoryLabelMap[key]}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${
                        key === "mudflow" ? "bg-blue-400" :
                        key === "landslide" ? "bg-orange-400" :
                        "bg-red-400"
                      }`} />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-gray-800/95 backdrop-blur-lg rounded-xl p-4 shadow-2xl z-10 pointer-events-auto">
        <h4 className="text-white font-semibold mb-3 text-sm">Легенда</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-300 text-xs">Высокий риск</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-300 text-xs">Средний риск</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300 text-xs">Низкий риск</span>
          </div>
          <div className="border-t border-gray-700 my-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-blue-400 rounded"></div>
            <span className="text-gray-300 text-xs">Сель</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div>
            <span className="text-gray-300 text-xs">Оползни</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-red-400/50 border border-red-400 rounded"></div>
            <span className="text-gray-300 text-xs">Разломы</span>
          </div>
        </div>
      </div>
    </div>
  );
}