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
import { Menu, X } from "lucide-react"; // Добавили иконки
import GRIMethodology from "./Methodology/GRIMethodology";
import BuildingRiskMethodology from "./Methodology/BuildingRiskMethodology";
import InfraReadinessMethodology from "./Methodology/InfraReadinessMethodology";
import RecommendationsMethodology from "./Methodology/RecommendationsMethodology";

export default function Header({ activeLayer, mainPageTab, setMainPageTab }) {
  const location = useLocation();
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false); // Состояние для мобильного меню

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
    if (location.pathname === "/recommendations") {
      return <RecommendationsMethodology />;
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
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Заголовок с адаптивным размером шрифта */}
          <h1 className="text-sm sm:text-base font-bold text-[#1b1b1b] truncate">
            {getHeaderContent()}
          </h1>

          {/* ДЕСТОПНАЯ НАВИГАЦИЯ (скрыта на экранах меньше lg) */}
          <nav className="hidden lg:flex items-center gap-2">
            {location.pathname !== "/analytics" && (
              <button
                onClick={() => setIsMethodologyOpen(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
              >
                Методология
              </button>
            )}
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.href;
              return (
                <Link key={tab.id} to={tab.href}>
                  <button
                    className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
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

          {/* МОБИЛЬНЫЕ УПРАВЛЯЮЩИЕ ЭЛЕМЕНТЫ (видны только на мобилках) */}
          <div className="flex lg:hidden items-center gap-2">
             {location.pathname !== "/analytics" && (
              <button
                onClick={() => setIsMethodologyOpen(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                Методология
              </button>
            )}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* МОБИЛЬНОЕ ВЫПАДАЮЩЕЕ МЕНЮ */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-[#e8e8e8] bg-white animate-in slide-in-from-top-1 duration-300">
            <div className="py-3 px-4 space-y-2 flex flex-col">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.href;
                return (
                  <Link 
                    key={tab.id} 
                    to={tab.href}
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-[#3772ff] to-[#2956bf] text-white shadow-md"
                        : "text-[#283353] hover:bg-[#ebf1ff] border border-transparent hover:border-[#c1d3ff]"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <Dialog open={isMethodologyOpen} onOpenChange={setIsMethodologyOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white shadow-sm z-50 pb-2">
            <DialogTitle className="text-xl sm:text-2xl pr-8">
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