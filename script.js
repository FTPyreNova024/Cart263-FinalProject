
document.body.style.cursor = 'none'

/* three.js terrain */
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import * as CANNON from 'cannon-es';

// https://threejs.org/examples/?q=pointerlock#misc_controls_pointerlock


let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3(); //movement of camera
const direction = new THREE.Vector3(); //direction
const speed = 10;
const moveSpeed = 300;

// Canvas
const canvas = document.querySelector('canvas.webgl');
const clock = new THREE.Clock();


// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.y = 10;
camera.position.x = -56.026;
camera.position.z = -310.555;
camera.rotation.y = 4;


const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);

scene.add(controls.object); //add camera to the scene
const onKeyDown = function (event) {
    // console.log(event.code);

    switch (event.code) {


        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            if (canJump === true) velocity.y += 200;
            canJump = false;
            break;

    }

};

const onKeyUp = function (event) {

    switch (event.code) {


        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

    }

};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);


document.addEventListener('click', function () {


    controls.lock();

});

controls.addEventListener('lock', function () {
    console.log("locked");

});


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


const objects = []



// Raycasting
const raycaster = new THREE.Raycaster();
const collisionObjects = [];

gltfLoader.load(
    'static/models/Path/Path1/Path.gltf',
    (gltf) => {
        console.log('success_2 ')
        let modelArray = gltf.scene.children;

        modelArray.forEach(mesh => {
            console.log("tetstststs")
            //console.log(mesh.name);
            mesh.scale.set(3, 3, 3);
            mesh.position.y += 2.2;


            function allDescendents(node) {
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    console.log(child.name);
                    allDescendents(child);
                    if (child.isMesh) {
                        collisionObjects.push(child);
                    }
                }
            }

            allDescendents(mesh);

        });
        for (const childmodel of modelArray) {
            scene.add(childmodel)
        }
    },
    (progress) => {
        console.log('progress')
        console.log(progress)
    },
    (error) => {
        console.log('error')
        console.log(error)
    }
);

gltfLoader.load(
    'static/models/Path/Path2/ Path.gltf',
    (gltf) => {
        console.log('success_2 ')
        let modelArray = gltf.scene.children;

        modelArray.forEach(mesh => {
            console.log("tetstststs")
            //console.log(mesh.name);
            mesh.scale.set(3, 3, 3);
            mesh.position.y += 2.2;
            mesh.position.x += 20;


            function allDescendents(node) {
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    console.log(child.name);
                    allDescendents(child);
                    if (child.isMesh) {
                        collisionObjects.push(child);
                    }
                }
            }

            allDescendents(mesh);

        });
        for (const childmodel of modelArray) {
            scene.add(childmodel)
        }
    },
    (progress) => {
        console.log('progress')
        console.log(progress)
    },
    (error) => {
        console.log('error')
        console.log(error)
    }
);

function movementUpdate() {
    controls.object.position.y = 10;
    //console.log("herereere")
    //console.log(collisionObjects.length)
    const time = performance.now();
    if (controls.isLocked === true) {

        raycaster.ray.origin.copy(controls.object.position);
        raycaster.ray.origin.y = 0;
        const intersections = raycaster.intersectObjects(collisionObjects, false);
        console.log(intersections)

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * speed * delta;
        velocity.z -= velocity.z * speed * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        //update velocity z
        if (moveForward || moveBackward) velocity.z -= direction.z * moveSpeed * delta;
        //update velocity x
        if (moveLeft || moveRight) velocity.x -= direction.x * moveSpeed * delta;

        // Raycasting for collision detection
        // raycaster.set(controls.object.position, direction);
        //  const intersections = raycaster.intersectObjects(collisionObjects, true);


        const onObject = intersections.length > 0;

        if (!onObject) {

            controls.moveRight(- velocity.x * delta);
            controls.moveForward(- velocity.z * delta);
        }
        else {
            console.log(intersections[0])
            console.log("stop")
            let boxThatWasHit = intersections[0].object;
            let hitPoint = intersections[0].point;
            console.log(boxThatWasHit)
            console.log(hitPoint)
        }




        // controls.object.position.y += (velocity.y * delta); // new behavior

        // if (controls.object.position.y < speed) {

        //     velocity.y = 0;
        //     controls.object.position.y = speed;

        //     canJump = true;

        // }

    }
    prevTime = time;

}

// sky
const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 32),
    new THREE.MeshBasicMaterial({
        color: 0x000033, // dark blue color
        side: THREE.DoubleSide
    })
);
scene.add(sky);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
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
    if (controls.isLocked === true) {
        movementUpdate();
        // updatePhysics();
        //console.log(camera.position)
    }
    renderer.render(scene, camera)
}
