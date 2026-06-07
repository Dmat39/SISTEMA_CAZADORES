/**
 * ARCHIVO DEPRECADO - NO UTILIZAR
 * 
 * Este archivo contiene datos mock/falsos y ya no se utiliza.
 * Usar en su lugar: Dashboard_admin.jsx que conecta con la API real.
 * 
 * Dashboard Administrativo - Métricas de Incidencias (VERSIÓN ANTIGUA CON DATOS MOCK)
 * 
 * Este componente proporciona una vista completa del rendimiento de Cazadores y Operadores
 * en el manejo de incidencias, incluyendo métricas, gráficos y análisis detallado.
 * 
 * ⚠️ IMPORTANTE: Este archivo usa datos simulados/mock.
 * Para datos reales de la API, usar Dashboard_admin.jsx
 * 
 * @author Sistema de Gestión Municipal
 * @version 1.0.0 (DEPRECADO)
 */

"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle } from "lucide-react"
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

// Importar componentes existentes
import Overview from "../../components/Dashboard/Overview"
import IncidenceBarChart from "../../components/Dashboard/IncidenceBarChart"
import IncidenceAreaChart from "../../components/Dashboard/IncidenceAreaChart"
import { ArrowUpIcon, ArrowDownIcon, Search } from "lucide-react"
import CustomTable from "../../components/CustomTable"

/**
 * DATOS SIMULADOS PARA MÉTRICAS
 * En producción, estos datos deberían venir de una API o base de datos
 */

/**
 * Datos de incidencias por semana
 * @type {Array<Object>} Array de objetos con métricas semanales
 * @property {string} period - Período de tiempo (Sem 1, Sem 2, etc.)
 * @property {number} cazadorAsignadas - Incidencias asignadas a cazadores
 * @property {number} cazadorAtendidas - Incidencias atendidas por cazadores
 * @property {number} operadorAsignadas - Incidencias asignadas a operadores
 * @property {number} operadorAtendidas - Incidencias atendidas por operadores
 */
const weeklyData = [
  { period: "Sem 1", cazadorAsignadas: 45, cazadorAtendidas: 38, operadorAsignadas: 32, operadorAtendidas: 28 },
  { period: "Sem 2", cazadorAsignadas: 52, cazadorAtendidas: 44, operadorAsignadas: 38, operadorAtendidas: 35 },
  { period: "Sem 3", cazadorAsignadas: 48, cazadorAtendidas: 42, operadorAsignadas: 35, operadorAtendidas: 31 },
  { period: "Sem 4", cazadorAsignadas: 58, cazadorAtendidas: 51, operadorAsignadas: 42, operadorAtendidas: 39 },
]

/**
 * Datos de incidencias por mes
 * @type {Array<Object>} Array de objetos con métricas mensuales
 * Misma estructura que weeklyData pero con períodos mensuales
 */
const monthlyData = [
  { period: "Ene", cazadorAsignadas: 180, cazadorAtendidas: 165, operadorAsignadas: 140, operadorAtendidas: 128 },
  { period: "Feb", cazadorAsignadas: 195, cazadorAtendidas: 178, operadorAsignadas: 155, operadorAtendidas: 142 },
  { period: "Mar", cazadorAsignadas: 210, cazadorAtendidas: 192, operadorAsignadas: 168, operadorAtendidas: 158 },
  { period: "Abr", cazadorAsignadas: 225, cazadorAtendidas: 208, operadorAsignadas: 175, operadorAtendidas: 165 },
  { period: "May", cazadorAsignadas: 240, cazadorAtendidas: 220, operadorAsignadas: 185, operadorAtendidas: 172 },
  { period: "Jun", cazadorAsignadas: 235, cazadorAtendidas: 215, operadorAsignadas: 180, operadorAtendidas: 168 },
]

/**
 * Datos de tasa de conversión por tipo de usuario
 * @type {Array<Object>} Array con tasas de conversión
 * @property {string} name - Tipo de usuario (Cazadores/Operadores)
 * @property {number} value - Porcentaje de conversión
 * @property {string} color - Color hexadecimal para gráficos
 */
const conversionData = [
  { name: "Cazadores", value: 88.5, color: "#3b82f6" },
  { name: "Operadores", value: 92.1, color: "#10b981" },
]

/**
 * Datos de rendimiento individual del personal
 * @type {Array<Object>} Array con métricas individuales
 * @property {number} id - Identificador único
 * @property {string} nombre - Nombre completo del empleado
 * @property {string} tipo - Tipo de usuario (Cazador/Operador)
 * @property {number} asignadas - Incidencias asignadas
 * @property {number} resueltas - Incidencias resueltas
 * @property {number} conversion - Porcentaje de conversión
 * @property {number} tendencia - Tendencia de rendimiento (positiva/negativa)
 * @property {string} avatar - Iniciales para avatar
 */


/** Colores para gráficos de torta */
const COLORS = ["#3b82f6", "#10b981"]

/**
 * Componente principal del Dashboard Administrativo
 * 
 * Maneja el estado de filtros, ordenamiento y visualización de métricas.
 * Proporciona una interfaz completa para analizar el rendimiento del equipo.
 * 
 * @returns {JSX.Element} Componente del dashboard
 */
const DashboardAdmin = () => {
  // Estados para filtros y controles de la interfaz
  const [timeFilter, setTimeFilter] = useState("monthly") // Filtro temporal: "weekly" | "monthly"
  const [userType, setUserType] = useState("all") // Filtro por tipo: "all" | "cazador" | "operador"
  const [searchTerm, setSearchTerm] = useState("") // Término de búsqueda para tabla
  const [sortField, setSortField] = useState("conversion") // Campo de ordenamiento
  const [sortDirection, setSortDirection] = useState("desc") // Dirección: "asc" | "desc"

  // Seleccionar datos según filtro temporal
  const currentData = timeFilter === "weekly" ? weeklyData : monthlyData

  /**
   * CÁLCULOS DE MÉTRICAS PRINCIPALES
   */

  // Totales generales
  const totalAsignadas = currentData.reduce((acc, item) => acc + item.cazadorAsignadas + item.operadorAsignadas, 0)
  const totalAtendidas = currentData.reduce((acc, item) => acc + item.cazadorAtendidas + item.operadorAtendidas, 0)
  const tasaConversionGeneral = ((totalAtendidas / totalAsignadas) * 100).toFixed(1)

  // Totales por tipo de usuario
  const cazadorTotal = currentData.reduce((acc, item) => acc + item.cazadorAtendidas, 0)
  const operadorTotal = currentData.reduce((acc, item) => acc + item.operadorAtendidas, 0)

  /**
   * Calcular tendencia comparando último período vs anterior
   * @type {string} Porcentaje de cambio en formato string
   */
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

  /**
   * FILTRADO Y ORDENAMIENTO DE DATOS DE PERSONAL
   */

  // Filtrar por búsqueda y tipo de usuario
  const filteredPersonalData = personalData.filter(
    (person) =>
      person.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (userType === "all" || person.tipo.toLowerCase() === userType),
  )

  // Ordenar datos filtrados
  const sortedPersonalData = [...filteredPersonalData].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    // Ordenamiento para strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    // Ordenamiento para números
    const numA = Number(aValue)
    const numB = Number(bValue)
    return sortDirection === "asc" ? numA - numB : numB - numA
  })

  /**
   * Manejar cambio de ordenamiento en tabla
   * @param {string} field - Campo por el cual ordenar
   */
  const handleSort = (field) => {
    if (sortField === field) {
      // Si es el mismo campo, cambiar dirección
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Si es campo nuevo, ordenar descendente por defecto
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ESTRUCTURA DEL DASHBOARD:
          1. Encabezado con título y controles de filtro
          2. Componente Overview (métricas generales)
          3. Gráficos principales (líneas y barras)
          4. Análisis detallado (torta, resúmenes, KPIs)
          5. Tabla de rendimiento individual
      */}
      {/* ENCABEZADO Y CONTROLES */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas de Incidencias</h1>
          <p className="text-gray-600 dark:text-gray-400">Análisis de rendimiento de Cazadores y Operadores</p>
        </div>

        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative">
            <select
              className="w-[180px] p-2 border rounded-md"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="weekly">Por Semana</option>
              <option value="monthly">Por Mes</option>
            </select>
          </div>

          <div className="relative">
            <select
              className="w-[180px] p-2 border rounded-md"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="cazador">Cazadores</option>
              <option value="operador">Operadores</option>
            </select>
          </div>
        </div>
      </div>

      {/* MÉTRICAS GENERALES - Componente Overview existente */}
      <Overview />

      {/* GRÁFICOS PRINCIPALES */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2">
            <h3 className="text-lg font-medium">Tendencia de Incidencias</h3>
            <p className="text-sm text-gray-500">Comparación entre incidencias asignadas y atendidas</p>
          </div>
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

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2">
            <h3 className="text-lg font-medium">Comparación por Período</h3>
            <p className="text-sm text-gray-500">Incidencias atendidas por tipo de usuario</p>
          </div>
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

      {/* ANÁLISIS DETALLADO - Gráfico de torta, resúmenes y KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2">
            <h3 className="text-lg font-medium">Tasa de Conversión por Tipo</h3>
            <p className="text-sm text-gray-500">Eficiencia de resolución</p>
          </div>
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

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2">
            <h3 className="text-lg font-medium">Resumen por Usuario</h3>
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
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                {cazadorTotal.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Operadores</p>
                  <p className="text-sm text-gray-500">Soporte general</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                {operadorTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-2">
            <h3 className="text-lg font-medium">Indicadores Clave</h3>
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
              <div className="border border-orange-600 text-orange-600 px-2 py-1 rounded-md text-sm">
                {totalAsignadas - totalAtendidas}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado</span>
              <div className={`px-2 py-1 rounded-md text-sm ${Number(tendencia) >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {Number(tendencia) >= 0 ? "Mejorando" : "Declinando"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE RENDIMIENTO INDIVIDUAL */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
          <div>
            <h3 className="text-lg font-medium">Rendimiento Individual</h3>
            <p className="text-sm text-gray-500">Métricas detalladas por Cazador y Operador</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar persona..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[200px] p-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persona
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("tipo")}
                >
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
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("tendencia")}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Tendencia</span>
                    {sortField === "tendencia" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPersonalData.map((person) => (
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
                    <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${person.tipo === "Cazador" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}>
                      {person.tipo}
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {person.tendencia >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`font-medium text-sm ${person.tendencia >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {person.tendencia >= 0 ? "+" : ""}
                        {person.tendencia}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedPersonalData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron resultados para "{searchTerm}"
          </div>
        )}

        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div>
            Mostrando {sortedPersonalData.length} de {personalData.length} personas
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
      </div>
    </div>
  )
}

export default DashboardAdmin