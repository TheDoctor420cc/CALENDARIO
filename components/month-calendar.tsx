"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, UserCheck, Plane } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MonthCalendarProps {
  year: number // Using year and month instead of date to avoid confusion
  month: number
  schedules: any
  employees: any[]
  vacations: any
  onAssignShift: (day: number, employeeId: string) => void
  onRemoveShift: (day: number) => void
}

export default function MonthCalendar({
  year,
  month,
  schedules,
  employees,
  vacations,
  onAssignShift,
  onRemoveShift,
}: MonthCalendarProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let firstDayOfMonth = new Date(year, month, 1).getDay()
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  const monthKey = `${year}-${month}`
  const monthSchedules = schedules || {}

  const getEmployeeName = (employeeId: string) => {
    return employees.find((emp) => emp.id === employeeId)?.name || "?"
  }

  const getEmployeeRank = (employeeId: string) => {
    return employees.find((emp) => emp.id === employeeId)?.rank || "?"
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

  const getGuardsThisMonth = (employeeId: string) => {
    return Object.values(monthSchedules).filter((id) => id === employeeId).length
  }

  const hasVacation = (employeeId: string, day: number) => {
    const emp = employees.find((e) => e.id === employeeId)
    if (!emp) return false
    const empVacations = emp.vacationDays[monthKey] || []
    return empVacations.includes(day)
  }

  const getVacationsOnDay = (day: number) => {
    return employees.filter((emp) => hasVacation(emp.id, day)).length
  }

  const getAvailableEmployees = (day: number) => {
    return employees.filter((emp) => {
      const empVacations = emp.vacationDays[monthKey] || []
      if (empVacations.includes(day)) return false

      if (monthSchedules[day - 1] === emp.id) return false

      if (monthSchedules[day + 1] === emp.id) return false

      const dayOfWeek = new Date(year, month, day).getDay()
      const isThursdayWeekend = dayOfWeek >= 5 || dayOfWeek === 0
      if (isThursdayWeekend && monthSchedules[day - 1] === emp.id) {
        const prevDayOfWeek = new Date(year, month, day - 1).getDay()
        if (prevDayOfWeek === 4) return false
      }

      return true
    })
  }

  const getEmployeesOnVacation = (day: number) => {
    return employees.filter((emp) => hasVacation(emp.id, day))
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return

      const distance = touchStartX.current - touchEndX.current
      const minSwipeDistance = 50

      if (distance > minSwipeDistance) {
        console.log("[v0] Swipe left detected - next month")
      }

      if (distance < -minSwipeDistance) {
        console.log("[v0] Swipe right detected - previous month")
      }

      touchStartX.current = null
      touchEndX.current = null
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart)
      container.addEventListener("touchmove", handleTouchMove)
      container.addEventListener("touchend", handleTouchEnd)
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [])

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Guardias asignadas este mes:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {employees.map((emp) => {
            const guardsCount = getGuardsThisMonth(emp.id)
            return (
              <div key={emp.id} className={`${getRankColor(emp.rank)} rounded-lg p-2 text-center`}>
                <div className="font-semibold text-sm">{emp.name}</div>
                <div className="text-xs mt-1">
                  <UserCheck className="w-3 h-3 inline mr-1" />
                  {guardsCount} guardias
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden">
        {days.map((day) => (
          <div key={day} className="bg-blue-600 text-white font-semibold text-center py-3 text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-600 p-px rounded-lg overflow-visible relative">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-slate-50 dark:bg-slate-900 aspect-square min-h-32 border border-slate-200 dark:border-slate-600"
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const assignedEmployeeId = monthSchedules[day]
          const assignedEmployee = assignedEmployeeId ? getEmployeeName(assignedEmployeeId) : null
          const assignedRank = assignedEmployeeId ? getEmployeeRank(assignedEmployeeId) : null
          let dayOfWeek = new Date(year, month, day).getDay()
          dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          const isWeekend = dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6

          const dayIndex = firstDayOfMonth + day - 1
          const isLastRow = dayIndex >= (Math.ceil((firstDayOfMonth + daysInMonth) / 7) - 1) * 7

          const vacationsCount = getVacationsOnDay(day)
          const employeesOnVacation = getEmployeesOnVacation(day)

          return (
            <div
              key={day}
              className={`bg-white dark:bg-slate-800 min-h-32 p-3 flex flex-col gap-2 relative group border border-slate-200 dark:border-slate-600 ${isWeekend ? "bg-red-50 dark:bg-red-950/20" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-lg text-slate-900 dark:text-white">{day}</div>
                {vacationsCount > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors cursor-pointer flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        {vacationsCount}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          Vacaciones del día {day}
                        </h4>
                        <div className="space-y-1">
                          {employeesOnVacation.map((emp) => (
                            <div key={emp.id} className={`text-xs px-2 py-1 rounded ${getRankColor(emp.rank)}`}>
                              {emp.name} ({emp.rank})
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {assignedEmployee ? (
                <div className="mt-2 flex-1 flex flex-col gap-2 relative pb-12">
                  <div className={`p-2 rounded text-sm font-semibold ${getRankColor(assignedRank)}`}>
                    {assignedEmployee} ({assignedRank})
                  </div>
                  <button
                    onClick={() => onRemoveShift(day)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 border border-rose-300 dark:border-rose-700 rounded flex items-center justify-center touch-manipulation transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative min-h-[3rem]">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded flex items-center justify-center touch-manipulation"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}

              {expandedDay === day && !assignedEmployee && (
                <div
                  className={`absolute ${isLastRow ? "bottom-full mb-2" : "top-full mt-2"} left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-50 p-2 max-h-80 overflow-y-auto`}
                >
                  <div className="space-y-1">
                    {getAvailableEmployees(day).length === 0 ? (
                      <div className="text-sm text-slate-500 p-2 text-center">No hay empleados disponibles</div>
                    ) : (
                      getAvailableEmployees(day).map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            onAssignShift(day, emp.id)
                            setExpandedDay(null)
                          }}
                          className={`w-full text-left px-4 py-3 rounded text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-98 transition-transform ${getRankColor(emp.rank)} min-h-[44px] touch-manipulation`}
                        >
                          {emp.name} ({emp.rank})
                          <span className="text-xs ml-2 opacity-75">{getGuardsThisMonth(emp.id)} guardias</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
