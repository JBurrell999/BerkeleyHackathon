"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, TrendingUp, Activity, Zap, Settings, Droplets, Gauge, Wind, Home } from "lucide-react"

interface PredictionResult {
  prediction: number
  probability?: number[]
  feature_importance?: Record<string, number>
  risk_level?: string
}

// Engine sensor data (existing)
interface EngineSensorData {
  setting_1: number
  setting_2: number
  setting_3: number
  fan_inlet_temperature: number
  lpc_pressure_ratio: number
  hpc_pressure_ratio: number
  lpt_temperature: number
  hpt_temperature: number
  fuel_flow_rate: number
  oil_pressure: number
  vibration_level: number
  exhaust_gas_temperature: number
  shaft_speed: number
  ambient_air_pressure: number
  ambient_air_temperature: number
  total_air_pressure: number
  static_pressure_ratio: number
  torque: number
  acceleration: number
  compressor_discharge_temperature: number
  combustion_chamber_pressure: number
  fuel_temperature: number
  nozzle_pressure_ratio: number
  oil_temperature: number
}

// New subsystem sensor data
interface SubsystemSensorData {
  // Hydraulic System (3 sensors)
  hydraulic_pressure: number
  hydraulic_flow: number
  hydraulic_temp: number
  
  // Electrical System (2 sensors)
  electrical_voltage: number
  electrical_current: number
  
  // Control Surface System (1 sensor)
  control_surface_deflection: number
  
  // Cabin System (1 sensor)
  cabin_pressure: number
  
  // Altimeter System (1 sensor)
  altimeter_drift: number
}

interface SubsystemPrediction {
  subsystem: string
  rul: number
  risk_level: 'safe' | 'warning' | 'danger'
  status: string
}

export function PredictionPanel() {
  const [apiUrl, setApiUrl] = useState('https://b533-2607-f140-6000-802b-d8f1-d31b-5440-8b73.ngrok-free.app/predict-rf')
  
  // State declarations
  const [enginePrediction, setEnginePrediction] = useState<PredictionResult | null>(null)
  const [subsystemPredictions, setSubsystemPredictions] = useState<SubsystemPrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationTime, setSimulationTime] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [alertLevel, setAlertLevel] = useState<'safe' | 'warning' | 'danger'>('safe')
  const [lastRUL, setLastRUL] = useState<number | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown')

  // Real-time simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isSimulating) {
      interval = setInterval(() => {
        setSimulationTime(prev => {
          const newTime = prev + 1
          
          // Calculate current speed based on takeoff profile (0-45 seconds to V1)
          let speed = 0
          if (newTime <= 45) {
            // Accelerate from 0 to 175 knots over 45 seconds (typical takeoff)
            speed = Math.min(175, (newTime / 45) * 175)
          } else {
            speed = 175 // Maintain V1 speed
          }
          setCurrentSpeed(speed)
          
          // Update all system parameters dynamically during simulation
          if (newTime <= 50) { // Run simulation for 50 seconds
            updateEngineParameters(newTime)
            updateSubsystemParameters(newTime)
            
            // Auto-predict every 3 seconds during critical phase
            if (newTime % 3 === 0) { // Predict every 3 seconds to avoid API overload
              handleEnginePrediction() // auto prediction during simulation
              simulateSubsystemPredictions(newTime) // simulate subsystem RUL
            }
          } else {
            // End simulation after 50 seconds
            setIsSimulating(false)
            setSimulationTime(0)
            setCurrentSpeed(0)
            setAlertLevel('safe') // Reset to safe when simulation ends
            setEnginePrediction(null) // Clear prediction data
            setSubsystemPredictions([]) // Clear subsystem predictions
          }
          
          return newTime
        })
      }, 1000) // Update every second
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSimulating])

  // Update engine parameters based on time and stress with realistic changes
  const updateEngineParameters = (time: number) => {
    setEngineSensorData(prev => {
      const newData = { ...prev }
      
      // Simulate realistic engine behavior during takeoff
      const stressFactor = Math.min(time / 45, 1) // Increase stress over time
      const throttlePosition = Math.min(time / 10, 1) // Throttle up over first 10 seconds
      
      // REALISTIC FUEL CONSUMPTION - Always decreases during takeoff
      newData.fuel_flow_rate = prev.fuel_flow_rate * (1 + throttlePosition * 0.002) // Increase flow rate
      newData.fuel_temperature = Math.max(prev.fuel_temperature * 0.9995, 80) // Fuel gets consumed/cooler
      
      // ENGINE TEMPERATURES - Increase with throttle and stress
      newData.exhaust_gas_temperature = prev.exhaust_gas_temperature * (1 + throttlePosition * 0.0008)
      newData.hpt_temperature = prev.hpt_temperature * (1 + throttlePosition * 0.0005)
      newData.lpt_temperature = prev.lpt_temperature * (1 + throttlePosition * 0.0003)
      newData.fan_inlet_temperature = prev.fan_inlet_temperature * (1 + throttlePosition * 0.0002)
      newData.compressor_discharge_temperature = prev.compressor_discharge_temperature * (1 + throttlePosition * 0.0004)
      
      // PRESSURES - Increase with engine power
      newData.lpc_pressure_ratio = prev.lpc_pressure_ratio * (1 + throttlePosition * 0.0006)
      newData.hpc_pressure_ratio = prev.hpc_pressure_ratio * (1 + throttlePosition * 0.0008)
      newData.total_air_pressure = prev.total_air_pressure * (1 + throttlePosition * 0.0005)
      newData.combustion_chamber_pressure = prev.combustion_chamber_pressure * (1 + throttlePosition * 0.0007)
      
      // MECHANICAL STRESS - Increase vibration and decrease oil pressure under stress
      newData.vibration_level = prev.vibration_level * (1 + stressFactor * 0.0008)
      newData.oil_pressure = prev.oil_pressure * (0.9998 - stressFactor * 0.0002) // Oil pressure decreases under stress
      newData.oil_temperature = prev.oil_temperature * (1 + stressFactor * 0.0003)
      
      // SHAFT AND MECHANICAL
      newData.shaft_speed = prev.shaft_speed * (1 + throttlePosition * 0.0004)
      newData.torque = prev.torque * (1 + throttlePosition * 0.0006)
      
      // AMBIENT CONDITIONS - Slight changes due to altitude/speed
      newData.ambient_air_pressure = prev.ambient_air_pressure * (0.9999 - time * 0.00001) // Slight decrease
      newData.ambient_air_temperature = prev.ambient_air_temperature * (0.9999 - time * 0.00001)
      
      // Add realistic variation (±0.5% for critical parameters)
      Object.keys(newData).forEach(key => {
        if (key !== 'setting_1' && key !== 'setting_2' && key !== 'setting_3') {
          const variation = 1 + (Math.random() - 0.5) * 0.01 // Reduced variation for realism
          newData[key as keyof EngineSensorData] = newData[key as keyof EngineSensorData] * variation
        }
      })
      
      return newData
    })
  }

  // Update subsystem parameters during simulation
  const updateSubsystemParameters = (time: number) => {
    setSubsystemSensorData(prev => {
      const newData = { ...prev }
      const stressFactor = Math.min(time / 45, 1)
      const throttlePosition = Math.min(time / 10, 1)
      
      // HYDRAULIC SYSTEM - Pressure increases, flow changes, temperature rises
      newData.hydraulic_pressure = prev.hydraulic_pressure * (1 + throttlePosition * 0.0003)
      newData.hydraulic_flow = prev.hydraulic_flow * (1 + stressFactor * 0.0002)
      newData.hydraulic_temp = prev.hydraulic_temp * (1 + stressFactor * 0.0004)
      
      // ELECTRICAL SYSTEM - Voltage slightly decreases under load, current increases
      newData.electrical_voltage = prev.electrical_voltage * (0.9999 - stressFactor * 0.0001)
      newData.electrical_current = prev.electrical_current * (1 + throttlePosition * 0.0005)
      
      // CONTROL SURFACE - More deflection during takeoff maneuvers
      newData.control_surface_deflection = prev.control_surface_deflection + (Math.random() - 0.5) * 0.5
      
      // CABIN PRESSURE - Slight changes during climb
      newData.cabin_pressure = prev.cabin_pressure * (0.9999 - time * 0.000005)
      
      // ALTIMETER - Small drift accumulation
      newData.altimeter_drift = prev.altimeter_drift + (Math.random() - 0.5) * 0.01
      
      return newData
    })
  }

  // Simulate subsystem RUL predictions (since we don't have real API endpoints)
  const simulateSubsystemPredictions = (time: number) => {
    const stressFactor = Math.min(time / 45, 1)
    const baseDegradation = stressFactor * 5 // Systems degrade more under stress
    
    const predictions: SubsystemPrediction[] = [
      {
        subsystem: 'hydraulic',
        rul: Math.max(20, 120 - baseDegradation - Math.random() * 10),
        risk_level: 'safe',
        status: 'Normal Operation'
      },
      {
        subsystem: 'electrical',
        rul: Math.max(15, 110 - baseDegradation - Math.random() * 15),
        risk_level: 'safe',
        status: 'Stable Power'
      },
      {
        subsystem: 'control_surface',
        rul: Math.max(25, 90 - baseDegradation - Math.random() * 8),
        risk_level: 'safe',
        status: 'Responsive'
      },
      {
        subsystem: 'cabin',
        rul: Math.max(30, 100 - baseDegradation - Math.random() * 5),
        risk_level: 'safe',
        status: 'Pressurized'
      },
      {
        subsystem: 'altimeter',
        rul: Math.max(40, 115 - baseDegradation - Math.random() * 12),
        risk_level: 'safe',
        status: 'Accurate Reading'
      }
    ]
    
    // Update risk levels based on RUL
    predictions.forEach(pred => {
      if (pred.rul < 30) {
        pred.risk_level = 'danger'
        pred.status = 'Critical Condition'
      } else if (pred.rul < 80) {
        pred.risk_level = 'warning'
        pred.status = 'Monitor Closely'
      }
    })
    
    setSubsystemPredictions(predictions)
  }

  // Check for RUL changes and trigger alerts
  useEffect(() => {
    if (enginePrediction && isSimulating) {
      const currentRUL = enginePrediction.prediction
      
      // Check all systems for overall alert level
      let newAlertLevel: 'safe' | 'warning' | 'danger' = 'safe'
      
      // Engine RUL check
      if (currentRUL < 30) {
        newAlertLevel = 'danger'
      } else if (currentRUL < 80) {
        newAlertLevel = 'warning'
      }
      
      // Subsystem RUL check
      subsystemPredictions.forEach(pred => {
        if (pred.rul < 30 && newAlertLevel !== 'danger') {
          newAlertLevel = 'danger'
        } else if (pred.rul < 80 && newAlertLevel === 'safe') {
          newAlertLevel = 'warning'
        }
      })
      
      // Trigger alert if level changed
      if (lastRUL !== null && newAlertLevel !== alertLevel) {
        setAlertLevel(newAlertLevel)
        
        if (newAlertLevel === 'danger') {
          console.log('🔴 CRITICAL: System RUL reached danger level!')
        } else if (newAlertLevel === 'warning') {
          console.log('🟡 WARNING: System RUL reached caution level!')
        }
      }
      
      setLastRUL(currentRUL)
    }
  }, [enginePrediction, subsystemPredictions, isSimulating, lastRUL, alertLevel])

  // Emit simulation data to aircraft visualization
  useEffect(() => {
    const simulationData = {
      isSimulating,
      alertLevel,
      currentSpeed,
      simulationTime,
      rulValue: enginePrediction?.prediction
    }
    
    // Emit custom event for aircraft visualization
    const event = new CustomEvent('simulationUpdate', { detail: simulationData })
    window.dispatchEvent(event)
  }, [isSimulating, alertLevel, currentSpeed, simulationTime, enginePrediction])

  const [engineSensorData, setEngineSensorData] = useState<EngineSensorData>({
    // Operational Settings (new working values)
    setting_1: 0.0023,      // Altitude setting (normalized)
    setting_2: 0.0003,      // Mach number setting (normalized)  
    setting_3: 100.0,       // Throttle resolver angle (degrees)
    
    // Temperature Sensors (new dataset values)
    fan_inlet_temperature: 518.67,       // Fan inlet temp (°R)
    lpc_pressure_ratio: 643.02,          // Low pressure compressor 
    hpc_pressure_ratio: 1585.29,         // High pressure compressor
    lpt_temperature: 1398.21,            // Low pressure turbine temp (°R)
    hpt_temperature: 14.62,              // High pressure turbine temp
    fuel_flow_rate: 21.61,               // Fuel flow rate
    oil_pressure: 553.90,                // Oil pressure
    vibration_level: 2388.04,            // Vibration level
    
    // Pressure & Flow Sensors (new values)
    exhaust_gas_temperature: 9050.17,    // Exhaust gas temp
    shaft_speed: 1.30,                   // Shaft speed (normalized)
    ambient_air_pressure: 47.20,         // Ambient pressure
    ambient_air_temperature: 521.72,     // Ambient temp (°R)
    total_air_pressure: 2388.03,         // Total pressure
    static_pressure_ratio: 8125.55,      // Static pressure ratio
    torque: 8.4052,                      // Engine torque
    acceleration: 0.03,                  // Acceleration
    
    // Mechanical Sensors (new dataset values)
    compressor_discharge_temperature: 392,    // CDT
    combustion_chamber_pressure: 2388,       // Combustor pressure
    fuel_temperature: 100.00,                // Fuel temperature
    nozzle_pressure_ratio: 38.86,            // Nozzle pressure ratio
    oil_temperature: 23.3735,                // Oil temperature
  })

  const [subsystemSensorData, setSubsystemSensorData] = useState<SubsystemSensorData>({
    // Hydraulic System - Based on flight_subsystem_data.ipynb parameters
    hydraulic_pressure: 3000,     // psi - typical aircraft hydraulic pressure
    hydraulic_flow: 120,          // gpm - gallons per minute
    hydraulic_temp: 80,           // °F - hydraulic fluid temperature
    
    // Electrical System
    electrical_voltage: 28,       // V - typical aircraft DC voltage
    electrical_current: 5,        // A - amperes
    
    // Control Surface System
    control_surface_deflection: 0, // degrees - neutral position
    
    // Cabin System
    cabin_pressure: 101.3,        // kPa - sea level pressure
    
    // Altimeter System
    altimeter_drift: 0,           // feet - altimeter error
  })

  const handleEnginePrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      // Convert engineSensorData object to array in the correct order (24 features)
      const featuresArray = [
        engineSensorData.setting_1,
        engineSensorData.setting_2,
        engineSensorData.setting_3,
        engineSensorData.fan_inlet_temperature,
        engineSensorData.lpc_pressure_ratio,
        engineSensorData.hpc_pressure_ratio,
        engineSensorData.lpt_temperature,
        engineSensorData.hpt_temperature,
        engineSensorData.fuel_flow_rate,
        engineSensorData.oil_pressure,
        engineSensorData.vibration_level,
        engineSensorData.exhaust_gas_temperature,
        engineSensorData.shaft_speed,
        engineSensorData.ambient_air_pressure,
        engineSensorData.ambient_air_temperature,
        engineSensorData.total_air_pressure,
        engineSensorData.static_pressure_ratio,
        engineSensorData.torque,
        engineSensorData.acceleration,
        engineSensorData.compressor_discharge_temperature,
        engineSensorData.combustion_chamber_pressure,
        engineSensorData.fuel_temperature,
        engineSensorData.nozzle_pressure_ratio,
        engineSensorData.oil_temperature
      ]
      
      let response: Response
      let apiUsed = 'direct'
      
      try {
        // Try proxy API first since direct calls trigger CORS preflight
        console.log('Using proxy API to avoid CORS issues...')
        apiUsed = 'proxy'
        
        response = await fetch(`/api/predict?url=${encodeURIComponent(apiUrl)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ features: featuresArray })
        })
      } catch (proxyError) {
        console.log('Proxy API failed, trying direct call...', proxyError)
        apiUsed = 'direct'
        
        // Fallback to direct API with no-cors mode to avoid preflight
        response = await fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({ features: featuresArray })
        })
      }

      console.log(`Response from ${apiUsed} API - Status:`, response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorData.error || ''}`)
      }

      const result = await response.json()
      console.log('API Response:', result)
      setEnginePrediction(result)
      
    } catch (err) {
      console.error('Prediction Error:', err)
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to the API. Please check if the ngrok URL is correct and the server is running.')
      } else if (err instanceof Error) {
        setError(`${err.message}`)
      } else {
        setError('Failed to get prediction. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus('unknown')
    
    try {
      console.log('Testing connection via proxy to:', apiUrl)
      
      // Use proxy for testing to avoid CORS issues
      const testFeaturesArray = [
        0.0023, 0.0003, 100.0, 518.67, 643.02, 1585.29, 1398.21, 14.62,
        21.61, 553.90, 2388.04, 9050.17, 1.30, 47.20, 521.72, 2388.03,
        8125.55, 8.4052, 0.03, 392, 2388, 100.00, 38.86, 23.3735
      ]
      
      const response = await fetch(`/api/predict?url=${encodeURIComponent(apiUrl)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features: testFeaturesArray })
      })
      
      console.log('Test response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Test response data:', result)
        setConnectionStatus('success')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Test failed with status:', response.status, errorData)
        setConnectionStatus('failed')
      }
    } catch (err) {
      console.error('Connection test failed:', err)
      setConnectionStatus('failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleEngineInputChange = (field: keyof EngineSensorData, value: string) => {
    setEngineSensorData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleSubsystemInputChange = (field: keyof SubsystemSensorData, value: string) => {
    setSubsystemSensorData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const getSubsystemIcon = (subsystem: string) => {
    switch (subsystem) {
      case 'hydraulic': return Droplets
      case 'electrical': return Zap
      case 'control_surface': return Settings
      case 'cabin': return Home
      case 'altimeter': return Gauge
      default: return Activity
    }
  }

  const getSubsystemColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'danger': return 'bg-red-50 border-red-200 text-red-900'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      default: return 'bg-green-50 border-green-200 text-green-900'
    }
  }

  const engineSensors = [
    { key: 'setting_1', label: 'Operational Setting 1', unit: '' },
    { key: 'setting_2', label: 'Operational Setting 2', unit: '' },
    { key: 'setting_3', label: 'Operational Setting 3', unit: '' },
    { key: 'fan_inlet_temperature', label: 'Fan Inlet Temp (°R)', unit: '°R' },
    { key: 'lpc_pressure_ratio', label: 'LPC Pressure Ratio', unit: '' },
    { key: 'hpc_pressure_ratio', label: 'HPC Pressure Ratio', unit: '' },
    { key: 'lpt_temperature', label: 'LPT Temperature (°R)', unit: '°R' },
    { key: 'hpt_temperature', label: 'HPT Temperature (°R)', unit: '°R' },
    { key: 'fuel_flow_rate', label: 'Fuel Flow Rate', unit: '' },
    { key: 'oil_pressure', label: 'Oil Pressure (psi)', unit: 'psi' },
    { key: 'vibration_level', label: 'Vibration Level', unit: '' },
    { key: 'exhaust_gas_temperature', label: 'Exhaust Gas Temp (°R)', unit: '°R' },
    { key: 'shaft_speed', label: 'Shaft Speed', unit: '' },
    { key: 'ambient_air_pressure', label: 'Ambient Air Pressure', unit: '' },
    { key: 'ambient_air_temperature', label: 'Ambient Air Temp (°R)', unit: '°R' },
    { key: 'total_air_pressure', label: 'Total Air Pressure', unit: '' },
    { key: 'static_pressure_ratio', label: 'Static Pressure Ratio', unit: '' },
    { key: 'torque', label: 'Torque', unit: '' },
    { key: 'acceleration', label: 'Acceleration', unit: '' },
    { key: 'compressor_discharge_temperature', label: 'Compressor Discharge Temp', unit: '°R' },
    { key: 'combustion_chamber_pressure', label: 'Combustion Chamber Pressure', unit: '' },
    { key: 'fuel_temperature', label: 'Fuel Temperature', unit: '°R' },
    { key: 'nozzle_pressure_ratio', label: 'Nozzle Pressure Ratio', unit: '' },
    { key: 'oil_temperature', label: 'Oil Temperature', unit: '°R' },
  ] as const

  const subsystemSensors = {
    hydraulic: [
      { key: 'hydraulic_pressure', label: 'Hydraulic Pressure', unit: 'psi' },
      { key: 'hydraulic_flow', label: 'Hydraulic Flow', unit: 'gpm' },
      { key: 'hydraulic_temp', label: 'Hydraulic Temperature', unit: '°F' },
    ],
    electrical: [
      { key: 'electrical_voltage', label: 'Electrical Voltage', unit: 'V' },
      { key: 'electrical_current', label: 'Electrical Current', unit: 'A' },
    ],
    control_surface: [
      { key: 'control_surface_deflection', label: 'Control Surface Deflection', unit: '°' },
    ],
    cabin: [
      { key: 'cabin_pressure', label: 'Cabin Pressure', unit: 'kPa' },
    ],
    altimeter: [
      { key: 'altimeter_drift', label: 'Altimeter Drift', unit: 'ft' },
    ],
  } as const

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Comprehensive Flight Systems Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of engine and all critical flight subsystems during takeoff phase
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Configuration */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              API Configuration
            </h4>
            <div className="space-y-2">
              <Label htmlFor="api-url" className="text-xs">Ngrok API URL</Label>
              <div className="flex gap-2">
                <Input
                  id="api-url"
                  type="url"
                  value={apiUrl}
                  onChange={(e) => {
                    setApiUrl(e.target.value)
                    setConnectionStatus('unknown')
                  }}
                  placeholder="https://your-ngrok-url.ngrok-free.app/predict-rf"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testConnection}
                  disabled={testingConnection}
                  className="shrink-0"
                >
                  {testingConnection ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
              {connectionStatus !== 'unknown' && (
                <div className={`text-xs flex items-center gap-1 ${
                  connectionStatus === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {connectionStatus === 'success' ? (
                    <>✅ Connection successful - API is reachable</>
                  ) : (
                    <>❌ Connection failed - check URL and server status</>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Simulation Controls */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                🛫 Real-Time Takeoff Simulation
              </h4>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                alertLevel === 'danger' ? 'bg-red-100 text-red-800 animate-pulse' :
                alertLevel === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {alertLevel === 'danger' ? '🔴 CRITICAL' :
                 alertLevel === 'warning' ? '🟡 CAUTION' : '⚪ SAFE'}
              </div>
            </div>
            
            {isSimulating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time: {simulationTime}s</span>
                  <span>Speed: {currentSpeed.toFixed(0)} knots</span>
                  <span>Phase: {currentSpeed < 140 ? 'Pre-V1' : currentSpeed < 175 ? 'V1 Critical' : 'Post-V1'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      currentSpeed < 140 ? 'bg-green-500' : 
                      currentSpeed < 175 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentSpeed / 175) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (!isSimulating) {
                    // Starting simulation - reset to safe state
                    setAlertLevel('safe')
                    setEnginePrediction(null)
                    setSubsystemPredictions([])
                    setSimulationTime(0)
                    setCurrentSpeed(0)
                  }
                  setIsSimulating(!isSimulating)
                }}
                disabled={loading}
                variant={isSimulating ? "destructive" : "default"}
                className="flex-1"
              >
                {isSimulating ? (
                  <>🛑 Stop Simulation</>
                ) : (
                  <>🚀 Start Takeoff Simulation</>
                )}
              </Button>
              
              <Button 
                onClick={handleEnginePrediction} 
                disabled={loading || isSimulating}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Manual Predict
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabbed Interface for Different Systems */}
          <Tabs defaultValue="engine" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="engine" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Engine
              </TabsTrigger>
              <TabsTrigger value="hydraulic" className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                Hydraulic
              </TabsTrigger>
              <TabsTrigger value="electrical" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Electrical
              </TabsTrigger>
              <TabsTrigger value="control_surface" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Control
              </TabsTrigger>
              <TabsTrigger value="cabin" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                Cabin
              </TabsTrigger>
              <TabsTrigger value="altimeter" className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                Altimeter
              </TabsTrigger>
            </TabsList>

            {/* Engine Tab */}
            <TabsContent value="engine" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Engine sensor parameters (24 features) - NASA CMAPSS dataset format
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {engineSensors.map(({ key, label, unit }) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={key} className="text-xs">{label}</Label>
                    <Input
                      id={key}
                      type="number"
                      step={key.includes('setting') ? "0.0001" : "0.01"}
                      value={engineSensorData[key]}
                      onChange={(e) => handleEngineInputChange(key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Subsystem Tabs */}
            {Object.entries(subsystemSensors).map(([subsystem, sensors]) => (
              <TabsContent key={subsystem} value={subsystem} className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {subsystem.charAt(0).toUpperCase() + subsystem.slice(1)} system sensor parameters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sensors.map(({ key, label, unit }) => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={key} className="text-xs">{label}</Label>
                      <Input
                        id={key}
                        type="number"
                        step="0.01"
                        value={subsystemSensorData[key as keyof SubsystemSensorData]}
                        onChange={(e) => handleSubsystemInputChange(key as keyof SubsystemSensorData, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Prediction Error:</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* System Status Overview */}
          {(enginePrediction || subsystemPredictions.length > 0) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">System Status Overview</h3>
              
              {/* Engine Status */}
              {enginePrediction && (
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Engine System - Primary RUL Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Remaining Useful Life (RUL)</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {enginePrediction.prediction.toFixed(0)} cycles
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            ~{(enginePrediction.prediction * 1.5).toFixed(0)} flight hours*
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div>
                          <p className="text-sm font-medium text-orange-700">Critical Takeoff Risk</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {(() => {
                              const criticalRisk = Math.max(0, Math.min(100, (130 - enginePrediction.prediction) / 130 * 100))
                              return criticalRisk.toFixed(1)
                            })()}%
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            V1 Speed: 140-175 knots
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subsystem Status Grid */}
              {subsystemPredictions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subsystemPredictions.map((pred) => {
                    const IconComponent = getSubsystemIcon(pred.subsystem)
                    return (
                      <Card key={pred.subsystem} className={`border-2 ${getSubsystemColor(pred.risk_level)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="h-4 w-4" />
                            <h4 className="font-medium capitalize">{pred.subsystem}</h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-bold">{pred.rul.toFixed(0)} cycles</p>
                            <p className="text-sm">{pred.status}</p>
                            <Badge 
                              variant={pred.risk_level === 'danger' ? 'destructive' : 
                                      pred.risk_level === 'warning' ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {pred.risk_level === 'danger' ? '🔴 Critical' :
                               pred.risk_level === 'warning' ? '🟡 Caution' : '🟢 Normal'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 