import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";

export default function MapGeoRisk({
  mode,
  setMode,
  selectedDistrict,
  riskLevels,
  infrastructureCategories,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  const [geoStructData, setGeoStructData] = useState(null);
  const geoStructCache = useRef({});
  const riskMap = useRef({
    high: "высокий",
    medium: "средний",
    low: "низкий",
  });

  // === Build MapLibre Filter Expression for Risk Levels ===
  const buildRiskFilter = useCallback(() => {
    const selectedRisks = Object.entries(riskLevels)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => riskMap.current[key]);

    const noneChecked = selectedRisks.length === 0;
    const allChecked = selectedRisks.length === 3;

    if (noneChecked) {
      // Hide everything by using impossible match
      return ["==", ["get", "GRI_class"], "невозможное_значение"];
    } else if (allChecked) {
      // Show everything (no filter)
      return null;
    } else {
      // Show only selected risk levels
      return ["match", ["get", "GRI_class"], selectedRisks, true, false];
    }
  }, [riskLevels]);

  // === Build Combined Filter Query (for API calls only) ===
  const buildQuery = useCallback(() => {
    const params = [];

    // 🏙 District filter (only this is supported by backend)
    if (
      selectedDistrict.length > 0 &&
      !(selectedDistrict.length === 1 && selectedDistrict[0] === "Все районы")
    ) {
      const districts = selectedDistrict
        .filter((d) => d !== "Все районы")
        .map((d) => `${d} район`)
        .join(",");
      params.push(`district=${encodeURIComponent(districts)}`);
    }

    // NOTE: Backend doesn't support GRI_class filtering
    // We filter client-side using MapLibre expressions instead

    // ✅ Always return valid query string with page_size
    return params.length ? `?${params.join("&")}&page_size=5000` : "?page_size=5000";
  }, [selectedDistrict]);

  // === Fetch GeoStruct Data ===
  useEffect(() => {
    const fetchGeoStruct = async () => {
      const query = buildQuery();
      if (geoStructCache.current[query]) {
        setGeoStructData(geoStructCache.current[query]);
        return;
      }

      try {
        const res = await fetch(
          `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/${query}`
        );
        const data = await res.json();

        if (!data?.features?.length) {
          console.warn("⚠️ No features found in geoStructData");
          // Set empty collection instead of returning
          const emptyCollection = { type: "FeatureCollection", features: [] };
          geoStructCache.current[query] = emptyCollection;
          setGeoStructData(emptyCollection);
          return;
        }

        // Normalize categories
        const normalizedFeatures = data.features
          .filter((f) =>
            ["Point", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(
              f.geometry?.type
            )
          )
          .map((f) => {
            const raw = f.properties?.category?.toLowerCase?.() || "";
            if (raw.includes("ополз")) f.properties.category = "оползни";
            else if (raw.includes("разлом")) f.properties.category = "разломы";
            else if (raw.includes("сель")) f.properties.category = "сель";
            return f;
          });

        const cleaned = { ...data, features: normalizedFeatures };
        geoStructCache.current[query] = cleaned;
        setGeoStructData(cleaned);
      } catch (err) {
        console.error("❌ Failed to fetch geoStructData", err);
        const emptyCollection = { type: "FeatureCollection", features: [] };
        geoStructCache.current[query] = emptyCollection;
        setGeoStructData(emptyCollection);
      }
    };

    fetchGeoStruct();
  }, [buildQuery]);

  // === Initialize MapLibre ===
  useEffect(() => {
    if (!mapContainer.current) return;
    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
    const baseUrl = "https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk-tile";

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.886, 43.238],
      zoom: 10,
      pitch: 45,
      antialias: true,
    });

    mapRef.current = map;
    overlayRef.current = new MapboxOverlay({ interleaved: true, layers: [] });
    map.addControl(overlayRef.current);

    map.on("load", () => {
      const queryString = buildQuery();
      const tileUrl = `${baseUrl}/{z}/{x}/{y}.pbf${queryString}`;

      // === GEO-RISK ===
      map.addSource("geoRisk", {
        type: "vector",
        tiles: [tileUrl],
        minzoom: 0,
        maxzoom: 14,
      });

      // Add layer with initial filter
      const initialFilter = buildRiskFilter();
      const layerConfig = {
        id: "geoRisk-fill",
        type: "fill",
        source: "geoRisk",
        "source-layer": "geo_risk",
        paint: {
          "fill-color": [
            "case",
            ["has", "color_GRI"],
            ["get", "color_GRI"],
            "#33a456",
          ],
          "fill-opacity": 0.35,
        },
      };

      // Only add filter if it's not null
      if (initialFilter !== null) {
        layerConfig.filter = initialFilter;
      }

      map.addLayer(layerConfig);

      // === GEOSTRUCT ===
      map.addSource("geoStruct", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Polygons (разломы)
      map.addLayer({
        id: "geoStruct-fault-fill",
        type: "fill",
        source: "geoStruct",
        filter: [
          "all",
          ["any", ["==", ["geometry-type"], "Polygon"], ["==", ["geometry-type"], "MultiPolygon"]],
          ["==", ["get", "category"], "разломы"],
        ],
        paint: {
          "fill-color": "#ff9966",
          "fill-opacity": 0.45,
          "fill-outline-color": "#cc5500",
        },
        layout: { visibility: "visible" },
      });

      // Lines
      map.addLayer({
        id: "geoStruct-line",
        type: "line",
        source: "geoStruct",
        filter: [
          "all",
          ["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "MultiLineString"]],
          ["match", ["get", "category"], ["сель", "оползни", "разломы"], true, false],
        ],
        paint: {
          "line-color": [
            "match",
            ["get", "category"],
            "сель", "#0077ff",
            "разломы", "#ff6600",
            "оползни", "#cf8805",
            "#777",
          ],
          "line-width": 2,
        },
        layout: { visibility: "visible" },
      });

      // Points (оползни)
      map.addLayer({
        id: "geoStruct-point",
        type: "circle",
        source: "geoStruct",
        filter: [
          "all",
          ["==", ["geometry-type"], "Point"],
          ["match", ["get", "category"], ["оползни"], true, false],
        ],
        paint: {
          "circle-radius": 6,
          "circle-color": "#cf8805",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
        layout: { visibility: "visible" },
      });
    });

    // Cleanup on unmount
    return () => {
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Update GeoRisk tiles when district changes ===
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const baseUrl = "https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk-tile";
    const tileUrl = `${baseUrl}/{z}/{x}/{y}.pbf${buildQuery()}`;

    const updateTiles = () => {
      if (!map.isStyleLoaded()) {
        map.once("styledata", updateTiles);
        return;
      }

      // Remove existing layer and source if they exist
      if (map.getLayer("geoRisk-fill")) {
        map.removeLayer("geoRisk-fill");
      }
      if (map.getSource("geoRisk")) {
        map.removeSource("geoRisk");
      }

      map.addSource("geoRisk", {
        type: "vector",
        tiles: [tileUrl],
        minzoom: 0,
        maxzoom: 14,
      });

      // Always keep it under other layers
      const beforeLayer = map.getLayer("geoStruct-fault-fill")
        ? "geoStruct-fault-fill"
        : undefined;

      // Apply current risk filter
      const riskFilter = buildRiskFilter();
      const layerConfig = {
        id: "geoRisk-fill",
        type: "fill",
        source: "geoRisk",
        "source-layer": "geo_risk",
        paint: {
          "fill-color": [
            "case",
            ["has", "color_GRI"],
            ["get", "color_GRI"],
            "#33a456",
          ],
          "fill-opacity": 0.35,
        },
      };

      // Only add filter if it's not null
      if (riskFilter !== null) {
        layerConfig.filter = riskFilter;
      }

      map.addLayer(layerConfig, beforeLayer);
    };

    if (map.isStyleLoaded()) updateTiles();
    else map.once("styledata", updateTiles);
  }, [selectedDistrict, riskLevels, buildQuery, buildRiskFilter]);

  // === Update GeoStruct Data ===
  useEffect(() => {
    if (!mapRef.current || !geoStructData) return;
    const src = mapRef.current.getSource("geoStruct");
    if (src) src.setData(geoStructData);
  }, [geoStructData]);

  // === Dynamic Category Filtering - FIXED ===
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const setVisibility = (layerId, visible) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    };

    // Check if any infrastructure categories are selected
    const noneInfraChecked = Object.values(infrastructureCategories).every(v => !v);

    // If NONE are checked, hide everything
    if (noneInfraChecked) {
      setVisibility("geoStruct-line", false);
      setVisibility("geoStruct-fault-fill", false);
      setVisibility("geoStruct-point", false);
      return;
    }

    // Build active categories list
    const activeLineCategories = [];
    if (infrastructureCategories.mudflowPaths) activeLineCategories.push("сель");
    if (infrastructureCategories.landslides) activeLineCategories.push("оползни");
    if (infrastructureCategories.tectonicFaults) activeLineCategories.push("разломы");

    // Update line layer
    if (map.getLayer("geoStruct-line") && activeLineCategories.length > 0) {
      map.setFilter("geoStruct-line", [
        "all",
        ["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "MultiLineString"]],
        ["match", ["get", "category"], activeLineCategories, true, false],
      ]);
      setVisibility("geoStruct-line", true);
    } else {
      setVisibility("geoStruct-line", false);
    }

    // Update fault polygons (разломы)
    setVisibility(
      "geoStruct-fault-fill",
      infrastructureCategories.tectonicFaults === true
    );

    // Update points (оползни)
    if (map.getLayer("geoStruct-point")) {
      setVisibility("geoStruct-point", infrastructureCategories.landslides === true);
    }
  }, [infrastructureCategories]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
        {/* Risk Levels Legend */}
        <div className="mb-3">
          <h4 className="font-semibold text-xs mb-2 text-gray-900">Уровень риска</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-3 rounded" style={{ backgroundColor: '#eb5a3a', opacity: 0.35 }}></div>
              <span className="text-xs text-gray-700">Высокий</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-3 rounded" style={{ backgroundColor: '#fca85e', opacity: 0.35 }}></div>
              <span className="text-xs text-gray-700">Средний</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-3 rounded" style={{ backgroundColor: '#66bd63', opacity: 0.35 }}></div>
              <span className="text-xs text-gray-700">Низкий</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Categories Legend */}
        <div className="pt-3 border-t border-gray-200">
          <h4 className="font-semibold text-xs mb-2 text-gray-900">Геоструктуры</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5">
                <div className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: '#cf8805' }}></div>
              </div>
              <span className="text-xs text-gray-700">Оползни (точки/линии)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: '#ff9966', opacity: 0.45, border: '1px solid #cc5500' }}></div>
              </div>
              <span className="text-xs text-gray-700">Разломы (полигоны/линии)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-0.5 rounded" style={{ backgroundColor: '#0077ff' }}></div>
              <span className="text-xs text-gray-700">Селевые пути (линии)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}