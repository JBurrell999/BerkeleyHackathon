'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'

interface AircraftViewerProps {
  alertLevel: 'safe' | 'warning' | 'danger'
  isSimulating: boolean
  currentSpeed: number
  simulationTime: number
  rulValue?: number
}

// Engine glow effect component
function EngineGlow({ position, alertLevel, isSimulating, rulValue }: { 
  position: [number, number, number], 
  alertLevel: 'safe' | 'warning' | 'danger',
  isSimulating: boolean,
  rulValue?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && isSimulating && alertLevel !== 'safe') {
      // Pulsing animation for warnings/danger
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7
      meshRef.current.scale.setScalar(pulse)
    }
  })

  // Only show engine glow when:
  // 1. Simulation is running
  // 2. RUL value exists and indicates risk
  // 3. Alert level is not safe
  if (!isSimulating || !rulValue || alertLevel === 'safe') {
    return null // No glow when safe, not simulating, or no RUL data
  }

  // Adjust glow size and intensity based on alert level
  const glowSize = alertLevel === 'danger' ? 0.4 : 0.25
  const glowOpacity = alertLevel === 'danger' ? 0.8 : 0.5
  const glowColor = alertLevel === 'danger' ? '#ff3333' : '#ffaa00'

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[glowSize, 16, 16]} />
      <meshBasicMaterial 
        color={glowColor} 
        transparent 
        opacity={glowOpacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Aircraft model component
function AircraftModel({ alertLevel, isSimulating, currentSpeed, rulValue }: {
  alertLevel: 'safe' | 'warning' | 'danger',
  isSimulating: boolean,
  currentSpeed: number,
  rulValue?: number
}) {
  const modelRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  
  // Load the OBJ model
  useEffect(() => {
    const loader = new OBJLoader()
    loader.load(
      '/3d-model.obj',
      (object) => {
        // Scale and position the model for optimal flight operator view
        object.scale.setScalar(0.03)  // Slightly larger for better visibility
        // Fix orientation - try different rotation to get aircraft horizontal
        object.rotation.x = 0
        object.rotation.y = 0  // Start with no rotation
        object.rotation.z = 0
        object.position.set(0, 1, 0)  // Raise aircraft slightly above ground
        
        // Apply materials to the model
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#e0e0e0',
              metalness: 0.7,
              roughness: 0.3,
            })
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        setModel(object)
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('Error loading model:', error)
        // Create fallback geometry if model fails to load
        const fallbackGeometry = new THREE.BoxGeometry(4, 0.5, 1)
        const fallbackMaterial = new THREE.MeshStandardMaterial({ color: '#cccccc' })
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)
        const fallbackGroup = new THREE.Group()
        fallbackGroup.add(fallbackMesh)
        setModel(fallbackGroup)
      }
    )
  }, [])

  // Keep aircraft stable - no unnecessary movement
  useFrame(() => {
    if (modelRef.current) {
      // Ensure aircraft stays in proper position
      modelRef.current.position.set(0, 1, 0)
      modelRef.current.rotation.x = 0
      modelRef.current.rotation.y = 0
      modelRef.current.rotation.z = 0
    }
  })

  return (
    <group ref={modelRef}>
      {model && <primitive object={model} />}
      
      {/* Engine glow effects - positioned at realistic engine locations */}
      <EngineGlow 
        position={[-2, 0.5, 0]}  // Left engine 
        alertLevel={alertLevel} 
        isSimulating={isSimulating}
        rulValue={rulValue}
      />
      <EngineGlow 
        position={[2, 0.5, 0]}   // Right engine
        alertLevel={alertLevel} 
        isSimulating={isSimulating}
        rulValue={rulValue}
      />
    </group>
  )
}

// Flight operator camera setup - Fixed position for professional view
function FlightOperatorCamera() {
  return (
    <PerspectiveCamera
      makeDefault
      position={[25, 12, 25]}  // Much further back for full aircraft view
      fov={50}                 // Wider field of view for better overview
    />
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading Aircraft Model...</p>
      </div>
    </div>
  )
}

export function Aircraft3DViewer({ 
  alertLevel, 
  isSimulating, 
  currentSpeed, 
  simulationTime,
  rulValue 
}: AircraftViewerProps) {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
      <Canvas 
        shadows 
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={null}>
          {/* Professional hangar lighting setup */}
          <ambientLight intensity={0.6} color="#f8fafc" />
          
          {/* Main overhead lighting */}
          <directionalLight
            position={[0, 20, 0]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          
          {/* Side lighting for professional visibility */}
          <pointLight position={[15, 8, 15]} intensity={0.4} color="#ffffff" />
          <pointLight position={[-15, 8, -15]} intensity={0.4} color="#ffffff" />
          
          {/* Environment for professional aircraft hangar */}
          <Environment preset="warehouse" />
          
          {/* Flight operator camera */}
          <FlightOperatorCamera />
          
          {/* Aircraft model with engine vulnerability visualization */}
          <AircraftModel 
            alertLevel={alertLevel} 
            isSimulating={isSimulating} 
            currentSpeed={currentSpeed}
            rulValue={rulValue}
          />
          
          {/* Manual camera controls when not simulating */}
          {!isSimulating && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={15}
              maxDistance={40}
              target={[0, 0, 0]}
            />
          )}
          
          {/* Professional grid floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial 
              color="#f8fafc" 
              transparent 
              opacity={0.8}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
          
          {/* Grid lines for professional hangar look */}
          <gridHelper 
            args={[30, 30, '#e2e8f0', '#f1f5f9']} 
            position={[0, -2.9, 0]} 
          />
        </Suspense>
      </Canvas>
      
      {/* Flight operator overlay information */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        <div>Aircraft: Commercial Jet</div>
        <div>View: Flight Operator</div>
        {isSimulating && (
          <>
            <div>Time: {simulationTime}s</div>
            <div>Speed: {currentSpeed.toFixed(0)} kts</div>
            {rulValue && <div>RUL: {rulValue.toFixed(0)} cycles</div>}
          </>
        )}
      </div>
      
      {/* Engine status indicator */}
      {isSimulating && alertLevel !== 'safe' && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
          <div className={`font-bold ${alertLevel === 'danger' ? 'text-red-400' : 'text-yellow-400'}`}>
            ⚠️ ENGINE ALERT
          </div>
          <div>Status: {alertLevel.toUpperCase()}</div>
          {rulValue && <div>RUL: {rulValue.toFixed(0)} cycles</div>}
        </div>
      )}
    </div>
  )
} 