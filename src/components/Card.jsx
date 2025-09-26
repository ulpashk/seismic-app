import { AlertCircle } from "lucide-react"
export default function Card({ title, value,  className = "", icon: Icon = AlertCircle, iconClassName="", iconBack=""}) {
  return (
    <div className={`h-full group relative overflow-hidden backdrop-blur-sm shadow-lg rounded-2xl p-5 transition-all duration-500 hover:scale-105 hover:shadow-2xl  cursor-pointer ${className}`}>
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-gray-700 leading-tight max-w-[70%] group-hover:text-gray-900 transition-colors duration-300">{title}</h3>
        <div className="relative">
            {/* Pulsing background for icon */}
            <div className={`absolute inset-0 ${iconBack} animate-pulse group-hover:animate-ping`} />
            <Icon className={`relative h-5 w-5 ${iconClassName} transition-colors duration-300`}/>
        </div>
        {/* <AlertCircle className="h-5 w-5 text-red-500"/> */}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300 tracking-tight">
          {value}
        </div>
        {/* <h1 className="text-4xl font-semibold text-center">{value}</h1> */}
      </div>
    </div>
  );
}