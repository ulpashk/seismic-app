"use client"

import { useEffect, useRef, useState } from "react"

const urls = {
  readiness: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/infra-readiness/?page_size=10000",
  repgis: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/rep-gis-infra/?page_size=10000",
  social: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/social-objects/?page_size=10000",
  building: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf",
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

export default function MapComponent() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [activeLayer, setActiveLayer] = useState("readiness")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [maplibreLoaded, setMaplibreLoaded] = useState(false)
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ"

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

    loadLayer("readiness")
  }, [maplibreLoaded])

  const loadLayer = async (layerKey) => {
    if (!map.current || !window.maplibregl) return
    const maplibregl = window.maplibregl

    setLoading(true)
    setError(null)

    try {
      // Remove old layers/sources
      Object.keys(layerConfigs).forEach((key) => {
        if (map.current.getLayer(`${key}-polygons`)) map.current.removeLayer(`${key}-polygons`)
        if (map.current.getLayer(`${key}-lines`)) map.current.removeLayer(`${key}-lines`)
        if (map.current.getLayer(`${key}-points`)) map.current.removeLayer(`${key}-points`)
        if (map.current.getLayer(`${key}-fill`)) map.current.removeLayer(`${key}-fill`)
        if (map.current.getSource(key)) map.current.removeSource(key)
      })

      const config = layerConfigs[layerKey]

      if (config.type === "geojson") {
        // 🔹 Fetch GeoJSON data
        const response = await fetch(urls[layerKey])
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
            "fill-color": config.color,
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
            "line-color": config.color,
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
            "circle-color": config.color,
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
    //   setError(`Failed to load ${layerConfigs[layerKey].name}: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLayerSwitch = (layerKey) => {
    setActiveLayer(layerKey)
    loadLayer(layerKey)
  }

  if (!maplibreLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading MapLibre GL JS...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen relative">
      {/* Layer Switcher */}
      <div className="absolute top-4 left-4 z-10 p-4 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg">
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
    </div>
  )
}
