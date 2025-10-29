import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";

export default function MapGeoRisk({
  mode,
  setMode,
  selectedDistrict,
  riskLevels,
  infrastructureCategories,
  densityLevels,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  const [districtFilter, setDistrictFilter] = useState("");
  const [geoStructData, setGeoStructData] = useState(null);

  const geoRiskCache = useRef({});
  const geoStructCache = useRef(null);

  const riskMap = {
    high: "высокий",
    medium: "средний",
    low: "низкий",
  };

  const densityMap = {
    high: "высокая",
    medium: "средняя",
    low: "низкая",
  };

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
    setDistrictFilter(buildQuery());
  }, [selectedDistrict]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (geoStructCache.current) {
  //       setGeoStructData(geoStructCache.current);
  //       return;
  //     }

  //     try {
  //       const res = await fetch("https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000");
  //       const data = await res.json();
  //       geoStructCache.current = data;
  //       setGeoStructData(data);
  //     } catch (err) {
  //       console.error("Failed to fetch geoStructData", err);
  //     }
  //   };
  //   fetchData();
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000"
        );
        const data = await res.json();
        console.log("GeoStruct data", data);
        setGeoStructData(data);
      } catch (error) {
        console.error("Error loading geostructures:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;
    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
    const tileUrl = `https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk-tile/{z}/{x}/{y}.pbf${districtFilter}`;
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
        antialias: true,
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
            "fill-color": [
              "case",
              ["has", "color_GRI"],
              ["get", "color_GRI"],
              "#33a456",
            ],
            "fill-opacity": 0.5,
          },
        });

        const addGeoStructLayers = () => {
          if (mapRef.current.getSource("geoStruct")) return;

          mapRef.current.addSource("geoStruct", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });

          // Polygon — разломы (light brown)
          mapRef.current.addLayer({
            id: "geoStruct-fill",
            type: "fill",
            source: "geoStruct",
            paint: {
              "fill-color": "#d2b48c", // light brown
              "fill-opacity": 0.5,
            },
            filter: [
              "all",
              ["==", "$type", "Polygon"],
              ["==", ["get", "category"], "разломы"],
            ],
          });

          // Line — сель (blue)
          mapRef.current.addLayer({
            id: "geoStruct-sel-line",
            type: "line",
            source: "geoStruct",
            paint: {
              "line-color": "#0077ff", // blue
              "line-width": 2,
            },
            filter: [
              "all",
              ["==", "$type", "LineString"],
              ["==", ["get", "category"], "сель"],
            ],
          });

          // Line — оползни (с помощью жадного алгоритма по понижению высоты рельефа) (orange)
          mapRef.current.addLayer({
            id: "geoStruct-opolzni-line",
            type: "line",
            source: "geoStruct",
            paint: {
              "line-color": "#ff8800", // orange
              "line-width": 2,
            },
            filter: [
              "all",
              ["==", "$type", "LineString"],
              [
                "==",
                ["get", "category"],
                "оползни (с помощью жадного алгоритма по понижению высоты рельефа)",
              ],
            ],
          });

          // Point — оползни (orange)
          mapRef.current.addLayer({
            id: "geoStruct-opolzni-point",
            type: "circle",
            source: "geoStruct",
            paint: {
              "circle-color": "#ff8800", // orange
              "circle-radius": 5,
              "circle-stroke-color": "#fff",
              "circle-stroke-width": 1,
            },
            filter: [
              "all",
              ["==", "$type", "Point"],
              ["==", ["get", "category"], "оползни"],
            ],
          });
        };
        addGeoStructLayers();

        mapRef.current.addSource("openfreemap", {
          url: "https://tiles.openfreemap.org/planet",
          type: "vector",
        });

        mapRef.current.addLayer({
          id: "3d-buildings",
          source: "openfreemap",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 15,
          filter: ["!=", ["get", "hide_3d"], true],
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "render_height"],
              0,
              "lightgray",
              200,
              "royalblue",
              400,
              "lightblue",
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              16,
              ["get", "render_height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              16,
              ["get", "render_min_height"],
            ],
            "fill-extrusion-opacity": 0.9,
          },
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

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const visibility = (key) =>
      infrastructureCategories[key] ? "visible" : "none";

    const layerMap = {
      "geoStruct-opolzni-point": "landslides", // оползни (points)
      "geoStruct-sel-line": "mudflowPaths", // сель
      "geoStruct-opolzni-line": "mudflowPaths", // оползни (жадный)
      "geoStruct-fill": "tectonicFaults", // разломы
    };

    Object.entries(layerMap).forEach(([layerId, key]) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visibility(key));
      }
    });
  }, [infrastructureCategories]);

  // useEffect(() => {
  //   if (!mapRef.current || !mapRef.current.getLayer("geoRisk-fill")) return;

  //   const map = mapRef.current;
  //   const selected = Object.entries(riskLevels)
  //     .filter(([_, enabled]) => enabled)
  //     .map(([level]) => riskMap[level]);

  //   if (selected.length === 0) {
  //     map.setFilter("geoRisk-fill", ["==", "GRI_class", "___NONE___"]);
  //   } else {
  //     map.setFilter("geoRisk-fill", ["in", "GRI_class", ...selected]);
  //   }
  // }, [riskLevels]);

  // useEffect(() => {
  //   if (!mapRef.current || !mapRef.current.getLayer("geoRisk-fill")) return;

  //   const map = mapRef.current;
  //   const selected = Object.entries(densityLevels)
  //     .filter(([_, enabled]) => enabled)
  //     .map(([level]) => densityMap[level]);

  //   if (selected.length === 0) {
  //     map.setFilter("geoRisk-fill", ["==", "density_level", "___NONE___"]);
  //   } else {
  //     map.setFilter("geoRisk-fill", ["in", "density_level", ...selected]);
  //   }
  // }, [densityLevels]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.getLayer("geoRisk-fill")) return;
    const map = mapRef.current;

    const riskFilter = ["in", "GRI_class"];
    const selectedRisks = Object.entries(riskLevels)
      .filter(([_, enabled]) => enabled)
      .map(([level]) => riskMap[level]);

    if (selectedRisks.length > 0) {
      riskFilter.push(...selectedRisks);
    } else {
      riskFilter.push("NONE");
    }

    const densityFilter = ["in", "density_level"];
    const selectedDensities = Object.entries(densityLevels)
      .filter(([_, enabled]) => enabled)
      .map(([level]) => densityMap[level]);

    if (selectedDensities.length > 0) {
      densityFilter.push(...selectedDensities);
    } else {
      densityFilter.push("NONE");
    }

    map.setFilter("geoRisk-fill", ["all", riskFilter, densityFilter]);
  }, [riskLevels, densityLevels]);

  return (
    <div className="relative w-full h-full rounded-lg shadow-md rounded-lg overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center">
        <div className="flex space-x-2">
          {[
            { key: "grid", label: "Гео-риски" },
            { key: "population", label: "Плотность населения" },
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
    </div>
  );
}
