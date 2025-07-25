"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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

// Agregar estos imports adicionales al inicio del archivo
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowUpIcon, ArrowDownIcon, Search } from "lucide-react"

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

// Agregar estos datos simulados después de los datos existentes (después de conversionData)
const personalData = [
  {
    id: 1,
    nombre: "Ana García",
    tipo: "Cazador",
    asignadas: 45,
    resueltas: 42,
    conversion: 93.3,
    tendencia: 8.5,
    avatar: "AG",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    tipo: "Cazador",
    asignadas: 38,
    resueltas: 35,
    conversion: 92.1,
    tendencia: -2.1,
    avatar: "CM",
  },
  {
    id: 3,
    nombre: "María López",
    tipo: "Operador",
    asignadas: 52,
    resueltas: 48,
    conversion: 92.3,
    tendencia: 12.3,
    avatar: "ML",
  },
  {
    id: 4,
    nombre: "Diego Ruiz",
    tipo: "Cazador",
    asignadas: 41,
    resueltas: 36,
    conversion: 87.8,
    tendencia: -5.2,
    avatar: "DR",
  },
  {
    id: 5,
    nombre: "Laura Fernández",
    tipo: "Operador",
    asignadas: 47,
    resueltas: 44,
    conversion: 93.6,
    tendencia: 6.8,
    avatar: "LF",
  },
  {
    id: 6,
    nombre: "Roberto Silva",
    tipo: "Cazador",
    asignadas: 39,
    resueltas: 34,
    conversion: 87.2,
    tendencia: -1.5,
    avatar: "RS",
  },
  {
    id: 7,
    nombre: "Patricia Morales",
    tipo: "Operador",
    asignadas: 44,
    resueltas: 41,
    conversion: 93.2,
    tendencia: 4.7,
    avatar: "PM",
  },
  {
    id: 8,
    nombre: "Andrés Castro",
    tipo: "Cazador",
    asignadas: 36,
    resueltas: 32,
    conversion: 88.9,
    tendencia: 3.2,
    avatar: "AC",
  },
]

const COLORS = ["#3b82f6", "#10b981"]

export default function Component() {
  const [timeFilter, setTimeFilter] = useState("monthly")
  const [userType, setUserType] = useState("all")

  // Agregar este estado después de los estados existentes
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("conversion")
  const [sortDirection, setSortDirection] = useState("desc")

  const currentData = timeFilter === "weekly" ? weeklyData : monthlyData

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

  // Agregar estas funciones antes del return
  const filteredPersonalData = personalData.filter(
    (person) =>
      person.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (userType === "all" || person.tipo.toLowerCase() === userType),
  )

  const sortedPersonalData = [...filteredPersonalData].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    const numA = Number(aValue)
    const numB = Number(bValue)
    return sortDirection === "asc" ? numA - numB : numB - numA
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas de Incidencias</h1>
          <p className="text-muted-foreground">Análisis de rendimiento de Cazadores y Operadores</p>
        </div>

        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Por Semana</SelectItem>
              <SelectItem value="monthly">Por Mes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de Usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="cazador">Cazadores</SelectItem>
              <SelectItem value="operador">Operadores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asignadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAsignadas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {timeFilter === "weekly" ? "Últimas 4 semanas" : "Últimos 6 meses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Atendidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAtendidas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Incidencias resueltas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasaConversionGeneral}%</div>
            <p className="text-xs text-muted-foreground">Eficiencia general</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
            {Number(tendencia) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(tendencia) >= 0 ? "+" : ""}
              {tendencia}%
            </div>
            <p className="text-xs text-muted-foreground">vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Incidencias</CardTitle>
            <CardDescription>Comparación entre incidencias asignadas y atendidas</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparación por Período</CardTitle>
            <CardDescription>Incidencias atendidas por tipo de usuario</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Conversión por Tipo</CardTitle>
            <CardDescription>Eficiencia de resolución</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen por Usuario</CardTitle>
            <CardDescription>Total de incidencias atendidas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Cazadores</p>
                  <p className="text-sm text-muted-foreground">Especialistas</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {cazadorTotal.toLocaleString()}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Operadores</p>
                  <p className="text-sm text-muted-foreground">Soporte general</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {operadorTotal.toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores Clave</CardTitle>
            <CardDescription>KPIs principales del período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Badge variant="outline" className="text-orange-600">
                {totalAsignadas - totalAtendidas}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado</span>
              <Badge variant={Number(tendencia) >= 0 ? "default" : "destructive"}>
                {Number(tendencia) >= 0 ? "Mejorando" : "Declinando"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla detallada por persona */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle>Rendimiento Individual</CardTitle>
              <CardDescription>Métricas detalladas por Cazador y Operador</CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar persona..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("tipo")}>
                    <div className="flex items-center space-x-1">
                      <span>Tipo</span>
                      {sortField === "tipo" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-right"
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
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-right"
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
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-right"
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
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-right"
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
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPersonalData.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {person.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{person.nombre}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={person.tipo === "Cazador" ? "default" : "secondary"}
                        className={
                          person.tipo === "Cazador" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }
                      >
                        {person.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{person.asignadas}</TableCell>
                    <TableCell className="text-right font-medium">{person.resueltas}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className={`h-2 w-16 rounded-full bg-gray-200`}>
                          <div
                            className={`h-2 rounded-full ${
                              person.conversion >= 90
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
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedPersonalData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron resultados para "{searchTerm}"
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>
    </div>
  )
}
