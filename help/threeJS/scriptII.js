document.body.style.cursor = 'none'
/* three.js terrain 
https://threejs.org/examples/?q=terra#webgl_geometry_terrain */

import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'





// Canvas
const canvas = document.querySelector('canvas.webgl');
const clock = new THREE.Clock();


// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.y = 0;
camera.position.x = 5;
camera.position.z = 10;
camera.lookAt(-5, 0, 10);


const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);


const controls = new FirstPersonControls(camera, renderer.domElement)
controls.lookSpeed = 0.01;
controls.movementSpeed = 1;
controls.noFly = false;
controls.lookVertical = false;


scene.add(camera); //add camera to the scene


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
        //duckModel.position.set(1, 1, 0)
        scene.add(duckModel)
        objects.push(duckModel)
    }
)


gltfLoader.load(
    'static/models/Cube/cube.glb',
    (gltf) => {
        let cube = gltf.scene.children[0]
        scene.add(cube)
        objects.push(cube)
    }
)

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
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
function animate() {
    controls.update(clock.getDelta());
    renderer.render(scene, camera)
}

