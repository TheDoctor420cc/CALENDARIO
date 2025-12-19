"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShiftAssignmentProps {
  date: Date
  employeeId: string
  onAssignShift: (day: number, employeeId: string, shiftType: string) => void
  onRemoveShift: (day: number, employeeId: string) => void
  schedules: any
}

const SHIFT_TYPES = [
  { id: "morning", label: "🌅 Mañana (6-14h)" },
  { id: "afternoon", label: "☀️ Tarde (14-22h)" },
  { id: "night", label: "🌙 Noche (22-6h)" },
  { id: "full", label: "24h Guardia completa" },
]

export default function ShiftAssignment({
  date,
  employeeId,
  onAssignShift,
  onRemoveShift,
  schedules,
}: ShiftAssignmentProps) {
  const [selectedDay, setSelectedDay] = useState<number | "">("")
  const [selectedShift, setSelectedShift] = useState<string>("")

  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return <div className="p-4 text-center text-red-600">Error: Fecha inválida</div>
  }

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const monthKey = `${date.getFullYear()}-${date.getMonth()}`

  const handleAssign = () => {
    if (selectedDay && selectedShift) {
      onAssignShift(Number(selectedDay), employeeId, selectedShift)
      setSelectedDay("")
      setSelectedShift("")
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Asignar Turno</h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select value={String(selectedDay)} onValueChange={setSelectedDay}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un día" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: daysInMonth }).map((_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedShift} onValueChange={setSelectedShift}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de turno" />
          </SelectTrigger>
          <SelectContent>
            {SHIFT_TYPES.map((shift) => (
              <SelectItem key={shift.id} value={shift.id}>
                {shift.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleAssign} className="bg-green-600 hover:bg-green-700 w-full">
          Asignar
        </Button>
      </div>

      {/* Lista de turnos asignados */}
      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Turnos asignados este mes</h5>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayKey = `${monthKey}-${day}`
            const shift = schedules[monthKey]?.[dayKey]?.[employeeId]

            if (!shift) return null

            const shiftLabel = SHIFT_TYPES.find((s) => s.id === shift)?.label

            return (
              <div
                key={day}
                className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600"
              >
                <span className="text-sm text-slate-900 dark:text-white">
                  <strong>Día {day}:</strong> {shiftLabel}
                </span>
                <Button variant="destructive" size="sm" onClick={() => onRemoveShift(day, employeeId)}>
                  Eliminar
                </Button>
              </div>
            )
          })}
        </div>
        {!Array.from({ length: daysInMonth }).some(
          (_, i) => schedules[monthKey]?.[`${monthKey}-${i + 1}`]?.[employeeId],
        ) && <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">Sin turnos asignados</p>}
      </div>
    </div>
  )
}
