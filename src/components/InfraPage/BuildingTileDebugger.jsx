import React from "react";

/**
 * Компонент для отладки PBF тайлов зданий
 * Проверяет состояние слоев и источников на карте
 */
const BuildingTileDebugger = ({ map }) => {
  const debugBuildingLayer = () => {
    if (!map) {
      console.log("❌ Карта не инициализирована");
      return;
    }

    console.log("🔍 === ОТЛАДКА BUILDING СЛОЯ ===");

    // Проверяем источник
    const buildingSource = map.getSource("building");
    if (buildingSource) {
      console.log("✅ Building source найден:", buildingSource);
      console.log("📊 Source tiles:", buildingSource.tiles);
    } else {
      console.log("❌ Building source НЕ найден");
    }

    // Проверяем слой
    const buildingLayer = map.getLayer("building-fill");
    if (buildingLayer) {
      console.log("✅ Building layer найден:", buildingLayer);
      console.log("🎨 Paint properties:", buildingLayer.paint);
      console.log("📐 Layout properties:", buildingLayer.layout);
    } else {
      console.log("❌ Building layer НЕ найден");
    }

    // Проверяем все доступные слои
    const allLayers = map.getStyle().layers || [];
    console.log(
      "🗂️ Все слои на карте:",
      allLayers.map((l) => ({
        id: l.id,
        type: l.type,
        source: l.source,
        sourceLayer: l["source-layer"],
      }))
    );

    // Проверяем видимость слоя
    if (buildingLayer) {
      const visibility = map.getLayoutProperty("building-fill", "visibility");
      console.log(
        `👁️ Видимость building-fill слоя: ${visibility || "visible"}`
      );
    }
  };

  const toggleBuildingLayer = () => {
    if (!map) return;

    const currentVisibility =
      map.getLayoutProperty("building-fill", "visibility") || "visible";
    const newVisibility = currentVisibility === "visible" ? "none" : "visible";

    try {
      map.setLayoutProperty("building-fill", "visibility", newVisibility);
      console.log(`🔄 Building layer visibility изменен на: ${newVisibility}`);
    } catch (error) {
      console.error("❌ Ошибка при изменении видимости:", error);
    }
  };

  const testFeatureQuery = () => {
    if (!map) return;

    const features = map.queryRenderedFeatures({ layers: ["building-fill"] });
    console.log(`🔍 Найдено ${features.length} features в слое building-fill`);

    if (features.length > 0) {
      console.log("📋 Первая feature:", features[0]);
      console.log("🏗️ Свойства первого здания:", features[0].properties);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        fontSize: "12px",
      }}
    >
      <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
        Building Tile Debugger
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <button
          onClick={debugBuildingLayer}
          style={{ padding: "5px", fontSize: "11px" }}
        >
          🔍 Проверить слой
        </button>
        <button
          onClick={toggleBuildingLayer}
          style={{ padding: "5px", fontSize: "11px" }}
        >
          👁️ Переключить видимость
        </button>
        <button
          onClick={testFeatureQuery}
          style={{ padding: "5px", fontSize: "11px" }}
        >
          🔎 Найти features
        </button>
      </div>
    </div>
  );
};

export default BuildingTileDebugger;
