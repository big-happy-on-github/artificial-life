// Basic 3D FPS game setup with Three.js
let scene, camera, renderer, player, bullets = [];
let keys = {}; // Track key states

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

  // Set the initial camera position
  camera.position.set(0, 1.6, 5);
  camera.lookAt(player.position);

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
  
  bullet.position.copy(player.position);
  bullet.velocity = new THREE.Vector3(
    Math.sin(camera.rotation.y),
    0,
    Math.cos(camera.rotation.y)
  ).multiplyScalar(0.2);
  bullets.push(bullet);
  scene.add(bullet);
}

// Animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Update player position based on keys
  if (keys['w']) player.position.z -= 0.1;
  if (keys['s']) player.position.z += 0.1;
  if (keys['a']) player.position.x -= 0.1;
  if (keys['d']) player.position.x += 0.1;

  // Update camera position to follow player
  camera.position.set(player.position.x, player.position.y + 1.5, player.position.z + 5);
  camera.lookAt(player.position);

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
