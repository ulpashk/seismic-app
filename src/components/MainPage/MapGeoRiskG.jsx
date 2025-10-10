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
  const geoRiskCache = useRef({});
  const geoStructCache = useRef({});
  const riskMap = useRef({
    high: "высокий",
    medium: "средний",
    low: "низкий",
  });

  // === Build Combined Filter Query ===
  const buildQuery = useCallback(() => {
    const params = [];

    // 🏙 District filter
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

    // ⚠️ Risk level filter
    const selectedRisks = Object.entries(riskLevels)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => riskMap.current[key]);

    if (selectedRisks.length > 0) {
      params.push(`GRI_class=${encodeURIComponent(selectedRisks.join(","))}`);
    } else {
      // ✅ Default: all risk levels if none selected
      params.push(`GRI_class=${encodeURIComponent("высокий,средний,низкий")}`);
    }

    // ✅ Always return valid query string
    return params.length ? `?${params.join("&")}` : "?page_size=5000";
  }, [selectedDistrict, riskLevels]);

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
          `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/${query}&page_size=5000`
        );
        const data = await res.json();

        if (!data?.features?.length) {
          console.warn("⚠️ No features found in geoStructData");
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

      map.addLayer({
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
      });

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
  }, []);

  // === Update GeoRisk tiles safely ===
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

      if (map.getSource("geoRisk")) {
        map.removeLayer("geoRisk-fill");
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

      map.addLayer(
        {
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
        },
        beforeLayer
      );
    };

    if (map.isStyleLoaded()) updateTiles();
    else map.once("styledata", updateTiles);
  }, [selectedDistrict, riskLevels, buildQuery]);

  // === Update GeoStruct Data ===
  useEffect(() => {
    if (!mapRef.current || !geoStructData) return;
    const src = mapRef.current.getSource("geoStruct");
    if (src) src.setData(geoStructData);
  }, [geoStructData]);

  // === Dynamic Category Filtering ===
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const setVisibility = (layerId, visible) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    };

    const activeLineCategories = [];
    if (infrastructureCategories.mudflowPaths) activeLineCategories.push("сель");
    if (infrastructureCategories.landslides) activeLineCategories.push("оползни");
    if (infrastructureCategories.tectonicFaults) activeLineCategories.push("разломы");

    const allCategories = ["сель", "оползни", "разломы"];
    const finalCategories =
      activeLineCategories.length > 0 ? activeLineCategories : allCategories;

    if (map.getLayer("geoStruct-line")) {
      map.setFilter("geoStruct-line", [
        "all",
        ["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "MultiLineString"]],
        ["match", ["get", "category"], finalCategories, true, false],
      ]);
      setVisibility("geoStruct-line", true);
    }

    setVisibility(
      "geoStruct-fault-fill",
      infrastructureCategories.tectonicFaults ?? true
    );

    const showPoints = infrastructureCategories.landslides ?? true;
    if (map.getLayer("geoStruct-point")) {
      map.setFilter("geoStruct-point", [
        "match",
        ["get", "category"],
        ["оползни"],
        true,
        false,
      ]);
      setVisibility("geoStruct-point", showPoints);
    }
  }, [infrastructureCategories]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
