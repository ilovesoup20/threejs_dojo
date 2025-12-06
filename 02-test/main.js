import * as THREE from 'three';

const canvas = document.querySelector('#c');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5); // light background

// --- Camera (orthographic, top-down) ---
let camera;
function createCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  const zoom = 50; // how many world units fill half the screen (tweak for “scale”)

  camera = new THREE.OrthographicCamera(
    -aspect * zoom, // left
    aspect * zoom, // right
    zoom,          // top
    -zoom,          // bottom
    0.1,
    1000
  );

  camera.position.set(0, 0, 100); // above the X/Y plane
  camera.lookAt(0, 0, 0);
}
createCamera();

function createComponentBox({
                              x = 0,
                              y = 0,
                              width = 20,
                              height = 10,
                              color = 0x4a90e2
                            } = {}) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(x, y, 0); // z=0 on the diagram plane
  scene.add(mesh);

  return mesh;
}

// Example components
const api = createComponentBox({ x: -20, y: 0, width: 20, height: 10, color: 0x4a90e2 });
const db  = createComponentBox({ x:  20, y: 0, width: 20, height: 10, color: 0x7ed321 });

function connectComponents(a, b, color = 0x333333) {
  const points = [
    new THREE.Vector3(a.position.x + a.geometry.parameters.width / 2,  a.position.y, 0.01),
    new THREE.Vector3(b.position.x - b.geometry.parameters.width / 2,  b.position.y, 0.01),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  return line;
}

connectComponents(api, db);

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;
  const zoom = 50;

  camera.left   = -aspect * zoom;
  camera.right  =  aspect * zoom;
  camera.top    =  zoom;
  camera.bottom = -zoom;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

// basic scroll-to-zoom
window.addEventListener('wheel', (event) => {
  const factor = 1 + (event.deltaY > 0 ? 0.1 : -0.1);
  camera.zoom = Math.max(0.2, Math.min(5, camera.zoom * factor));
  camera.updateProjectionMatrix();
});

// basic drag-to-pan
let isDragging = false;
let lastX = 0, lastY = 0;

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

window.addEventListener('mouseup', () => { isDragging = false; });

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  const panSpeed = 0.2 / camera.zoom;
  camera.position.x -= dx * panSpeed;
  camera.position.y += dy * panSpeed;
});
