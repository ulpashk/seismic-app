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
    // color: "#f59e0b", // amber
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
  // readiness: [
  //   "step",
  //   ["get", "IRI"],
  //   "#dbeafe",
  //   0.2, "#bfdbfe",
  //   0.4, "#93c5fd",
  //   0.6, "#4594f4ff",
  //   0.8, "#123f9fff"
  // ],

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
  // const [enginNodes, setEnginNodes] = useState({
  //   canalization: true,
  //   powerSupply: true,
  //   cityInfra: true,
  //   heatSupply: true,
  //   gasSupply: true,
  // })

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

  // useEffect(() => {
  //   if (activeLayer === "repgis") {
  //     loadLayer("repgis")
  //   }
  // }, [enginNodes])

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
    // const catFilters = [];
    if (buildingCategories.highrise) {
      filters.push(["==", ["get", "is_highrise_in_poly"], "True"]);
    }
    // if (buildingCategories.emergency) {
    //   catFilters.push(["==", ["get", "is_emergency_building"], "True"]);
    // }
    // if (buildingCategories.seismic) {
    //   catFilters.push(["==", ["get", "seismic_eval"], true]);
    // }

    // if (catFilters.length > 0) {
    //   filters.push(["any", ...catFilters]); // OR logic between categories
    // }

    // ✅ Apply combined filter
    map.current.setFilter("building-fill", filters);

    // // 🔹 Apply district filter if not "Все районы"
    // if (selectedDistrict.length > 0 && !selectedDistrict.includes("Все районы")) {
    //   map.current.setFilter("building-fill", [
    //     "in",
    //     ["get", "district"], 
    //     ["literal", selectedDistrict]   // supports multiple districts
    //   ]);
    // } else {
    //   map.current.setFilter("building-fill", true); // show all
    // }
  }

  // useEffect(() => {
  //   if (map.current && map.current.getLayer("building-fill")) {
  //     loadBuildingLayer();
  //   }
  // }, [selectedDistrict, buildingCategories]);

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

    // loadLayer("building")
    map.current.on("load", () => {
      loadBuildingLayer()

      loadLayer("repgis");
      loadLayer("social");
    })
  }, [maplibreLoaded])

  const loadLayer = async (layerKey) => {
    if (!map.current || !window.maplibregl) return
    const maplibregl = window.maplibregl

    setLoading(true)
    setError(null)

    try {
      // Remove old layers/sources
      // Object.keys(layerConfigs).forEach((key) => {
      //   if (key === "building") return // keep base layer
      //   if (map.current.getLayer(`${key}-polygons`)) map.current.removeLayer(`${key}-polygons`)
      //   if (map.current.getLayer(`${key}-lines`)) map.current.removeLayer(`${key}-lines`)
      //   if (map.current.getLayer(`${key}-points`)) map.current.removeLayer(`${key}-points`)
      //   // if (map.current.getLayer(`${key}-fill`)) map.current.removeLayer(`${key}-fill`)
      //   if (map.current.getSource(key)) map.current.removeSource(key)
      // })

      if (map.current.getSource(layerKey)) {
        map.current.removeSource(layerKey)
      }
      if (map.current.getLayer(`${layerKey}-polygons`)) map.current.removeLayer(`${layerKey}-polygons`)
      if (map.current.getLayer(`${layerKey}-lines`)) map.current.removeLayer(`${layerKey}-lines`)
      if (map.current.getLayer(`${layerKey}-points`)) map.current.removeLayer(`${layerKey}-points`)

      const config = layerConfigs[layerKey]

      if (config.type === "geojson") {

        let url = urls[layerKey]

        // 🔹 Apply district filtering for ALL geojson layers
        const districtFilter = buildQuery();
        if (districtFilter) {
          // if url already has query params → append with `&`
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
            // "fill-color": config.color,
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
          // "building-fill"
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

      if (config.type === "vector") {
        // 🔹 Add vector tile source
        map.current.addSource(layerKey, {
          type: "vector",
          tiles: [urls[layerKey]],
          minzoom: 0,
          maxzoom: 14,
        })

        map.current.addLayer({
          id: `${layerKey}-fill`,
          type: "fill",
          source: layerKey,
          "source-layer": config.sourceLayer,
          paint: {
            "fill-color": ["get", "config.color"],
            "fill-opacity": 0.5,
          },
        })
      }
    } catch (err) {
      console.error("Error loading layer:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!map.current || !map.current.getLayer("social-points")) return;

    const selected = Object.entries(socialCategories)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key); // ["schools", "health", ...]

    if (selected.length === 0) {
      // hide everything
      map.current.setFilter("social-points", ["==", "category", "___NONE___"]);
    } else {
      map.current.setFilter("social-points", ["in", "category", ...selected]);
    }
  }, [socialCategories]);

  const handleLayerSwitch = (layerKey) => {
    setActiveLayer(layerKey)
    loadLayer(layerKey)
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg shadow-md rounded-lg overflow-hidden">

      {/* Layer Switcher */}
      <div className="absolute top-20 right-4 z-10 p-4 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Map Layers</h3>
        <div className="space-y-2">
          {Object.entries(layerConfigs).map(([key, config]) => (
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
          ))}
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
