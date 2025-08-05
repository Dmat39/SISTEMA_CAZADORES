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
import DateRangeFilter from "../../components/Supervisors/DateRangeFilter"
import CustomTablePagination from "../../components/Pagination/TablePagination"
import UserTypeSelector from "../../components/UI/UserTypeSelector"

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
  const [startDate, setStartDate] = useState("")

  // Obtener parámetros de URL para paginación y filtros
  const searchParams = new URLSearchParams(location.search)
  const currentPage = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10
  const generalStartDate = searchParams.get('start') || ''
  const generalEndDate = searchParams.get('end') || ''

  // Estados para los datos generales
  const [generalData, setGeneralData] = useState({
    totalIncidencias: 0,
    incidenciasEnProceso: 0,
    incidenciasFinalizadas: 0,
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
          <DateRangeFilter
            containerStyle={{
              position: "relative",
              left: "0",
              top: "0",
              zIndex: "1500",
              width: "100%",
              height: "100%",
            }}
            sx={{

            }}
          />
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Selector de fecha moderno */}
              <div className="relative group">
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
                  className="w-full sm:w-[160px] h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 hover:shadow-sm group-hover:shadow-sm"
                  title="Fecha de inicio"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>

              {/* Selector de tipo moderno con Headless UI */}
              <UserTypeSelector
                value={userType}
                onChange={(newValue) => {
                  setUserType(newValue)
                  // Reset a página 1 cuando cambia el filtro
                  const searchParams = new URLSearchParams(location.search)
                  searchParams.set('page', '1')
                  navigate({ search: searchParams.toString() })
                }}
                className="w-[190px]"
              />

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
                              className={`h-2 rounded-full ${person.conversion >= 80
                                ? "bg-green-500"
                                : person.conversion >= 40
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

            {/* Leyenda de colores para las barras de conversión */}
            <div className="flex items-center justify-end mt-4 text-sm text-gray-500">
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

