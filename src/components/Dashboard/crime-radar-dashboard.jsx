import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from "recharts"
import { Shield, TrendingUp } from "lucide-react"
import { CalendarPicker } from "@/components/Dashboard/calendar-picker"

// Mock data basado en la estructura JSON proporcionada
const mockData = {
    trends: {
        days: [
            {
                date: "2025-01-28",
                crimen: {
                    homicidio: 2,
                    sicariato: 1,
                    secuestro: 5,
                    lesiones: 5,
                    roboPersona: 8,
                    roboVehiculo: 3,
                    roboAccesorios: 4,
                    extorsion: 2,
                    drogas: 3,
                    accidente: 6,
                    incendio: 1,
                },
            },
            {
                date: "2025-01-27",
                crimen: {
                    homicidio: 10,
                    sicariato: 5,
                    secuestro: 1,
                    lesiones: 7,
                    roboPersona: 12,
                    roboVehiculo: 5,
                    roboAccesorios: 6,
                    extorsion: 3,
                    drogas: 4,
                    accidente: 8,
                    incendio: 2,
                },
            },
            {
                date: "2025-01-26",
                crimen: {
                    homicidio: 2,
                    sicariato: 2,
                    secuestro: 4,
                    lesiones: 4,
                    roboPersona: 9,
                    roboVehiculo: 2,
                    roboAccesorios: 3,
                    extorsion: 1,
                    drogas: 2,
                    accidente: 5,
                    incendio: 4,
                },
            },
        ],
    },
}

const crimeLabels = {
    homicidio: "Homicidio",
    sicariato: "Sicariato",
    secuestro: "Secuestro",
    lesiones: "Lesiones",
    roboPersona: "Robo Persona",
    roboVehiculo: "Robo Vehículo",
    roboAccesorios: "Robo Accesorios",
    extorsion: "Extorsión",
    drogas: "Drogas",
    accidente: "Accidente",
    incendio: "Incendio",
}

export function CrimeRadarDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState("24H")
    const [hoveredCrime, setHoveredCrime] = useState(null)

    // Configurar fechas por defecto: último mes (30 días desde ayer)
    const [startDate, setStartDate] = useState(() => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        const startDate = new Date(yesterday)
        startDate.setDate(yesterday.getDate() - 29) // 30 días incluyendo ayer
        return startDate
    })
    const [endDate, setEndDate] = useState(() => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        return yesterday
    })

    const radarData = useMemo(() => {
        // Filtrar datos basado en el período seleccionado
        let filteredDays = mockData.trends.days

        if (selectedPeriod === "24H") {
            filteredDays = mockData.trends.days.slice(0, 1)
        } else if (selectedPeriod === "7D") {
            filteredDays = mockData.trends.days.slice(0, 3) // Mock: mostrando 3 días como muestra
        }
        // Para 30D, usar todos los datos disponibles

        // Agregar datos de crímenes
        const aggregatedCrimes = Object.keys(crimeLabels).reduce(
            (acc, crimeType) => {
                acc[crimeType] = filteredDays.reduce((sum, day) => sum + day.crimen[crimeType], 0)
                return acc
            },
            {}
        )

        // Transformar al formato del gráfico radar
        return Object.entries(crimeLabels).map(([key, label]) => ({
            crime: label,
            value: aggregatedCrimes[key],
            fullMark: Math.max(...Object.values(aggregatedCrimes)) || 10,
        }))
    }, [selectedPeriod, startDate, endDate])

    const totalCrimes = useMemo(() => {
        return radarData.reduce((sum, item) => sum + item.value, 0)
    }, [radarData])

    const highestCrime = useMemo(() => {
        return radarData.reduce((max, item) => (item.value > max.value ? item : max), radarData[0])
    }, [radarData])

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-gray-800 dark:bg-gray-900 border border-gray-600 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                    <p className="text-white font-semibold text-sm">{data.crime}</p>
                    <p className="text-red-400 font-bold text-lg">{data.value} incidentes</p>
                    <p className="text-gray-400 text-xs">Período: {selectedPeriod}</p>
                </div>
            )
        }
        return null
    }

    const handleRadarMouseEnter = (data) => {
        if (data && data.payload) {
            setHoveredCrime(data.payload.crime)
        }
    }

    const handleRadarMouseLeave = () => {
        setHoveredCrime(null)
    }

    const handleDateRangeChange = (newStartDate, newEndDate) => {
        setStartDate(newStartDate)
        setEndDate(newEndDate)
    }

    return (
        <Card className="bg-white dark:bg-card transition-colors duration-200">
            <CardHeader >
                <div className="flex items-center justify-between mb-0">
                    <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <CardTitle className="text-lg text-gray-900 dark:text-white">Análisis de Crímenes</CardTitle>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        Distribución de incidentes criminales por categoría
                        {hoveredCrime && (
                            <span className="block text-red-400 text-sm mt-1">Detalles: {hoveredCrime}</span>
                        )}
                    </CardDescription>
                </div>

                {/* Métricas compactas */}
                <div className="grid grid-cols-3 gap-4 mt-0 pt-4  dark:border-gray-700">
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{totalCrimes}</div>
                        <div className="text-xs text-gray-400">incidentes</div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mayor</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{highestCrime?.value || 0}</div>
                        <div className="text-xs text-gray-400">{highestCrime?.crime || 'N/A'}</div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Período</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedPeriod}</div>
                        <div className="text-xs text-red-500">
                            {selectedPeriod === "24H"
                                ? "24 horas"
                                : selectedPeriod === "7D"
                                    ? "7 días"
                                    : "30 días"}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 mx-5">

                {/* CalendarPicker */}
                <CalendarPicker
                    startDate={startDate}
                    endDate={endDate}
                    onDateRangeChange={handleDateRangeChange}
                    className="text-sm"
                />

                {/* Botones de período */}
                <div className="flex space-x-1">
                    {["24H", "7D", "30D"].map((period) => (
                        <Button
                            key={period}
                            variant={selectedPeriod === period ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedPeriod(period)}
                            className={`text-xs px-3 py-1 ${selectedPeriod === period
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            {period}
                        </Button>
                    ))}
                </div>
            </div>

            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                            data={radarData}
                            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                            onMouseEnter={handleRadarMouseEnter}
                            onMouseLeave={handleRadarMouseLeave}
                        >
                            <PolarGrid stroke="#374151" className="opacity-30" />
                            <PolarAngleAxis
                                dataKey="crime"
                                tick={{ fontSize: 10, fill: "#6b7280" }}
                                className="text-xs"
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, "dataMax"]}
                                tick={{ fontSize: 8, fill: "#9ca3af" }}
                                tickCount={4}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Radar
                                name="Incidentes"
                                dataKey="value"
                                stroke="#dc2626"
                                fill="#dc2626"
                                fillOpacity={hoveredCrime ? 0.4 : 0.2}
                                strokeWidth={hoveredCrime ? 3 : 2}
                                dot={{ fill: "#dc2626", strokeWidth: 2, r: 3 }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Lista compacta de crímenes */}
                <div className="mt-4 max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                        {radarData.slice(0, 6).map((item) => (
                            <div
                                key={item.crime}
                                className={`flex items-center justify-between p-2 rounded text-xs transition-all duration-200 ${hoveredCrime === item.crime
                                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                    : "bg-gray-50 dark:bg-gray-700"
                                    }`}
                            >
                                <span className={`font-medium ${hoveredCrime === item.crime
                                    ? "text-red-700 dark:text-red-300"
                                    : "text-gray-700 dark:text-gray-300"
                                    }`}>
                                    {item.crime}
                                </span>
                                <span className={`font-bold ${hoveredCrime === item.crime
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-red-500"
                                    }`}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    {radarData.length > 6 && (
                        <div className="text-center mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{radarData.length - 6} categorías más
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}