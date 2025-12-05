"use client";

import { Link, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { useState } from "react";
import GRIMethodology from "./Methodology/GRIMethodology";
import BuildingRiskMethodology from "./Methodology/BuildingRiskMethodology";
import InfraReadinessMethodology from "./Methodology/InfraReadinessMethodology";

export default function Header({ activeLayer, mainPageTab, setMainPageTab }) {
  const location = useLocation();
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const tabs = [
    { id: "geo-risks", label: "Гео - риски", href: "/" },
    { id: "infrastructure", label: "Инфраструктура", href: "/infrastructure" },
    { id: "analytics", label: "Аналитика", href: "/analytics" },
    { id: "recommendations", label: "Рекомендации", href: "/recommendations" },
  ];

  function getMethodologyContent() {
    if (location.pathname === "/") {
      return <GRIMethodology />;
    }

    if (location.pathname === "/infrastructure") {
      if (activeLayer === "building") {
        return <BuildingRiskMethodology />;
      } else if (activeLayer === "readiness") {
        return <InfraReadinessMethodology />;
      }
    }

    return (
      <p className="text-gray-500 p-4">
        Методология недоступна для текущего контекста.
      </p>
    );
  }

  const getHeaderContent = () => {
    if (location.pathname === "/infrastructure") {
      return "Мониторинг сейсмоустойчивости городских объектов";
    } else {
      return "Мониторинг сейсмической опасности";
    }
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          {/* <div className="flex items-center gap-8"> */}
          <h1 className="text-lg font-semibold">{getHeaderContent()}</h1>
          <nav className="flex gap-2">
            {location.pathname !== "/analytics" &&
              location.pathname !== "/recommendations" && (
                <button
                  onClick={() => setIsMethodologyOpen(true)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Методология
                </button>
              )}
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.href;
              return (
                <Link key={tab.id} to={tab.href}>
                  <button
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#236FFF] text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <Dialog open={isMethodologyOpen} onOpenChange={setIsMethodologyOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white shadow-sm z-50">
            <DialogTitle className="text-2xl">
              {location.pathname === "/"
                ? "Методология расчёта Geo-Risk Index (GRI)"
                : location.pathname === "/infrastructure" &&
                  activeLayer === "building"
                ? "Методология расчёта индекса сейсмоустойчивости зданий (SRI)"
                : location.pathname === "/infrastructure" &&
                  activeLayer === "readiness"
                ? "Методология расчёта Infrastructure Readiness Index (IRI)"
                : "Методология"}
            </DialogTitle>
            <DialogClose onOpenChange={setIsMethodologyOpen} />
          </DialogHeader>
          <div className="mt-4">{getMethodologyContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
