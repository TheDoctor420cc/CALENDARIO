"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScheduleHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export default function ScheduleHeader({ currentDate, onPreviousMonth, onNextMonth }: ScheduleHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Planilla de Guardias</h1>
            <p className="text-blue-100 mt-1">Sistema de gestión de turnos y disponibilidades</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousMonth}
              className="text-white hover:bg-blue-700 min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="text-center text-white min-w-[200px]">
              <p className="text-lg font-semibold">
                {currentDate?.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                }) || "Cargando..."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextMonth}
              className="text-white hover:bg-blue-700 min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
