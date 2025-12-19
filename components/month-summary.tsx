"use client"

interface MonthSummaryProps {
  schedules: any
  monthKey: string
  employees: any[]
}

export default function MonthSummary({ schedules, monthKey, employees }: MonthSummaryProps) {
  const monthSchedules = schedules[monthKey] || {}
  const assignedDays = Object.keys(monthSchedules).length

  const [yearStr, monthStr] = monthKey.split("-")
  const year = Number.parseInt(yearStr)
  const month = Number.parseInt(monthStr)

  // Calculate total days in month safely
  let totalDays = 30
  if (!isNaN(year) && !isNaN(month)) {
    totalDays = new Date(year, month + 1, 0).getDate()
  }

  const employeeShiftCounts = employees.reduce(
    (acc, emp) => {
      acc[emp.id] = Object.values(monthSchedules).filter((id) => id === emp.id).length
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Guardias asignadas: <strong className="text-foreground">{assignedDays}</strong> / {totalDays}
        </span>
        {assignedDays < totalDays && (
          <span className="text-amber-600 dark:text-amber-400">⚠️ {totalDays - assignedDays} días sin asignar</span>
        )}
      </div>
    </div>
  )
}
