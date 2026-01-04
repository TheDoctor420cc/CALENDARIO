"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Plus, Trash2, Edit2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Employee {
  id: string
  name: string
  rank: string
  department?: string
  vacationDays: Record<string, number[]>
  preferences: Record<string, string[]>
}

interface EmployeeManagementProps {
  employees: Employee[]
  monthKey: string
  currentDate: Date // Changed from Date | null to Date
  onUpdateVacation: (employeeId: string, day: number, isVacation: boolean) => void
  onAddEmployee: (name: string, rank: string, department: string) => void
  onRemoveEmployee: (employeeId: string) => void
  onEditEmployee: (employeeId: string, name: string, rank: string, department: string) => void
}

export default function EmployeeManagement({
  employees,
  monthKey,
  currentDate, // Now always receives a valid Date object
  onUpdateVacation,
  onAddEmployee,
  onRemoveEmployee,
  onEditEmployee,
}: EmployeeManagementProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showVacationPanel, setShowVacationPanel] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRank, setNewRank] = useState("R3")
  const [newDepartment, setNewDepartment] = useState("COLOPROCTO")
  const [editName, setEditName] = useState("")
  const [editRank, setEditRank] = useState("R3")
  const [editDepartment, setEditDepartment] = useState("COLOPROCTO")

  const [year, month] = monthKey.split("-").map(Number)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const selectedEmp = employees.find((emp) => emp.id === selectedEmployee)
  const vacationDays = selectedEmp?.vacationDays[monthKey] || []

  const departments = ["COLOPROCTO", "HEPÁTICA", "CMA", "MAMA"]

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

  const handleAddEmployee = () => {
    if (newName.trim()) {
      onAddEmployee(newName, newRank, newDepartment)
      setNewName("")
      setNewRank("R3")
      setNewDepartment("COLOPROCTO")
      setShowAddForm(false)
    }
  }

  const handleStartEdit = (emp: Employee) => {
    setEditName(emp.name)
    setEditRank(emp.rank)
    setEditDepartment(emp.department || "COLOPROCTO")
    setShowEditForm(true)
  }

  const handleSaveEdit = () => {
    if (selectedEmployee && editName.trim()) {
      onEditEmployee(selectedEmployee, editName, editRank, editDepartment)
      setShowEditForm(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Employee list and management */}
      <Card className="bg-white dark:bg-slate-800 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empleados</h3>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Añadir
            </Button>
          </div>

          {/* Add employee form */}
          {showAddForm && (
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-3">
              <Input
                placeholder="Nombre del empleado"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-black dark:text-white"
              />
              <Select value={newRank} onValueChange={setNewRank}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R5">R5</SelectItem>
                  <SelectItem value="R4">R4</SelectItem>
                  <SelectItem value="R3">R3</SelectItem>
                  <SelectItem value="R2">R2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newDepartment} onValueChange={setNewDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleAddEmployee} className="flex-1">
                  Guardar
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {employees && employees.length > 0 ? (
              employees.map((emp) => (
                <div
                  key={emp.id}
                  className={`p-3 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    selectedEmployee === emp.id
                      ? "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-600"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  <div onClick={() => setSelectedEmployee(emp.id)} className="flex-1 flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">{emp.name}</span>
                    <Badge className={getRankColor(emp.rank)}>{emp.rank}</Badge>
                    {emp.department && (
                      <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                        {emp.department}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleStartEdit(emp)} className="h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveEmployee(emp.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Cargando empleados...</p>
            )}
          </div>
        </div>
      </Card>

      {/* Edit employee form */}
      {showEditForm && selectedEmp && (
        <Card className="bg-white dark:bg-slate-800 shadow-lg">
          <div className="p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Editar empleado</h4>
            <div className="space-y-3">
              <Input
                placeholder="Nombre"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-black dark:text-white"
              />
              <Select value={editRank} onValueChange={setEditRank}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R5">R5</SelectItem>
                  <SelectItem value="R4">R4</SelectItem>
                  <SelectItem value="R3">R3</SelectItem>
                  <SelectItem value="R2">R2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editDepartment} onValueChange={setEditDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Guardar
                </Button>
                <Button onClick={() => setShowEditForm(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Vacation management */}
      {selectedEmp && (
        <Card className="bg-white dark:bg-slate-800 shadow-lg">
          <div className="p-6">
            <Button
              onClick={() => setShowVacationPanel(!showVacationPanel)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {showVacationPanel ? "Cerrar" : "Vacaciones"}
            </Button>
          </div>
        </Card>
      )}

      {showVacationPanel && selectedEmp && (
        <Card className="bg-white dark:bg-slate-800 shadow-lg">
          <div className="p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Vacaciones - {selectedEmp.name}</h4>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isVacation = vacationDays.includes(day)

                return (
                  <button
                    key={day}
                    onClick={() => onUpdateVacation(selectedEmp.id, day, !isVacation)}
                    className={`p-2 rounded text-sm font-semibold transition-colors ${
                      isVacation
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {vacationDays.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Días:</strong> {vacationDays.sort((a, b) => a - b).join(", ")}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
