import { useState, useMemo, useEffect } from "react"
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
import { Shield, TrendingUp, UserPlus, CheckCircle } from "lucide-react"
import { CalendarPicker } from "@/components/Dashboard/calendar-picker"
import { dashboardData } from "../../api/dashboard/DashboardApi"

// Datos de crímenes obtenidos desde la API del dashboard

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
    const [selectedPeriod, setSelectedPeriod] = useState("30D")
    const [hoveredCrime, setHoveredCrime] = useState(null)
    const [loading, setLoading] = useState(false)
    const [crimeType, setCrimeType] = useState("assigned") // "assigned" o "finished"
    const [apiData, setApiData] = useState({
        trends: {
            days: []
        }
    })

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

    // Función para cargar datos de la API
    const loadCrimeData = async () => {
        setLoading(true)
        try {
            const params = {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            }

            const response = await dashboardData(params)

            if (response.data.status && response.data.data.trends) {
                setApiData({
                    trends: response.data.data.trends
                })
            }
        } catch (error) {
            console.error('Error loading crime data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Cargar datos cuando cambien las fechas
    useEffect(() => {
        loadCrimeData()
    }, [startDate, endDate])

    const radarData = useMemo(() => {
        if (!apiData?.trends?.days || apiData.trends.days.length === 0) {
            return []
        }

        const trends = apiData.trends

        // Función para obtener datos de crímenes según el tipo (assigned/finished)
        const getCrimeData = (hours, crimeTypeFilter) => {
            return Object.keys(crimeLabels).reduce((acc, crimeKey) => {
                if (crimeTypeFilter === "assigned") {
                    // Para asignadas, contar solo las horas donde assigned > 0
                    acc[crimeKey] = hours.reduce((sum, hour) => {
                        return sum + (hour.assigned > 0 ? (hour.crimen[crimeKey] || 0) : 0)
                    }, 0)
                } else {
                    // Para finalizadas, contar solo las horas donde finished > 0
                    acc[crimeKey] = hours.reduce((sum, hour) => {
                        return sum + (hour.finished > 0 ? (hour.crimen[crimeKey] || 0) : 0)
                    }, 0)
                }
                return acc
            }, {})
        }

        // Función para obtener datos de crímenes de días según el tipo
        const getDayCrimeData = (days, crimeTypeFilter) => {
            return Object.keys(crimeLabels).reduce((acc, crimeKey) => {
                if (crimeTypeFilter === "assigned") {
                    // Para asignadas, contar solo los días donde assigned > 0
                    acc[crimeKey] = days.reduce((sum, day) => {
                        return sum + (day.assigned > 0 ? (day.crimen[crimeKey] || 0) : 0)
                    }, 0)
                } else {
                    // Para finalizadas, contar solo los días donde finished > 0
                    acc[crimeKey] = days.reduce((sum, day) => {
                        return sum + (day.finished > 0 ? (day.crimen[crimeKey] || 0) : 0)
                    }, 0)
                }
                return acc
            }, {})
        }

        // Filtrar datos según el período seleccionado
        if (selectedPeriod === "24H") {
            // Para 24H, usar datos por horas del día más reciente con datos
            const latestDayWithData = trends.days.find(day =>
                (crimeType === "assigned" ? day.assigned > 0 : day.finished > 0) &&
                day.crimen && Object.values(day.crimen).some(value => value > 0)
            )

            if (latestDayWithData && latestDayWithData.hours) {
                const aggregatedCrimes = getCrimeData(latestDayWithData.hours, crimeType)

                return Object.entries(crimeLabels).map(([key, label]) => ({
                    crime: label,
                    value: aggregatedCrimes[key],
                    fullMark: Math.max(...Object.values(aggregatedCrimes)) || 10,
                }))
            }

            // Si no hay datos por horas, usar datos del día
            if (latestDayWithData && latestDayWithData.crimen) {
                const dayValue = crimeType === "assigned" && latestDayWithData.assigned > 0 ||
                    crimeType === "finished" && latestDayWithData.finished > 0

                if (dayValue) {
                    return Object.entries(crimeLabels).map(([key, label]) => ({
                        crime: label,
                        value: latestDayWithData.crimen[key] || 0,
                        fullMark: Math.max(...Object.values(latestDayWithData.crimen)) || 10,
                    }))
                }
            }
        } else if (selectedPeriod === "7D") {
            // Para 7D, usar los últimos 7 días
            const last7Days = trends.days.slice(-7)
            const aggregatedCrimes = getDayCrimeData(last7Days, crimeType)

            return Object.entries(crimeLabels).map(([key, label]) => ({
                crime: label,
                value: aggregatedCrimes[key],
                fullMark: Math.max(...Object.values(aggregatedCrimes)) || 10,
            }))
        } else if (selectedPeriod === "30D") {
            // Para 30D, usar todos los días disponibles
            const aggregatedCrimes = getDayCrimeData(trends.days, crimeType)

            return Object.entries(crimeLabels).map(([key, label]) => ({
                crime: label,
                value: aggregatedCrimes[key],
                fullMark: Math.max(...Object.values(aggregatedCrimes)) || 10,
            }))
        }

        return []
    }, [selectedPeriod, startDate, endDate, apiData, crimeType])

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

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period)

        // Actualizar automáticamente las fechas del CalendarPicker según el período seleccionado
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        let newStartDate, newEndDate

        if (period === "24H") {
            // Para 24H: desde ayer hasta ayer (un solo día)
            newStartDate = new Date(yesterday)
            newEndDate = new Date(yesterday)
        } else if (period === "7D") {
            // Para 7D: últimos 7 días desde ayer
            newStartDate = new Date(yesterday)
            newStartDate.setDate(yesterday.getDate() - 6) // 7 días incluyendo ayer
            newEndDate = new Date(yesterday)
        } else if (period === "30D") {
            // Para 30D: últimos 30 días desde ayer
            newStartDate = new Date(yesterday)
            newStartDate.setDate(yesterday.getDate() - 29) // 30 días incluyendo ayer
            newEndDate = new Date(yesterday)
        }

        setStartDate(newStartDate)
        setEndDate(newEndDate)
    }

    const handleCrimeTypeToggle = (type) => {
        setCrimeType(type)
    }

    // Configuración dinámica según el tipo de análisis
    const crimeConfig = {
        assigned: {
            title: "Análisis de Crímenes Asignadas",
            description: "Distribución de crímenes en incidencias asignadas",
            icon: UserPlus,
            color: "blue"
        },
        finished: {
            title: "Análisis de Crímenes Finalizadas",
            description: "Distribución de crímenes en incidencias finalizadas",
            icon: CheckCircle,
            color: "green"
        }
    }

    const config = crimeConfig[crimeType]

    return (
        <Card className="bg-white dark:bg-card transition-colors duration-200">
            <CardHeader >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <config.icon className={crimeType === "assigned" ? "h-5 w-5 text-blue-600 dark:text-blue-400" : "h-5 w-5 text-green-600 dark:text-green-400"} />
                        <CardTitle className="text-lg text-gray-900 dark:text-white">{config.title}</CardTitle>
                    </div>

                    {/* Toggle Button para alternar entre tipos de análisis */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCrimeTypeToggle("assigned")}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${crimeType === "assigned"
                                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 font-medium"
                                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                                }`}
                        >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Asignadas
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCrimeTypeToggle("finished")}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${crimeType === "finished"
                                ? "bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400 font-medium"
                                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                                }`}
                        >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Finalizadas
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {config.description}
                        {hoveredCrime && (
                            <span className={`block text-sm mt-1 ${crimeType === "assigned" ? "text-blue-400" : "text-green-400"}`}>Detalles: {hoveredCrime}</span>
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
                        <div className={`text-xs ${crimeType === "assigned" ? "text-blue-500" : "text-green-500"}`}>
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
                            onClick={() => handlePeriodChange(period)}
                            className={`text-xs px-3 py-1 ${selectedPeriod === period
                                ? crimeType === "assigned"
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            {period}
                        </Button>
                    ))}
                </div>
            </div>

            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2 ${crimeType === "assigned" ? "border-blue-600" : "border-green-600"}`}></div>
                            <p>Cargando datos de crímenes...</p>
                        </div>
                    </div>
                ) : radarData.length > 0 ? (
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
                                    stroke={crimeType === "assigned" ? "#2563eb" : "#16a34a"}
                                    fill={crimeType === "assigned" ? "#2563eb" : "#16a34a"}
                                    fillOpacity={hoveredCrime ? 0.4 : 0.2}
                                    strokeWidth={hoveredCrime ? 3 : 2}
                                    dot={{
                                        fill: crimeType === "assigned" ? "#2563eb" : "#16a34a",
                                        strokeWidth: 2,
                                        r: 3
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay datos de crímenes disponibles</p>
                            <p className="text-sm">para el período seleccionado</p>
                        </div>
                    </div>
                )}

                {/* Lista compacta de crímenes */}
                {!loading && radarData.length > 0 && (
                    <div className="mt-4 max-h-28 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                            {radarData.map((item) => (
                                <div
                                    key={item.crime}
                                    className={`flex items-center justify-between p-2 rounded text-xs transition-all duration-200 ${hoveredCrime === item.crime
                                        ? crimeType === "assigned"
                                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                            : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                        : "bg-gray-50 dark:bg-gray-700"
                                        }`}
                                >
                                    <span className={`font-medium ${hoveredCrime === item.crime
                                        ? crimeType === "assigned"
                                            ? "text-blue-700 dark:text-blue-300"
                                            : "text-green-700 dark:text-green-300"
                                        : "text-gray-700 dark:text-gray-300"
                                        }`}>
                                        {item.crime}
                                    </span>
                                    <span className={`font-bold ${hoveredCrime === item.crime
                                        ? crimeType === "assigned"
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-green-600 dark:text-green-400"
                                        : crimeType === "assigned"
                                            ? "text-blue-500"
                                            : "text-green-500"
                                        }`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </CardContent>
        </Card>
    )
}