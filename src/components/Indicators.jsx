import Card from "./Card";
import { MapPin, Building2, IdCard, AlertTriangle } from "lucide-react"

export default function Indicators({}){
    return (
        <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full text-center">
            <Card
                title="Оползнеопасных участков"
                value="286"
                className="shadow-lg bg-gradient-to-br from-red-50 to-red-200 hover:shadow-xl transition-all duration-300 rounded-xl"
                icon={AlertTriangle}
                iconClassName="text-red-500 group-hover:text-red-600"
                iconBack="bg-red-500/20 rounded-full"
            />
            <Card
                title="Неустойчивых зданий"
                value="1,088"
                className="shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-200 hover:shadow-xl transition-all duration-300 rounded-xl"
                icon={Building2}
                iconClassName="text-orange-500 group-hover:text-orange-600"
                iconBack="bg-orange-500/20 rounded-full"
            />
            <Card
                title="Объектов паспортизации"
                value="21,539"
                className="shadow-lg bg-gradient-to-br from-green-50 to-green-200 hover:shadow-xl transition-all duration-300 rounded-xl"
                icon={IdCard}
                iconClassName="text-green-500 group-hover:text-green-600"
                iconBack="bg-green-500/20 "
            />
            <div title="523 неустойчивых объектов по району. Часть неустойчивых зданий расположена вблизи оползнеопасных зон, особенно в южных районах города (Медеуский и Бостандыкский)">
                <Card
                    title="Самый опасный район"
                    value="Туркисибский район"
                    className="shadow-lg bg-gradient-to-br from-blue-50 to-blue-200 hover:shadow-xl transition-all duration-300 rounded-xl"
                    icon={MapPin}
                    iconClassName="text-blue-500 group-hover:text-blue-600"
                    iconBack="bg-blue-500/20 rounded-full"
                />
            </div>
        </div>
    )
}