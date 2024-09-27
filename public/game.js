// Get references to game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currencyDisplay = document.getElementById('currency');
const waveDisplay = document.getElementById('wave');
const towerSelection = document.getElementById('tower-selection');

// Game State
let currency = 100;
let wave = 1;
const towers = [];
const enemies = [];

// Canvas settings
canvas.width = 800;
canvas.height = 600;

// Game objects
class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 100;
        this.fireRate = 1000;
        this.lastFired = 0;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    shoot() {
        // Shooting logic will be added here
    }

    update(deltaTime) {
        if (Date.now() - this.lastFired > this.fireRate) {
            this.shoot();
            this.lastFired = Date.now();
        }
        this.draw();
    }
}

class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = 100;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    update() {
        this.x += this.speed;
        this.draw();
    }
}

// Tower Placement
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currency >= 50) {
        towers.push(new Tower(x, y));
        currency -= 50;
        updateHUD();
    }
});

// Tower Selection
towerSelection.addEventListener('click', (event) => {
    // Logic for selecting different towers can go here
});

// Game Loop
function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update towers
    towers.forEach(tower => tower.update(deltaTime));

    // Update enemies
    enemies.forEach(enemy => enemy.update());
}

function updateHUD() {
    currencyDisplay.textContent = `$${currency}`;
    waveDisplay.textContent = `lvl ${wave}`;
}

// Start the game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}

gameLoop();
