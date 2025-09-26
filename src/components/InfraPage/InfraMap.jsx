"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

// 🔹 Helpers
function mercatorToWgs84(x, y) {
  const lon = (x / 20037508.34) * 180
  let lat = (y / 20037508.34) * 180
  lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2)
  return [lon, lat]
}

export default function MapView({ districtFilter = "" }) {
  const mapRef = useRef(null)
  const [mode, setMode] = useState("readiness")
  const [geoStructData, setGeoStructData] = useState(null)
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ"

  // 🔹 Initialize map
  useEffect(() => {
    if (mapRef.current) return
    const map = new maplibregl.Map({
      container: "map",
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.9, 43.25],
      zoom: 11,
    })
    mapRef.current = map
  }, [])

  // 🔹 Fetch data for GeoJSON modes
  useEffect(() => {
    if (!mode || mode === "building") return

    const urls = {
      readiness:
        "https://admin.smartalmaty.kz/api/v1/address/clickhouse/infra-readiness/?page_size=2000",
      repgis:
        "https://admin.smartalmaty.kz/api/v1/address/clickhouse/rep-gis-infra/?page_size=5000",
      social:
        "https://admin.smartalmaty.kz/api/v1/address/clickhouse/social-objects/?page_size=2000",
    }

    if (!urls[mode]) return

    const fetchData = async () => {
      try {
        const res = await fetch(urls[mode])
        let data = await res.json()

        setGeoStructData(data)
      } catch (err) {
        console.error(`Failed to fetch ${mode} data`, err)
      }
    }

    fetchData()
  }, [mode])

  // 🔹 Render layers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // clear old layers
    const oldLayers = [
      "data-layer",
      "data-fill",
      "building-fill"
    ]
    oldLayers.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id)
    })
    const oldSources = ["data", "buildingRisk"]
    oldSources.forEach((id) => {
      if (map.getSource(id)) map.removeSource(id)
    })


    // 🔸 READINESS
    if (mode === "readiness" && geoStructData) {
        if (map.getLayer("data-fill")) map.removeLayer("data-fill")
        if (map.getSource("data")) map.removeSource("data")

        map.addSource("data", { type: "geojson", data: geoStructData })
        map.addLayer({
            id: "data-fill",
            type: "fill",
            source: "data",
            paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.6,
            },
        })
    }

    // 🔸 REPGIS
    if (mode === "repgis" && geoStructData) {
        if (map.getLayer("data-fill")) map.removeLayer("data-fill")
        if (map.getSource("data")) map.removeSource("data")

        map.addSource("data", { type: "geojson", data: geoStructData })
        map.addLayer({
            id: "data-fill",
            type: "fill",
            source: "data",
            paint: {
            "fill-color": "#eab308",
            "fill-opacity": 0.5,
            "fill-outline-color": "#000",
            },
        })
    }

    // 🔸 SOCIAL
    // if (mode === "social" && geoStructData) {
    //   map.addSource("data", { type: "geojson", data: geoStructData })
    //   map.addLayer({
    //     id: "data-layer",
    //     type: "circle",
    //     source: "data",
    //     paint: {
    //       "circle-radius": 5,
    //       "circle-color": "#dc2626",
    //       "circle-stroke-color": "#fff",
    //       "circle-stroke-width": 1,
    //     },
    //   })
    // }
    if (mode === "social" && geoStructData) {
        if (map.getLayer("social-layer")) map.removeLayer("social-layer")
        if (map.getSource("data")) map.removeSource("data")

        map.addSource("data", { type: "geojson", data: geoStructData })
        map.addLayer({
            id: "social-layer",
            type: "circle",
            source: "data",
            paint: {
            "circle-radius": 6,
            "circle-color": [
                "match",
                ["get", "category"],
                "school", "#2563eb",  // blue
                "pppn", "#16a34a",    // green
                "health", "#dc2626",  // red
                "ddo", "#eab308",     // yellow
                /* default */ "#6b7280" // gray
            ],
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 1,
            },
        })
    }

    // 🔸 BUILDING (Vector tiles)
    if (mode === "building") {
      const tileUrl = `https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf${districtFilter}`
      map.addSource("buildingRisk", {
        type: "vector",
        tiles: [tileUrl],
        minzoom: 0,
        maxzoom: 14,
      })

      map.addLayer({
        id: "building-fill",
        type: "fill",
        source: "buildingRisk",
        "source-layer": "building_risk", // <- must match backend layer name
        paint: {
          "fill-color": ["get, color"],
          "fill-opacity": 0.5,
        },
      })
    }
  }, [mode, geoStructData, districtFilter])

  return (
    <div className="flex flex-col h-screen">
      {/* 🔹 Switcher */}
      <div className="flex space-x-2 p-2 bg-white shadow-md z-10">
        {[ "readiness", "repgis", "social", "building"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              mode === m ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 🔹 Map */}
      <div id="map" className="flex-1" />

      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded shadow text-sm">
        <div className="font-semibold mb-2">Легенда по загруженности</div>
        <div className="flex items-center mb-1">
          <span className="w-4 h-4 bg-green-500 inline-block rounded mr-2"></span>
          Оптимальная загруженность (0.60-1)
        </div>
        <div className="flex items-center mb-1">
          <span className="w-4 h-4 bg-yellow-400 inline-block rounded mr-2"></span>
            {`Низкая загруженность (<0.60)`}
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-red-500 inline-block rounded mr-2"></span>
            {`Высокая загруженность (> 1.00)`}
        </div>
      </div>
    </div>
  )
}
