"use client"

import { Link, useLocation } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { useState } from "react"
import GRIMethodology from "./Methodology/GRIMethodology"
import IRIMethodology from "./Methodology/IRIMethodology"

export default function Header() {
  const location = useLocation()
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false)

  const tabs = [
    { id: "geo-risks", label: "Гео - риски", href: "/" },
    { id: "infrastructure", label: "Инфраструктура", href: "/infrastructure" },
    { id: "analytics", label: "Аналитика", href: "/analytics" },
  ]

  const getMethodologyContent = () => {
    if (location.pathname === "/") {
      return <GRIMethodology />
    } else if (location.pathname === "/infrastructure") {
      return <IRIMethodology />
    }
    return null
  }

  const getHeaderContent = () => {
    if (location.pathname === "/infrastructure") {
      return "Мониторинг сейсмоустойчивости городских объектов"
    } else {
      return "Мониторинг сейсмической опасности"
    }
  }

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          {/* <div className="flex items-center gap-8"> */}
            <h1 className="text-lg font-semibold">{getHeaderContent()}</h1>
            <nav className="flex gap-2">
            {location.pathname !== "/analytics" && (
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Методология
            </button>
          )}
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.href
                return (
                  <Link key={tab.id} to={tab.href}>
                    <button
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-[#236FFF] text-white" : "bg-transparent text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </Link>
                )
              })}
            </nav>
        </div>
      </header>

      <Dialog open={isMethodologyOpen} onOpenChange={setIsMethodologyOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white shadow-sm">
            <DialogTitle className="text-2xl">
              {location.pathname === "/" ? "Методология GRI" : "Методология IRI"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">{getMethodologyContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}