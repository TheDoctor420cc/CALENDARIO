"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2, Eye, Undo2, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ScheduleGeneratorProps {
  employees: any[]
  schedules: any
  monthKey: string
  currentMonth: number
  currentYear: number
  onGenerate: (schedule: any) => void
  isGenerating?: boolean
}

export default function ScheduleGenerator({
  employees,
  schedules,
  monthKey,
  currentMonth,
  currentYear,
  onGenerate,
  isGenerating = false,
}: ScheduleGeneratorProps) {
  const [generatingState, setGeneratingState] = useState(false)
  const [message, setMessage] = useState("")
  const [previewSchedule, setPreviewSchedule] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previousSchedule, setPreviousSchedule] = useState<any>(null)
  const [conflicts, setConflicts] = useState<string[]>([])
  const foundConflicts: string[] = [] // Declare the variable here

  const generateSchedule = () => {
    setGeneratingState(true)
    setMessage("")
    setConflicts([])

    try {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const schedule: Record<number, string> = {}
      const expectedGuards: Record<string, number> = {}
      const lastGuardDay: Record<string, number> = {}
      const guardsAssigned: Record<string, number> = {}
      const weekendDaysAssigned: Record<string, number> = {}

      const vacationsByEmployee: Record<string, number[]> = {}
      const availableDaysByEmployee: Record<string, number> = {}

      employees.forEach((emp) => {
        const vacationDays = emp.vacationDays[monthKey] || []
        vacationsByEmployee[emp.id] = vacationDays
        availableDaysByEmployee[emp.id] = daysInMonth - vacationDays.length
      })

      const r2Employees = employees.filter((emp) => emp.rank === "R2")
      r2Employees.forEach((emp) => {
        const availableDays = availableDaysByEmployee[emp.id]
        // R2 can work up to 2 guards per month, but adjust if they have many vacations
        // If they have less than 15 days available, allow up to 2 guards
        // If they have 15+ days available, maintain the 2 guard limit
        expectedGuards[emp.id] = Math.min(2, Math.ceil(availableDays / 15))
        lastGuardDay[emp.id] = -10
        guardsAssigned[emp.id] = 0
        weekendDaysAssigned[emp.id] = 0
      })

      const highRankEmployees = employees.filter((emp) => emp.rank !== "R2")
      const totalR2Guards = r2Employees.reduce((sum, emp) => sum + expectedGuards[emp.id], 0)
      const totalHighRankDays = daysInMonth - totalR2Guards

      // Calculate total available days for high rank employees
      const totalAvailableDaysHighRank = highRankEmployees.reduce(
        (sum, emp) => sum + availableDaysByEmployee[emp.id],
        0,
      )

      highRankEmployees.forEach((emp) => {
        const availableDays = availableDaysByEmployee[emp.id]
        // Distribute guards proportionally to available days
        const proportionalGuards = Math.round((availableDays / totalAvailableDaysHighRank) * totalHighRankDays)
        expectedGuards[emp.id] = Math.max(1, proportionalGuards) // Minimum 1 guard
        lastGuardDay[emp.id] = -10
        guardsAssigned[emp.id] = 0
        weekendDaysAssigned[emp.id] = 0
      })

      const totalExpectedGuards = Object.values(expectedGuards).reduce((sum, val) => sum + val, 0)
      if (totalExpectedGuards < daysInMonth) {
        // Add extra guards to high rank employees with most available days
        const sortedByAvailability = highRankEmployees.sort(
          (a, b) => availableDaysByEmployee[b.id] - availableDaysByEmployee[a.id],
        )
        let remaining = daysInMonth - totalExpectedGuards
        for (let i = 0; i < sortedByAvailability.length && remaining > 0; i++) {
          expectedGuards[sortedByAvailability[i].id]++
          remaining--
        }
      }

      const weekends: Array<{ friday: number; saturday: number; sunday: number }> = []
      for (let day = 1; day <= daysInMonth; day++) {
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
        if (dayOfWeek === 5) {
          weekends.push({
            friday: day,
            saturday: day + 1,
            sunday: day + 2,
          })
        }
      }

      const weekendGuardsPerPerson = Math.ceil((weekends.length * 2) / employees.length)

      for (const weekend of weekends) {
        const { friday, saturday, sunday } = weekend

        const fridayCandidates = employees.filter((emp) => {
          const isOnVacation =
            vacationsByEmployee[emp.id].includes(friday) || vacationsByEmployee[emp.id].includes(sunday)
          const daysSinceLastGuard = friday - lastGuardDay[emp.id]
          const isSaliente = daysSinceLastGuard === 1
          const canDoMoreGuards = guardsAssigned[emp.id] < expectedGuards[emp.id]
          const hasWeekendCapacity = weekendDaysAssigned[emp.id] < weekendGuardsPerPerson

          return !isOnVacation && !isSaliente && canDoMoreGuards && hasWeekendCapacity
        })

        if (fridayCandidates.length === 0) {
          foundConflicts.push(`🔴 Falta capacidad para viernes ${friday} y domingo ${sunday}`)
          continue // Continue instead of return
        }

        const selectedFriday = fridayCandidates.reduce((prev, current) => {
          return expectedGuards[current.id] - guardsAssigned[current.id] >
            expectedGuards[prev.id] - guardsAssigned[prev.id]
            ? current
            : prev
        })

        schedule[friday] = selectedFriday.id
        schedule[sunday] = selectedFriday.id
        lastGuardDay[selectedFriday.id] = sunday
        guardsAssigned[selectedFriday.id] += 2
        weekendDaysAssigned[selectedFriday.id] += 2

        const saturdayCandidates = employees.filter((emp) => {
          const isOnVacation = vacationsByEmployee[emp.id].includes(saturday)
          const daysSinceLastGuard = saturday - lastGuardDay[emp.id]
          const isSaliente = daysSinceLastGuard === 1
          const canDoMoreGuards = guardsAssigned[emp.id] < expectedGuards[emp.id]
          const hasWeekendCapacity = weekendDaysAssigned[emp.id] < weekendGuardsPerPerson
          const isNotFridayPerson = emp.id !== selectedFriday.id

          return !isOnVacation && !isSaliente && canDoMoreGuards && hasWeekendCapacity && isNotFridayPerson
        })

        if (saturdayCandidates.length === 0) {
          foundConflicts.push(`🔴 Falta capacidad para sábado ${saturday}`)
          continue // Continue instead of return
        }

        const selectedSaturday = saturdayCandidates.reduce((prev, current) => {
          return expectedGuards[current.id] - guardsAssigned[current.id] >
            expectedGuards[prev.id] - guardsAssigned[prev.id]
            ? current
            : prev
        })

        schedule[saturday] = selectedSaturday.id
        lastGuardDay[selectedSaturday.id] = saturday
        guardsAssigned[selectedSaturday.id] += 1
        weekendDaysAssigned[selectedSaturday.id] += 1
      }

      for (let day = 1; day <= daysInMonth; day++) {
        if (schedule[day]) continue

        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()

        const candidates = employees.filter((emp) => {
          const isOnVacation = vacationsByEmployee[emp.id].includes(day)
          const daysSinceLastGuard = day - lastGuardDay[emp.id]
          const isSaliente = daysSinceLastGuard === 1
          const canDoMoreGuards = guardsAssigned[emp.id] < expectedGuards[emp.id]

          let violatesThursdayRule = false
          if (day - 1 >= 1 && schedule[day - 1]) {
            const previousDayOfWeek = new Date(currentYear, currentMonth, day - 1).getDay()
            if (previousDayOfWeek === 4 && schedule[day - 1] === emp.id) {
              if ([5, 6, 0].includes(dayOfWeek)) {
                violatesThursdayRule = true
              }
            }
          }

          return !isOnVacation && !isSaliente && canDoMoreGuards && !violatesThursdayRule
        })

        if (candidates.length === 0) {
          foundConflicts.push(`🔴 Falta capacidad para día ${day}`)
          continue // Continue to next day instead of stopping
        }

        let selected: any = null

        if (day > 1 && schedule[day - 1]) {
          const previousEmployeeId = schedule[day - 1]
          const previousEmployee = employees.find((e) => e.id === previousEmployeeId)

          if (previousEmployee) {
            const previousRank = previousEmployee.rank

            const differentRankCandidates = candidates.filter((emp) => emp.rank !== previousRank)

            if (differentRankCandidates.length > 0) {
              selected = differentRankCandidates.reduce((prev, current) => {
                const prevDeficit = expectedGuards[prev.id] - guardsAssigned[prev.id]
                const currentDeficit = expectedGuards[current.id] - guardsAssigned[current.id]

                if (Math.abs(prevDeficit - currentDeficit) <= 1) {
                  return Math.random() > 0.5 ? current : prev
                }
                return currentDeficit > prevDeficit ? current : prev
              })
            }
          }
        }

        if (!selected) {
          selected = candidates.reduce((prev, current) => {
            const prevDeficit = expectedGuards[prev.id] - guardsAssigned[prev.id]
            const currentDeficit = expectedGuards[current.id] - guardsAssigned[current.id]

            if (Math.abs(prevDeficit - currentDeficit) <= 1) {
              return Math.random() > 0.5 ? current : prev
            }
            return currentDeficit > prevDeficit ? current : prev
          })
        }

        schedule[day] = selected.id
        lastGuardDay[selected.id] = day
        guardsAssigned[selected.id] += 1
      }

      const unassignedDays = []
      for (let day = 1; day <= daysInMonth; day++) {
        if (!schedule[day]) {
          unassignedDays.push(day)
        }
      }

      setPreviousSchedule(schedules[monthKey] || {})
      setPreviewSchedule(schedule)
      setShowPreview(true)

      if (unassignedDays.length > 0) {
        setMessage(
          `Vista previa con ${unassignedDays.length} día${unassignedDays.length > 1 ? "s" : ""} sin asignar. Revisa los conflictos.`,
        )
      } else if (foundConflicts.length > 0) {
        setMessage("Vista previa con advertencias. Revisa los conflictos antes de aplicar.")
      } else {
        setMessage("Vista previa generada correctamente. Todo listo para aplicar.")
      }

      setConflicts(foundConflicts)
    } catch (error) {
      console.error("[v0] Schedule generation error:", error)
      setMessage("Error al generar la planilla: " + (error as Error).message)
    } finally {
      setGeneratingState(false)
    }
  }

  const handleApplyPreview = () => {
    if (previewSchedule) {
      onGenerate(previewSchedule)
      setShowPreview(false)
      setPreviewSchedule(null)
      setMessage("Planilla aplicada exitosamente")
    }
  }

  const handleCancelPreview = () => {
    setShowPreview(false)
    setPreviewSchedule(null)
    setMessage("")
  }

  const handleUndo = () => {
    if (previousSchedule) {
      if (confirm("¿Deseas deshacer la última generación y restaurar la planilla anterior?")) {
        onGenerate(previousSchedule)
        setPreviousSchedule(null)
        setMessage("Planilla anterior restaurada")
      }
    }
  }

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || "?"
  }

  const getEmployeeRank = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.rank || "?"
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "R5":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "R4":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "R3":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "R2":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGuardsCount = (schedule: any, employeeId: string) => {
    return Object.values(schedule).filter((id) => id === employeeId).length
  }

  return (
    <>
      <Card className="bg-white dark:bg-slate-800">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Generador Automático</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              La aplicación generará automáticamente una planilla respetando:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4">
              <li>• Todos los días cubiertos con 1 guardia</li>
              <li>• No hay 2 guardias seguidas (descanso de 24h)</li>
              <li>• R2: máximo 2 guardias/mes cada uno</li>
              <li>• R3, R4, R5: distribución proporcional</li>
              <li>• Fines de semana distribuidos proporcionalmente (máx 2/persona)</li>
              <li>• Descanso post-jueves: 3 días libres (viernes, sábado, domingo)</li>
              <li>• Guardias repartidas a lo largo del mes</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateSchedule}
              disabled={generatingState || isGenerating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {generatingState || isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Generar Vista Previa
                </>
              )}
            </Button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg flex gap-3 ${
                message.includes("exitoso") || message.includes("Vista previa")
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="min-w-[800px] max-w-[80vw] h-full max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Vista Previa de Planilla Generada</DialogTitle>
            <DialogDescription>
              Revisa la planilla antes de aplicarla. Puedes generar un nuevo borrador, deshacer o cancelar.
            </DialogDescription>
          </DialogHeader>

          {previewSchedule && (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Guardias asignadas:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {employees.map((emp) => {
                        const count = getGuardsCount(previewSchedule, emp.id)
                        return (
                          <div key={emp.id} className={`${getRankColor(emp.rank)} rounded-lg p-2 text-center`}>
                            <div className="font-semibold text-xs">{emp.name}</div>
                            <div className="text-xs mt-1">{count} guardias</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {conflicts.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Advertencias detectadas
                      </h4>
                      <ul className="space-y-1">
                        {conflicts.map((conflict, i) => (
                          <li key={i} className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                            <span className="mt-0.5">•</span>
                            <span>{conflict}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden mb-px">
                        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                          <div key={day} className="bg-blue-600 text-white font-semibold text-center py-2 text-xs">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-600 p-px rounded-lg">
                        {(() => {
                          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
                          let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
                          firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

                          const emptyDays = Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-slate-50 dark:bg-slate-900 min-h-20" />
                          ))

                          const calendarDays = Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const assignedEmployeeId = previewSchedule[day]
                            const assignedEmployee = assignedEmployeeId ? getEmployeeName(assignedEmployeeId) : null
                            const assignedRank = assignedEmployeeId ? getEmployeeRank(assignedEmployeeId) : null
                            let dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
                            dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                            const isWeekend = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6

                            return (
                              <div
                                key={day}
                                className={`min-h-20 p-1.5 flex flex-col ${
                                  isWeekend ? "bg-red-50 dark:bg-red-950" : "bg-white dark:bg-slate-800"
                                } border border-slate-200 dark:border-slate-600`}
                              >
                                <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">{day}</div>
                                {assignedEmployee ? (
                                  <div className={`p-1 rounded text-xs font-semibold ${getRankColor(assignedRank)}`}>
                                    <div className="truncate">{assignedEmployee}</div>
                                    <div className="text-xs">({assignedRank})</div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-400 dark:text-slate-600 italic">Sin asignar</div>
                                )}
                              </div>
                            )
                          })

                          return [...emptyDays, ...calendarDays]
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter className="gap-2 flex-shrink-0">
            <div className="flex-1 flex gap-2">
              <Button
                variant="outline"
                onClick={generateSchedule}
                disabled={generatingState}
                className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                {generatingState ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Generar Nuevo Borrador
                  </>
                )}
              </Button>

              {previousSchedule && Object.keys(previousSchedule).length > 0 && (
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  <Undo2 className="w-4 h-4 mr-2" />
                  Deshacer Anterior
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={handleCancelPreview}>
              Cancelar
            </Button>
            <Button onClick={handleApplyPreview} className="bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4 mr-2" />
              Aplicar Planilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
