"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OBJLoader } from "three-stdlib"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Aircraft3DViewer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [modelStatus, setModelStatus] = useState<"loading" | "loaded" | "fallback">("loading")
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const aircraftRef = useRef<THREE.Group>()
  const controlsRef = useRef<{
    mouseX: number
    mouseY: number
    isMouseDown: boolean
    targetRotationX: number
    targetRotationY: number
    currentRotationX: number
    currentRotationY: number
  }>({
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
    targetRotationX: 0,
    targetRotationY: 0,
    currentRotationX: 0,
    currentRotationY: 0,
  })

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue background
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(8, 4, 8)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    rendererRef.current = renderer

    // Enhanced Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.4)
    scene.add(ambientLight)

    // Main directional light (sun)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2)
    mainLight.position.set(20, 20, 10)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 4096
    mainLight.shadow.mapSize.height = 4096
    mainLight.shadow.camera.near = 0.1
    mainLight.shadow.camera.far = 100
    mainLight.shadow.camera.left = -20
    mainLight.shadow.camera.right = 20
    mainLight.shadow.camera.top = 20
    mainLight.shadow.camera.bottom = -20
    mainLight.shadow.bias = -0.0001
    scene.add(mainLight)

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3)
    fillLight.position.set(-10, 5, -5)
    scene.add(fillLight)

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5)
    rimLight.position.set(0, 5, -10)
    scene.add(rimLight)

    // Create materials
    const createMaterials = () => ({
      body: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.7,
        roughness: 0.1,
        reflectivity: 0.9,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
      critical: new THREE.MeshPhysicalMaterial({
        color: 0xff3333,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x331111,
        emissiveIntensity: 0.2,
      }),
      moderate: new THREE.MeshPhysicalMaterial({
        color: 0xffaa00,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x332200,
        emissiveIntensity: 0.1,
      }),
      normal: new THREE.MeshPhysicalMaterial({
        color: 0x44aa44,
        metalness: 0.2,
        roughness: 0.3,
      }),
    })

    const materials = createMaterials()

    // Enhanced aircraft creation
    const createStylizedAircraft = () => {
      const aircraft = new THREE.Group()

      // Main Fuselage
      const fuselageGeometry = new THREE.CylinderGeometry(0.4, 0.15, 6, 32)
      const fuselage = new THREE.Mesh(fuselageGeometry, materials.body)
      fuselage.rotation.z = Math.PI / 2
      fuselage.castShadow = true
      fuselage.receiveShadow = true
      aircraft.add(fuselage)

      // Nose cone
      const noseGeometry = new THREE.ConeGeometry(0.15, 0.8, 16)
      const nose = new THREE.Mesh(noseGeometry, materials.body)
      nose.position.set(3.4, 0, 0)
      nose.rotation.z = -Math.PI / 2
      nose.castShadow = true
      aircraft.add(nose)

      // Wings
      const wingGeometry = new THREE.BoxGeometry(4, 0.15, 1.2)
      const wings = new THREE.Mesh(wingGeometry, materials.body)
      wings.castShadow = true
      wings.receiveShadow = true
      aircraft.add(wings)

      // Wing tips
      const tipGeometry = new THREE.SphereGeometry(0.3, 16, 8)
      const leftTip = new THREE.Mesh(tipGeometry, materials.normal)
      leftTip.position.set(0, 0, 0.9)
      leftTip.scale.set(0.5, 0.3, 1)
      leftTip.castShadow = true
      aircraft.add(leftTip)

      const rightTip = new THREE.Mesh(tipGeometry, materials.normal)
      rightTip.position.set(0, 0, -0.9)
      rightTip.scale.set(0.5, 0.3, 1)
      rightTip.castShadow = true
      aircraft.add(rightTip)

      // Engine nacelles (CRITICAL)
      const engineGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.2, 16)
      
      const leftEngine = new THREE.Mesh(engineGeometry, materials.critical)
      leftEngine.position.set(-0.5, -0.4, 1.5)
      leftEngine.rotation.z = Math.PI / 2
      leftEngine.castShadow = true
      aircraft.add(leftEngine)

      const rightEngine = new THREE.Mesh(engineGeometry, materials.critical)
      rightEngine.position.set(-0.5, -0.4, -1.5)
      rightEngine.rotation.z = Math.PI / 2
      rightEngine.castShadow = true
      aircraft.add(rightEngine)

      // Engine intakes
      const intakeGeometry = new THREE.RingGeometry(0.15, 0.25, 16)
      const intakeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x222222,
        metalness: 1,
        roughness: 0.1,
      })

      const leftIntake = new THREE.Mesh(intakeGeometry, intakeMaterial)
      leftIntake.position.set(0.1, -0.4, 1.5)
      leftIntake.rotation.y = Math.PI / 2
      aircraft.add(leftIntake)

      const rightIntake = new THREE.Mesh(intakeGeometry, intakeMaterial)
      rightIntake.position.set(0.1, -0.4, -1.5)
      rightIntake.rotation.y = Math.PI / 2
      aircraft.add(rightIntake)

      // Vertical stabilizer (tail)
      const tailGeometry = new THREE.BoxGeometry(0.15, 2, 1)
      const tail = new THREE.Mesh(tailGeometry, materials.body)
      tail.position.set(-2.5, 0.5, 0)
      tail.castShadow = true
      aircraft.add(tail)

      // Horizontal stabilizers
      const hTailGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.4)
      const hTail = new THREE.Mesh(hTailGeometry, materials.body)
      hTail.position.set(-2.5, 0, 0)
      hTail.castShadow = true
      aircraft.add(hTail)

      // Landing gear (CRITICAL)
      const gearGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8)
      
      const mainGearLeft = new THREE.Mesh(gearGeometry, materials.critical)
      mainGearLeft.position.set(-0.5, -0.8, 0.8)
      mainGearLeft.castShadow = true
      aircraft.add(mainGearLeft)

      const mainGearRight = new THREE.Mesh(gearGeometry, materials.critical)
      mainGearRight.position.set(-0.5, -0.8, -0.8)
      mainGearRight.castShadow = true
      aircraft.add(mainGearRight)

      const noseGear = new THREE.Mesh(gearGeometry, materials.critical)
      noseGear.position.set(2, -0.8, 0)
      noseGear.castShadow = true
      aircraft.add(noseGear)

      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16)
      const wheelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x333333,
        metalness: 0.1,
        roughness: 0.8,
      })

      const wheels = [
        { pos: [-0.5, -1.2, 0.8] },
        { pos: [-0.5, -1.2, -0.8] },
        { pos: [2, -1.2, 0] },
      ]

             wheels.forEach(wheel => {
         const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial)
         wheelMesh.position.set(wheel.pos[0], wheel.pos[1], wheel.pos[2])
         wheelMesh.rotation.z = Math.PI / 2
         wheelMesh.castShadow = true
         aircraft.add(wheelMesh)
       })

      // Windows
      const windowGeometry = new THREE.SphereGeometry(0.08, 8, 8)
      const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x87CEEB,
        metalness: 0,
        roughness: 0,
        transmission: 0.9,
        thickness: 0.1,
      })

      for (let i = 0; i < 12; i++) {
        const window = new THREE.Mesh(windowGeometry, windowMaterial)
        window.position.set(2 - i * 0.3, 0.3, 0)
        window.scale.set(0.8, 0.6, 0.8)
        aircraft.add(window)
      }

      return aircraft
    }

    // Load OBJ model with proper loader
    const objLoader = new OBJLoader()
    
    objLoader.load(
      '/3d-model.obj',
      (object) => {
        // Successfully loaded OBJ
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = materials.body
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        
        // Scale and position the loaded model
        object.scale.setScalar(0.1)
        object.position.set(0, 0, 0)
        
        aircraftRef.current = object
        scene.add(object)
        setModelStatus("loaded")
        setLoading(false)
      },
      (progress) => {
        console.log('Loading progress:', progress)
      },
      (error) => {
        console.log('Failed to load OBJ, using fallback')
        // Use enhanced fallback aircraft
        const aircraft = createStylizedAircraft()
        aircraftRef.current = aircraft
        scene.add(aircraft)
        setModelStatus("fallback")
        setLoading(false)
      }
    )

         // Enhanced Ground plane with grid
    const groundGeometry = new THREE.PlaneGeometry(50, 50, 50, 50)
    const groundMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8f9fa,
      metalness: 0,
      roughness: 0.8,
      transparent: true,
      opacity: 0.8,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0xcccccc, 0xeeeeee)
    gridHelper.position.y = -1.99
    scene.add(gridHelper)

    // Clouds (atmospheric effect)
    const cloudGeometry = new THREE.SphereGeometry(2, 8, 6)
    const cloudMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    })

    for (let i = 0; i < 10; i++) {
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial)
      cloud.position.set(
        (Math.random() - 0.5) * 80,
        Math.random() * 10 + 15,
        (Math.random() - 0.5) * 80
      )
      cloud.scale.setScalar(Math.random() * 2 + 1)
      scene.add(cloud)
    }

    // Enhanced mouse controls
    const handleMouseDown = (event: MouseEvent) => {
      controlsRef.current.isMouseDown = true
      controlsRef.current.mouseX = event.clientX
      controlsRef.current.mouseY = event.clientY
    }

    const handleMouseUp = () => {
      controlsRef.current.isMouseDown = false
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!controlsRef.current.isMouseDown) return

      const deltaX = event.clientX - controlsRef.current.mouseX
      const deltaY = event.clientY - controlsRef.current.mouseY

      controlsRef.current.targetRotationY += deltaX * 0.01
      controlsRef.current.targetRotationX += deltaY * 0.01
      controlsRef.current.targetRotationX = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, controlsRef.current.targetRotationX)
      )

      controlsRef.current.mouseX = event.clientX
      controlsRef.current.mouseY = event.clientY
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (cameraRef.current) {
        const distance = cameraRef.current.position.distanceTo(new THREE.Vector3(0, 0, 0))
        const newDistance = Math.max(3, Math.min(20, distance + event.deltaY * 0.01))
        const direction = cameraRef.current.position.clone().normalize()
        cameraRef.current.position.copy(direction.multiplyScalar(newDistance))
      }
    }

    mountRef.current.addEventListener('mousedown', handleMouseDown)
    mountRef.current.addEventListener('mouseup', handleMouseUp)
    mountRef.current.addEventListener('mousemove', handleMouseMove)
    mountRef.current.addEventListener('wheel', handleWheel)
    mountRef.current.appendChild(renderer.domElement)

    // Enhanced animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Smooth camera controls
      controlsRef.current.currentRotationX +=
        (controlsRef.current.targetRotationX - controlsRef.current.currentRotationX) * 0.05
      controlsRef.current.currentRotationY +=
        (controlsRef.current.targetRotationY - controlsRef.current.currentRotationY) * 0.05

      if (cameraRef.current) {
        const radius = cameraRef.current.position.distanceTo(new THREE.Vector3(0, 0, 0))
        cameraRef.current.position.x =
          Math.cos(controlsRef.current.currentRotationY) * 
          Math.cos(controlsRef.current.currentRotationX) * radius
        cameraRef.current.position.y = Math.sin(controlsRef.current.currentRotationX) * radius
        cameraRef.current.position.z =
          Math.sin(controlsRef.current.currentRotationY) * 
          Math.cos(controlsRef.current.currentRotationX) * radius
        cameraRef.current.lookAt(0, 0, 0)
      }

      // Gentle aircraft rotation for better viewing
      if (aircraftRef.current && modelStatus === "fallback") {
        aircraftRef.current.rotation.y += 0.003
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousedown', handleMouseDown)
        mountRef.current.removeEventListener('mouseup', handleMouseUp)
        mountRef.current.removeEventListener('mousemove', handleMouseMove)
        mountRef.current.removeEventListener('wheel', handleWheel)
        if (renderer.domElement && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement)
        }
      }
      renderer.dispose()
    }
  }, [])



  return (
    <div className="flex-1 p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">3D Aircraft Health Monitor</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Flight Ready
          </Badge>
          <span className="text-sm text-gray-500">Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Boeing 747 - Enhanced 3D Aircraft Overview</CardTitle>
          <p className="text-center text-sm text-gray-600">
            Click and drag to rotate • Mouse wheel to zoom • 
            {loading ? 'Loading model...' : 
             modelStatus === "loaded" ? 'Using custom OBJ model' : 
             'Using enhanced fallback model'}
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="relative w-full max-w-3xl mx-auto">
            <div 
              ref={mountRef} 
              className="w-full h-96 border rounded-lg overflow-hidden"
              style={{ cursor: 'grab' }}
            />
            
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading 3D model...</p>
                </div>
              </div>
            )}

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