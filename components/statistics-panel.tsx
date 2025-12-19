"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp } from "lucide-react"

interface StatisticsPanelProps {
  employees: any[]
  schedules: any
  monthKey: string
  currentMonth: number
  currentYear: number
}

export default function StatisticsPanel({
  employees,
  schedules,
  monthKey,
  currentMonth,
  currentYear,
}: StatisticsPanelProps) {
  const stats = employees.map((emp) => {
    let totalGuards = 0
    const daysByWeekday = { lun: 0, mar: 0, mié: 0, jue: 0, vie: 0, sáb: 0, dom: 0 }
    const weekdayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]

    Object.entries(schedules).forEach(([monthKeyEntry, monthSchedule]: [string, any]) => {
      const [year, month] = monthKeyEntry.split("-").map(Number)
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      for (let day = 1; day <= daysInMonth; day++) {
        if (monthSchedule[day] === emp.id) {
          totalGuards++
          const dayOfWeek = new Date(year, month, day).getDay()
          daysByWeekday[weekdayNames[dayOfWeek]]++
        }
      }
    })

    return {
      id: emp.id,
      name: emp.name,
      rank: emp.rank,
      totalGuards,
      daysByWeekday,
    }
  })

  const maxGuards = Math.max(...stats.map((s) => s.totalGuards), 1)

  const avgGuards = stats.reduce((sum, s) => sum + s.totalGuards, 0) / stats.length

  const calculateBalanceScore = (daysByWeekday: any) => {
    const values = Object.values(daysByWeekday) as number[]
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
    return Math.sqrt(variance).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Total de Guardias</p>
              <p className="text-3xl font-bold">{stats.reduce((sum, s) => sum + s.totalGuards, 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Promedio por Persona</p>
              <p className="text-3xl font-bold">{avgGuards.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Meses Registrados</p>
              <p className="text-3xl font-bold">{Object.keys(schedules).length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-800">
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Resumen Global de Guardias - 2026/2027
          </h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Rango</TableHead>
                <TableHead className="text-center">Guardias (Global)</TableHead>
                <TableHead>Distribución</TableHead>
                <TableHead className="text-center">Lun</TableHead>
                <TableHead className="text-center">Mar</TableHead>
                <TableHead className="text-center">Mié</TableHead>
                <TableHead className="text-center">Jue</TableHead>
                <TableHead className="text-center">Vie</TableHead>
                <TableHead className="text-center">Sáb</TableHead>
                <TableHead className="text-center">Dom</TableHead>
                <TableHead className="text-center">Equilibrio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        stat.rank === "R5"
                          ? "bg-purple-100 text-purple-800"
                          : stat.rank === "R4"
                            ? "bg-blue-100 text-blue-800"
                            : stat.rank === "R3"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {stat.rank}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold">{stat.totalGuards}</TableCell>
                  <TableCell className="w-32">
                    <Progress value={(stat.totalGuards / maxGuards) * 100} className="h-2" />
                  </TableCell>
                  <TableCell className="text-center">{stat.daysByWeekday.lun}</TableCell>
                  <TableCell className="text-center">{stat.daysByWeekday.mar}</TableCell>
                  <TableCell className="text-center">{stat.daysByWeekday.mié}</TableCell>
                  <TableCell className="text-center">{stat.daysByWeekday.jue}</TableCell>
                  <TableCell className="text-center">{stat.daysByWeekday.vie}</TableCell>
                  <TableCell className="text-center">{stat.daysByWeekday.sáb}</TableCell>
                  <TableCell className="text-center">{stat.daysByWeekday.dom}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        Number.parseFloat(calculateBalanceScore(stat.daysByWeekday)) < 1.5
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {calculateBalanceScore(stat.daysByWeekday)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 border-t pt-4">
            <p className="font-semibold mb-1">Equilibrio:</p>
            <p>
              Mide la desviación estándar de días de semana. Menor valor = mejor balance (más uniforme). Verde {"<"}{" "}
              1.5, Amarillo ≥ 1.5
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
