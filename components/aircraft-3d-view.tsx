"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function Aircraft3DView() {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mountRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xf8fafc) // Light gray background

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        )
        camera.position.z = 5

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
        mountRef.current.appendChild(renderer.domElement)

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 5, 5)
        scene.add(directionalLight)

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05

        // Load 3D Model
        const loader = new OBJLoader()
        loader.load('/3d-model.obj', (object: Group) => {
            // Center the object
            const box = new THREE.Box3().setFromObject(object)
            const center = box.getCenter(new THREE.Vector3())
            object.position.sub(center)

            // Scale the object to fit the view
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = 3 / maxDim
            object.scale.multiplyScalar(scale)

            scene.add(object)
        })

        // Animation loop
        function animate() {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        // Handle window resize
        function handleResize() {
            if (!mountRef.current) return
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            mountRef.current?.removeChild(renderer.domElement)
            renderer.dispose()
        }
    }, [])

    return (
        <div className="relative w-full h-full">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">3D Model View</h2>
                <p className="text-sm text-gray-600">Use mouse to rotate and zoom</p>
            </div>
        </div>
    )
} 