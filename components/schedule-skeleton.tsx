import { Card } from "@/components/ui/card"

export function ScheduleSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-muted rounded w-24"></div>
          <div className="h-10 bg-muted rounded w-24"></div>
        </div>
      </div>

      {/* Calendar skeleton */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div key={day} className="h-6 bg-muted rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </Card>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded"></div>
        ))}
      </div>
    </div>
  )
}
