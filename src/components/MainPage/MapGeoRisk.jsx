import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";

export default function MapGeoRisk() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  const [mode, setMode] = useState("grid");
  const [districtFilter, setDistrictFilter] = useState("");
  const [geoStructData, setGeoStructData] = useState(null);
  const [riskLevels, setRiskLevels] = useState({
    high: false,
    medium: true,
    low: true,
  })
  const [infrastructureCategories, setInfrastructureCategories] = useState({
    landslides: true,
    tectonicFaults: true,
    mudflowPaths: true,
  })

  const [selectedDistrict, setSelectedDistrict] = useState(["Все районы"])
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const allDistricts = [
      "Все районы",
      "Алатауский",
      "Алмалинский",
      "Ауэзовский",
      "Бостандыкский",
      "Жетысуский",
      "Медеуский",
      "Наурызбайский",
      "Турксибский",
  ]

  

  // 🔹 Caches
  const geoRiskCache = useRef({});

  const riskMap = {
    high: "высокий",
    medium: "средний",
    low: "низкий",
  };

  const buildQuery = () => {
    const params = [];
    if (selectedDistrict && selectedDistrict !== "Все районы") {
      params.push(`district=${encodeURIComponent(selectedDistrict + " район")}`);
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
    if (!mapRef.current) return;
    const map = mapRef.current;

    const addGeoStructLayers = () => {
      if (map.getSource("geoStruct")) return;

      map.addSource("geoStruct", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "geoStruct-fill",
        type: "fill",
        source: "geoStruct",
        paint: {
          "fill-color": "#d6b83fff",
          "fill-opacity": 0.4,
        },
        filter: ["==", "$type", "Polygon"],
      },
        // "geoRisk-fill"
    );

      map.addLayer({
        id: "geoStruct-line",
        type: "line",
        source: "geoStruct",
        paint: {
          "line-color": "#539ad1ff",
          "line-width": 2,
        },
        filter: ["==", "$type", "LineString"],
      },
        // "geoRisk-fill"
    );

      const landslideSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <!-- white circle background -->
          <circle cx="20" cy="20" r="18" fill="white" stroke="black" stroke-width="2"/>
          <!-- yellow warning triangle -->
          <path d="M20 8 L32 32 H8 Z" fill="#ffcc00" stroke="black" stroke-width="2"/>
          <!-- exclamation line -->
          <line x1="20" y1="14" x2="20" y2="24" stroke="black" stroke-width="2" stroke-linecap="round"/>
          <!-- exclamation dot -->
          <circle cx="20" cy="28" r="2" fill="black"/>
        </svg>
      `;

      const img = new Image(40, 40);
      img.onload = () => {
        if (!map.hasImage("landslide-icon")) {
          map.addImage("landslide-icon", img, { pixelRatio: 2 });
        }

        map.addLayer({
          id: "geoStruct-point",
          type: "symbol",
          source: "geoStruct",
          layout: {
            "icon-image": "landslide-icon",
            "icon-size": 0.8,
            "icon-allow-overlap": true,
          },
          filter: ["==", "$type", "Point"],
        },
          // "geoRisk-fill"
      );
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(landslideSvg);
    };

    if (map.isStyleLoaded()) {
      addGeoStructLayers();
    } else {
      map.once("style.load", addGeoStructLayers);
    }
  }, []);


  useEffect(() => {
    if (!mapRef.current || !geoStructData) return;
    const src = mapRef.current.getSource("geoStruct");
    if (src) {
      src.setData(geoStructData);
    }
  }, [geoStructData]);
  
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Landslides → Points
    if (map.getLayer("geoStruct-point")) {
      map.setLayoutProperty(
        "geoStruct-point",
        "visibility",
        infrastructureCategories.landslides ? "visible" : "none"
      );
    }

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
  }, [infrastructureCategories]);


  const handleRiskLevelChange = (level) => {
    setRiskLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }))
  }

  const handleInfrastructureChange = (category) => {
    setInfrastructureCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleCityChange = (city) => {
    setSelectedDistrict((prev) => {
      if (prev.includes(city)) {
        return prev.filter((c) => c !== city)
      } else {
        return [...prev, city]
      }
    })
  }

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
    <div className="relative w-full h-screen rounded-lg shadow-md rounded-lg overflow-hidden">

      {/* Population Density Button */}
      <div className="absolute top-20 left-1/2 flex items-center gap-2 transform -translate-x-1/2 z-10">
        <button
          onClick={() => setMode("population")}
          className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors shadow-md
            ${
              mode === "population"
                ? "bg-white text-blue-600 border border-blue-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          Плотность населения
        </button>
        <button 
          onClick={() => setMode("grid")}
          className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors shadow-md
          ${
            mode === "grid"
              ? "bg-white text-blue-600 border border-blue-600"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Гео-риски
        </button>
      </div>

      <div className="absolute top-20 left-4 z-10 w-64 bg-white/95 backdrop-blur-sm rounded-lg border shadow-lg">
        {/* City Selector */}
        <div className="p-4 border-b">
          <div className="relative">
            <div
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center justify-between px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
            >
              <span className="flex-1">
                {selectedDistrict.length > 0 ? selectedDistrict.join(", ") : "Выберите район"}
              </span>
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-4 h-4 transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {cityDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-20">
                <div className="p-2 space-y-1">
                  {allDistricts.map((city) => (
                    <label
                      key={city}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistrict.includes(city)}
                        onChange={() => handleCityChange(city)}
                        className="rounded"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Уровень риска:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={riskLevels.high}
                onChange={() => handleRiskLevelChange("high")}
                className="rounded"
              />
              <span className="text-sm">Высокий</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={riskLevels.medium}
                onChange={() => handleRiskLevelChange("medium")}
                className="rounded"
              />
              <span className="text-sm">Средний</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={riskLevels.low}
                onChange={() => handleRiskLevelChange("low")}
                className="rounded"
              />
              <span className="text-sm">Низкий</span>
            </label>
          </div>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-3">Категория геоструктур:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infrastructureCategories.landslides}
                onChange={() => handleInfrastructureChange("landslides")}
                className="rounded"
              />
              <span className="text-sm">Оползни</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infrastructureCategories.tectonicFaults}
                onChange={() => handleInfrastructureChange("tectonicFaults")}
                className="rounded"
              />
              <span className="text-sm">Тектонические разломы</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={infrastructureCategories.mudflowPaths}
                onChange={() => handleInfrastructureChange("mudflowPaths")}
                className="rounded"
              />
              <span className="text-sm">Селевые пути</span>
            </label>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Население:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-red-600 font-medium">Высокий</span>
              <span>57020 - 2.49%</span>
            </div>
            <div className="flex justify-between">
              <span>Средний</span>
              <span>454666 - 77.68%</span>
            </div>
            <div className="flex justify-between">
              <span>Низкий</span>
              <span>1780159 - 19.83%</span>
            </div>
          </div>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
