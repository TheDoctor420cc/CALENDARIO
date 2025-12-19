"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Check } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VacationManagementProps {
  employees: any[]
  monthKey: string
  currentDate: Date // Changed from Date | null to Date
  onUpdateVacation: (employeeId: string, day: number, isVacation: boolean) => void
  onClearAllVacations?: () => void
}

export default function VacationManagement({
  employees,
  monthKey,
  currentDate,
  onUpdateVacation,
  onClearAllVacations,
}: VacationManagementProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const getEmployeesOnVacation = (day: number) => {
    return employees.filter((emp) => {
      const vacationDays = emp.vacationDays[monthKey] || []
      return vacationDays.includes(day)
    })
  }

  const totalVacationDaysInMonth = employees.reduce((total, emp) => {
    const empVacations = emp.vacationDays[monthKey] || []
    return total + empVacations.length
  }, 0)

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
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleDayClick = (day: number) => {
    if (!selectedEmployee) return

    const employee = employees.find((emp) => emp.id === selectedEmployee)
    if (!employee) return

    const vacationDays = employee.vacationDays[monthKey] || []
    const isCurrentlyOnVacation = vacationDays.includes(day)

    onUpdateVacation(selectedEmployee, day, !isCurrentlyOnVacation)
  }

  const isSelectedEmployeeOnVacation = (day: number) => {
    if (!selectedEmployee) return false
    const employee = employees.find((emp) => emp.id === selectedEmployee)
    if (!employee) return false
    const vacationDays = employee.vacationDays[monthKey] || []
    return vacationDays.includes(day)
  }

  const selectedEmployeeData = employees.find((emp) => emp.id === selectedEmployee)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Vacaciones</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {totalVacationDaysInMonth} día(s) de vacaciones configurados este mes
          </p>
        </div>

        {totalVacationDaysInMonth > 0 && onClearAllVacations && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950 bg-transparent"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Borrar todas las vacaciones del mes?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todas las vacaciones configuradas para{" "}
                  {currentDate?.toLocaleDateString("es-ES", { month: "long", year: "numeric" })} de todos los
                  trabajadores. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAllVacations} className="bg-red-600 hover:bg-red-700">
                  Sí, borrar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card className="p-4 bg-white dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          {selectedEmployee
            ? "Trabajador activo - Haz clic en los días del calendario"
            : "Selecciona un trabajador para empezar"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {employees.map((emp) => {
            const vacationDays = emp.vacationDays[monthKey] || []
            const isActive = selectedEmployee === emp.id

            return (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(isActive ? null : emp.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md scale-105"
                    : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${getRankColor(emp.rank)}`}>{emp.rank}</span>
                  {isActive && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{emp.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{vacationDays.length} día(s)</p>
              </button>
            )
          })}
        </div>

        {selectedEmployeeData && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Modo edición activo:</strong> {selectedEmployeeData.name} ({selectedEmployeeData.rank})
              <br />
              <span className="text-xs">Haz clic en los días del calendario para añadir/quitar vacaciones</span>
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-800">
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden mb-2">
          {days.map((day) => (
            <div key={day} className="bg-blue-600 text-white font-semibold text-center py-2 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-600 p-px rounded-lg overflow-hidden">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50 dark:bg-slate-900 min-h-24" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const employeesOnVacation = getEmployeesOnVacation(day)
            const hasVacations = employeesOnVacation.length > 0
            const dayOfWeek = (firstDayOfMonth + i) % 7
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
            const selectedEmpOnVacation = isSelectedEmployeeOnVacation(day)

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={!selectedEmployee}
                className={`min-h-24 p-2 flex flex-col items-start justify-start gap-1 transition-all relative ${
                  isWeekend ? "bg-red-50 dark:bg-red-950/20" : "bg-white dark:bg-slate-800"
                } border-2 ${
                  selectedEmpOnVacation
                    ? "border-blue-500 bg-blue-100 dark:bg-blue-950"
                    : "border-slate-200 dark:border-slate-600"
                } ${
                  selectedEmployee
                    ? "hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                }`}
              >
                <span className="font-semibold text-sm text-slate-900 dark:text-white">{day}</span>

                {hasVacations && (
                  <div className="flex flex-wrap gap-1 w-full">
                    {employeesOnVacation.slice(0, 2).map((emp) => (
                      <span
                        key={emp.id}
                        className={`text-xs px-1.5 py-0.5 rounded ${getRankColor(emp.rank)} font-medium truncate max-w-full`}
                      >
                        {emp.name}
                      </span>
                    ))}
                    {employeesOnVacation.length > 2 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        +{employeesOnVacation.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {hasVacations && (
                  <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {employeesOnVacation.length}
                  </div>
                )}

                {selectedEmpOnVacation && (
                  <Check className="absolute bottom-1 right-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
