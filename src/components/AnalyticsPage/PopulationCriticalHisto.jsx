import { Info } from "lucide-react"

export default function PopulationCriticalHisto() {
    return (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-base font-medium">Население в критических зонах по районам</h2>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <div className="p-6">
            <div className="flex h-48 items-end justify-around gap-2">
              {[
                { height: "85%", color: "bg-red-500" },
                { height: "55%", color: "bg-gray-300" },
                { height: "60%", color: "bg-gray-300" },
                { height: "50%", color: "bg-gray-300" },
                { height: "40%", color: "bg-gray-300" },
              ].map((bar, i) => (
                <div key={i} className="flex flex-1 flex-col items-center">
                  <div className={`w-full rounded-t ${bar.color}`} style={{ height: bar.height }} />
                  <span className="mt-2 text-xs text-gray-500">###</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">Районы</div>
          </div>
        </div>
    )
}