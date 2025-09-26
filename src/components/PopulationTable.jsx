import {districtPopulation} from "../data/districts_population";

export default function PopulationTable({}) {
    return (
        <div className="h-full flex flex-col">

        <div className="relative flex-1 overflow-y-auto">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-blue-200">
                    <tr>
                        <th className="px-4 py-2 border ">Район</th>
                        <th className="px-4 py-2 border ">Население в оползнеопасных районах</th>
                    </tr>
                </thead>
                <tbody>
                    {districtPopulation.map((item) => (
                        <tr className="hover:bg-gray-50 hover:bg-gray-100">
                            <td className="px-4 py-2 border">{item.district}</td>
                            <td className="px-4 py-2 border">{item.population}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
        
    )
}