import {priorityBuildings} from "../data/priority_table";
import { XCircle, AlertTriangle } from "lucide-react";

export default function PriorityTable({}) {
    const getPriorityIcon = (priority) => {
        if (priority === "Высокий") {
            return <XCircle className="inline-block w-5 h-5 text-red-500 mr-2" />;
        }
        if (priority === "Средний") {
            return <AlertTriangle className="inline-block w-5 h-5 text-orange-500 mr-2" />;
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="relative flex-1 overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-blue-200">
                        <tr>
                            <th className="px-4 py-2 border ">Приоритетные здания</th>
                            <th className="px-4 py-2 border ">Адрес</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priorityBuildings.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-200">
                                <td className="border px-2 py-1 flex items-center">
                                    {getPriorityIcon(item.priority)}
                                    {item.priority}
                                </td>
                                <td className="border px-2 py-1">{item.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}