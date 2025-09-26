import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { mapData } from "../data/mapData"; 
import '@watergis/maplibre-gl-legend/dist/maplibre-gl-legend.css';

export default function MapLibre({selectedDistrict}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";
  const [category, setCategory] = useState("landslides"); 

  // function to update filters
  const updateFilters = (selectedCategory, selectedDistrict) => {
    if (!mapInstance.current) return;

    let allowedClasses = [];

    if (selectedCategory === "landslides") {
      allowedClasses = ["Оползни", "Тектонические разломы"];
    } else if (selectedCategory === "grids") {
      allowedClasses = ["grids"];
    } else if (selectedCategory === "gridsWeak") {
      allowedClasses = ["grids", "Несейсмоустойчивый"];
    }

    // apply filters with geometry restriction
    const layerFilters = {
      "hazard-lines": ["==", ["geometry-type"], "LineString"],
      "hazard-polygons": ["==", ["geometry-type"], "Polygon"],
      "hazard-points": ["==", ["geometry-type"], "Point"],
    };

    Object.entries(layerFilters).forEach(([layerId, geomFilter]) => {
      if(mapInstance.current.getLayer(layerId)) {
        mapInstance.current.setFilter(layerId, [
          "all",
          ["in", ["get", "class"], ["literal", allowedClasses]],
          geomFilter,
        ]);

        let filter = [
          "all",
          ["in", ["get", "class"], ["literal", allowedClasses]],
          geomFilter
        ];

        // if a district is selected, add it as an extra condition
        if (selectedDistrict && selectedDistrict !== "Все районы") {
          filter.push(["==", ["get", "district"], selectedDistrict]);
        }

        mapInstance.current.setFilter(layerId, filter);
      }
    });
  };


  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
      center: [76.88, 43.25],
      zoom: 10,
      pitch: 30,
    });

    mapInstance.current.on("load", () => {
      // --- add your data as a GeoJSON source ---
      mapInstance.current.addSource("hazards", {
        type: "geojson",
        data: mapData,
      });

      // --- LineString layer ---
      mapInstance.current.addLayer({
        id: "hazard-lines",
        type: "line",
        source: "hazards",
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
        },
      });

      // --- Polygon layer (buffered zones) ---
      mapInstance.current.addLayer({
        id: "hazard-polygons",
        type: "fill",
        source: "hazards",
        filter: ["==", ["geometry-type"], "Polygon"],
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.4,
        },
      });

      // --- Point layer (if any future data has points) ---
      mapInstance.current.addLayer({
        id: "hazard-points",
        type: "circle",
        source: "hazards",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": 4,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#c8c2c2ff",
        },
      });

      mapInstance.current.addLayer({
        id: "conventional-sign",
        type: "symbol",
        source: "your-source",
        layout: {
          "icon-image": "your-icon",        // name registered with map.addImage()
          "icon-size": 0.8,                 // scale it
          "icon-anchor": "center",          // can be 'center', 'top', 'bottom', 'left', 'right', etc.
          "icon-offset": [0, -20]           // move the icon by x,y pixels
        }
      });

      // initial filter
      updateFilters(category, selectedDistrict);
    });

    mapInstance.current.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

  }, []);

  // reapply filters when category changes
  useEffect(() => {
    updateFilters(category, selectedDistrict);
  }, [category, selectedDistrict]);

  return (
    <div className="map-container h-[400px] bg-gray-50 border border-gray/20 cursor-pointer rounded-xl transition-all duration-500 hover:shadow-xl hover:bg-gray-100">
      <h1 className="text-center text-xl font-bold text-blue-900 mb-2">
        Карта событий
      </h1>

      {/* Category switcher */}
      <div className="flex justify-center space-x-2 mb-2">
        <button
          onClick={() => setCategory("landslides")}
          className={`px-3 py-1 rounded-xl ${category==="landslides" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          Оползни и Тектонические разломы
        </button>
        <button
          onClick={() => setCategory("grids")}
          className={`px-3 py-1 rounded-xl ${category==="grids" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          Тепловая карта
        </button>
        <button
          onClick={() => setCategory("gridsWeak")}
          className={`px-3 py-1 rounded-xl ${category==="gridsWeak" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          Неустойчивые здания
        </button>
      </div>

      <div
        ref={mapContainer}
        style={{ width: "100%", height: "80%", borderRadius: "12px" }}
      />
    </div>
  );
}
