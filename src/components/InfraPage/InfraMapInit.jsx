"use client"

import { useEffect, useRef, useState } from "react"
import { MapboxOverlay } from "@deck.gl/mapbox";
import SocialIconLayer from "./map-icons/social-icons"
import RepgisIconLayer from "./map-icons/repgis-icons"

const urls = {
  readiness: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/infra-readiness/?page_size=10000",
  repgis: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/rep-gis-infra/?page_size=10000",
  social: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/social-objects/?page_size=10000",
  building: "https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf",
  seismicSafety: "https://admin.smartalmaty.kz/api/v1/chs/buildings-seismic-safety/?limit=1000",
}

const layerConfigs = {
  readiness: {
    name: "Готовность инфраструктуры",
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
    name: "Риск зданий",
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
  { label: "Школы", key: "school", color: "#2563eb" },
  { label: "ПППН", key: "pppn", color: "#16a34a" },
  { label: "Больницы", key: "health", color: "#dc2626" },
  { label: "Детские сады", key: "ddo", color: "#eab308" },
];

const enginLegend = [
  { label: "Канализация", key: "Канализация", color: "#0ea5e9", icon: "/icons/sewer.png" },
  { label: "Электроснабжение", key: "Электроснабжение", color: "#f97316", icon: "/icons/electricity.png" },
  { label: "ИКТ инфраструктура города", key: "ИКТ инфраструктура города", color: "#a855f7", icon: "/icons/ict.png" },
  { label: "Теплоснабжение", key: "Теплоснабжение", color: "#ef4444", icon: "/icons/heat.png" },
  { label: "Газоснабжение", key: "Газоснабжение", color: "#eab308", icon: "/icons/gas.png" },
];

const readinessLegend = [
  { label: "IRI < 0.2", color: "#e0f2fe", text: "Низкий" },
  { label: "0.2 – 0.4", color: "#7dd3fc", text: "Средне-низкий" },
  { label: "0.4 – 0.6", color: "#3b82f6", text: "Средний" },
  { label: "0.6 – 0.8", color: "#1d4ed8", text: "Средне-высокий" },
  { label: "≥ 0.8", color: "#0c143d", text: "Высокий" },
];

const buildingLegend = [
  { label: "A - Высокая устойчивость, минимальный риск", color: "#038009" },
  { label: "B - Хорошее состояние, устойчиво", color: "#8DE314" },
  { label: "C - Средняя устойчивость", color: "#EDDC26" },
  { label: "D - Повышенный риск, требует проверки", color: "#ED7626" },
  { label: "E - Критически низкая устойчивость", color: "#ED3726" },
];

const icons = {
  school: "icons/school.png",
  health: "icons/health.png",
  pppn: "icons/pppn.png",
  ddo: "icons/ddo.png"
};

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
  const overlayRef = useRef(null);

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

// mapp 
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

  // const buildRepgisUrl = () => {
  //   const base = urls.repgis
  //   const selected = Object.entries(enginNodes)
  //     .filter(([_, enabled]) => enabled)
  //     .map(([name]) => name) // тут уже русские названия

  //   if (selected.length === 0) return base
  //   return `${base}&cat_name=${selected.join(",")}`
  // }

  // useEffect(() => {
  //   if (!overlayRef.current || !map.current) return;

  //   const updateRepgisLayer = async () => {
  //     if (!window.cachedData?.repgis_full) {
  //       const res = await fetch(urls.repgis);
  //       const data = await res.json();
  //       window.cachedData = window.cachedData || {};
  //       window.cachedData.repgis_full = data.features
  //         ? data
  //         : {
  //             type: "FeatureCollection",
  //             features: (data.results || []).map(item => ({
  //               type: "Feature",
  //               geometry: item.geometry,
  //               properties: item,
  //             })),
  //           };
  //     }

  //     const fullGeojson = window.cachedData.repgis_full;

  //     const selectedCategories = Object.entries(enginNodes)
  //       .filter(([, enabled]) => enabled)
  //       .map(([name]) => name);

  //     // Filter main polygons/lines
  //     const filteredFeatures = fullGeojson.features.filter(f =>
  //       selectedCategories.includes(f.properties.cat_name)
  //     );

  //     // ⬇️ Add marker_geojson points from polygons
  //     const markerPoints = filteredFeatures
  //   .filter(f => f.properties.marker_geojson)
  //   .map(f => {
  //     let markerGeom = f.properties.marker_geojson;

  //     // 🧠 Handle both JSON string or already-parsed object
  //     if (typeof markerGeom === "string") {
  //       try {
  //         markerGeom = JSON.parse(markerGeom);
  //       } catch (e) {
  //         console.warn("Invalid marker_geojson for feature:", f.properties.id);
  //         return null;
  //       }
  //     }

  //     // Validate geometry type
  //     if (!markerGeom || markerGeom.type !== "Point") return null;

  //     return {
  //       type: "Feature",
  //       geometry: markerGeom,
  //       properties: f.properties,
  //     };
  //   })
  //   .filter(Boolean);

  //     // Merge all into one dataset
  //     const mergedFeatures = [...filteredFeatures, ...markerPoints];

  //     const repgisLayer = new RepgisIconLayer({
  //       id: "repgis-layer",
  //       data: mergedFeatures,
  //     });

  //     overlayRef.current.setProps({ layers: [repgisLayer] });
  //   };

  //   updateRepgisLayer();
  // }, [enginNodes]);

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
          "fill-color": [
          "match",
          ["get", "SRI_class"],

          "E", "#ED3726",        // зелёный
          "D", "#ED7626",     // светло-зелёный
          "C", "#EDDC26",          // лаймовый  // янтарный
          "B", "#8DE314", // оранжевый
          "A", "#038009", // красный

          /* default */ "#9E9E9E" // серый если не совпало
        ],
        "fill-opacity": 0.4,
          // "fill-color": config.color,
          // "fill-opacity": 0.4,
        },
      })
    }
    else {
      map.current.setLayoutProperty("building-fill", "visibility", "visible");
    }

    //  // ✅ Build filters
    // let filters = ["all"];

    // // 🔹 District filter
    // if (selectedDistrict.length > 0 && !selectedDistrict.includes("Все районы")) {
    //   filters.push([
    //     "in",
    //     ["get", "district"],
    //     ["literal", selectedDistrict],
    //   ]);
    // }

    // // 🔹 Building category filters
    // // const catFilters = [];
    // if (buildingCategories.highrise) {
    //   filters.push(["==", ["get", "is_highrise_in_poly"], "True"]);
    // }

    // // ✅ Apply combined filter
    // map.current.setFilter("building-fill", filters);
  }

  useEffect(() => {
    if (!map.current) return;

    // 🔹 Hide layer if none selected
    if (!buildingCategories.seismicSafety && !buildingCategories.emergency && !buildingCategories.seismic) {
      if (map.current.getLayer("seismic-safety-fill")) {
        map.current.setLayoutProperty("seismic-safety-fill", "visibility", "none");
      }
      return;
    }

    // 🔹 Otherwise, load layer and show
    loadSeismicSafetyLayer().then(() => {
      if (map.current.getLayer("seismic-safety-fill")) {
        map.current.setLayoutProperty("seismic-safety-fill", "visibility", "visible");
      }
    });
  }, [selectedDistrict, buildingCategories]);

  const loadSeismicSafetyLayer = async () => {
    if (!map.current) return;

    let url = urls.seismicSafety;
    const districtQuery = buildQuery();

    // 🔹 Determine which type of data we are loading
    let filterType = "all";

    if (buildingCategories.emergency) {
      url += "?category=is_emergency_building";
      filterType = "is_emergency_building";
    } else if (buildingCategories.seismic) {
      url += "?category=seismic_eval";
      filterType = "seismic_eval";
    } else if (buildingCategories.seismicSafety) {
      // all data → no extra category parameter
      filterType = "all";
    }

    if (districtQuery) {
      url += url.includes("?") ? `&${districtQuery.slice(1)}` : districtQuery;
    }

    // 🔹 Fetch data
    const res = await fetch(url);
    const rawData = await res.json();

    // Check if we got features
    if (!rawData?.results?.length) {
      console.warn("No seismic safety data received");
      return;
    }

    // 🔹 Convert to GeoJSON
    const geojson = {
      type: "FeatureCollection",
      features: rawData.results
        .filter((item) => item.geometry) // ensure geometry exists
        .map((item) => ({
          type: "Feature",
          geometry: item.geometry,
          properties: item,
        })),
    };

    // 🔹 Determine color based on filter type
    let fillColor = "#0066ff"; // blue
    if (filterType === "is_emergency_building") fillColor = "#ff0000"; // red
    else if (filterType === "seismic_eval") fillColor = "#00cc66"; // green

    // 🔹 Add or update source
    if (!map.current.getSource("seismic-safety")) {
      map.current.addSource("seismic-safety", {
        type: "geojson",
        data: geojson,
      });
    } else {
      map.current.getSource("seismic-safety").setData(geojson);
    }

    // 🔹 Add or update fill layer
    if (!map.current.getLayer("seismic-safety-fill")) {
      map.current.addLayer({
        id: "seismic-safety-fill",
        type: "fill",
        source: "seismic-safety",
        paint: {
          "fill-color": fillColor,
          "fill-opacity": 0.5,
          "fill-outline-color": "#000000",
        },
      });
    } else {
      map.current.setPaintProperty("seismic-safety-fill", "fill-color", fillColor);
    }

    // 🔹 Apply filters
    const filters = ["all"];
    if (filterType === "is_emergency_building") {
      filters.push(["==", ["get", "is_emergency_building"], true]);
    } else if (filterType === "seismic_eval") {
      filters.push(["==", ["get", "seismic_eval"], true]);
    }

    // If "all" → no filters
    map.current.setFilter("seismic-safety-fill", filters);

    // 🔹 Fit map to data bounds
    const maplibregl = window.maplibregl;
    const bounds = new maplibregl.LngLatBounds();
    geojson.features.forEach((f) => {
      if (f.geometry?.type === "Polygon") {
        f.geometry.coordinates[0].forEach((coord) => bounds.extend(coord));
      } else if (f.geometry?.type === "Point") {
        bounds.extend(f.geometry.coordinates);
      }
    });

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  useEffect(() => {
    if (!maplibreLoaded || map.current) return

    const maplibregl = window.maplibregl

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.9129, 43.222],
      zoom: 10,
      pitch: 45,
      antialias: true 
    })

    // loadLayer("building")
    map.current.on("load", () => {
      loadBuildingLayer()

      // loadLayer("repgis");
      // loadLayer("social");

      map.current.addSource("openfreemap", {
        url: "https://tiles.openfreemap.org/planet",
        type: "vector",
      })
      overlayRef.current = new MapboxOverlay({ interleaved: true });
      map.current.addControl(overlayRef.current);

      map.current.addLayer({
        id: "3d-buildings",
        source: "openfreemap",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15,
        filter: ["!=", ["get", "hide_3d"], true],
        paint: {
          "fill-extrusion-color": [
            "interpolate", ["linear"], ["get", "render_height"],
            0, "lightgray",
            200, "royalblue",
            400, "lightblue"
          ],
          "fill-extrusion-height": [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            16, ["get", "render_height"]
          ],
          "fill-extrusion-base": [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            16, ["get", "render_min_height"]
          ],
          "fill-extrusion-opacity": 0.9
        }
      });
      for (const [key, url] of Object.entries(icons)) {
        map.current.loadImage(url, (error, image) => {
          if (error) throw error;
          if (!map.current.hasImage(key)) {
            map.current.addImage(key, image);
          }
        });
      }
    }
  )
  }, [maplibreLoaded])

  useEffect(() => {
    if (!map.current || !map.current.getLayer("building-fill")) return;

    const filters = ["all"];

    // 🔹 District filter
    if (selectedDistrict.length > 0 && !selectedDistrict.includes("Все районы")) {
      const districtFilterValues = selectedDistrict
        .filter(d => d !== "Все районы")
        .map(d => `${d} район`);

      filters.push([
        "in",
        ["get", "district"],
        // ["literal", selectedDistrict],
        // ["literal", selectedDistrict.filter(d => d !== "Все районы")],
        ["literal", districtFilterValues]
      ]);
    }

    // 🔹 Highrise filter
    if (buildingCategories.highrise) {
      filters.push(["==", ["get", "is_highrise_in_ploadLayeroly"], "True"]);
    }

    // ✅ Apply filter dynamically
    map.current.setFilter("building-fill", filters);
  }, [buildingCategories, selectedDistrict]);


  const loadLayer = async (layerKey) => {
    if (!map.current || !window.maplibregl) return
    const maplibregl = window.maplibregl

    setLoading(true)
    setError(null)

    try {

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
        // if (layerKey === "repgis") {
        //   url = buildRepgisUrl()
        // }
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
            "fill-outline-color": "#000000",
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
            "circle-radius": 4,
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

  // useEffect(() => {
  //   if (!overlayRef.current || !map.current) return;

  //   const fetchData = async () => {
  //     if (window.cachedData?.social) return window.cachedData.social;
  //     const res = await fetch(urls.social);
  //     const data = await res.json();
  //     const geojson = data.features
  //       ? data
  //       : {
  //           type: "FeatureCollection",
  //           features: (data.results || []).map((item) => ({
  //             type: "Feature",
  //             geometry: item.geometry,
  //             properties: item,
  //           })),
  //         };
  //     window.cachedData = window.cachedData || {};
  //     window.cachedData.social = geojson;
  //     return geojson;
  //   };

  //   fetchData().then((geojson) => {
  //     const selected = Object.entries(socialCategories)
  //       .filter(([_, enabled]) => enabled)
  //       .map(([key]) => key);

  //     const filtered = selected.length
  //       ? geojson.features.filter((f) => selected.includes(f.properties.category))
  //       : [];

  //     const socialLayer = new SocialIconLayer({
  //       id: "social-layer",
  //       data: filtered,
  //     });

  //     overlayRef.current.setProps({ layers: [socialLayer] });
  //   });
  // }, [socialCategories]);

  // ADD THIS NEW UNIFIED USEEFFECT
  useEffect(() => {
    if (!overlayRef.current || !map.current) return;

    const updateLayers = async () => {
      // 1. Fetch and prepare Social Data (This part is correct)
      const socialData = await (async () => {
        if (!window.cachedData?.social) {
          const res = await fetch(urls.social);
          const data = await res.json();
          window.cachedData = window.cachedData || {};
          window.cachedData.social = data.features ? data : {
            type: "FeatureCollection",
            features: (data.results || []).map(item => ({
              type: "Feature",
              geometry: item.geometry,
              properties: item,
            })),
          };
        }
        return window.cachedData.social;
      })();

      const selectedSocial = Object.entries(socialCategories)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key);

      const filteredSocialFeatures = selectedSocial.length
        ? socialData.features.filter((f) => selectedSocial.includes(f.properties.category))
        : [];

      const socialLayer = new SocialIconLayer({
        id: "social-layer",
        data: filteredSocialFeatures,
      });

      // 2. Fetch and prepare RepGIS Data (This section is now corrected)
      const repgisData = await (async () => {
        if (!window.cachedData?.repgis_full) {
          const res = await fetch(urls.repgis);
          const data = await res.json();
          window.cachedData = window.cachedData || {};
          window.cachedData.repgis_full = data.features ? data : {
            type: "FeatureCollection",
            features: (data.results || []).map(item => ({
              type: "Feature",
              geometry: item.geometry,
              properties: item,
            })),
          };
        }
        return window.cachedData.repgis_full;
      })();

      const selectedRepgis = Object.entries(enginNodes)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name);
        
      let mergedRepgisFeatures = [];

      if (selectedRepgis.length > 0) {
          const filteredMainFeatures = repgisData.features.filter(f => 
              selectedRepgis.includes(f.properties.cat_name)
          );

          // <<< START: RESTORED MARKER_GEOJSON LOGIC
          const markerPoints = filteredMainFeatures
              .filter(f => f.properties.marker_geojson)
              .map(f => {
                  let markerGeom = f.properties.marker_geojson;
                  if (typeof markerGeom === "string") {
                      try {
                          markerGeom = JSON.parse(markerGeom);
                      } catch (e) {
                          console.warn("Invalid marker_geojson for feature:", f.properties.id);
                          return null;
                      }
                  }
                  if (!markerGeom || markerGeom.type !== "Point") return null;
                  return {
                      type: "Feature",
                      geometry: markerGeom,
                      properties: f.properties,
                  };
              })
              .filter(Boolean); // Remove any nulls
          // <<< END: RESTORED MARKER_GEOJSON LOGIC
          
          // Combine main polygons/lines with their extracted marker points
          mergedRepgisFeatures = [...filteredMainFeatures, ...markerPoints];
      }


      const repgisLayer = new RepgisIconLayer({
        id: "repgis-layer",
        data: mergedRepgisFeatures, // Use the fully processed data
      });
      
      // 3. Set both layers at the same time
      overlayRef.current.setProps({ layers: [socialLayer, repgisLayer] });
    };

    updateLayers();
    
  }, [socialCategories, enginNodes]);

const handleLayerSwitch = (layerKey) => {
  setActiveLayer(layerKey);

  if (!map.current) return;

  if (layerKey === "building") {
    // Hide readiness if exists
    ["readiness-polygons", "readiness-lines", "readiness-points"].forEach(id => {
      if (map.current.getLayer(id)) map.current.setLayoutProperty(id, "visibility", "none");
    });

    // Show building
    loadBuildingLayer();
  } else if (layerKey === "readiness") {
    // Hide building
    if (map.current.getLayer("building-fill")) {
      map.current.setLayoutProperty("building-fill", "visibility", "none");
    }

    // Show readiness
    if (map.current.getLayer("readiness-polygons")) {
      // Already loaded → just show it
      ["readiness-polygons", "readiness-lines", "readiness-points"].forEach(id => {
        if (map.current.getLayer(id)) map.current.setLayoutProperty(id, "visibility", "visible");
      });
    } else {
      // Not loaded yet → load it
      loadLayer("readiness").then(() => {
        ["readiness-polygons", "readiness-lines", "readiness-points"].forEach(id => {
          if (map.current.getLayer(id)) map.current.setLayoutProperty(id, "visibility", "visible");
        });
      });
    }
  }
};


  return (
    <div className="relative w-full h-full rounded-lg shadow-md rounded-lg overflow-hidden">

      {/* Layer Switcher */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center">
        <div className="flex space-x-2">
          {["building", "readiness"].map((key) => {
            const config = layerConfigs[key];
            return (
              <div key={key}>
                <div
                  onClick={() => handleLayerSwitch(key)}
                  className={`w-full px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center justify-start ${
                    activeLayer === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {config.name}
                </div>
              </div>
            );
          })}
        </div>

        {loading && <div className="ml-3 text-sm text-gray-500">Загрузка...</div>}
        {error && <div className="ml-3 text-sm text-red-600">{error}</div>}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {activeLayer === "building" && (
        <div className="absolute bottom-8 right-4 p-3 bg-gray-50 rounded-md border shadow">
          <ul className="space-y-1">
            {buildingLegend.map((item) => (
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

      {activeLayer==="readiness" && (
        <div className="absolute bottom-8 right-4 p-3 bg-gray-50 rounded-md border">
          <ul className="space-y-1">
            {readinessLegend.map((item) => (
              <li key={item.label} className="flex items-center space-x-2">
                <span
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-700 font-medium">
                  {item.text} 
                </span>
                <span className="text-xs text-gray-500">({item.label})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(Object.values(enginNodes).some(Boolean) || Object.values(socialCategories).some(Boolean)) && (
        <div className="absolute bottom-8 z-40 left-[350px] p-3 bg-gray-50 rounded-md border shadow-md">
          
          {/* Engineering (RepGIS) Legend Section */}
          {Object.values(enginNodes).some(Boolean) && (
            <ul className="space-y-1">
              {enginLegend
                .filter((item) => enginNodes[item.key])
                .map((item) => (
                  <li key={item.label} className="flex items-center space-x-2">
                    <div
                      className="flex items-center justify-center rounded-full border"
                      style={{
                        borderColor: item.color,
                        backgroundColor: "white",
                        width: "24px",
                        height: "24px",
                      }}
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <span className="text-xs text-gray-700">{item.label}</span>
                  </li>
                ))}
            </ul>
          )}

          {/* Divider: Shows only if both legends are active */}
          {Object.values(enginNodes).some(Boolean) && Object.values(socialCategories).some(Boolean) && (
            <hr className="my-2 border-gray-200" />
          )}

          {/* Social Legend Section */}
          {Object.values(socialCategories).some(Boolean) && (
            <ul className="space-y-1">
              {socialLegend
                .filter((item) => socialCategories[item.key])
                .map((item) => (
                  <li key={item.label} className="flex items-center space-x-2">
                    <div
                      className="flex items-center justify-center rounded-full border"
                      style={{
                        borderColor: item.color,
                        backgroundColor: "white",
                        width: "24px",
                        height: "24px",
                      }}
                    >
                      <img
                        src={`/icons/${item.key}.png`}
                        alt={item.label}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <span className="text-xs text-gray-700">{item.label}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
