const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let towers = [];
let enemies = [];
let level = 1;

const towerTemplate = {
    x: 0,
    y: 0,
    range: 100,
    fireRate: 1000, // Fire rate in milliseconds
    lastShotTime: 0,
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    },
    shoot() {
        // Find the nearest enemy within range
        let target = findNearestEnemy(this);
        if (target) {
            // Shoot only if enough time has passed since the last shot
            if (Date.now() - this.lastShotTime >= this.fireRate) {
                target.health -= 20; // Damage the enemy
                this.lastShotTime = Date.now(); // Update the last shot time
                
                // Draw the projectile line (visual representation)
                ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            }
        }
    }
};

const enemyTemplate = {
    x: 0,
    y: 300,
    speed: 1,
    health: 100,
    draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    },
    update() {
        this.x += this.speed;
    }
};

// Game loop
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTowers();
    drawEnemies();
    updateEnemies();
    towersShoot();

    // Auto-generate new enemies based on level
    if (enemies.length < level * 5) {
        createEnemy();
    }

    requestAnimationFrame(gameLoop);
}

// Draw functions
function drawTowers() {
    towers.forEach(tower => tower.draw());
}

function drawEnemies() {
    enemies.forEach(enemy => enemy.draw());
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.update();
        if (enemy.x > canvas.width) {
            enemy.health = 0; // Remove enemy if it passes the screen
        }
    });

    // Remove dead enemies
    enemies = enemies.filter(enemy => enemy.health > 0);
}

// Towers shoot at enemies
function towersShoot() {
    towers.forEach(tower => tower.shoot());
}

// Find the nearest enemy within the tower's range
function findNearestEnemy(tower) {
    let closestEnemy = null;
    let closestDistance = tower.range;

    enemies.forEach(enemy => {
        const distance = Math.sqrt(Math.pow(tower.x - enemy.x, 2) + Math.pow(tower.y - enemy.y, 2));
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    });

    return closestEnemy;
}

// Create new enemies
function createEnemy() {
    let newEnemy = { ...enemyTemplate, x: 0, y: 300, speed: 1 + level * 0.1 };
    enemies.push(newEnemy);
}

// Add a new tower
function addTower() {
    let newTower = { ...towerTemplate, x: Math.random() * canvas.width, y: Math.random() * canvas.height };
    towers.push(newTower);
}

// AI Level generator (simple)
function generateNextLevel() {
    level++;
    // Modify enemy properties based on level for increased difficulty
    enemies.forEach(enemy => {
        enemy.speed += 0.2;
        enemy.health += 20;
    });
}

// Start the game loop
requestAnimationFrame(gameLoop);
