"use client"

import React, { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart3 } from "lucide-react"

interface IncidentBarChartProps {
  data: {
    data: {
      trends: {
        days: Array<{
          date: string
          totalAssigned: number
          totalFinished: number
          hours?: Array<{
            hour: number
            assigned: number
            finished: number
          }>
        }>
      }
    }
  }
}

export function IncidentBarChart({ data }: IncidentBarChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("24H")

  // Procesar datos del endpoint
  const processedData = useMemo(() => {
    if (!data?.data?.trends?.days || data.data.trends.days.length === 0) {
      return []
    }

    const trends = data.data.trends
    
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
  }, [data, selectedPeriod])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
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
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Reportes de Incidencias</h3>
        </div>
        <p className="text-sm text-gray-600">
          Total de incidencias reportadas en el período seleccionado.
        </p>
        
        {/* Filtros de período */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 text-sm">
            <span>📅</span>
            <span>21 jul - 20 ago</span>
          </div>
          <div className="flex space-x-1">
            {["24H", "7D", "30D"].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`text-xs px-3 py-1 rounded ${
                  selectedPeriod === period 
                    ? "bg-orange-600 text-white" 
                    : "text-gray-600 hover:bg-gray-100 border"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

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
      </div>
      
      <div>
        {processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
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
                formatter={(value) => [value, 'Incidencias']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="incidencias" 
                fill="#ea580c" 
                name="Incidencias"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay datos disponibles</p>
              <p className="text-sm">para el período seleccionado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}