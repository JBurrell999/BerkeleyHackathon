'use client'

import { useState, useEffect } from "react"
import { AlertTriangle, Bell, Plane, Settings, Wrench } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Alert {
  id: number
  component: string
  risk: 'critical' | 'moderate'
  message: string
  timestamp: string
  flightImpact: string
}

interface SimulationData {
  isSimulating: boolean
  alertLevel: 'safe' | 'warning' | 'danger'
  currentSpeed: number
  simulationTime: number
  rulValue?: number
}

export function AviationSidebar() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [simulationData, setSimulationData] = useState<SimulationData>({
    isSimulating: false,
    alertLevel: 'safe',
    currentSpeed: 0,
    simulationTime: 0
  })

  // Listen for simulation events
  useEffect(() => {
    const handleSimulationUpdate = (event: CustomEvent) => {
      const newData = event.detail as SimulationData
      setSimulationData(newData)
      
      // Generate alerts based on simulation state
      if (newData.isSimulating && newData.rulValue !== undefined) {
        const newAlerts: Alert[] = []
        
        if (newData.alertLevel === 'danger' && newData.rulValue < 30) {
          newAlerts.push({
            id: Date.now(),
            component: "Engine RUL Critical",
            risk: "critical",
            message: `Remaining Useful Life: ${newData.rulValue.toFixed(0)} cycles - IMMEDIATE ACTION REQUIRED`,
            timestamp: `${newData.simulationTime}s ago`,
            flightImpact: "Abort takeoff recommended"
          })
        } else if (newData.alertLevel === 'warning' && newData.rulValue < 80) {
          newAlerts.push({
            id: Date.now(),
            component: "Engine RUL Warning",
            risk: "moderate",
            message: `Remaining Useful Life: ${newData.rulValue.toFixed(0)} cycles - Enhanced monitoring required`,
            timestamp: `${newData.simulationTime}s ago`,
            flightImpact: "Monitor closely during takeoff"
          })
        }
        
        setAlerts(newAlerts)
      } else if (!newData.isSimulating) {
        // Clear alerts when simulation stops
        setAlerts([])
      }
    }

    window.addEventListener('simulationUpdate', handleSimulationUpdate as EventListener)
    
    return () => {
      window.removeEventListener('simulationUpdate', handleSimulationUpdate as EventListener)
    }
  }, [])

  const criticalAlerts = alerts.filter(alert => alert.risk === 'critical')
  const moderateAlerts = alerts.filter(alert => alert.risk === 'moderate')

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Flight Alert System</h2>
            <p className="text-sm text-gray-500">Aircraft ID: N747BA</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-4">
        {/* Show status when no alerts */}
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-green-600 mb-2">
              <Plane className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">
              {simulationData.isSimulating ? 
                "Monitoring engine health..." : 
                "All systems normal"
              }
            </p>
            {simulationData.isSimulating && (
              <p className="text-xs text-gray-500 mt-1">
                Simulation: {simulationData.simulationTime}s | Speed: {simulationData.currentSpeed.toFixed(0)} kts
              </p>
            )}
          </div>
        )}

        {/* Critical Alerts - Only show when they exist */}
        {criticalAlerts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 text-red-700 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Critical Alerts
              <Badge variant="destructive" className="ml-auto animate-pulse">
                {criticalAlerts.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2">
              {criticalAlerts.map((alert) => (
                <Card key={alert.id} className="border-red-200 bg-red-50 animate-pulse">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">{alert.component}</CardTitle>
                    <CardDescription className="text-xs text-red-600">{alert.timestamp}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-red-700 mb-2">{alert.message}</p>
                    <Badge variant="destructive" className="text-xs">
                      {alert.flightImpact}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Moderate Risk Alerts - Only show when they exist */}
        {moderateAlerts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 text-yellow-700 font-semibold">
              <Bell className="h-4 w-4" />
              Moderate Risk
              <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800">
                {moderateAlerts.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2">
              {moderateAlerts.map((alert) => (
                <Card key={alert.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">{alert.component}</CardTitle>
                    <CardDescription className="text-xs text-yellow-600">{alert.timestamp}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-yellow-700 mb-2">{alert.message}</p>
                    <Badge className="text-xs bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
                      {alert.flightImpact}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Quick Actions - Always visible */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-semibold">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start">
                  <Wrench className="h-4 w-4" />
                  <span>Schedule Maintenance</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start">
                  <Settings className="h-4 w-4" />
                  <span>System Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
