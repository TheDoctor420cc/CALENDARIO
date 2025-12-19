"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Plus, Calendar } from "lucide-react"

interface Employee {
  id: string
  name: string
  vacationDays: number[]
  preferences: string[]
}

interface EmployeePanelProps {
  employees: Employee[]
  selectedEmployee: string | null
  onSelectEmployee: (id: string | null) => void
  onAddEmployee: (name: string) => void
  onRemoveEmployee: (id: string) => void
  onUpdateEmployee: (employee: Employee) => void
  currentMonth: number
  currentYear: number
}

export default function EmployeePanel({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  currentMonth,
  currentYear,
}: EmployeePanelProps) {
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [showVacationPanel, setShowVacationPanel] = useState(false)

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      onAddEmployee(newEmployeeName)
      setNewEmployeeName("")
    }
  }

  const selectedEmp = employees.find((emp) => emp.id === selectedEmployee)

  const toggleVacationDay = (day: number) => {
    if (!selectedEmp) return
    const vacationDays = selectedEmp.vacationDays.includes(day)
      ? selectedEmp.vacationDays.filter((d) => d !== day)
      : [...selectedEmp.vacationDays, day]

    onUpdateEmployee({ ...selectedEmp, vacationDays })
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  return (
    <>
      <Card className="bg-white dark:bg-slate-800 shadow-lg sticky top-4">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Empleados</h3>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nombre del empleado"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddEmployee()}
              className="flex-1"
            />
            <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {employees.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">Sin empleados aún</p>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp.id}
                  className={`p-3 rounded-lg transition-colors ${
                    selectedEmployee === emp.id
                      ? "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-600"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => onSelectEmployee(emp.id)}
                  >
                    <div className="flex-1">
                      <span className="font-medium text-slate-900 dark:text-white">{emp.name}</span>
                      {emp.vacationDays.length > 0 && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {emp.vacationDays.length} día(s) de vacaciones
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveEmployee(emp.id)
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedEmp && (
            <Button
              onClick={() => setShowVacationPanel(!showVacationPanel)}
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {showVacationPanel ? "Cerrar" : "Gestionar vacaciones"}
            </Button>
          )}
        </div>
      </Card>

      {showVacationPanel && selectedEmp && (
        <Card className="bg-white dark:bg-slate-800 shadow-lg mt-4">
          <div className="p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Vacaciones - {selectedEmp.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Selecciona los días de vacaciones para este mes
            </p>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isVacation = selectedEmp.vacationDays.includes(day)
                const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                return (
                  <button
                    key={day}
                    onClick={() => toggleVacationDay(day)}
                    className={`p-2 rounded text-sm font-semibold transition-colors ${
                      isVacation
                        ? "bg-orange-500 text-white"
                        : isWeekend
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"
                    } ${isWeekend && !isVacation ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    disabled={isWeekend && !isVacation}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {selectedEmp.vacationDays.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Días seleccionados:</strong> {selectedEmp.vacationDays.sort((a, b) => a - b).join(", ")}
                </p>
                <Button
                  onClick={() => onUpdateEmployee({ ...selectedEmp, vacationDays: [] })}
                  variant="destructive"
                  size="sm"
                >
                  Limpiar vacaciones
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  )
}
