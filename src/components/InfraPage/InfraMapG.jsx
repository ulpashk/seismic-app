"use client"

import { useEffect, useRef, useState } from "react"

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
  const [activeLayer, setActiveLayer] = useState("building")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [maplibreLoaded, setMaplibreLoaded] = useState(false)
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ"

  // 🔹 Build district query string
  const buildQuery = () => {
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
  };

  useEffect(() => {
    // Load MapLibre GL CSS
    const cssLink = document.createElement("link")
    cssLink.rel = "stylesheet"
    cssLink.href = "https://unpkg.com/maplibre-gl@4.0.2/dist/maplibre-gl.css"
    document.head.appendChild(cssLink)

    // Load MapLibre GL JS
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

  const buildRepgisUrl = () => {
    const base = urls.repgis
    const selected = Object.entries(enginNodes)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name) // тут уже русские названия

    if (selected.length === 0) return base
    return `${base}&cat_name=${selected.join(",")}`
  }

  useEffect(() => {
    loadLayer("repgis");
  }, [enginNodes]);

  const loadBuildingLayer = () => {
    if (!map.current) return

    const config = layerConfigs.building

    if (!map.current.getSource("building")) {
      map.current.addSource("building", {
        type: "vector",
        tiles: [urls.building],
        minzoom: 0,
        maxzoom: 14,
      })
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
      })
    }

     // ✅ Build filters
    let filters = ["all"];

    // 🔹 District filter
    if (selectedDistrict.length > 0 && !selectedDistrict.includes("Все районы")) {
      filters.push([
        "in",
        ["get", "district"],
        ["literal", selectedDistrict],
      ]);
    }

    // 🔹 Building category filters
    if (buildingCategories.highrise) {
      filters.push(["==", ["get", "is_highrise_in_poly"], "True"]);
    }

    // ✅ Apply combined filter
    map.current.setFilter("building-fill", filters);
  }

  useEffect(() => {
    if (map.current) {
      loadBuildingLayer();
      if (buildingCategories.seismicSafety) {
        loadSeismicSafetyLayer();
      } else if (map.current.getLayer("seismic-safety-fill")) {
        map.current.setFilter("seismic-safety-fill", ["==", "___NONE___", "___NONE___"]);
      }
    }
  }, [selectedDistrict, buildingCategories]);

  const loadSeismicSafetyLayer = async () => {
    if (!map.current) return;

    const url = urls.seismicSafety;
    const districtQuery = buildQuery(); // reuse your function
    const fullUrl = districtQuery ? url + districtQuery : url;

    const res = await fetch(fullUrl);
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
    }

    map.current.setFilter("seismic-safety-fill", filters);
  };

  useEffect(() => {
    if (!maplibreLoaded || map.current) return

    const maplibregl = window.maplibregl

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.9129, 43.222],
      zoom: 10,
    })

    map.current.addControl(new maplibregl.NavigationControl(), "top-right")
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right")

    map.current.on("load", () => {
      loadBuildingLayer()
    })
  }, [maplibreLoaded])

  // Helper function to remove or hide all layers (except the one being loaded)
const hideBaseLayers = (exceptLayerKey) => {
  if (!map.current) return;

  const baseLayers = ["building", "readiness"];

  baseLayers.forEach((key) => {
    const layerId = key === "building" ? "building-fill" : "readiness-fill";
    if (map.current.getLayer(layerId)) {
      if (key === exceptLayerKey) {
        map.current.setLayoutProperty(layerId, "visibility", "visible");
      } else {
        map.current.setLayoutProperty(layerId, "visibility", "none");
      }
    }
  });

  // Hide seismic safety if building is not active
  if (exceptLayerKey !== "building" && map.current.getLayer("seismic-safety-fill")) {
    map.current.setLayoutProperty("seismic-safety-fill", "visibility", "none");
  }
};


  const loadLayer = async (layerKey) => {
    if (!map.current || !window.maplibregl) return
    const maplibregl = window.maplibregl

    setLoading(true)
    setError(null)

    // Hide all other layers before loading the new one
    hideBaseLayers(layerKey);

    try {
      const config = layerConfigs[layerKey]

      if (config.type === "geojson") {
        // If the source already exists for this geojson layer, remove and re-add to ensure fresh data
        if (map.current.getSource(layerKey)) {
          if (map.current.getLayer(`${layerKey}-polygons`)) map.current.removeLayer(`${layerKey}-polygons`)
          if (map.current.getLayer(`${layerKey}-lines`)) map.current.removeLayer(`${layerKey}-lines`)
          if (map.current.getLayer(`${layerKey}-points`)) map.current.removeLayer(`${layerKey}-points`)
          map.current.removeSource(layerKey)
        }

        let url = urls[layerKey]

        // 🔹 Apply district filtering for ALL geojson layers
        const districtFilter = buildQuery();
        if (districtFilter) {
          url += url.includes("?") ? `&${districtFilter.slice(1)}` : districtFilter;
        }

        // если это repgis – строим url с фильтрацией
        if (layerKey === "repgis") {
          url = buildRepgisUrl()
        }
        // 🔹 Fetch GeoJSON data
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        let geoJsonData
        if (data.features) {
          geoJsonData = data
        } else if (data.results) {
          geoJsonData = {
            type: "FeatureCollection",
            features: data.results.map((item) => ({
              type: "Feature",
              geometry: item.geometry || item.geom,
              properties: item.properties || item,
            })),
          }
        } else {
          throw new Error("Invalid data format")
        }

        map.current.addSource(layerKey, { type: "geojson", data: geoJsonData })

        // polygons
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
        })

        // lines
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
        })

        // points
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
        })

        // fit bounds
        if (geoJsonData.features.length > 0) {
          const bounds = new maplibregl.LngLatBounds()
          geoJsonData.features.forEach((feature) => {
            if (feature.geometry.type === "Point") {
              bounds.extend(feature.geometry.coordinates)
            } else if (feature.geometry.type === "MultiPolygon") {
              feature.geometry.coordinates.forEach((polygon) => {
                polygon.forEach((ring) => {
                  ring.forEach((coord) => bounds.extend(coord))
                })
              })
            } else if (feature.geometry.type === "Polygon") {
              feature.geometry.coordinates.forEach((ring) => {
                ring.forEach((coord) => bounds.extend(coord))
              })
            } else if (feature.geometry.type === "LineString") {
              feature.geometry.coordinates.forEach((coord) => bounds.extend(coord))
            } else if (feature.geometry.type === "MultiLineString") {
              feature.geometry.coordinates.forEach((line) => {
                line.forEach((coord) => bounds.extend(coord))
              })
            }
          })
          map.current.fitBounds(bounds, { padding: 50 })
        }
      }

    //   if (config.type === "vector") {
    //     // For vector layers (like 'building'), just make them visible if they are the active layer
    //     if (layerKey === "building" && map.current.getLayer("building-fill")) {
    //         map.current.setLayoutProperty("building-fill", "visibility", "visible");
    //         // Also ensure seismic safety is handled if building is active
    //         if (buildingCategories.seismicSafety && map.current.getLayer("seismic-safety-fill")) {
    //             map.current.setLayoutProperty("seismic-safety-fill", "visibility", "visible");
    //         } else if (map.current.getLayer("seismic-safety-fill")) {
    //              map.current.setLayoutProperty("seismic-safety-fill", "visibility", "none");
    //         }
    //     }
    //      if (layerKey === "seismicSafety" && map.current.getLayer("seismic-safety-fill")) {
    //         map.current.setLayoutProperty("seismic-safety-fill", "visibility", "visible");
    //     }
    //     // If it's a vector layer and the source/layer doesn't exist, load it.
    //     // This is mainly for initial load or if 'building' was removed by some other logic.
    //     if (!map.current.getSource(layerKey) && layerKey === "building") {
    //         loadBuildingLayer(); // Re-add building layer if it was somehow removed
    //     }
    //   }

    if (config.type === "vector") {
      // Vector base layers like 'building'
      if (!map.current.getSource(layerKey)) {
        loadBuildingLayer(); // load if not present
      }
      // Make only the selected base layer visible
      if (layerKey === "building" && map.current.getLayer("building-fill")) {
        map.current.setLayoutProperty("building-fill", "visibility", "visible");

        // Seismic safety only visible if building is active & selected
        if (buildingCategories.seismicSafety && map.current.getLayer("seismic-safety-fill")) {
          map.current.setLayoutProperty("seismic-safety-fill", "visibility", "visible");
        }
      }

      if (layerKey === "readiness" && map.current.getLayer("readiness-fill")) {
        map.current.setLayoutProperty("readiness-fill", "visibility", "visible");
      }
    }
    } catch (err) {
      console.error("Error loading layer:", err)
    } finally {
      setLoading(false)
    }
  }

    // useEffect(() => {
    // if (!map.current) return;

    // const selected = Object.entries(socialCategories)
    //     .filter(([_, enabled]) => enabled)
    //     .map(([key]) => key);

    // // if (activeLayer !== "social") { // Only apply filter if 'social' is the active layer
    // //     // If social isn't active, ensure its layers are hidden or removed
    // //     if (map.current.getLayer("social-points")) {
    // //         map.current.setLayoutProperty("social-points", "visibility", "none");
    // //         map.current.setLayoutProperty("social-polygons", "visibility", "none");
    // //         map.current.setLayoutProperty("social-lines", "visibility", "none");
    // //     }
    // //     return;
    // // }

    // if (selected.length === 0) {
    //     // nothing selected → hide all social layers if they exist
    //     if (map.current.getLayer("social-points")) {
    //         map.current.setFilter("social-points", ["==", "category", "___NONE___"]);
    //         map.current.setFilter("social-polygons", ["==", "category", "___NONE___"]);
    //         map.current.setFilter("social-lines", ["==", "category", "___NONE___"]);
    //     }
    // } else {
    //     // something selected → ensure layer is loaded and visible
    //     if (!map.current.getSource("social")) {
    //         loadLayer("social").then(() => {
    //             if (map.current.getLayer("social-points")) {
    //                 map.current.setFilter("social-points", ["in", "category", ...selected]);
    //                 map.current.setFilter("social-polygons", ["in", "category", ...selected]);
    //                 map.current.setFilter("social-lines", ["in", "category", ...selected]);
    //                 map.current.setLayoutProperty("social-points", "visibility", "visible");
    //                 map.current.setLayoutProperty("social-polygons", "visibility", "visible");
    //                 map.current.setLayoutProperty("social-lines", "visibility", "visible");
    //             }
    //         });
    //     } else {
    //         // already loaded → just update filter and ensure visibility
    //         if (map.current.getLayer("social-points")) {
    //             map.current.setFilter("social-points", ["in", "category", ...selected]);
    //             map.current.setFilter("social-polygons", ["in", "category", ...selected]);
    //             map.current.setFilter("social-lines", ["in", "category", ...selected]);
    //             map.current.setLayoutProperty("social-points", "visibility", "visible");
    //             map.current.setLayoutProperty("social-polygons", "visibility", "visible");
    //             map.current.setLayoutProperty("social-lines", "visibility", "visible");
    //         }
    //     }
    // }
    // }, [socialCategories, activeLayer]);

    useEffect(() => {
        if (!map.current) return; // ✅ exit if map not ready

        // Overlay: social
        const selected = Object.entries(socialCategories)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => key);

        if (selected.length > 0) {
            loadLayer("social").then(() => {
            if (!map.current) return; // safety
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
            // hide social if nothing selected
            if (map.current.getLayer && map.current.getLayer("social-points")) {
            map.current.setLayoutProperty("social-points", "visibility", "none");
            map.current.setLayoutProperty("social-polygons", "visibility", "none");
            map.current.setLayoutProperty("social-lines", "visibility", "none");
            }
        }
        }, [socialCategories]);


//   const handleLayerSwitch = (layerKey) => {
//     setActiveLayer(layerKey)
//     loadLayer(layerKey)
//   }
    const handleLayerSwitch = (layerKey) => {
    setActiveLayer(layerKey);

    // Hide other base layers
    hideBaseLayers(layerKey);

    // Load selected layer if needed
    if (layerKey === "building") {
        loadBuildingLayer();
    } else if (layerKey === "readiness") {
        loadLayer("readiness");
    }
    };

  return (
    <div className="relative w-full h-[600px] rounded-lg shadow-md rounded-lg overflow-hidden">

      {/* Layer Switcher */}
      <div className="absolute top-20 right-4 z-10 p-4 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg">
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
                    <p className="text-xs text-gray-500 px-2">{config.description}</p>
                    </div>
                );
            })}
        </div>

        {loading && <div className="mt-3 text-sm text-gray-500">Loading data...</div>}
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {activeLayer==="readiness" && (
        <div className="absolute bottom-8 right-4 p-3 bg-gray-50 rounded-md border">
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

      {activeLayer==="social" && (
        <div className="absolute bottom-8 right-4 p-3 bg-gray-50 rounded-md border">
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
    </div>
  )
}