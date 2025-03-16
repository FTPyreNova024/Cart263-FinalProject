document.body.style.cursor = 'none'

import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 1, 5)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


// Controls
const controls = new FirstPersonControls(camera, renderer.domElement)
// Remove momentum from mouse look
controls.lookSpeed = 0.1
controls.lookVertical = true
controls.constrainVertical = true
controls.verticalMin = 1.0
controls.verticalMax = 2.0
controls.lon = 0
controls.lat = 0

controls.handleMouseMove = function (event) {
    if (this.enabled === false) return

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    this.lon -= movementX * this.lookSpeed
    this.lat -= movementY * this.lookSpeed

    this.lat = Math.max(-85, Math.min(85, this.lat))
    this.phi = THREE.MathUtils.degToRad(90 - this.lat)
    this.theta = THREE.MathUtils.degToRad(this.lon)

    const position = this.object.position
    const targetPosition = new THREE.Vector3(
        position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta),
        position.y + 100 * Math.cos(this.phi),
        position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta)
    )

    this.object.lookAt(targetPosition)
}

document.addEventListener('mousemove', controls.handleMouseMove.bind(controls), false)

// Models
const gltfLoader = new GLTFLoader()

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)


// Collision detection
const objects = []

let duckModel;

gltfLoader.load(
    'static/models/Duck/glTF/Duck.gltf',
    (gltf) => {
        duckModel = gltf.scene.children[0]
        duckModel.position.set(1, 1, 0)
        scene.add(duckModel)
        objects.push(duckModel)
        camera.position.set(1, 2, 3) // Adjust camera position relative to the duck
        camera.lookAt(duckModel.position)
    }
)

const originalUpdate = controls.update.bind(controls)
controls.update = (delta) => {
    const prevPosition = camera.position.clone()
    originalUpdate(delta)
    if (duckModel) {
        duckModel.position.copy(camera.position)
        duckModel.position.y -= 1 // Adjust the height offset if needed
        duckModel.rotation.y = camera.rotation.y // Rotate the duck model along with the camera
    }
    if (checkCollisions()) {
        camera.position.copy(prevPosition)
        if (duckModel) {
            duckModel.position.copy(prevPosition)
            duckModel.position.y -= 1 // Adjust the height offset if needed
        }
    }
}

gltfLoader.load(
    'static/models/Cube/cube.glb',
    (gltf) => {
        let cube = gltf.scene.children[0]
        scene.add(cube)
        objects.push(cube)
    }
)

const checkCollisions = () => {
    const cameraBox = new THREE.Box3().setFromObject(camera)
    for (let i = 0; i < objects.length; i++) {
        const objectBox = new THREE.Box3().setFromObject(objects[i])
        if (cameraBox.intersectsBox(objectBox)) {
            return true
        }
    }
    return false
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.rotation.x = - Math.PI / 2
scene.add(floor)
objects.push(floor)

// Animation loop
const animate = () => {
    requestAnimationFrame(animate)
    controls.update(0.1) // Update controls
    renderer.render(scene, camera)
}

animate()