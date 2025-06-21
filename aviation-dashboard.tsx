"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AviationSidebar } from "./components/aviation-sidebar"
import { AircraftVisualization } from "./components/aircraft-visualization"
import { AlertDetails } from "@/components/alert-details"
import { Aircraft3DView } from "@/components/aircraft-3d-view"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { View } from "lucide-react"

interface AlertDetail {
  id: number
  component: string
  risk: "critical" | "moderate"
  message: string
  timestamp: string
  flightImpact: string
  recommendedActions: string[]
}

export default function AviationDashboard() {
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null)
  const [show3D, setShow3D] = useState(false)

  const handleAlertClick = (alert: AlertDetail) => {
    setSelectedAlert(alert)
    setShow3D(false)
  }

  const handleBackClick = () => {
    setSelectedAlert(null)
  }

  const toggle3DView = () => {
    setShow3D(!show3D)
    setSelectedAlert(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider defaultOpen={true}>
        <AviationSidebar onAlertClick={handleAlertClick} />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-end">
              <Button
                variant={show3D ? "secondary" : "outline"}
                size="sm"
                onClick={toggle3DView}
                className="gap-2"
              >
                <View className="h-4 w-4" />
                {show3D ? "2D View" : "3D View"}
              </Button>
            </div>
            {selectedAlert ? (
              <AlertDetails alert={selectedAlert} onBackClick={handleBackClick} />
            ) : show3D ? (
              <Aircraft3DView />
            ) : (
              <AircraftVisualization />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
