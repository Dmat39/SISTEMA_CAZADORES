import { useState, useEffect, useMemo } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarPicker } from "@/components/Dashboard/calendar-picker"
import { BarChart3, TrendingUp } from "lucide-react"
import { dashboardData } from "../../api/dashboard/DashboardApi"

export function IncidentChartToggle() {
  const [chartType, setChartType] = useState("line") // "line" o "bar"
  const [selectedPeriod, setSelectedPeriod] = useState("30D")

  // Estados para controlar la visibilidad de las líneas/barras
  const [showAsignadas, setShowAsignadas] = useState(true)
  const [showFinalizadas, setShowFinalizadas] = useState(true)

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

  const [chartData, setChartData] = useState({
    data: {
      trends: {
        days: []
      }
    }
  })
  const [loading, setLoading] = useState(false)

  // Función para cargar datos independientes
  const loadChartData = async () => {
    setLoading(true)
    try {
      const params = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }

      const response = await dashboardData(params)

      if (response.data.status && response.data.data.trends) {
        setChartData({
          data: {
            trends: response.data.data.trends
          }
        })
      }
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos cuando cambien las fechas
  useEffect(() => {
    loadChartData()
  }, [startDate, endDate])

  // Procesar datos del endpoint
  const processedData = useMemo(() => {
    if (!chartData?.data?.trends?.days || chartData.data.trends.days.length === 0) {
      return []
    }

    const trends = chartData.data.trends

    // Filtrar datos según el período seleccionado
    if (selectedPeriod === "24H") {
      // Para 24H, usar datos por horas del día más reciente con datos
      const latestDayWithData = trends.days.find(day => day.assigned > 0 || day.finished > 0)

      if (latestDayWithData && latestDayWithData.hours) {
        return latestDayWithData.hours.map(hour => ({
          time: `${hour.hour.toString().padStart(2, '0')}:00`,
          asignadas: hour.assigned,
          finalizadas: hour.finished
        }))
      }

      // Si no hay datos por horas, crear datos vacíos para 24 horas
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        asignadas: 0,
        finalizadas: 0
      }))
    } else if (selectedPeriod === "7D") {
      // Para 7D, usar los últimos 7 días
      const last7Days = trends.days.slice(-7)
      return last7Days.map(day => {
        // Crear fecha sin problemas de zona horaria
        const [year, month, dayNum] = day.date.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum))
        
        return {
          time: date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
          }),
          asignadas: day.assigned,
          finalizadas: day.finished
        }
      })
    } else if (selectedPeriod === "30D") {
      // Para 30D, usar todos los días disponibles
      return trends.days.map(day => {
        // Crear fecha sin problemas de zona horaria
        const [year, month, dayNum] = day.date.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum))
        
        return {
          time: date.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
          }),
          asignadas: day.assigned,
          finalizadas: day.finished
        }
      })
    }

    return []
  }, [chartData, selectedPeriod])

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

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  const handleChartTypeToggle = (type) => {
    setChartType(type)
  }

  // Calcular métricas basadas en datos reales
  const metrics = useMemo(() => {
    if (processedData.length === 0) {
      return {
        asignadas: { total: 0, pico: 0, promedio: 0, minimo: 0 },
        finalizadas: { total: 0, pico: 0, promedio: 0, minimo: 0 }
      }
    }

    const asignadasValues = processedData.map(item => item.asignadas)
    const finalizadasValues = processedData.map(item => item.finalizadas)

    const totalAsignadas = asignadasValues.reduce((sum, val) => sum + val, 0)
    const totalFinalizadas = finalizadasValues.reduce((sum, val) => sum + val, 0)

    return {
      asignadas: {
        total: totalAsignadas,
        pico: Math.max(...asignadasValues),
        promedio: Math.round(totalAsignadas / asignadasValues.length),
        minimo: Math.min(...asignadasValues)
      },
      finalizadas: {
        total: totalFinalizadas,
        pico: Math.max(...finalizadasValues),
        promedio: Math.round(totalFinalizadas / finalizadasValues.length),
        minimo: Math.min(...finalizadasValues)
      }
    }
  }, [processedData])

  const { asignadas, finalizadas } = metrics

  // Configuración dinámica según el tipo de gráfico
  const chartConfig = {
    line: {
      title: "Tendencia de Incidencias",
      description: "Patrón de tendencias mostrando picos y variaciones de incidencias.",
      icon: TrendingUp,
      color: "teal",
      showMetrics: true
    },
    bar: {
      title: "Reportes de Incidencias",
      description: "Total de incidencias reportadas en el período seleccionado.",
      icon: BarChart3,
      color: "orange",
      showMetrics: false
    }
  }

  const config = chartConfig[chartType]

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <config.icon className={chartType === "line" ? "h-5 w-5 text-teal-600" : "h-5 w-5 text-orange-600"} />
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>

          {/* Toggle Button para alternar entre gráficos */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChartTypeToggle("line")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${chartType === "line"
                ? "bg-white dark:bg-gray-700 shadow-sm text-teal-600 dark:text-teal-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                }`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Tendencia
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChartTypeToggle("bar")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${chartType === "bar"
                ? "bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                }`}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Reportes
            </Button>
          </div>
        </div>

        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {config.description}
        </CardDescription>

        {/* Métricas para ambas líneas */}
        <div className="mt-4 flex justify-between">
          {/* Métricas Asignadas */}
          <div className="mb-3">
            <div className="text-sm font-medium text-teal-600 mb-2">Asignadas</div>
            <div className="flex space-x-4">
              <div>
                <div className="text-xl font-bold text-teal-600">{asignadas.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-xl font-bold text-teal-600">{asignadas.pico}</div>
                <div className="text-xs text-gray-500">Pico</div>
              </div>
              <div>
                <div className="text-xl font-bold text-teal-600">{asignadas.promedio}</div>
                <div className="text-xs text-gray-500">Promedio</div>
              </div>
              <div>
                <div className="text-xl font-bold text-teal-600">{asignadas.minimo}</div>
                <div className="text-xs text-gray-500">Mínimo</div>
              </div>
            </div>
          </div>

          {/* Métricas Finalizadas */}
          <div>
            <div className="text-sm font-medium text-orange-600 mb-2">Finalizadas</div>
            <div className="flex space-x-4">
              <div>
                <div className="text-xl font-bold text-orange-600">{finalizadas.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">{finalizadas.pico}</div>
                <div className="text-xs text-gray-500">Pico</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">{finalizadas.promedio}</div>
                <div className="text-xs text-gray-500">Promedio</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">{finalizadas.minimo}</div>
                <div className="text-xs text-gray-500">Mínimo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de período */}
        <div className="flex items-center justify-between mt-4">
          <CalendarPicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
            className="text-sm"
          />
          <div className="flex space-x-1">
            {["24H", "7D", "30D"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => handlePeriodChange(period)}
                className={`text-xs px-3 py-1 ${selectedPeriod === period
                  ? chartType === "line"
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <div className={chartType === "line" ? "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2" : "animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"}></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        ) : processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="time"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  className="text-gray-600"
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  className="text-gray-600"
                />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {showAsignadas && (
                  <Line
                    type="monotone"
                    dataKey="asignadas"
                    stroke="#0d9488"
                    strokeWidth={3}
                    name="Asignadas"
                    dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#0d9488', strokeWidth: 2 }}
                  />
                )}
                {showFinalizadas && (
                  <Line
                    type="monotone"
                    dataKey="finalizadas"
                    stroke="#ea580c"
                    strokeWidth={3}
                    name="Finalizadas"
                    dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ea580c', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            ) : (
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="time"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  className="text-gray-600"
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  className="text-gray-600"
                />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {showAsignadas && (
                  <Bar
                    dataKey="asignadas"
                    fill="#0d9488"
                    name="Asignadas"
                    radius={[2, 2, 0, 0]}
                  />
                )}
                {showFinalizadas && (
                  <Bar
                    dataKey="finalizadas"
                    fill="#ea580c"
                    name="Finalizadas"
                    radius={[2, 2, 0, 0]}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <config.icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay datos disponibles</p>
              <p className="text-sm">para el período seleccionado</p>
            </div>
          </div>
        )}

        {/* Leyenda con Toggle Buttons */}
        {processedData.length > 0 && (
          <div className="flex justify-center items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAsignadas(!showAsignadas)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${showAsignadas
                ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <div className={`w-4 h-4 rounded-sm ${showAsignadas ? "bg-teal-600 dark:bg-teal-400" : "bg-gray-300 dark:bg-gray-600"
                }`}></div>
              <span className="text-sm font-medium">Asignadas</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFinalizadas(!showFinalizadas)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${showFinalizadas
                ? "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              <div className={`w-4 h-4 rounded-sm ${showFinalizadas ? "bg-orange-600 dark:bg-orange-400" : "bg-gray-300 dark:bg-gray-600"
                }`}></div>
              <span className="text-sm font-medium">Finalizadas</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}