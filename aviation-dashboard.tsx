"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AviationSidebar } from "./components/aviation-sidebar"
import { AircraftVisualization } from "./components/aircraft-visualization"
import { AlertDetails } from "./components/alert-details"
import { useState } from "react"

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

  const handleAlertClick = (alert: AlertDetail) => {
    setSelectedAlert(alert)
  }

  const handleBackClick = () => {
    setSelectedAlert(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider defaultOpen={true}>
        <AviationSidebar onAlertClick={handleAlertClick} />
        <SidebarInset>
          <div className="flex flex-col h-full">
            {selectedAlert ? (
              <AlertDetails alert={selectedAlert} onBackClick={handleBackClick} />
            ) : (
              <AircraftVisualization />
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
