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
import { dashboardData, incidenceStatistics, incidenceGeneral } from "../../api/dashboard/DashboardApi"
import { useNavigate, useLocation } from 'react-router-dom'
import DateRangeFilter from "../../components/Supervisors/DateRangeFilter"
import CustomTablePagination from "../../components/Pagination/TablePagination"
import UserTypeSelector from "../../components/Dashboard/UserTypeSelector"
import { IncidentBarChart } from "../../components/Dashboard/incident-bar-chart"
import { IncidentLineChart } from "../../components/Dashboard/incident-line-chart"

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

  // Obtener parámetros de URL para paginación y filtros
  const searchParams = new URLSearchParams(location.search)
  const currentPage = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10
  
  // Calcular fechas del último mes (30 días desde ayer) por defecto
  const getDefaultDateRange = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    const startDate = new Date(yesterday)
    startDate.setDate(yesterday.getDate() - 29) // 30 días incluyendo ayer
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: yesterday.toISOString().split('T')[0]
    }
  }
  
  const defaultDates = getDefaultDateRange()
  const generalStartDate = searchParams.get('start') || defaultDates.start
  const generalEndDate = searchParams.get('end') || defaultDates.end

  // Estados para los datos generales
  const [generalData, setGeneralData] = useState({
    totalIncidencias: 0,
    incidenciasEnProceso: 0,
    incidenciasFinalizadas: 0,
    incidenciasCompletadas: 0, // Nueva métrica
    totalOperadores: 0,
    totalCazadores: 0
  })
  const [loadingGeneral, setLoadingGeneral] = useState(false)



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

      // Usar la nueva API dashboard
      const response = await dashboardData(params)

      if (response.data.status) {
        const dashboardData = response.data.data.general
        setGeneralData({
          totalIncidencias: dashboardData.total || 0,
          incidenciasEnProceso: dashboardData.process || 0,
          incidenciasFinalizadas: dashboardData.finished || 0,
          incidenciasCompletadas: dashboardData.completed || 0, // Nueva métrica
          totalOperadores: dashboardData.operators || 0,
          totalCazadores: dashboardData.hunters || 0
        })


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

      // Usar las fechas globales del DateRangeFilter
      if (generalStartDate) {
        params.start = generalStartDate
      }

      if (generalEndDate) {
        params.end = generalEndDate
      }

      // Usar la nueva API dashboard
      const response = await dashboardData(params)

      if (response.data.status) {
        const performanceData = response.data.data.performance
        const apiData = performanceData.data.map(user => ({
          id: user.id,
          nombre: `${user.name} ${user.lastname}`,
          tipo: user.rol === "hunter" ? "Cazador" : "Operador",
          asignadas: user.asigned,
          resueltas: user.finished,
          conversion: user.asigned > 0 ? ((user.finished / user.asigned) * 100).toFixed(1) : 0,
          // tendencia: 0, // Comentado - se implementará más adelante
          avatar: `${user.name.charAt(0)}${user.lastname.charAt(0)}`,
          dni: user.dni,
          phone: user.phone
        }))

        setPersonalData(apiData)
        setTotalPages(performanceData.totalPages || 1)
        setTotalCount(performanceData.totalCount || 0)
      }
    } catch (error) {
      console.error('Error loading personal data:', error)
    } finally {
      setLoading(false)
    }
  }

  // useEffect para cargar datos generales cuando cambien las fechas desde URL
  useEffect(() => {
    loadGeneralData()
  }, [generalStartDate, generalEndDate])

  // useEffect para cargar datos cuando cambien los filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPersonalData()
    }, searchTerm ? 500 : 0) // Debounce solo si hay búsqueda

    return () => clearTimeout(timer)
  }, [currentPage, limit, searchTerm, userType, generalStartDate, generalEndDate])

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
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-screen transition-colors duration-200">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-200">Métricas de Incidencias</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">Análisis de rendimiento de Cazadores y Operadores</p>
        </div>

        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <DateRangeFilter
            containerStyle={{
              position: "relative",
              left: "0",
              top: "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: "1",
              width: "100%",
              height: "100%",
            }}
            sx={{

            }}
          />
        </div>
      </div>

      {/* Métricas principales - Datos del endpoint dashboard */}
      <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-6">
        {/* Total Incidencias */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 transition-colors duration-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Incidencias</h3>
            <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{generalData.totalIncidencias.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Incidencias registradas</p>
              </>
            )}
          </div>
        </div>

        {/* Incidencias En Proceso */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 transition-colors duration-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">En Proceso</h3>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 dark:border-orange-400"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{generalData.incidenciasEnProceso.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Incidencias pendientes</p>
              </>
            )}
          </div>
        </div>

        {/* Incidencias Finalizadas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 transition-colors duration-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Finalizadas</h3>
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 dark:border-green-400"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{generalData.incidenciasFinalizadas.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Incidencias completadas</p>
              </>
            )}
          </div>
        </div>

        {/* Incidencias Completadas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 transition-colors duration-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Completado</h3>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{generalData.incidenciasCompletadas.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Incidencias completadas</p>
              </>
            )}
          </div>
        </div>

        {/* Total Operadores */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 transition-colors duration-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Operadores</h3>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 dark:border-purple-400"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{generalData.totalOperadores.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Personal operativo</p>
              </>
            )}
          </div>
        </div>

        {/* Total Cazadores */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 transition-colors duration-200">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Cazadores</h3>
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            {loadingGeneral ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{generalData.totalCazadores.toLocaleString()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Personal especializado</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos principales con shadcn/ui */}
      <div className="grid gap-6 md:grid-cols-2">
        <IncidentLineChart />
        <IncidentBarChart />
      </div>

      {/* Análisis detallado */}
      {/* <div className="grid gap-6 md:grid-cols-3">
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
      </div>  */}

      {/* Tabla detallada por persona */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/20 transition-colors duration-200">
        <div className="mb-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rendimiento Individual</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Métricas detalladas de Cazadores</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Selector de tipo comentado - Solo se evalúa rendimiento de cazadores por defecto */}
              {/* <UserTypeSelector
                value={userType}
                onChange={(newValue) => {
                  setUserType(newValue)
                  // Reset a página 1 cuando cambia el filtro
                  const searchParams = new URLSearchParams(location.search)
                  searchParams.set('page', '1')
                  navigate({ search: searchParams.toString() })
                }}
                className="w-[190px]"
              /> */}

              {/* Campo de búsqueda moderno */}
              <div className="relative group flex-1 sm:flex-initial">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar persona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[320px] sm:w-[320px] h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 hover:shadow-sm group-hover:shadow-sm"
                />
                {/* Efecto de búsqueda activa */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    title="Limpiar búsqueda"
                  >
                    <svg className="w-3 h-3 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>

            </div>
          </div>
          <div>
            <div className="rounded-md overflow-x-auto mt-5">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Persona</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" onClick={() => handleSort("tipo")}>
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
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center py-8 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                          <span>Cargando datos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedPersonalData.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                            {person.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{person.nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${person.tipo === "Cazador" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                            }`}
                        >
                          {person.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-gray-100">{person.asignadas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-gray-100">{person.resueltas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className={`h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700`}>
                            <div
                              className={`h-2 rounded-full ${person.conversion >= 80
                                ? "bg-green-500"
                                : person.conversion >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                                }`}
                              style={{ width: `${person.conversion}%` }}
                            />
                          </div>
                          <span className="font-medium text-sm w-12 text-gray-900 dark:text-gray-100">{person.conversion}%</span>
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

            {/* Leyenda de colores para las barras de conversión */}
            <div className="flex items-center justify-end mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-4 rounded-full bg-green-500" />
                  <span>≥80% Excelente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-4 rounded-full bg-yellow-500" />
                  <span>40-80% Bueno</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-4 rounded-full bg-red-500" />
                  <span>{"<40% Necesita mejora"}</span>
                </div>
              </div>
            </div>

            {/* Paginación con componente reutilizable */}
            {totalCount > 0 && (
              <CustomTablePagination
                count={totalCount}
                page={currentPage}
                limit={limit}
                handlePageLimitChange={handlePageLimitChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

