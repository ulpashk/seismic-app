import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";

export default function MapGeoRisk({mode, setMode, selectedDistrict, riskLevels, infrastructureCategories}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  const [districtFilter, setDistrictFilter] = useState("");
  const [geoStructData, setGeoStructData] = useState(null);

  // 🔹 Caches
  const geoRiskCache = useRef({});
  const geoStructCache = useRef(null);

  const riskMap = useRef({
    high: "высокий",
    medium: "средний",
    low: "низкий",
  });

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

  useEffect(() => {
    setDistrictFilter(buildQuery());
  }, [selectedDistrict, buildQuery]);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const url = `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000`;
  //       const res = await fetch(url);
  //       const data = await res.json();
  //       setGeoStructData(data);
  //     } catch (err) {
  //       console.error("Failed to fetch geoStructData", err);
  //     }
  //   };
  //   fetchData();
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      if (geoStructCache.current) {
        setGeoStructData(geoStructCache.current);
        return;
      }

      try {
        const res = await fetch("https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000");
        const data = await res.json();
        geoStructCache.current = data;
        setGeoStructData(data);
      } catch (err) {
        console.error("Failed to fetch geoStructData", err);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (!mapContainer.current) return;
    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
    const tileUrl = `https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk-tile/{z}/{x}/{y}.pbf${districtFilter}`;
    // geoRiskCache.current[districtFilter] = tileUrl;
    if (!geoRiskCache.current[districtFilter]) {
      geoRiskCache.current[districtFilter] = tileUrl;
    }

    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
        center: [76.886, 43.238],
        zoom: 10,
        pitch: 45, 
        antialias: true 
      });
      // mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
      overlayRef.current = new MapboxOverlay({ interleaved: true, layers: [] });
      mapRef.current.addControl(overlayRef.current);

      mapRef.current.on("load", () => {
        mapRef.current.addSource("geoRisk", {
          type: "vector",
          tiles: [geoRiskCache.current[districtFilter]],
          minzoom: 0,
          maxzoom: 14,
        });
        mapRef.current.addLayer({
          id: "geoRisk-fill",
          type: "fill",
          source: "geoRisk",
          "source-layer": "geo_risk",
          paint: {
            "fill-color": ["case", ["has", "color_GRI"], ["get", "color_GRI"], "#33a456"],
            "fill-opacity": 0.5,
          },
        });

        // Now, call addGeoStructLayers, ensuring geoRisk-fill exists for 'beforeId'
      const addGeoStructLayers = () => {
        if (mapRef.current.getSource("geoStruct")) return; // Prevent re-adding

        mapRef.current.addSource("geoStruct", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
        });

        // --- POLYGONS ---
        mapRef.current.addLayer({
            id: "geoStruct-fill",
            type: "fill",
            source: "geoStruct",
            filter: ["==", "$type", "Polygon"],
            paint: {
            // Brown for 'разломы'
            "fill-color": [
                "case",
                ["==", ["get", "category"], "разломы"],
                "#e5b475ff", // brown
                "#888888" // fallback
            ],
            "fill-opacity": 0.5,
            },
            layout: {
                "visibility": "visible"
            }
        });

        // --- LINES ---
        mapRef.current.addLayer({
            id: "geoStruct-line",
            type: "line",
            source: "geoStruct",
            filter: ["==", "$type", "LineString"],
            paint: {
            "line-color": [
                "case",
                ["==", ["get", "category"], "сель"], "#0077ff", // blue
                ["==", ["get", "category"], "оползни (с помощью жадного алгоритма по понижению высоты рельефа)"], "#cf8805ff", // orange
                "#888888"
            ],
            "line-width": 2,
            },
            layout: {
                "visibility": "visible"
            }
        });

        // --- POINTS ---
        mapRef.current.addLayer({
            id: "geoStruct-point",
            type: "circle",
            source: "geoStruct",
            filter: ["==", "$type", "Point"],
            paint: {
            "circle-radius": 6,
            // Orange for 'оползни'
            "circle-color": [
                "case",
                ["==", ["get", "category"], "оползни"], "#cf8805ff", // orange
                "#ff0000"
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
            },
            layout: {
                "visibility": "visible"
            }
        });
        };

       addGeoStructLayers();

        mapRef.current.addSource("openfreemap", {
      url: "https://tiles.openfreemap.org/planet",
      type: "vector",
    })

    mapRef.current.addLayer({
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
      });
    } else {
      const src = mapRef.current.getSource("geoRisk");
      if (src) {
        src.setTiles([geoRiskCache.current[districtFilter]]);
        mapRef.current.triggerRepaint();
      }
    }
  }, [districtFilter]);


//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map || !map.getLayer("geoRisk-fill")) return;
//     const fillColor =
//       mode === "population"
//         ? ["case", ["has", "color_population"], ["get", "color_population"], "#999999"]
//         : ["case", ["has", "color_GRI"], ["get", "color_GRI"], "#33a456"];
//     map.setPaintProperty("geoRisk-fill", "fill-color", fillColor);
//   }, [mode]);


  useEffect(() => {
    if (!mapRef.current || !geoStructData) return;
    const map = mapRef.current;

    console.log("GeoStruct data loaded:", geoStructData);

    // Wait for map to be fully loaded
    if (!map.loaded()) {
      console.log("Map not loaded yet, waiting...");
      map.once("load", () => {
        const src = map.getSource("geoStruct");
        if (src) {
          console.log("Setting geoStruct data (after load), features count:", geoStructData?.features?.length);
          src.setData(geoStructData);
        }
      });
      return;
    }

    const src = map.getSource("geoStruct");
    if (src) {
      console.log("Setting geoStruct data, features count:", geoStructData?.features?.length);
      src.setData(geoStructData);
    } else {
      console.warn("geoStruct source not found, retrying after slight delay...");
      // Retry after a short delay in case layers are still being added
      setTimeout(() => {
        const retrySource = map.getSource("geoStruct");
        if (retrySource) {
          console.log("Retry successful, setting data");
          retrySource.setData(geoStructData);
        } else {
          console.error("geoStruct source still not found after retry");
        }
      }, 500);
    }
  }, [geoStructData]);
  

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    console.log("Infrastructure categories changed:", infrastructureCategories);

    if (map.getLayer("geoStruct-point")) {
      const visibility = infrastructureCategories.landslides ? "visible" : "none";
      console.log("Setting geoStruct-point visibility:", visibility);
      map.setLayoutProperty("geoStruct-point", "visibility", visibility);
    } else {
      console.warn("geoStruct-point layer not found");
    }

    if (map.getLayer("geoStruct-fill")) {
      const visibility = infrastructureCategories.tectonicFaults ? "visible" : "none";
      console.log("Setting geoStruct-fill visibility:", visibility);
      map.setLayoutProperty("geoStruct-fill", "visibility", visibility);
    } else {
      console.warn("geoStruct-fill layer not found");
    }

    if (map.getLayer("geoStruct-line")) {
      const visibility = infrastructureCategories.mudflowPaths ? "visible" : "none";
      console.log("Setting geoStruct-line visibility:", visibility);
      map.setLayoutProperty("geoStruct-line", "visibility", visibility);
    } else {
      console.warn("geoStruct-line layer not found");
    }

    if (map._geoStructMarkers) {
      map._geoStructMarkers.forEach(m => {
        const el = m.getElement();
        el.style.display = infrastructureCategories.landslides ? "block" : "none";
      });
    }

  }, [infrastructureCategories]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.getLayer("geoRisk-fill")) return;
    const map = mapRef.current;

    const riskFilter = ["in", "GRI_class"];
    const selectedRisks = Object.entries(riskLevels)
      .filter(([_, enabled]) => enabled)
      .map(([level]) => riskMap.current[level]);

    if (selectedRisks.length > 0) {
      riskFilter.push(...selectedRisks);
    } else {
      riskFilter.push("NONE"); 
    }

    // const densityFilter = ["in", "density_level"];
    // const selectedDensities = Object.entries(densityLevels)
    //   .filter(([_, enabled]) => enabled)
    //   .map(([level]) => densityMap[level]);

    // if (selectedDensities.length > 0) {
    //   densityFilter.push(...selectedDensities);
    // } else {
    //   densityFilter.push("NONE");
    // }

    map.setFilter("geoRisk-fill", ["all", riskFilter]);

  }, [riskLevels]);

  return (
    <div className="relative w-full h-full rounded-lg shadow-md rounded-lg overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center">
        <div className="flex space-x-2">
          {[
            { key: "grid", label: "Гео-рискиs" },
            // { key: "population", label: "Плотность населения" },
          ].map(({ key, label }) => (
            <div key={key}>
              <div
                onClick={() => setMode(key)}
                className={`w-full px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center justify-center shadow-md
                  ${
                    mode === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute bottom-8 right-6 z-20 bg-white/80 backdrop-blur-md border border-gray-300 rounded-lg p-2 shadow-md">
      <div className="text-gray-700 font-medium mb-1 text-[15px] text-center">
        Уровень риска
      </div>
      <div
        className="w-40 h-3 rounded-full"
        style={{
          background: "linear-gradient(to right, #f46d43, #ffd700, #006837)",
        }}
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
        <span>Высокий</span>
        <span>Средний</span>
        <span>Низкий</span>
      </div>
    </div>
    </div>
  );
}