import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";

export default function GeoRiskMap({ selectedDistrict }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  const [mode, setMode] = useState("grid");
  const [districtFilter, setDistrictFilter] = useState("");
  const [griFilter, setGriFilter] = useState("");
  const [geoStructData, setGeoStructData] = useState(null);

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

  // 🔷 Fetch geo structures when mode = structure
  useEffect(() => {
    if (mode !== "structure") return;
    const fetchData = async () => {
      try {
        // const url = `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000${districtFilter}`;
        const url = `https://admin.smartalmaty.kz/api/v1/address/clickhouse/geostructures/?page_size=5000`;
        const res = await fetch(url);
        const data = await res.json();
        setGeoStructData(data);
      } catch (err) {
        console.error("Failed to fetch geoStructData", err);
      }
    };
    fetchData();
  // }, [mode, districtFilter]);
  }, [mode]);

  // 🔷 Initialize / update geoRisk tiles
  useEffect(() => {
    if (!mapContainer.current) return;
    const API_KEY = "9zZ4lJvufSPFPoOGi6yZ";

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
          tiles: [
            `https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk-tile/{z}/{x}/{y}.pbf${districtFilter}`,
          ],
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
                <b>Total population:</b> ${props.total_population|| "N/A"}
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
        src.setTiles([
          `https://admin.smartalmaty.kz/api/v1/address/postgis/geo-risk-tile/{z}/{x}/{y}.pbf${districtFilter}`,
        ]);
        mapRef.current.triggerRepaint();
      }
    }
  }, [districtFilter]);

  // 🔷 Handle modes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous layers/sources
    ["buildingRisk-fill", "geoStruct-layer"].forEach((layer) => {
      if (map.getLayer(layer)) map.removeLayer(layer);
    });
    ["buildingRisk", "geoStruct"].forEach((src) => {
      if (map.getSource(src)) map.removeSource(src);
    });

    // Reset geoRisk visibility
    if (map.getLayer("geoRisk-fill")) {
      map.setLayoutProperty("geoRisk-fill", "visibility", "visible");
    }

    // Building/Highrise
    if (mode === "building" || mode === "highrise") {
      if (map.getLayer("geoRisk-fill")) {
        map.setLayoutProperty("geoRisk-fill", "visibility", "none");
      }
      map.addSource("buildingRisk", {
        type: "vector",
        tiles: [
          `https://admin.smartalmaty.kz/api/v1/address/clickhouse/building-risk-tile/{z}/{x}/{y}.pbf${districtFilter}`,
        ],
        minzoom: 0,
        maxzoom: 14,
      });

      const filter = mode === "highrise" ? ["==", ["get", "is_highrise_in_poly"], "True"] : ["all"];

      map.addLayer({
        id: "buildingRisk-fill",
        type: "fill",
        source: "buildingRisk",
        "source-layer": "building_risk",
        filter,
        paint: { "fill-color": "#8c6d43", "fill-opacity": 0.6 },
      });
    }

    // Geo Structure
    if (mode === "structure" && geoStructData) {
      if (map.getLayer("geoRisk-fill")) {
        map.setLayoutProperty("geoRisk-fill", "visibility", "none");
      }
      map.addSource("geoStruct", { type: "geojson", data: geoStructData });
      map.addLayer({
        id: "geoStruct-layer",
        type: "circle",
        source: "geoStruct",
        paint: {
          "circle-radius": 5,
          "circle-color": "#ff6600",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1,
        },
      });
    }
  }, [mode, districtFilter, geoStructData]);

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

  return (
    <div className="relative w-full h-[600px] rounded-lg shadow-md">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2 items-start">
        <div className="flex gap-2">
          {[
            ["grid", "Geo Risk"],
            ["population", "Total Population"],
            ["building", "Building Risk"],
            ["highrise", "High-Rise Buildings"],
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
