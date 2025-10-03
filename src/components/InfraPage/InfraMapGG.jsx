"use client"

import { useEffect, useRef, useState, useCallback } from "react" // Added useCallback

const urls = {
  readiness: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/infra-readiness/?page_size=10000",
  repgis: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/rep-gis-infra/?page_size=10000",
  social: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/social-objects/?page_size=10000",
  building: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf",
  seismicSafety: "https://admin.smartalmaty.kz/api/v1/chs/buildings-seismic-safety/?limit=10000",
}

const layerConfigs = {
  readiness: {
    name: "Infrastructure Readiness",
    description: "MultiPolygon data showing infrastructure readiness",
    color: "#3b82f6", // blue
    type: "geojson",
  },
  repgis: {
    name: "Rep GIS Infrastructure",
    description: "MultiPolygon, MultiLineString and Point data",
    color: "#10b981", // green
    type: "geojson",
  },
  social: {
    name: "Social Objects",
    description: "Point data showing social infrastructure",
    color: "#f59e0b", // amber
    type: "geojson",
  },
  building: {
    name: "Building Risk",
    description: "Vector tile of building risks",
    color: "#16a34a", // green
    type: "vector",
    sourceLayer: "building_risk", // must match backend
  },
}

const pointPaintLogic = {
  social: [
    "match",
    ["get", "category"],
    "school", "#2563eb",  // blue
    "pppn", "#16a34a",    // green
    "health", "#dc2626",  // red
    "ddo", "#eab308",     // yellow
    /* default */ "#6b7280" // gray
  ],
  readiness: [
    "step",
    ["get", "IRI"],
    "#e0f2fe",   // lightest blue (IRI < 0.2)
    0.2, "#7dd3fc", // light blue (0.2–0.4)
    0.4, "#3b82f6", // medium blue (0.4–0.6)
    0.6, "#1d4ed8", // deep blue (0.6–0.8)
    0.8, "#111c55ff"  // darkest blue (>= 0.8)
  ],

  repgis: {
    polygon: "#c7a07fff", // brownish fill
    line: "#0ea5e9",      // sky blue
    point: "#9333ea"      // purple
  }
}

const socialLegend = [
  { label: "Школы", color: "#2563eb" },
  { label: "ПППН", color: "#16a34a" },
  { label: "Больницы", color: "#dc2626" },
  { label: "Детские сады", color: "#eab308" },
]

const readinessLegend = [
  { label: "IRI < 0.2", color: "#e0f2fe" },
  { label: "0.2 – 0.4", color: "#7dd3fc" },
  { label: "0.4 – 0.6", color: "#3b82f6" },
  { label: "0.6 – 0.8", color: "#1d4ed8" },
  { label: "≥ 0.8", color: "#0c143d" },
]

export default function InfraMap({
  selectedDistrict,
  enginNodes,
  socialCategories,
  buildingCategories
}) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [activeLayer, setActiveLayer] = useState("building") // Default active base layer
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [maplibreLoaded, setMaplibreLoaded] = useState(false)
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ"

  // 🔹 Build district query string (memoized)
  const buildQuery = useCallback(() => {
    const params = [];
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
    return params.length ? `?${params.join("&")}` : "";
  }, [selectedDistrict]);

  // Load MapLibre GL CSS and JS
  useEffect(() => {
    const cssLink = document.createElement("link")
    cssLink.rel = "stylesheet"
    cssLink.href = "https://unpkg.com/maplibre-gl@4.0.2/dist/maplibre-gl.css"
    document.head.appendChild(cssLink)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/maplibre-gl@4.0.2/dist/maplibre-gl.js"
    script.onload = () => setMaplibreLoaded(true)
    script.onerror = () => setError("Failed to load MapLibre GL JS")
    document.head.appendChild(script)

    return () => {
      if (cssLink.parentNode) cssLink.parentNode.removeChild(cssLink)
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  const buildRepgisUrl = useCallback(() => {
    const base = urls.repgis
    const selected = Object.entries(enginNodes)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name) // тут уже русские названия

    if (selected.length === 0) return base
    return `${base}&cat_name=${selected.join(",")}`
  }, [enginNodes])

  // Helper function to remove or hide all base layers
  const hideBaseLayers = useCallback((exceptLayerKey) => {
    if (!map.current) return;

    const baseLayerIds = {
      "building": "building-fill",
      "readiness": "readiness-fill",
    };

    // Hide all known base layers initially
    Object.keys(baseLayerIds).forEach((key) => {
      const layerId = baseLayerIds[key];
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, "visibility", "none");
      }
    });

    // Hide seismic safety if not the building layer
    if (map.current.getLayer("seismic-safety-fill")) {
      map.current.setLayoutProperty("seismic-safety-fill", "visibility", "none");
    }

    // Make the exception layer visible
    if (exceptLayerKey && baseLayerIds[exceptLayerKey] && map.current.getLayer(baseLayerIds[exceptLayerKey])) {
      map.current.setLayoutProperty(baseLayerIds[exceptLayerKey], "visibility", "visible");
    }

    // Special handling for seismic safety if building is the active base layer
    if (exceptLayerKey === "building" && buildingCategories.seismicSafety && map.current.getLayer("seismic-safety-fill")) {
      map.current.setLayoutProperty("seismic-safety-fill", "visibility", "visible");
    }
  }, [buildingCategories.seismicSafety]);


  const loadSeismicSafetyLayer = useCallback(async () => {
    if (!map.current) return;

    setLoading(true);
    setError(null);

    try {
      const url = urls.seismicSafety;
      const districtQuery = buildQuery();
      const fullUrl = districtQuery ? url + districtQuery : url;

      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (!map.current.getSource("seismic-safety")) {
        map.current.addSource("seismic-safety", {
          type: "geojson",
          data,
        });
      } else {
        map.current.getSource("seismic-safety").setData(data);
      }

      if (!map.current.getLayer("seismic-safety-fill")) {
        map.current.addLayer({
          id: "seismic-safety-fill",
          type: "fill",
          source: "seismic-safety",
          paint: {
            "fill-color": "#d46a6a",
            "fill-opacity": 0.5,
          },
        });
      }

      let filters = ["all"];
      if (buildingCategories.seismicSafety) {
        filters.push(["==", ["get", "is_emergency_building"], true]);
        filters.push(["==", ["get", "seismic_eval"], true]);
      } else {
        // If seismic safety is not active, filter it out completely
        filters.push(["==", "___NONE___", "___NONE___"]);
      }

      map.current.setFilter("seismic-safety-fill", filters);
      // Ensure visibility is managed by activeLayer logic
      if (activeLayer === "building" && buildingCategories.seismicSafety) {
         map.current.setLayoutProperty("seismic-safety-fill", "visibility", "visible");
      } else {
         map.current.setLayoutProperty("seismic-safety-fill", "visibility", "none");
      }

    } catch (err) {
      console.error("Error loading seismic safety layer:", err);
      setError("Failed to load seismic safety data.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, buildingCategories.seismicSafety, activeLayer]);


  const loadBuildingLayer = useCallback(() => {
    if (!map.current) return;

    const config = layerConfigs.building;

    if (!map.current.getSource("building")) {
      map.current.addSource("building", {
        type: "vector",
        tiles: [urls.building],
        minzoom: 0,
        maxzoom: 14,
      });
    }

    if (!map.current.getLayer("building-fill")) {
      map.current.addLayer({
        id: "building-fill",
        type: "fill",
        source: "building",
        "source-layer": config.sourceLayer,
        paint: {
          "fill-color": config.color,
          "fill-opacity": 0.4,
        },
      });
    }

    // ✅ Build filters for building
    let filters = ["all"];

    // 🔹 District filter
    if (selectedDistrict.length > 0 && !selectedDistrict.includes("Все районы")) {
      filters.push([
        "in",
        ["get", "district"],
        ["literal", selectedDistrict.map(d => `${d} район`)], // Ensure district format matches
      ]);
    }

    // 🔹 Building category filters
    if (buildingCategories.highrise) {
      filters.push(["==", ["get", "is_highrise_in_poly"], "True"]);
    }

    // ✅ Apply combined filter
    map.current.setFilter("building-fill", filters);

    // Manage seismic safety layer visibility based on activeLayer and buildingCategories
    if (buildingCategories.seismicSafety) {
      loadSeismicSafetyLayer();
    } else {
      if (map.current.getLayer("seismic-safety-fill")) {
        map.current.setLayoutProperty("seismic-safety-fill", "visibility", "none");
      }
    }

    // Ensure building-fill visibility is managed by activeLayer logic
    if (activeLayer === "building") {
      map.current.setLayoutProperty("building-fill", "visibility", "visible");
    } else {
      map.current.setLayoutProperty("building-fill", "visibility", "none");
    }

  }, [selectedDistrict, buildingCategories, loadSeismicSafetyLayer, activeLayer]); // Added activeLayer


  const loadReadinessLayer = useCallback(async () => {
    if (!map.current) return;

    setLoading(true);
    setError(null);

    try {
      const config = layerConfigs.readiness;
      const url = urls.readiness + buildQuery();

      if (map.current.getSource("readiness")) {
        if (map.current.getLayer("readiness-fill")) map.current.removeLayer("readiness-fill");
        map.current.removeSource("readiness");
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      let geoJsonData;
      if (data.features) {
        geoJsonData = data;
      } else if (data.results) {
        geoJsonData = {
          type: "FeatureCollection",
          features: data.results.map((item) => ({
            type: "Feature",
            geometry: item.geometry || item.geom,
            properties: item.properties || item,
          })),
        };
      } else {
        throw new Error("Invalid data format for readiness");
      }

      map.current.addSource("readiness", { type: "geojson", data: geoJsonData });

      map.current.addLayer({
        id: "readiness-fill",
        type: "fill",
        source: "readiness",
        paint: {
          "fill-color": pointPaintLogic.readiness, // Use specific paint logic for readiness
          "fill-opacity": 0.6,
          "fill-outline-color": config.color,
        },
      });

      // Ensure readiness-fill visibility is managed by activeLayer logic
      if (activeLayer === "readiness") {
        map.current.setLayoutProperty("readiness-fill", "visibility", "visible");
      } else {
        map.current.setLayoutProperty("readiness-fill", "visibility", "none");
      }

      // Optional: fit bounds to readiness data if desired when it's active
      // if (geoJsonData.features.length > 0 && activeLayer === "readiness") {
      //     const bounds = new window.maplibregl.LngLatBounds();
      //     geoJsonData.features.forEach(feature => bounds.extend(feature.geometry.coordinates));
      //     map.current.fitBounds(bounds, { padding: 50 });
      // }


    } catch (err) {
      console.error("Error loading readiness layer:", err);
      setError("Failed to load infrastructure readiness data.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, activeLayer]); // Added activeLayer

  // Generic function to load/manage overlay layers (social, repgis)
  const loadOverlayLayer = useCallback(async (layerKey, customUrl = null) => {
    if (!map.current || !window.maplibregl) return;
    const maplibregl = window.maplibregl;

    setLoading(true);
    setError(null);

    try {
      const config = layerConfigs[layerKey];

      // Remove existing layers if they exist to ensure fresh data/styles
      if (map.current.getSource(layerKey)) {
        if (map.current.getLayer(`${layerKey}-polygons`)) map.current.removeLayer(`${layerKey}-polygons`);
        if (map.current.getLayer(`${layerKey}-lines`)) map.current.removeLayer(`${layerKey}-lines`);
        if (map.current.getLayer(`${layerKey}-points`)) map.current.removeLayer(`${layerKey}-points`);
        map.current.removeSource(layerKey);
      }

      let url = customUrl || urls[layerKey];

      // 🔹 Apply district filtering for GeoJSON overlays
      const districtFilter = buildQuery();
      if (districtFilter) {
        url += url.includes("?") ? `&${districtFilter.slice(1)}` : districtFilter;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      let geoJsonData;
      if (data.features) {
        geoJsonData = data;
      } else if (data.results) {
        geoJsonData = {
          type: "FeatureCollection",
          features: data.results.map((item) => ({
            type: "Feature",
            geometry: item.geometry || item.geom,
            properties: item.properties || item,
          })),
        };
      } else {
        throw new Error("Invalid data format");
      }

      map.current.addSource(layerKey, { type: "geojson", data: geoJsonData });

      // Add layers for polygons, lines, points
      map.current.addLayer({
        id: `${layerKey}-polygons`,
        type: "fill",
        source: layerKey,
        filter: ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]],
        paint: {
          "fill-color": layerKey === "repgis" ? pointPaintLogic.repgis.polygon : pointPaintLogic[layerKey] || config.color,
          "fill-opacity": 0.6,
          "fill-outline-color": config.color,
        },
      });

      map.current.addLayer({
        id: `${layerKey}-lines`,
        type: "line",
        source: layerKey,
        filter: ["in", ["geometry-type"], ["literal", ["LineString", "MultiLineString"]]],
        paint: {
          "line-color":
            layerKey === "repgis"
              ? pointPaintLogic.repgis.line
              : pointPaintLogic[layerKey] || config.color,
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });

      map.current.addLayer({
        id: `${layerKey}-points`,
        type: "circle",
        source: layerKey,
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-color":
            layerKey === "repgis"
              ? pointPaintLogic.repgis.point
              : pointPaintLogic[layerKey] || config.color,
          "circle-radius": 6,
          "circle-opacity": 0.8,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Fit bounds if overlay has features, but don't force it if a base layer is active
      // if (geoJsonData.features.length > 0) {
      //   const bounds = new maplibregl.LngLatBounds()
      //   geoJsonData.features.forEach((feature) => {
      //     if (feature.geometry && feature.geometry.coordinates) {
      //       bounds.extend(feature.geometry.coordinates)
      //     }
      //   })
      //   map.current.fitBounds(bounds, { padding: 50 })
      // }

    } catch (err) {
      console.error(`Error loading ${layerKey} overlay layer:`, err);
      setError(`Failed to load ${layerKey} data.`);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, buildRepgisUrl]); // Added buildRepgisUrl here


  // 🚀 Initial Map Setup
  useEffect(() => {
    if (!maplibreLoaded || map.current) return;

    const maplibregl = window.maplibregl;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.9129, 43.222],
      zoom: 10,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.current.on("load", () => {
      // Load the default active base layer ('building')
      loadBuildingLayer();
    });

    return () => {
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
    }
  }, [maplibreLoaded, loadBuildingLayer]);


  // 🔄 Handle Base Layer Switch from UI
  const handleLayerSwitch = useCallback((layerKey) => {
    if (activeLayer === layerKey) return; // Prevent unnecessary reloads if already active
    setActiveLayer(layerKey);
  }, [activeLayer]);


  // 🔄 Effect to manage base layer visibility and loading when activeLayer changes
  useEffect(() => {
    if (!map.current) return;

    hideBaseLayers(activeLayer); // First, hide all base layers except the active one

    // Then, ensure the active base layer is loaded
    if (activeLayer === "building") {
      loadBuildingLayer();
    } else if (activeLayer === "readiness") {
      loadReadinessLayer();
    }

    // When switching base layers, ensure overlay layers remain visible if they were active
    // For social layer:
    const selectedSocial = Object.entries(socialCategories)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);

    if (selectedSocial.length > 0 && map.current.getLayer("social-points")) {
        map.current.setLayoutProperty("social-points", "visibility", "visible");
        map.current.setLayoutProperty("social-polygons", "visibility", "visible");
        map.current.setLayoutProperty("social-lines", "visibility", "visible");
    }

    // For repgis layer:
    const selectedRepgis = Object.entries(enginNodes)
        .filter(([_, enabled]) => enabled);

    if (selectedRepgis.length > 0 && map.current.getLayer("repgis-points")) {
        map.current.setLayoutProperty("repgis-points", "visibility", "visible");
        map.current.setLayoutProperty("repgis-polygons", "visibility", "visible");
        map.current.setLayoutProperty("repgis-lines", "visibility", "visible");
    }

  }, [activeLayer, hideBaseLayers, loadBuildingLayer, loadReadinessLayer, socialCategories, enginNodes]);


  // 🔄 Effect for Building Filters (district, highrise, seismic safety)
  useEffect(() => {
    if (map.current && activeLayer === "building") {
      loadBuildingLayer(); // Reload building layer with new filters
    }
    // Seismic safety needs to be re-evaluated whenever buildingCategories or district changes
    if (map.current && buildingCategories.seismicSafety) {
        loadSeismicSafetyLayer();
    } else if (map.current && map.current.getLayer("seismic-safety-fill")) {
         map.current.setLayoutProperty("seismic-safety-fill", "visibility", "none");
    }
  }, [selectedDistrict, buildingCategories, activeLayer, loadBuildingLayer, loadSeismicSafetyLayer]);


  // 🔄 Effect for Social Categories (Overlay)
  useEffect(() => {
    if (!map.current) return;

    const selected = Object.entries(socialCategories)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);

    if (selected.length > 0) {
        loadOverlayLayer("social").then(() => {
            if (!map.current) return; // safety
            // Apply filter and ensure visibility
            if (map.current.getLayer("social-points")) {
                map.current.setFilter("social-points", ["in", "category", ...selected]);
                map.current.setFilter("social-polygons", ["in", "category", ...selected]);
                map.current.setFilter("social-lines", ["in", "category", ...selected]);
                map.current.setLayoutProperty("social-points", "visibility", "visible");
                map.current.setLayoutProperty("social-polygons", "visibility", "visible");
                map.current.setLayoutProperty("social-lines", "visibility", "visible");
            }
        });
    } else {
        // No social categories selected, hide social layers
        if (map.current.getLayer && map.current.getLayer("social-points")) {
            map.current.setLayoutProperty("social-points", "visibility", "none");
            map.current.setLayoutProperty("social-polygons", "visibility", "none");
            map.current.setLayoutProperty("social-lines", "visibility", "none");
        }
    }
  }, [socialCategories, loadOverlayLayer]);


  // 🔄 Effect for RepGIS Categories (Overlay)
  useEffect(() => {
    if (!map.current) return;

    const selected = Object.entries(enginNodes)
        .filter(([_, enabled]) => enabled);

    if (selected.length > 0) {
      loadOverlayLayer("repgis", buildRepgisUrl()).then(() => {
        if (!map.current) return; // safety
        // Ensure visibility
        if (map.current.getLayer("repgis-points")) {
            map.current.setLayoutProperty("repgis-points", "visibility", "visible");
            map.current.setLayoutProperty("repgis-polygons", "visibility", "visible");
            map.current.setLayoutProperty("repgis-lines", "visibility", "visible");
        }
      });
    } else {
        // No repgis categories selected, hide repgis layers
        if (map.current.getLayer && map.current.getLayer("repgis-points")) {
            map.current.setLayoutProperty("repgis-points", "visibility", "none");
            map.current.setLayoutProperty("repgis-polygons", "visibility", "none");
            map.current.setLayoutProperty("repgis-lines", "visibility", "none");
        }
    }
  }, [enginNodes, buildRepgisUrl, loadOverlayLayer]);


  return (
    <div className="relative w-full h-[600px] rounded-lg shadow-md overflow-hidden">

      {/* Layer Switcher */}
      <div className="absolute top-4 right-4 z-20 p-4 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg"> {/* Increased z-index for switcher */}
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Map Layers</h3>
        <div className="space-y-2">
          {["building", "readiness"].map((key) => {
                const config = layerConfigs[key];
                return (
                    <div key={key} className="space-y-1">
                    <div
                        onClick={() => handleLayerSwitch(key)}
                        className={`w-full px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors flex items-center justify-start ${
                        activeLayer === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: config.color }} />
                        {config.name}
                    </div>
                    {/* <p className="text-xs text-gray-500 px-2">{config.description}</p> */}
                    </div>
                );
            })}
        </div>

        {loading && <div className="mt-3 text-sm text-gray-500">Loading data...</div>}
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legends (adjust z-index as needed) */}
      {activeLayer==="readiness" && (
        <div className="absolute bottom-8 right-4 p-3 bg-gray-50 rounded-md border z-10"> {/* Added z-index */}
          <h4 className="text-xl font-semibold text-gray-700 mb-2">Legend: Readiness</h4>
          <ul className="space-y-1">
            {readinessLegend.map((item) => (
              <li key={item.label} className="flex items-center space-x-2">
                <span
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Social Legend always visible if social categories are selected, regardless of active base layer */}
      {Object.values(socialCategories).some(c => c) && (
        <div className="absolute bottom-8 right-4 p-3 bg-gray-50 rounded-md border z-10"> {/* Added z-index */}
          <h4 className="text-xl font-semibold text-gray-700 mb-2">Легенда социальных объектов</h4>
          <ul className="space-y-1">
            {socialLegend.map((item) => (
              <li key={item.label} className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add a legend for seismic safety if active, similar to social */}
      {activeLayer === "building" && buildingCategories.seismicSafety && (
        <div className="absolute bottom-8 left-4 p-3 bg-gray-50 rounded-md border z-10">
          <h4 className="text-xl font-semibold text-gray-700 mb-2">Legend: Seismic Safety</h4>
          <ul className="space-y-1">
            <li className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: "#d46a6a" }} />
              <span className="text-xs text-gray-600">Emergency & Seismic Risk Buildings</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}