import { useState, useEffect, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarPicker } from "@/components/UI/calendar-picker"
import { TrendingUp } from "lucide-react"
import { dashboardData } from "../api/dashboard/DashboardApi"

export function IncidentLineChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("24H")
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 20)
    return date
  })
  const [endDate, setEndDate] = useState(new Date())
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
      const latestDayWithData = trends.days.find(day => day.totalAssigned > 0 || day.totalFinished > 0)
      
      if (latestDayWithData && latestDayWithData.hours) {
        return latestDayWithData.hours.map(hour => ({
          time: `${hour.hour.toString().padStart(2, '0')}:00`,
          incidencias: hour.assigned + hour.finished
        }))
      }
      
      // Si no hay datos por horas, crear datos vacíos para 24 horas
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        incidencias: 0
      }))
    } else if (selectedPeriod === "7D") {
      // Para 7D, usar los últimos 7 días
      const last7Days = trends.days.slice(-7)
      return last7Days.map(day => ({
        time: new Date(day.date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        }),
        incidencias: day.totalAssigned + day.totalFinished
      }))
    } else if (selectedPeriod === "30D") {
      // Para 30D, usar todos los días disponibles
      return trends.days.map(day => ({
        time: new Date(day.date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        }),
        incidencias: day.totalAssigned + day.totalFinished
      }))
    }

    return []
  }, [chartData, selectedPeriod])

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
  }

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
  }

  // Calcular métricas basadas en datos reales
  const metrics = useMemo(() => {
    if (processedData.length === 0) {
      return { totalIncidencias: 0, pico: 0, promedio: 0, minimo: 0 }
    }

    const values = processedData.map(item => item.incidencias)
    const totalIncidencias = values.reduce((sum, val) => sum + val, 0)
    const pico = Math.max(...values)
    const promedio = Math.round(totalIncidencias / values.length)
    const minimo = Math.min(...values)

    return { totalIncidencias, pico, promedio, minimo }
  }, [processedData])

  const { totalIncidencias, pico, promedio, minimo } = metrics

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-5 w-5 text-teal-600" />
          <CardTitle className="text-lg">Tendencia de Incidencias</CardTitle>
        </div>
        <CardDescription className="text-sm text-gray-600">
          Patrón de tendencias mostrando picos y variaciones de incidencias.
        </CardDescription>
        
        {/* Métricas */}
        <div className="flex space-x-6 mt-4">
          <div>
            <div className="text-2xl font-bold text-orange-600">{pico}</div>
            <div className="text-xs text-gray-500">Pico</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{promedio}</div>
            <div className="text-xs text-gray-500">Promedio</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{minimo}</div>
            <div className="text-xs text-gray-500">Mínimo</div>
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
                className={`text-xs px-3 py-1 ${
                  selectedPeriod === period 
                    ? "bg-teal-600 hover:bg-teal-700 text-white" 
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        ) : processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
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
                formatter={(value) => [value, 'Incidencias']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="incidencias"
                stroke="#0d9488"
                strokeWidth={3}
                name="Incidencias"
                dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#0d9488', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay datos disponibles</p>
              <p className="text-sm">para el período seleccionado</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}