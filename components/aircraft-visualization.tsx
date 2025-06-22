'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Aircraft3DViewer } from "./aircraft-3d-viewer"
import { PredictionPanel } from "./prediction-panel"

export function AircraftVisualization() {
  // State to track simulation data from PredictionPanel
  const [simulationData, setSimulationData] = useState({
    isSimulating: false,
    alertLevel: 'safe' as 'safe' | 'warning' | 'danger',
    currentSpeed: 0,
    simulationTime: 0,
    rulValue: undefined as number | undefined
  })

  // Listen for simulation events from PredictionPanel
  useEffect(() => {
    const handleSimulationUpdate = (event: CustomEvent) => {
      setSimulationData(event.detail)
    }

    window.addEventListener('simulationUpdate', handleSimulationUpdate as EventListener)
    
    return () => {
      window.removeEventListener('simulationUpdate', handleSimulationUpdate as EventListener)
    }
  }, [])

  return (
    <div className="flex-1 p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Flight Operator Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge 
            variant="outline" 
            className={`${
              simulationData.alertLevel === 'danger' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
              simulationData.alertLevel === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-green-50 text-green-700 border-green-200'
            }`}
          >
            {simulationData.isSimulating ? (
              simulationData.alertLevel === 'danger' ? '🔴 ENGINE CRITICAL' :
              simulationData.alertLevel === 'warning' ? '🟡 ENGINE CAUTION' :
              '✈️ TAKEOFF IN PROGRESS'
            ) : (
              'Flight Ready'
            )}
          </Badge>
          <span className="text-sm text-gray-500">
            {simulationData.isSimulating ? 
              `Takeoff Simulation: ${simulationData.simulationTime}s` : 
              `Last Updated: ${new Date().toLocaleTimeString()}`
            }
          </span>
        </div>
      </div>

      {/* 3D Aircraft Visualization */}
      <Card className="w-full max-w-4xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span>Commercial Aircraft - Flight Operator View</span>
            {simulationData.isSimulating && (
              <Badge variant={simulationData.alertLevel === 'danger' ? 'destructive' : 
                             simulationData.alertLevel === 'warning' ? 'secondary' : 'default'}>
                {simulationData.currentSpeed.toFixed(0)} kts
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <Aircraft3DViewer
              alertLevel={simulationData.alertLevel}
              isSimulating={simulationData.isSimulating}
              currentSpeed={simulationData.currentSpeed}
              simulationTime={simulationData.simulationTime}
              rulValue={simulationData.rulValue}
            />
          </div>

          {/* Flight Status Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${
              simulationData.alertLevel === 'danger' ? 'border-red-200 bg-red-50' :
              simulationData.alertLevel === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-green-200 bg-green-50'
            }`}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${
                  simulationData.alertLevel === 'danger' ? 'text-red-700' :
                  simulationData.alertLevel === 'warning' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  {simulationData.isSimulating ? 
                    simulationData.currentSpeed.toFixed(0) : 
                    '0'
                  }
                </div>
                <div className={`text-sm ${
                  simulationData.alertLevel === 'danger' ? 'text-red-600' :
                  simulationData.alertLevel === 'warning' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Speed (knots)
                </div>
                <div className={`text-xs mt-1 ${
                  simulationData.alertLevel === 'danger' ? 'text-red-500' :
                  simulationData.alertLevel === 'warning' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {simulationData.isSimulating ? 
                    (simulationData.currentSpeed < 140 ? 'Pre-V1' : 
                     simulationData.currentSpeed < 175 ? 'V1 Critical' : 'Post-V1') :
                    'Ground'
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {simulationData.isSimulating ? simulationData.simulationTime : '0'}
                </div>
                <div className="text-sm text-blue-600">Simulation Time</div>
                <div className="text-xs text-blue-500 mt-1">
                  {simulationData.isSimulating ? 'seconds' : 'Ready to start'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {simulationData.rulValue ? simulationData.rulValue.toFixed(0) : '--'}
                </div>
                <div className="text-sm text-purple-600">RUL Cycles</div>
                <div className="text-xs text-purple-500 mt-1">Remaining Useful Life</div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${
                  simulationData.alertLevel === 'danger' ? 'text-red-700' :
                  simulationData.alertLevel === 'warning' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  {simulationData.alertLevel === 'danger' ? 'CRITICAL' :
                   simulationData.alertLevel === 'warning' ? 'CAUTION' :
                   'NORMAL'}
                </div>
                <div className="text-sm text-gray-600">Engine Status</div>
                <div className="text-xs text-gray-500 mt-1">
                  {simulationData.isSimulating ? 'Live Monitoring' : 'Standby'}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* AI Prediction Panel */}
      <PredictionPanel />
    </div>
  )
}
