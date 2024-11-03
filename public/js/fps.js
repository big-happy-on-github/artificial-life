// Basic 3D FPS game setup with Three.js
let scene, camera, renderer, player, bullets = [], objects = [];
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

  // Add some objects for reference in the scene and enable collision detection
  createMapObjects();

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

// Create some map objects for visual reference and store them for collision detection
function createMapObjects() {
  // Add walls
  for (let i = -20; i <= 20; i += 10) {
    const wallGeometry = new THREE.BoxGeometry(1, 3, 10);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(i, 1.5, -30);
    scene.add(wall);
    objects.push(wall); // Add to objects array for collision detection
  }

  // Add boxes
  for (let i = 0; i < 5; i++) {
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x8844aa });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(Math.random() * 40 - 20, 1, Math.random() * 40 - 20);
    scene.add(box);
    objects.push(box); // Add to objects array for collision detection
  }
}

// Handle shooting
function shoot() {
  const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  bullet.position.copy(player.position); // Start bullet from player's position
  const direction = new THREE.Vector3(
    Math.sin(rotation.y) * Math.cos(rotation.x),
    Math.sin(rotation.x),
    Math.cos(rotation.y) * Math.cos(rotation.x)
  );
  bullet.velocity = direction.multiplyScalar(0.5); // Faster bullet speed for visibility
  bullets.push(bullet);
  scene.add(bullet);
}

// Handle mouse movement to control where the camera and player are looking
function onMouseMove(event) {
  const sensitivity = 0.001; // Adjust sensitivity as needed
  rotation.y -= event.movementX * sensitivity;
  rotation.x -= event.movementY * sensitivity;
  rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x)); // Limit vertical look angle

  // Set the player's rotation
  player.rotation.set(rotation.x, rotation.y, 0);
}

// Basic collision detection function
function checkCollision(newPosition) {
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const distance = newPosition.distanceTo(object.position);
    if (distance < 1.5) { // Adjust this radius for sensitivity
      return true;
    }
  }
  return false;
}

// Animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Calculate movement direction vectors
  const forward = new THREE.Vector3(
    Math.sin(rotation.y) * Math.cos(rotation.x),
    0,
    Math.cos(rotation.y) * Math.cos(rotation.x)
  );
  const right = new THREE.Vector3(
    Math.sin(rotation.y + Math.PI / 2),
    0,
    Math.cos(rotation.y + Math.PI / 2)
  );

  // Update player position based on WASD keys and camera direction
  let newPosition = player.position.clone();

  if (keys['w']) newPosition.add(forward.clone().multiplyScalar(-0.1));
  if (keys['s']) newPosition.add(forward.clone().multiplyScalar(0.1));
  if (keys['a']) newPosition.add(right.clone().multiplyScalar(0.1));
  if (keys['d']) newPosition.add(right.clone().multiplyScalar(-0.1));

  // Only update player position if no collision
  if (!checkCollision(newPosition)) {
    player.position.copy(newPosition);
  }

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
