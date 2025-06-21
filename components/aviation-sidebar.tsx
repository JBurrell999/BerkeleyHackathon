"use client"

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
import { Button } from "@/components/ui/button"

interface AlertDetail {
  id: number
  component: string
  risk: "critical" | "moderate"
  message: string
  timestamp: string
  flightImpact: string
  recommendedActions: string[]
}

interface AviationSidebarProps {
  onAlertClick: (alert: AlertDetail) => void
}

export function AviationSidebar({ onAlertClick }: AviationSidebarProps) {
  const criticalAlerts: AlertDetail[] = [
    {
      id: 1,
      component: "Engine Turbine Blade",
      risk: "critical",
      message: "Metal fatigue detected - immediate inspection required",
      timestamp: "2 min ago",
      flightImpact: "Grounding recommended",
      recommendedActions: [
        "Ground aircraft immediately",
        "Schedule emergency maintenance inspection",
        "Contact engine manufacturer support",
        "Review recent engine performance data",
        "Prepare incident report for aviation authority"
      ]
    },
    {
      id: 2,
      component: "Landing Gear Hydraulics",
      risk: "critical",
      message: "Pressure anomaly in main hydraulic system",
      timestamp: "5 min ago",
      flightImpact: "Flight restriction",
      recommendedActions: [
        "Restrict aircraft to ground operations",
        "Initiate hydraulic system diagnostic",
        "Check for hydraulic fluid leaks",
        "Test backup hydraulic systems",
        "Prepare maintenance work order"
      ]
    },
  ]

  const moderateAlerts: AlertDetail[] = [
    {
      id: 3,
      component: "Wing Flap Actuator",
      risk: "moderate",
      message: "Increased wear detected in actuator mechanism",
      timestamp: "15 min ago",
      flightImpact: "Monitor closely",
      recommendedActions: [
        "Schedule routine maintenance check",
        "Monitor actuator performance during pre-flight",
        "Log all flap operation anomalies",
        "Review maintenance history",
        "Order replacement parts if needed"
      ]
    },
    {
      id: 4,
      component: "Brake System",
      risk: "moderate",
      message: "Brake pad thickness below optimal range",
      timestamp: "1 hour ago",
      flightImpact: "Schedule maintenance",
      recommendedActions: [
        "Plan brake pad replacement within 48 hours",
        "Inspect brake discs for wear",
        "Monitor brake temperatures during operations",
        "Adjust landing distance calculations",
        "Update maintenance schedule"
      ]
    },
    {
      id: 5,
      component: "Navigation Antenna",
      risk: "moderate",
      message: "Signal strength degradation observed",
      timestamp: "2 hours ago",
      flightImpact: "Backup systems active",
      recommendedActions: [
        "Test backup navigation systems",
        "Calibrate antenna alignment",
        "Check connection integrity",
        "Monitor signal strength trends",
        "Schedule antenna inspection"
      ]
    },
  ]

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
        {/* Critical Alerts */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-red-700 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Critical Alerts
            <Badge variant="destructive" className="ml-auto">
              {criticalAlerts.length}
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            {criticalAlerts.map((alert) => (
              <Button
                key={alert.id}
                variant="ghost"
                className="w-full p-0 h-auto hover:bg-red-100 transition-colors block"
                onClick={() => onAlertClick(alert)}
              >
                <Card className="w-full border-red-200 bg-red-50 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-800 truncate">{alert.component}</CardTitle>
                    <CardDescription className="text-xs text-red-600">{alert.timestamp}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-red-700 mb-2 line-clamp-2">{alert.message}</p>
                    <Badge variant="destructive" className="text-[11px] whitespace-nowrap inline-block max-w-full truncate">
                      {alert.flightImpact}
                    </Badge>
                  </CardContent>
                </Card>
              </Button>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Moderate Risk Alerts */}
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
              <Button
                key={alert.id}
                variant="ghost"
                className="w-full p-0 h-auto hover:bg-yellow-100 transition-colors block"
                onClick={() => onAlertClick(alert)}
              >
                <Card className="w-full border-yellow-200 bg-yellow-50 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800 truncate">{alert.component}</CardTitle>
                    <CardDescription className="text-xs text-yellow-600">{alert.timestamp}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-yellow-700 mb-2 line-clamp-2">{alert.message}</p>
                    <Badge className="text-[11px] whitespace-nowrap inline-block max-w-full truncate bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
                      {alert.flightImpact}
                    </Badge>
                  </CardContent>
                </Card>
              </Button>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
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
