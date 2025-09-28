import { useState } from "react"
import { NavLink } from "react-router-dom"

export default function HeaderV() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { to: "/", label: "Гео-риски" },
    { to: "/infrastructure", label: "Инфраструктура" },
    { to: "/analytics", label: "Аналитика" },
  ]

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-blue-600 text-white">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold">
          Мониторинг сейсмической опасности
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <div className="text-yellow-300 text-xl font-bold">!</div>
          <div className="flex space-x-2">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-800 text-white"
                      : "text-blue-200 hover:bg-blue-700 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded bg-blue-700 hover:bg-blue-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col space-y-2 px-6 pb-4">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-800 text-white"
                    : "text-blue-200 hover:bg-blue-700 hover:text-white"
                }`
              }
              onClick={() => setIsOpen(false)} // close menu after clicking
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
