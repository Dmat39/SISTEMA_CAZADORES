import React from "react"
import { IncidentBarChart } from "../components/incident-bar-chart"
import { IncidentLineChart } from "../components/incident-line-chart"

// Datos de ejemplo basados en la estructura proporcionada
const sampleData = {
  data: {
    general: {
      total: 156,
      process: 45,
      completed: 89,
      finished: 22,
      hunters: 17,
      operators: 72,
    },
    trends: {
      totalAssigned: 156,
      totalFinished: 111,
      days: [
        {
          date: "2025-08-11",
          totalAssigned: 23,
          totalFinished: 18,
          hours: [
            { hour: 0, assigned: 1, finished: 2 },
            { hour: 1, assigned: 0, finished: 1 },
            { hour: 2, assigned: 2, finished: 0 },
            { hour: 3, assigned: 1, finished: 3 },
            { hour: 4, assigned: 0, finished: 1 },
            { hour: 5, assigned: 3, finished: 2 },
            { hour: 6, assigned: 2, finished: 1 },
            { hour: 7, assigned: 4, finished: 2 },
            { hour: 8, assigned: 5, finished: 3 },
            { hour: 9, assigned: 3, finished: 4 },
            { hour: 10, assigned: 2, finished: 2 },
            { hour: 11, assigned: 1, finished: 1 },
            { hour: 12, assigned: 3, finished: 2 },
            { hour: 13, assigned: 4, finished: 5 },
            { hour: 14, assigned: 6, finished: 3 },
            { hour: 15, assigned: 5, finished: 4 },
            { hour: 16, assigned: 3, finished: 2 },
            { hour: 17, assigned: 2, finished: 3 },
            { hour: 18, assigned: 1, finished: 2 },
            { hour: 19, assigned: 2, finished: 1 },
            { hour: 20, assigned: 1, finished: 0 },
            { hour: 21, assigned: 0, finished: 1 },
            { hour: 22, assigned: 1, finished: 0 },
            { hour: 23, assigned: 0, finished: 1 },
          ],
        },
        {
          date: "2025-08-12",
          totalAssigned: 31,
          totalFinished: 25,
          hours: [
            { hour: 0, assigned: 2, finished: 1 },
            { hour: 1, assigned: 1, finished: 2 },
            { hour: 2, assigned: 0, finished: 1 },
            { hour: 3, assigned: 2, finished: 1 },
            { hour: 4, assigned: 1, finished: 2 },
            { hour: 5, assigned: 3, finished: 1 },
            { hour: 6, assigned: 4, finished: 3 },
            { hour: 7, assigned: 5, finished: 4 },
            { hour: 8, assigned: 6, finished: 5 },
            { hour: 9, assigned: 4, finished: 3 },
            { hour: 10, assigned: 3, finished: 4 },
            { hour: 11, assigned: 2, finished: 2 },
            { hour: 12, assigned: 4, finished: 3 },
            { hour: 13, assigned: 5, finished: 4 },
            { hour: 14, assigned: 7, finished: 6 },
            { hour: 15, assigned: 6, finished: 5 },
            { hour: 16, assigned: 4, finished: 3 },
            { hour: 17, assigned: 3, finished: 2 },
            { hour: 18, assigned: 2, finished: 3 },
            { hour: 19, assigned: 1, finished: 2 },
            { hour: 20, assigned: 2, finished: 1 },
            { hour: 21, assigned: 1, finished: 1 },
            { hour: 22, assigned: 0, finished: 1 },
            { hour: 23, assigned: 1, finished: 0 },
          ],
        },
        {
          date: "2025-08-13",
          totalAssigned: 28,
          totalFinished: 22,
          hours: [
            { hour: 0, assigned: 1, finished: 1 },
            { hour: 1, assigned: 0, finished: 1 },
            { hour: 2, assigned: 1, finished: 0 },
            { hour: 3, assigned: 2, finished: 2 },
            { hour: 4, assigned: 1, finished: 1 },
            { hour: 5, assigned: 2, finished: 1 },
            { hour: 6, assigned: 3, finished: 2 },
            { hour: 7, assigned: 4, finished: 3 },
            { hour: 8, assigned: 5, finished: 4 },
            { hour: 9, assigned: 3, finished: 3 },
            { hour: 10, assigned: 4, finished: 2 },
            { hour: 11, assigned: 3, finished: 3 },
            { hour: 12, assigned: 2, finished: 2 },
            { hour: 13, assigned: 4, finished: 3 },
            { hour: 14, assigned: 5, finished: 4 },
            { hour: 15, assigned: 4, finished: 3 },
            { hour: 16, assigned: 3, finished: 2 },
            { hour: 17, assigned: 2, finished: 2 },
            { hour: 18, assigned: 1, finished: 1 },
            { hour: 19, assigned: 2, finished: 1 },
            { hour: 20, assigned: 1, finished: 2 },
            { hour: 21, assigned: 0, finished: 1 },
            { hour: 22, assigned: 1, finished: 0 },
            { hour: 23, assigned: 0, finished: 1 },
          ],
        },
        {
          date: "2025-08-14",
          totalAssigned: 35,
          totalFinished: 28,
          hours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            assigned: Math.floor(Math.random() * 5) + 1,
            finished: Math.floor(Math.random() * 4) + 1,
          })),
        },
        {
          date: "2025-08-15",
          totalAssigned: 42,
          totalFinished: 35,
          hours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            assigned: Math.floor(Math.random() * 6) + 1,
            finished: Math.floor(Math.random() * 5) + 1,
          })),
        },
        {
          date: "2025-08-16",
          totalAssigned: 29,
          totalFinished: 24,
          hours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            assigned: Math.floor(Math.random() * 4) + 1,
            finished: Math.floor(Math.random() * 3) + 1,
          })),
        },
        {
          date: "2025-08-17",
          totalAssigned: 38,
          totalFinished: 31,
          hours: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            assigned: Math.floor(Math.random() * 5) + 1,
            finished: Math.floor(Math.random() * 4) + 1,
          })),
        },
      ],
    },
  },
  message: "Successful",
  status: true,
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Reportes de Incidencias</h1>
          <p className="text-gray-600">Monitoreo y análisis de incidencias en tiempo real</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <IncidentBarChart data={sampleData} />
          <IncidentLineChart data={sampleData} />
        </div>
      </div>
    </main>
  )
}
