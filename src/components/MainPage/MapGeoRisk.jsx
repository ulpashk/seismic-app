import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";

export default function MapGeoRisk({ selectedDistrict }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  const [mode, setMode] = useState("grid");
  const [districtFilter, setDistrictFilter] = useState("");
  const [griFilter, setGriFilter] = useState("");
  const [geoStructData, setGeoStructData] = useState(null);

  // 🔹 Caches
  const geoStructCache = useRef({});
  const geoRiskCache = useRef({});

  const buildQuery = () => {
    const params = [];
    if (selectedDistrict && selectedDistrict !== "Все районы") {
      params.push(`district=${encodeURIComponent(selectedDistrict + " район")}`);
    }
    if (griFilter) params.push(`GRI_class=${encodeURIComponent(griFilter)}`);
    return params.length ? `?${params.join("&")}` : "";
  };

  useEffect(() => {
    setDistrictFilter(buildQuery());
  }, [selectedDistrict, griFilter]);

  // 🔷 Fetch geo structures (with caching)
  useEffect(() => {
    if (mode !== "structure") return;
    const key = districtFilter || "all";
    if (geoStructCache.current[key]) {
      setGeoStructData(geoStructCache.current[key]);
      return;
    }
    const fetchData = async () => {
      try {
        const url = `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000`;
        const res = await fetch(url);
        const data = await res.json();
        geoStructCache.current[key] = data;
        setGeoStructData(data);
      } catch (err) {
        console.error("Failed to fetch geoStructData", err);
      }
    };
    fetchData();
  }, [mode, districtFilter]);

  // 🔷 Initialize / update geoRisk tiles (with caching)
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

  // 🔷 Switch between GRI and population colors
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("geoRisk-fill")) return;
    const fillColor =
      mode === "population"
        ? ["case", ["has", "color_population"], ["get", "color_population"], "#999999"]
        : ["case", ["has", "color_GRI"], ["get", "color_GRI"], "#33a456"];
    map.setPaintProperty("geoRisk-fill", "fill-color", fillColor);
  }, [mode]);

  // Add GeoStruct layers after map style is loaded
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const addGeoStructLayers = () => {
      if (map.getSource("geoStruct")) return; // prevent duplicates

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
      });

      map.addLayer({
        id: "geoStruct-line",
        type: "line",
        source: "geoStruct",
        paint: {
          "line-color": "#539ad1ff",
          "line-width": 2,
        },
        filter: ["==", "$type", "LineString"],
      });

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
        });
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(landslideSvg);
    };

    //   map.addLayer({
    //     id: "geoStruct-point",
    //     type: "circle",
    //     source: "geoStruct",
    //     paint: {
    //       "circle-radius": 5,
    //       "circle-color": "#0066ff",
    //       "circle-stroke-color": "#ffffff",
    //       "circle-stroke-width": 1,
    //     },
    //     filter: ["==", "$type", "Point"],
    //   });
    // };

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
      src.setData(geoStructData); // API already returns GeoJSON
    }
  }, [geoStructData]);


  // Toggle visibility when mode changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const riskLayers = ["geoRisk-fill"];
    const structLayers = ["geoStruct-fill", "geoStruct-line", "geoStruct-point"];

    if (mode === "structure") {
      // hide risk
      riskLayers.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
      });
      // show structure
      structLayers.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "visible");
      });
    } else {
      // show risk
      riskLayers.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "visible");
      });
      // hide structure
      structLayers.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
      });
    }
  }, [mode]);

  return (
    <div className="relative w-full h-screen rounded-lg shadow-md rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2 items-start">
        <div className="flex gap-2">
          {[
            ["grid", "Geo Risk"],
            ["population", "Total Population"],
            ["structure", "Geo Structure"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`px-3 py-1 rounded shadow text-sm font-medium ${
                mode === value ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col bg-white rounded p-2 shadow">
          <label htmlFor="griFilter">GRI class</label>
          <select
            id="griFilter"
            value={griFilter}
            onChange={(e) => setGriFilter(e.target.value)}
            className="border rounded px-1 py-0.5 text-sm"
          >
            <option value="">All</option>
            <option value="низкий">низкий</option>
            <option value="средний">средний</option>
            <option value="высокий">высокий</option>
          </select>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
