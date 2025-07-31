"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle } from "lucide-react"
// Componentes UI reemplazados por elementos HTML estándar
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Imports adicionales
import { ArrowUpIcon, ArrowDownIcon, Search } from "lucide-react"
import { incidenceStatistics, incidenceGeneral } from "../../api/dashboard/DashboardApi"
import { useNavigate, useLocation } from 'react-router-dom'

// Datos simulados para las métricas
const weeklyData = [
  { period: "Sem 1", cazadorAsignadas: 45, cazadorAtendidas: 38, operadorAsignadas: 32, operadorAtendidas: 28 },
  { period: "Sem 2", cazadorAsignadas: 52, cazadorAtendidas: 44, operadorAsignadas: 38, operadorAtendidas: 35 },
  { period: "Sem 3", cazadorAsignadas: 48, cazadorAtendidas: 42, operadorAsignadas: 35, operadorAtendidas: 31 },
  { period: "Sem 4", cazadorAsignadas: 58, cazadorAtendidas: 51, operadorAsignadas: 42, operadorAtendidas: 39 },
]

const monthlyData = [
  { period: "Ene", cazadorAsignadas: 180, cazadorAtendidas: 165, operadorAsignadas: 140, operadorAtendidas: 128 },
  { period: "Feb", cazadorAsignadas: 195, cazadorAtendidas: 178, operadorAsignadas: 155, operadorAtendidas: 142 },
  { period: "Mar", cazadorAsignadas: 210, cazadorAtendidas: 192, operadorAsignadas: 168, operadorAtendidas: 158 },
  { period: "Abr", cazadorAsignadas: 225, cazadorAtendidas: 208, operadorAsignadas: 175, operadorAtendidas: 165 },
  { period: "May", cazadorAsignadas: 240, cazadorAtendidas: 220, operadorAsignadas: 185, operadorAtendidas: 172 },
  { period: "Jun", cazadorAsignadas: 235, cazadorAtendidas: 215, operadorAsignadas: 180, operadorAtendidas: 168 },
]

const conversionData = [
  { name: "Cazadores", value: 88.5, color: "#3b82f6" },
  { name: "Operadores", value: 92.1, color: "#10b981" },
]

// Los datos de personalData ahora se cargan desde la API

const COLORS = ["#3b82f6", "#10b981"]

// Componente DateRangeFilter adaptado para el Dashboard
const DashboardDateRangeFilter = ({ startDate, endDate, onDateChange }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  })
  const [tempDateRange, setTempDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  })
  const [isOpen, setIsOpen] = useState(false)
  const [displayValue, setDisplayValue] = useState('')

  // Helpers para fechas
  const formatDateToLocal = (date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDateFromLocal = (dateString) => {
    if (!dateString) return new Date()
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const formatDisplayDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Opciones de selección rápida
  const quickSelectOptions = [
    { label: 'Hoy', getValue: () => ({ startDate: new Date(), endDate: new Date() }) },
    {
      label: 'Ayer', getValue: () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return { startDate: yesterday, endDate: yesterday }
      }
    },
    {
      label: 'Últimos 7 días', getValue: () => {
        const today = new Date()
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 6)
        return { startDate: weekAgo, endDate: today }
      }
    },
    {
      label: 'Últimos 30 días', getValue: () => {
        const today = new Date()
        const monthAgo = new Date()
        monthAgo.setDate(monthAgo.getDate() - 29)
        return { startDate: monthAgo, endDate: today }
      }
    },
    {
      label: 'Este mes', getValue: () => {
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        return { startDate: firstDay, endDate: today }
      }
    }
  ]

  // Actualizar display value
  const updateDisplayValue = (startDate, endDate) => {
    if (!startDate || !endDate) {
      setDisplayValue('')
      return
    }
    const startStr = formatDisplayDate(startDate)
    const endStr = formatDisplayDate(endDate)
    setDisplayValue(startStr === endStr ? startStr : `${startStr} - ${endStr}`)
  }

  // Sincronizar con props
  useEffect(() => {
    if (startDate || endDate) {
      const start = startDate ? parseDateFromLocal(startDate) : new Date()
      const end = endDate ? parseDateFromLocal(endDate) : new Date()
      const range = { startDate: start, endDate: end, key: 'selection' }

      setDateRange(range)
      setTempDateRange(range)
      updateDisplayValue(start, end)
    } else {
      setDisplayValue('')
      const today = new Date()
      const defaultRange = { startDate: today, endDate: today, key: 'selection' }
      setDateRange(defaultRange)
      setTempDateRange(defaultRange)
    }
  }, [startDate, endDate])

  // Event handlers
  const handleRangeChange = (item) => setTempDateRange(item.selection)

  const applyDateFilter = () => {
    setDateRange(tempDateRange)
    updateDisplayValue(tempDateRange.startDate, tempDateRange.endDate)
    onDateChange(
      formatDateToLocal(tempDateRange.startDate),
      formatDateToLocal(tempDateRange.endDate)
    )
    setIsOpen(false)
  }

  const handleQuickSelect = (option) => {
    const { startDate, endDate } = option.getValue()
    setTempDateRange({ startDate, endDate, key: 'selection' })
  }

  const clearDateRangeFilter = () => {
    const today = new Date()
    const defaultRange = { startDate: today, endDate: today, key: 'selection' }
    setDateRange(defaultRange)
    setTempDateRange(defaultRange)
    setDisplayValue('')
    setIsOpen(false)
    onDateChange('', '')
  }

  const handleInputClick = () => {
    setIsOpen(!isOpen)
    if (!isOpen) setTempDateRange(dateRange)
  }

  const handleClickAway = () => {
    setIsOpen(false)
    setTempDateRange(dateRange)
  }

  // Manejar click fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.date-range-filter')) {
        handleClickAway()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const hasActiveFilter = () => {
    return startDate || endDate
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative date-range-filter">
        <div
          onClick={handleInputClick}
          className={`w-[320px] h-10 rounded-lg px-3 py-2 cursor-pointer bg-white relative flex items-center text-sm outline-none transition-all ${isOpen
            ? 'border-2 border-blue-600'
            : 'border border-gray-300 hover:border-gray-400'
            }`}
        >
          <span className={`absolute left-3 transition-all pointer-events-none ${displayValue
            ? 'top-[-8px] text-xs text-gray-600 bg-white px-1'
            : 'top-1/2 transform -translate-y-1/2 text-gray-400'
            }`}>
            Rango de Fechas
          </span>
          <span className={`w-full overflow-hidden text-ellipsis whitespace-nowrap ${displayValue ? 'text-gray-700' : 'text-gray-400'
            }`}>
            {displayValue}
          </span>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-50 bg-white border border-gray-300 rounded-lg mt-1 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Selección rápida:</p>
              <div className="flex flex-wrap gap-1">
                {quickSelectOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSelect(option)}
                    className="text-xs py-1 px-2 border border-gray-300 rounded text-gray-700 hover:border-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aquí iría el DateRange component, pero como no tenemos react-date-range instalado, 
                vamos a usar inputs de fecha simples por ahora */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={formatDateToLocal(tempDateRange.startDate)}
                    onChange={(e) => setTempDateRange({
                      ...tempDateRange,
                      startDate: parseDateFromLocal(e.target.value)
                    })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fecha fin</label>
                  <input
                    type="date"
                    value={formatDateToLocal(tempDateRange.endDate)}
                    onChange={(e) => setTempDateRange({
                      ...tempDateRange,
                      endDate: parseDateFromLocal(e.target.value)
                    })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-between gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={applyDateFilter}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtro
              </button>
            </div>
          </div>
        )}
      </div>

      {hasActiveFilter() && (
        <button
          onClick={clearDateRangeFilter}
          className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Limpiar filtro de rango"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default function Component() {
  const navigate = useNavigate()
  const location = useLocation()

  const [timeFilter, setTimeFilter] = useState("monthly")
  const [userType, setUserType] = useState("cazador")

  // Estados para la tabla de rendimiento individual
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("finished")
  const [sortDirection, setSortDirection] = useState("desc")
  const [personalData, setPersonalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [startDate, setStartDate] = useState("")

  // Obtener parámetros de URL para paginación
  const searchParams = new URLSearchParams(location.search)
  const currentPage = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10

  // Estados para los datos generales
  const [generalData, setGeneralData] = useState({
    totalIncidencias: 0,
    incidenciasEnProceso: 0,
    incidenciasFinalizadas: 0,
    totalOperadores: 0,
    totalCazadores: 0
  })
  const [loadingGeneral, setLoadingGeneral] = useState(false)
  const [generalStartDate, setGeneralStartDate] = useState("")
  const [generalEndDate, setGeneralEndDate] = useState("")

  const currentData = timeFilter === "weekly" ? weeklyData : monthlyData

  // Función para cargar datos generales de la API
  const loadGeneralData = async () => {
    setLoadingGeneral(true)
    try {
      const params = {}

      if (generalStartDate) {
        params.start = generalStartDate
      }

      if (generalEndDate) {
        params.end = generalEndDate
      }

      const response = await incidenceGeneral(params)

      if (response.data.status) {
        setGeneralData(response.data.data)
      }
    } catch (error) {
      console.error('Error loading general data:', error)
    } finally {
      setLoadingGeneral(false)
    }
  }

  // Función para cargar datos de la API
  const loadPersonalData = async () => {
    setLoading(true)
    try {
      const params = {
        limit: limit,
        page: currentPage,
        userType: userType === "all" ? undefined : userType === "cazador" ? "hunter" : "operator"
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      if (startDate) {
        params.start = startDate
      }

      const response = await incidenceStatistics(params)

      if (response.data.status) {
        const apiData = response.data.data.data.map(user => ({
          id: user.id,
          nombre: `${user.name} ${user.lastname}`,
          tipo: user.rol === "Cazador" ? "Cazador" : "Operador",
          asignadas: user.asigned,
          resueltas: user.finished,
          conversion: user.asigned > 0 ? ((user.finished / user.asigned) * 100).toFixed(1) : 0,
          // tendencia: 0, // Comentado - se implementará más adelante
          avatar: `${user.name.charAt(0)}${user.lastname.charAt(0)}`,
          dni: user.dni,
          phone: user.phone
        }))

        setPersonalData(apiData)
        setTotalPages(response.data.data.totalPages)
        setTotalCount(response.data.data.totalCount)
      }
    } catch (error) {
      console.error('Error loading personal data:', error)
    } finally {
      setLoading(false)
    }
  }

  // useEffect para cargar datos generales cuando cambien las fechas
  useEffect(() => {
    loadGeneralData()
  }, [generalStartDate, generalEndDate])

  // useEffect para cargar datos generales al inicializar
  useEffect(() => {
    loadGeneralData()
  }, [])

  // useEffect para cargar datos cuando cambien los filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPersonalData()
    }, searchTerm ? 500 : 0) // Debounce solo si hay búsqueda

    return () => clearTimeout(timer)
  }, [currentPage, limit, searchTerm, userType, startDate])

  // Calcular métricas totales
  const totalAsignadas = currentData.reduce((acc, item) => acc + item.cazadorAsignadas + item.operadorAsignadas, 0)
  const totalAtendidas = currentData.reduce((acc, item) => acc + item.cazadorAtendidas + item.operadorAtendidas, 0)
  const tasaConversionGeneral = ((totalAtendidas / totalAsignadas) * 100).toFixed(1)

  const cazadorTotal = currentData.reduce((acc, item) => acc + item.cazadorAtendidas, 0)
  const operadorTotal = currentData.reduce((acc, item) => acc + item.operadorAtendidas, 0)

  // Calcular tendencia (comparar último vs anterior)
  const lastPeriod = currentData[currentData.length - 1]
  const previousPeriod = currentData[currentData.length - 2]
  const tendencia =
    lastPeriod && previousPeriod
      ? (
        ((lastPeriod.cazadorAtendidas +
          lastPeriod.operadorAtendidas -
          (previousPeriod.cazadorAtendidas + previousPeriod.operadorAtendidas)) /
          (previousPeriod.cazadorAtendidas + previousPeriod.operadorAtendidas)) *
        100
      ).toFixed(1)
      : 0

  // Función para ordenar los datos localmente
  const sortedPersonalData = [...personalData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    const numA = Number(aValue)
    const numB = Number(bValue)
    return sortDirection === "asc" ? numA - numB : numB - numA
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Función para manejar cambio de página/límite
  const handlePageLimitChange = (newPage, newLimit) => {
    const searchParams = new URLSearchParams(location.search)

    if (newLimit !== limit) {
      searchParams.set('limit', newLimit.toString())
      searchParams.set('page', '1') // Reset a página 1 cuando cambia el límite
    } else {
      searchParams.set('page', newPage.toString())
    }

    navigate({ search: searchParams.toString() })
  }

  // Generar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i - 1) // Restamos 1 para mantener compatibilidad con el array de 0-indexed
    }

    return pages
  }

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Reset a página 1 cuando se busca
      const searchParams = new URLSearchParams(location.search)
      searchParams.set('page', '1')
      navigate({ search: searchParams.toString() })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas de Incidencias</h1>
          <p className="text-gray-500">Análisis de rendimiento de Cazadores y Operadores</p>
        </div>

        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <DashboardDateRangeFilter
            startDate={generalStartDate}
            endDate={generalEndDate}
            onDateChange={(start, end) => {
              setGeneralStartDate(start)
              setGeneralEndDate(end)
            }}
          />
          {/* <select
            className="w-[180px] p-2 border rounded-md"
            value={userType}
            onChange={(e) => {
              setUserType(e.target.value)
              setCurrentPage(0) // Reset page when changing filter
            }}
          >
            <option value="cazador">Cazadores</option>
            <option value="operador">Operadores</option>
          </select> */}
        </div>
      </div>

      {/* Métricas principales - Datos del endpoint incidence/general */}
      <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-5">
        {/* Total Incidencias */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Incidencias</h3>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{generalData.totalIncidencias.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Incidencias registradas</p>
              </>
            )}
          </div>
        </div>

        {/* Incidencias En Proceso */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">En Proceso</h3>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{generalData.incidenciasEnProceso.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Incidencias pendientes</p>
              </>
            )}
          </div>
        </div>

        {/* Incidencias Finalizadas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Finalizadas</h3>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{generalData.incidenciasFinalizadas.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Incidencias completadas</p>
              </>
            )}
          </div>
        </div>

        {/* Total Operadores */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Operadores</h3>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{generalData.totalOperadores.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Personal operativo</p>
              </>
            )}
          </div>
        </div>

        {/* Total Cazadores */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Cazadores</h3>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{generalData.totalCazadores.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Personal especializado</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/*
       {/* Gráficos principales 
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Tendencia de Incidencias</h3>
            <p className="text-sm text-gray-500">Comparación entre incidencias asignadas y atendidas</p>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cazadorAsignadas"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Cazador - Asignadas"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="cazadorAtendidas"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Cazador - Atendidas"
                />
                <Line
                  type="monotone"
                  dataKey="operadorAsignadas"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Operador - Asignadas"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="operadorAtendidas"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Operador - Atendidas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Comparación por Período</h3>
            <p className="text-sm text-gray-500">Incidencias atendidas por tipo de usuario</p>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cazadorAtendidas" fill="#3b82f6" name="Cazadores" />
                <Bar dataKey="operadorAtendidas" fill="#10b981" name="Operadores" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Análisis detallado 
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Tasa de Conversión por Tipo</h3>
            <p className="text-sm text-gray-500">Eficiencia de resolución</p>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={conversionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {conversionData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Resumen por Usuario</h3>
            <p className="text-sm text-gray-500">Total de incidencias atendidas</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Cazadores</p>
                  <p className="text-sm text-gray-500">Especialistas</p>
                </div>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {cazadorTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Operadores</p>
                  <p className="text-sm text-gray-500">Soporte general</p>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                {operadorTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Indicadores Clave</h3>
            <p className="text-sm text-gray-500">KPIs principales del período</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Promedio diario</span>
              <span className="text-sm">{Math.round(totalAtendidas / (timeFilter === "weekly" ? 28 : 180))}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mejor período</span>
              <span className="text-sm">
                {
                  currentData.reduce((max, item) =>
                    item.cazadorAtendidas + item.operadorAtendidas > max.cazadorAtendidas + max.operadorAtendidas
                      ? item
                      : max,
                  ).period
                }
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pendientes</span>
              <span className="border border-orange-600 text-orange-600 px-2 py-1 rounded text-sm">
                {totalAsignadas - totalAtendidas}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado</span>
              <span className={`px-2 py-1 rounded text-sm ${Number(tendencia) >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {Number(tendencia) >= 0 ? "Mejorando" : "Declinando"}
              </span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Tabla detallada por persona */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold">Rendimiento Individual</h3>
              <p className="text-sm text-gray-500">Métricas detalladas por Cazador y Operador</p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={limit}
                onChange={(e) => handlePageLimitChange(1, parseInt(e.target.value))}
                className="w-[100px] p-2 border rounded-md"
                title="Elementos por página"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  // Reset a página 1 cuando cambia el filtro
                  const searchParams = new URLSearchParams(location.search)
                  searchParams.set('page', '1')
                  navigate({ search: searchParams.toString() })
                }}
                className="w-[150px] p-2 border rounded-md"
                title="Fecha de inicio"
              />
              <select
                className="w-[180px] p-2 border rounded-md"
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value)
                  // Reset a página 1 cuando cambia el filtro
                  const searchParams = new URLSearchParams(location.search)
                  searchParams.set('page', '1')
                  navigate({ search: searchParams.toString() })
                }}
              >
                <option value="cazador">Cazadores</option>
                <option value="operador">Operadores</option>
              </select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Buscar persona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px] p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-md ">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Persona</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("tipo")}>
                    <div className="flex items-center space-x-1">
                      <span>Tipo</span>
                      {sortField === "tipo" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("asignadas")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Asignadas</span>
                      {sortField === "asignadas" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("resueltas")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Resueltas</span>
                      {sortField === "resueltas" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("conversion")}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Conversión</span>
                      {sortField === "conversion" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  {/* Columna de Tendencia comentada - el endpoint no provee esta data */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Cargando datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedPersonalData.map((person) => (
                  <tr key={person.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                          {person.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{person.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${person.tipo === "Cazador" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                      >
                        {person.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{person.asignadas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">{person.resueltas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className={`h-2 w-16 rounded-full bg-gray-200`}>
                          <div
                            className={`h-2 rounded-full ${person.conversion >= 90
                              ? "bg-green-500"
                              : person.conversion >= 85
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              }`}
                            style={{ width: `${person.conversion}%` }}
                          />
                        </div>
                        <span className="font-medium text-sm w-12">{person.conversion}%</span>
                      </div>
                    </td>
                    {/* Celda de Tendencia comentada - el endpoint no provee esta data */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && sortedPersonalData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay datos disponibles"}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>
              {totalCount > 0 ? (
                <>Elementos por página: {limit}</>
              ) : (
                "No hay datos para mostrar"
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-4 rounded-full bg-green-500" />
                <span>≥90% Excelente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-4 rounded-full bg-yellow-500" />
                <span>85-89% Bueno</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-4 rounded-full bg-red-500" />
                <span>{"<85% Necesita mejora"}</span>
              </div>
            </div>
          </div>

          {/* Controles de paginación mejorados */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 mt-4">
              {/* Información de paginación */}
              <div className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalCount)} de {totalCount} resultados
              </div>

              {/* Controles de navegación */}
              <div className="flex items-center space-x-1">
                {/* Botón Primera página */}
                <button
                  onClick={() => handlePageLimitChange(1, limit)}
                  disabled={currentPage === 1 || loading}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Primera página"
                >
                  ««
                </button>

                {/* Botón Anterior */}
                <button
                  onClick={() => handlePageLimitChange(Math.max(1, currentPage - 1), limit)}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {/* Números de página */}
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageLimitChange(pageNum + 1, limit)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:cursor-not-allowed ${currentPage === pageNum + 1
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-gray-700'
                      }`}
                  >
                    {pageNum + 1}
                  </button>
                ))}

                {/* Botón Siguiente */}
                <button
                  onClick={() => handlePageLimitChange(Math.min(totalPages, currentPage + 1), limit)}
                  disabled={currentPage >= totalPages || loading}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>

                {/* Botón Última página */}
                <button
                  onClick={() => handlePageLimitChange(totalPages, limit)}
                  disabled={currentPage >= totalPages || loading}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
