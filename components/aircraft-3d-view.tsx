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
        scene.background = new THREE.Color(0xf8fafc)

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        )
        camera.position.set(0, 5, 10)
        camera.lookAt(0, 0, 0)

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        mountRef.current.appendChild(renderer.domElement)

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 5, 5)
        scene.add(directionalLight)

        // Add a grid helper for reference
        const gridHelper = new THREE.GridHelper(10, 10)
        scene.add(gridHelper)

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.minDistance = 3
        controls.maxDistance = 20

        // Create a default geometry while model loads
        const defaultGeometry = new THREE.BoxGeometry(1, 1, 1)
        const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 })
        const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial)
        scene.add(defaultMesh)

        // Load 3D Model
        const loader = new OBJLoader()
        loader.load(
            '/3d-model.obj',
            (object: Group) => {
                // Remove the default mesh
                scene.remove(defaultMesh)

                // Ensure the object has geometry
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        // Create a new material for the mesh
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x4a5568,
                            metalness: 0.5,
                            roughness: 0.5,
                        })

                        // Ensure geometry has normals
                        if (!child.geometry.attributes.normal) {
                            child.geometry.computeVertexNormals()
                        }
                    }
                })

                // Add the object to the scene
                scene.add(object)

                // Center and scale the object
                const box = new THREE.Box3().setFromObject(object)
                const size = box.getSize(new THREE.Vector3())
                const center = box.getCenter(new THREE.Vector3())

                const maxDim = Math.max(size.x, size.y, size.z)
                const scale = 5 / maxDim
                object.scale.multiplyScalar(scale)
                object.position.sub(center.multiplyScalar(scale))

                // Update camera position based on object size
                camera.position.z = maxDim * 2
                controls.update()
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded')
            },
            (error) => {
                console.error('Error loading model:', error)
            }
        )

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
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose()
                    object.material.dispose()
                }
            })
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