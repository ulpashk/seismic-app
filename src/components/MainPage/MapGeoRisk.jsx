import { useEffect, useRef, useState } from "react";
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

  const riskMap = {
    high: "высокий",
    medium: "средний",
    low: "низкий",
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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000`;
        const res = await fetch(url);
        const data = await res.json();
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
    geoRiskCache.current[districtFilter] = tileUrl;

    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${API_KEY}`,
        center: [76.886, 43.238],
        zoom: 10,
      });
      mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
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
         if (mapRef.current.getSource("geoStruct")) return; // Prevent re-adding if already there

         mapRef.current.addSource("geoStruct", {
           type: "geojson",
           data: { type: "FeatureCollection", features: [] },
         });

         mapRef.current.addLayer({
           id: "geoStruct-fill",
           type: "fill",
           source: "geoStruct",
           paint: {
             "fill-color": "#d6b83fff",
             "fill-opacity": 0.4,
           },
           filter: ["==", "$type", "Polygon"],
         },);

         mapRef.current.addLayer({
           id: "geoStruct-line",
           type: "line",
           source: "geoStruct",
           paint: {
             "line-color": "#539ad1ff",
             "line-width": 2,
           },
           filter: ["==", "$type", "LineString"],
         }, );
         
       };
       addGeoStructLayers();

        mapRef.current.on("click", "geoRisk-fill", (e) => {
          const props = e.features?.[0]?.properties || {};
          new maplibregl.Popup({ closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-size:14px;line-height:1.4">
                <b>District:</b> ${props.district || "N/A"}<br/>
                <b>GRI:</b> ${props.gri || "N/A"}<br/>
                <b>Risk Class:</b> ${props.GRI_class || "N/A"}<br/>
                <b>Total population:</b> ${props.total_population || "N/A"}
              </div>`
            )
            .addTo(mapRef.current);
        });
        mapRef.current.on("mouseenter", "geoRisk-fill", () => {
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "geoRisk-fill", () => {
          mapRef.current.getCanvas().style.cursor = "";
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
    const map = mapRef.current;
    if (!map || !map.getLayer("geoRisk-fill")) return;
    const fillColor =
      mode === "population"
        ? ["case", ["has", "color_population"], ["get", "color_population"], "#999999"]
        : ["case", ["has", "color_GRI"], ["get", "color_GRI"], "#33a456"];
    map.setPaintProperty("geoRisk-fill", "fill-color", fillColor);
  }, [mode]);


  useEffect(() => {
    if (!mapRef.current || !geoStructData) return;
    const map = mapRef.current;

    const src = map.getSource("geoStruct");
    if (src) {
      src.setData(geoStructData);
    }
    // Remove old markers
  if (map._geoStructMarkers) {
    map._geoStructMarkers.forEach(m => m.remove());
  }
  map._geoStructMarkers = [];

  // Add default markers for Point features
  geoStructData.features
    .filter(f => f.geometry.type === "Point")
    .forEach(f => {
      const coords = f.geometry.coordinates;

      const marker = new maplibregl.Marker({
        color: "#ff5722", // default pin with custom color
        scale: 0.7        // make it smaller
      })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<b>Landslide</b><br/>District: ${f.properties?.district || "N/A"}`
          )
        )
        .addTo(map);

      map._geoStructMarkers.push(marker);
    });
  }, [geoStructData]);
  

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Landslides → Points
    // if (map.getLayer("geoStruct-point")) {
    //   map.setLayoutProperty(
    //     "geoStruct-point",
    //     "visibility",
    //     infrastructureCategories.landslides ? "visible" : "none"
    //   );
    // }

    // Tectonic Faults → Polygons
    if (map.getLayer("geoStruct-fill")) {
      map.setLayoutProperty(
        "geoStruct-fill",
        "visibility",
        infrastructureCategories.tectonicFaults ? "visible" : "none"
      );
    }

    // Mudflow Paths → Lines
    if (map.getLayer("geoStruct-line")) {
      map.setLayoutProperty(
        "geoStruct-line",
        "visibility",
        infrastructureCategories.mudflowPaths ? "visible" : "none"
      );
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
    const selected = Object.entries(riskLevels)
      .filter(([_, enabled]) => enabled)
      .map(([level]) => riskMap[level]);

    if (selected.length === 0) {
      map.setFilter("geoRisk-fill", ["==", "GRI_class", "___NONE___"]);
    } else {
      map.setFilter("geoRisk-fill", ["in", "GRI_class", ...selected]);
    }
  }, [riskLevels]);

  return (
    <div className="relative w-full h-[600px] rounded-lg shadow-md rounded-lg overflow-hidden">
      <div className="absolute top-1 left-1 flex items-center gap-2 z-10 p-4 pb-0">
        <button 
            onClick={() => setMode("grid")}
            className={`px-2 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-md
                ${
                    mode === "grid"
                    // ? "bg-white text-blue-600 border border-blue-600"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                }`}
        >
            Гео-риски
        </button>
        <button
            onClick={() => setMode("population")}
            className={`px-2 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors shadow-md
                ${
                mode === "population"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                }`}
        >
            Плотность населения
        </button>
    </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
