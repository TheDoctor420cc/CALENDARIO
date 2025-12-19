"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Upload } from "lucide-react"

interface ExportImportProps {
  employees: any[]
  schedules: any
}

export default function ExportImport({ employees, schedules }: ExportImportProps) {
  const handleExport = () => {
    const data = {
      employees,
      schedules,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `planilla-guardias-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        localStorage.setItem("employees", JSON.stringify(data.employees))
        localStorage.setItem("schedules", JSON.stringify(data.schedules))
        window.location.reload()
      } catch (error) {
        alert("Error al importar archivo")
      }
    }
    reader.readAsText(file)
  }

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-lg">
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Copias de Seguridad</h3>
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4" />
            Descargar Datos
          </Button>
          <label>
            <Button asChild variant="outline" className="flex items-center gap-2 cursor-pointer bg-transparent">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importar Datos
              </span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </Button>
          </label>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
          Descarga un archivo JSON con todos tus datos. Puedes reimportarlo en cualquier momento para restaurar la
          planilla.
        </p>
      </div>
    </Card>
  )
}
