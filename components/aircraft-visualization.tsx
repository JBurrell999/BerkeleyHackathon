"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

export function AircraftVisualization() {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date().toLocaleTimeString())

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex-1 p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Aircraft Health Monitor</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Flight Ready
          </Badge>
          <span className="text-sm text-gray-500">Last Updated: {currentTime}</span>
        </div>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Boeing 747 - Aircraft Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="relative w-full max-w-3xl mx-auto">
            {/* Aircraft SVG - Realistic Commercial Airliner */}
            <svg viewBox="0 0 1000 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
              {/* Main Fuselage */}
              <ellipse cx="500" cy="200" rx="280" ry="35" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />

              {/* Nose Cone */}
              <ellipse cx="220" cy="200" rx="45" ry="30" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

              {/* Cockpit Windows */}
              <ellipse cx="240" cy="190" rx="25" ry="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <ellipse cx="250" cy="185" rx="8" ry="6" fill="#0f172a" />
              <ellipse cx="250" cy="195" rx="8" ry="6" fill="#0f172a" />

              {/* Passenger Windows */}
              {Array.from({ length: 20 }, (_, i) => (
                <circle key={i} cx={280 + i * 25} cy="185" r="4" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
              ))}

              {/* Main Wings */}
              <ellipse cx="450" cy="200" rx="180" ry="15" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

              {/* Wing Tips */}
              <ellipse cx="270" cy="200" rx="25" ry="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
              <ellipse cx="630" cy="200" rx="25" ry="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />

              {/* Engine Nacelles - CRITICAL (Red with pulsing animation) */}
              <ellipse
                cx="380"
                cy="200"
                rx="35"
                ry="18"
                fill="#fecaca"
                stroke="#ef4444"
                strokeWidth="3"
                className="animate-pulse"
              />
              <ellipse
                cx="380"
                cy="200"
                rx="25"
                ry="12"
                fill="#ef4444"
                stroke="#dc2626"
                strokeWidth="2"
                className="animate-pulse"
              />

              <ellipse
                cx="520"
                cy="200"
                rx="35"
                ry="18"
                fill="#fecaca"
                stroke="#ef4444"
                strokeWidth="3"
                className="animate-pulse"
              />
              <ellipse
                cx="520"
                cy="200"
                rx="25"
                ry="12"
                fill="#ef4444"
                stroke="#dc2626"
                strokeWidth="2"
                className="animate-pulse"
              />

              {/* Wing Flaps - MODERATE RISK (Yellow) */}
              <rect x="300" y="190" width="40" height="8" rx="2" fill="#fef3c7" stroke="#eab308" strokeWidth="2" />
              <rect x="300" y="202" width="40" height="8" rx="2" fill="#fef3c7" stroke="#eab308" strokeWidth="2" />
              <rect x="560" y="190" width="40" height="8" rx="2" fill="#fef3c7" stroke="#eab308" strokeWidth="2" />
              <rect x="560" y="202" width="40" height="8" rx="2" fill="#fef3c7" stroke="#eab308" strokeWidth="2" />

              {/* Horizontal Stabilizer (Tail Wings) */}
              <ellipse cx="720" cy="200" rx="60" ry="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

              {/* Vertical Stabilizer (Tail Fin) */}
              <polygon points="750,200 780,140 785,140 785,200" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />

              {/* Navigation Antenna - MODERATE RISK (Yellow) */}
              <circle cx="770" cy="145" r="8" fill="#fef3c7" stroke="#eab308" strokeWidth="2" />
              <rect x="768" y="140" width="4" height="10" fill="#eab308" />

              {/* Landing Gear - CRITICAL (Red) */}
              {/* Main Landing Gear */}
              <g className="animate-pulse">
                <rect x="440" y="235" width="12" height="25" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                <rect x="448" y="235" width="12" height="25" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                <circle cx="446" cy="265" r="6" fill="#374151" stroke="#1f2937" strokeWidth="1" />
                <circle cx="454" cy="265" r="6" fill="#374151" stroke="#1f2937" strokeWidth="1" />
              </g>

              {/* Nose Landing Gear */}
              <g className="animate-pulse">
                <rect x="280" y="235" width="8" height="20" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                <circle cx="284" cy="260" r="4" fill="#374151" stroke="#1f2937" strokeWidth="1" />
              </g>

              {/* Brake System Indicators - MODERATE RISK (Yellow) */}
              <rect x="438" y="270" width="16" height="4" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <rect x="450" y="270" width="16" height="4" rx="1" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />

              {/* APU (Auxiliary Power Unit) */}
              <rect x="740" y="190" width="15" height="20" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />

              {/* Wing Fuel Tanks */}
              <ellipse cx="350" cy="200" rx="45" ry="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <ellipse cx="550" cy="200" rx="45" ry="10" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />

              {/* Aircraft Registration */}
              <text x="500" y="220" textAnchor="middle" className="text-xs font-bold fill-slate-600">
                N747BA
              </text>

              {/* Airline Logo Area */}
              <circle cx="400" cy="170" r="15" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
              <text x="400" y="175" textAnchor="middle" className="text-xs font-bold fill-white">
                AL
              </text>
            </svg>

            {/* Component Labels */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-700">Critical Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-700">Moderate Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Normal</span>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-700">2</div>
                <div className="text-sm text-red-600">Critical Issues</div>
                <div className="text-xs text-red-500 mt-1">Engines & Landing Gear</div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-700">3</div>
                <div className="text-sm text-yellow-600">Moderate Risks</div>
                <div className="text-xs text-yellow-500 mt-1">Flaps, Brakes, Nav</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">18</div>
                <div className="text-sm text-green-600">Systems Normal</div>
                <div className="text-xs text-green-500 mt-1">All Other Components</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">95%</div>
                <div className="text-sm text-blue-600">Overall Health</div>
                <div className="text-xs text-blue-500 mt-1">Flight Capable</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
