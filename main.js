import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/PointerLockControls.js";

let camera, scene, renderer, controls;
let overlay = document.getElementById("overlay");
let crosshair = document.getElementById("crosshair");

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.y = 2;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  overlay.addEventListener("click", () => controls.lock());

  controls.addEventListener("lock", () => {
    overlay.classList.add("hidden");
    crosshair.style.display = "block";
  });

  controls.addEventListener("unlock", () => {
    overlay.classList.remove("hidden");
    crosshair.style.display = "none";
  });

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Test cube
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  cube.position.set(0, 1, -5);
  scene.add(cube);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onWindowResize);
}

function onKeyDown(event) {
  switch(event.code){
    case "ArrowUp": case "KeyW": moveForward = true; break;
    case "ArrowLeft": case "KeyA": moveLeft = true; break;
    case "ArrowDown": case "KeyS": moveBackward = true; break;
    case "ArrowRight": case "KeyD": moveRight = true; break;
    case "Space": if(canJump) velocity.y = 5; canJump = false; break;
  }
}

function onKeyUp(event) {
  switch(event.code){
    case "ArrowUp": case "KeyW": moveForward = false; break;
    case "ArrowLeft": case "KeyA": moveLeft = false; break;
    case "ArrowDown": case "KeyS": moveBackward = false; break;
    case "ArrowRight": case "KeyD": moveRight = false; break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    const delta = 0.05;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 50.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 50.0 * delta;

    controls.moveRight(velocity.x * delta);
    controls.moveForward(velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta;

    if (controls.getObject().position.y < 2) {
      velocity.y = 0;
      controls.getObject().position.y = 2;
      canJump = true;
    }
  }

  renderer.render(scene, camera);
}
