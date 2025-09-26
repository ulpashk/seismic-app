import { Shield, AlertCircle, MapPinned, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Header({
  openDropDown,
  setOpenDropDown,
  selectedDistrict,
  districts,
  selectDistrict,
  infoDropDown,
  setInfoDropDown,
}) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="m-0 bg-green-500 shadow-lg border-b">
      <div className="flex h-20 items-center justify-between px-4 md:px-8">
        {/* Left: Logo + Title + District filter */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Тектонические разломы и оползнеопасные участки
            </h1>
            {/* District filter stays here */}
            <button
              className="text-emerald-100 font-sans flex gap-2 items-center hover:text-blue-500"
              onClick={() => setOpenDropDown(!openDropDown)}
            >
              <MapPinned className="w-4 h-4 text-blue-500" />
              {selectedDistrict === "Все районы"
                ? `${selectedDistrict} • Алматы`
                : `${selectedDistrict} район • Алматы`}
            </button>
            {openDropDown && (
              <div className="absolute left-30 mt-2 w-48 bg-white rounded-xl shadow-lg z-20">
                {districts.map((district) => (
                  <div
                    key={district}
                    onClick={() => selectDistrict(district)}
                    className={`px-4 py-2 hover:bg-blue-100 cursor-pointer border-b ${
                      district === selectedDistrict ? "bg-blue-200" : ""
                    }`}
                  >
                    {district}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Risk button + Info icon for larger screens */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl shadow-md transition-colors ${
                isActive
                  ? "bg-blue-800 text-white" // active styles
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`
            }
          >
            Геоструктура
          </NavLink>

          <NavLink
            to="/infra"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl shadow-md transition-colors ${
                isActive
                  ? "bg-blue-800 text-white" // active styles
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`
            }
          >
            Инфраструктура
          </NavLink>
          {/* <div className="relative">
            <AlertCircle
              className="h-5 w-5 text-gray-200 hover:text-white transition-colors cursor-pointer"
              onClick={() => setInfoDropDown(!infoDropDown)}
            />
            {infoDropDown && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-100 text-gray-500 text-sm rounded-xl shadow-lg p-3 z-20">
                <p>
                  Для построения отчета используются данные с Департамента по
                  чрезвычайным ситуациям. <br />
                  <u>Данные актуальны на конец 2024 года.</u>
                </p>
              </div>
            )}
          </div> */}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="md:hidden bg-green-600 text-white px-4 pb-4 space-y-3">
          <NavLink
            to="/risk"
            className="block px-4 py-2 bg-blue-600 rounded-xl shadow-md hover:bg-blue-700"
            onClick={() => setMobileMenu(false)}
          >
            Risk
          </NavLink>
          {/* <div className="flex items-center gap-2">
            <AlertCircle
              className="h-5 w-5 hover:text-blue-300 cursor-pointer"
              onClick={() => setInfoDropDown(!infoDropDown)}
            />
            {infoDropDown && (
              <div className="absolute mt-2 w-80 bg-gray-100 text-gray-500 text-sm rounded-xl shadow-lg p-3 z-20">
                <p>
                  Для построения отчета используются данные с Департаментa по
                  чрезвычайным ситуациям. <br />
                  <u>Данные актуальны на конец 2024 года.</u>
                </p>
              </div>
            )}
          </div> */}
        </div>
      )}
    </header>
  );
}
