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
import { incidenceStatistics } from "../../api/dashboard/DashboardApi"

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
  const [timeFilter, setTimeFilter] = useState("monthly")
  const [userType, setUserType] = useState("all")

  // Estados para la tabla de rendimiento individual
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("finished")
  const [sortDirection, setSortDirection] = useState("desc")
  const [personalData, setPersonalData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [summaryData, setSummaryData] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const currentData = timeFilter === "weekly" ? weeklyData : monthlyData

  // Función para cargar datos de la API
  const loadPersonalData = async () => {
    setLoading(true)
    try {
      const params = {
        limit: 10,
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

  // useEffect para cargar datos cuando cambien los filtros
  useEffect(() => {
    loadPersonalData()
  }, [currentPage, searchTerm, userType, startDate])

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

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(0) // Reset page when searching
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
          <select
            className="w-[180px] p-2 border rounded-md"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="weekly">Por Semana</option>
            <option value="monthly">Por Mes</option>
          </select>

          <select
            className="w-[180px] p-2 border rounded-md"
            value={userType}
            onChange={(e) => {
              setUserType(e.target.value)
              setCurrentPage(0) // Reset page when changing filter
            }}
          >
            <option value="all">Todos</option>
            <option value="cazador">Cazadores</option>
            <option value="operador">Operadores</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Asignadas</h3>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalAsignadas.toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              {timeFilter === "weekly" ? "Últimas 4 semanas" : "Últimos 6 meses"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Atendidas</h3>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalAtendidas.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Incidencias resueltas</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Tasa de Conversión</h3>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{tasaConversionGeneral}%</div>
            <p className="text-xs text-gray-500">Eficiencia general</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Tendencia</h3>
            {Number(tendencia) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <div className="text-2xl font-bold">
              {Number(tendencia) >= 0 ? "+" : ""}
              {tendencia}%
            </div>
            <p className="text-xs text-gray-500">vs período anterior</p>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
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

      {/* Análisis detallado */}
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
      </div>

      {/* Tabla detallada por persona */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold">Rendimiento Individual</h3>
              <p className="text-sm text-gray-500">Métricas detalladas por Cazador y Operador</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(0)
                }}
                className="w-[150px] p-2 border rounded-md"
                title="Fecha de inicio"
              />
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Buscar persona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px] p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-md border">
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
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          person.tipo === "Cazador" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
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
              Mostrando {sortedPersonalData.length} de {totalCount} personas
              {totalPages > 1 && ` (Página ${currentPage + 1} de ${totalPages})`}
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

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0 || loading}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="text-sm text-gray-500">
                Página {currentPage + 1} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
