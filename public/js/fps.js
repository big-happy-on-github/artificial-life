// Basic 3D FPS game setup with Three.js
let scene, camera, renderer, player, bullets = [];
let keys = {}; // Track key states
let rotation = { x: 0, y: 0 }; // Track camera rotation

// Set up the scene
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
  scene.add(light);

  // Create a simple floor
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa00 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Add a player
  const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.y = 0.5;
  scene.add(player);

  // Attach the camera to the player for first-person view
  player.add(camera);
  camera.position.set(0, 1.5, 0); // Position camera at player's head height

  // Enable pointer lock for mouse control
  document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.body) {
      document.addEventListener('mousemove', onMouseMove, false);
    } else {
      document.removeEventListener('mousemove', onMouseMove, false);
    }
  });

  // Add event listeners
  document.addEventListener('keydown', (e) => keys[e.key] = true);
  document.addEventListener('keyup', (e) => keys[e.key] = false);
  document.addEventListener('click', shoot);

  animate();
}

// Handle shooting
function shoot() {
  const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  
  bullet.position.copy(camera.position);
  bullet.velocity = new THREE.Vector3(
    Math.sin(rotation.y),
    0,
    Math.cos(rotation.y)
  ).multiplyScalar(0.2);
  bullets.push(bullet);
  scene.add(bullet);
}

// Handle mouse movement to control where the camera is looking
function onMouseMove(event) {
  const sensitivity = 0.002; // Adjust sensitivity as needed
  rotation.y -= event.movementX * sensitivity;
  rotation.x -= event.movementY * sensitivity;
  rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x)); // Limit vertical look angle

  camera.rotation.set(rotation.x, rotation.y, 0);
}

// Animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Update player position based on WASD keys and camera direction
  const forward = new THREE.Vector3(Math.sin(rotation.y), 0, Math.cos(rotation.y));
  const right = new THREE.Vector3(Math.sin(rotation.y + Math.PI / 2), 0, Math.cos(rotation.y + Math.PI / 2));

  if (keys['w']) player.position.add(forward.multiplyScalar(0.1));
  if (keys['s']) player.position.add(forward.multiplyScalar(-0.1));
  if (keys['a']) player.position.add(right.multiplyScalar(-0.1));
  if (keys['d']) player.position.add(right.multiplyScalar(0.1));

  // Update bullets
  bullets.forEach((bullet, index) => {
    bullet.position.add(bullet.velocity);
    if (bullet.position.length() > 100) {
      scene.remove(bullet);
      bullets.splice(index, 1);
    }
  });

  renderer.render(scene, camera);
}

// Resize the canvas on window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

init();
