// Get references to game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currencyDisplay = document.getElementById('currency');
const waveDisplay = document.getElementById('wave');
const livesDisplay = document.getElementById('lives');
const towerSelection = document.getElementById('tower-selection');
const startWaveButton = document.getElementById('start-wave-button');
const autoStartCheckbox = document.getElementById('auto-start');

// Game State
let currency = 10;
let wave = 1;
let lives = 9;
const towers = [];
const enemies = [];
const projectiles = [];
let selectedTowerType = null;
let waveInProgress = false; // Track if a wave is in progress

// Canvas settings
canvas.width = 800;
canvas.height = 600;

// Define path waypoints
const path = [
    { x: 0, y: 300 },
    { x: 200, y: 300 },
    { x: 200, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 400 },
    { x: 800, y: 400 }
];

// Game objects
class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        if (type == '1') {
            this.range = 150;
        } else if (type == '2') {
            this.range = 200;
        }
        if (type == '1') {
            this.fireRate = 1000;
        } else if (type == '2') {
            this.fireRate = 1500;
        }
        this.lastFired = 0;
        if (type == '1') {
            this.damage = 20;
        } else if (type == '2') {
            this.damage = 35;
        }
        if (type == '1') {
            this.price = 2;
        } else if (type == '2') {
            this.price = 3;
        }
    }

    draw() {
        if (this.type == '1') {
            ctx.fillStyle = 'grey';
        } else if (this.type == '2') {
            ctx.fillStyle = 'green';
        }
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    shoot(enemy) {
        const angle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
        projectiles.push(new Projectile(this.x, this.y, angle, this.damage));
    }

    upgrade() {
        if (this.level >= 10) {
            alert(`No upgrades available past level ${this.level}`);
            return;
        }
    
        const upgradePrice = this.price * this.level;
        let targetType = this.type === '1' ? 'rascal' : 'liam';
        if (confirm(`Are you sure you want to upgrade this level ${this.level} ${targetType} tower for $${upgradePrice}?`)) {
            if (currency >= upgradePrice) {
                this.level++;
                this.range += 50;
                this.fireRate -= 200; // Decrease fire rate for faster shooting
                this.damage += 10;
                currency -= upgradePrice;
                updateHUD();
            } else {
                alert("Not enough money to upgrade...");
            }
        }
    }

    update(deltaTime) {
        const nearestEnemy = enemies.find(enemy => this.isInRange(enemy));
        
        if (nearestEnemy && Date.now() - this.lastFired > this.fireRate) {
            this.shoot(nearestEnemy);
            this.lastFired = Date.now();
        }
        
        this.draw();
    }

    isInRange(enemy) {
        const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
        return distance <= this.range;
    }
}

class Enemy {
    constructor(speed, health) {
        this.x = path[0].x; // Start at the first waypoint
        this.y = path[0].y;
        this.speed = speed;
        this.health = health;
        this.currentPathIndex = 1; // Start moving to the second waypoint
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    update() {
        const target = path[this.currentPathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;

        if (distance < this.speed) {
            this.currentPathIndex++;
        }

        if (this.currentPathIndex >= path.length) {
            this.die(true);
        }

        this.draw();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die(false);
        }
    }

    die(crossed) {
        const index = enemies.indexOf(this);
        if (index > -1) {
            enemies.splice(index, 1);
            if (!crossed) {
                currency += 1;
            } else {
                lives--;
                if (lives <= 0) {
                    endGame();
                }
            }
            updateHUD();
        }
    }
}

class Projectile {
    constructor(x, y, angle, damage) {
        this.x = x;
        this.y = y;
        this.speed = 15;
        this.angle = angle;
        this.damage = damage;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.draw();

        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance < 20) {
                enemy.takeDamage(this.damage);
                this.destroy();
            }
        });
    }

    destroy() {
        const index = projectiles.indexOf(this);
        if (index > -1) {
            projectiles.splice(index, 1);
        }
    }
}

// Function to check if position is outside the path
function isOutsidePath(x, y) {
    const buffer = 30;

    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];

        const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const t = ((x - start.x) * (end.x - start.x) + (y - start.y) * (end.y - start.y)) / (length * length);
        const closestX = start.x + t * (end.x - start.x);
        const closestY = start.y + t * (end.y - start.y);

        const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

        if (distance < buffer) {
            return false;
        }
    }
    return true;
}

// Handle tower selection
towerSelection.addEventListener('click', (event) => {
    if (event.target.classList.contains('tower')) {
        selectedTowerType = event.target.id === '1-tower' ? '1' : '2';
    }
});

// Place towers on canvas click, only if outside the path
canvas.addEventListener('click', (event) => {
    if (selectedTowerType) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (isOutsidePath(x, y)) {
            const tower = new Tower(x, y, selectedTowerType);
            if (currency >= tower.price) {
                towers.push(tower);
                currency -= tower.price;
                selectedTowerType = null;
                updateHUD();
            }
        } else {
            alert('Cannot place tower on the path!');
        }
    }
});

// Draw the path
function drawPath() {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
}

// Game Loop
function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPath(); // Draw the path

    towers.forEach(tower => tower.update(deltaTime));
    enemies.forEach(enemy => enemy.update());
    projectiles.forEach(projectile => projectile.update());

    if (autoStartCheckbox.checked && !waveInProgress) {
        waveInProgress = true;
        spawnEnemies();
        startWaveButton.disabled = true;
    }
}

function updateHUD() {
    currencyDisplay.textContent = `$${currency}`;
    waveDisplay.textContent = `wave ${wave}`;
    livesDisplay.textContent = `${lives} lives`;
}

// Spawn enemies for the wave
function spawnEnemies() {
    const enemyCount = wave * 5;
    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => {
            const enemy = new Enemy(1 + wave * 0.25, 50 + wave * 5);
            enemies.push(enemy);
        }, i * 1000);
    }
    setTimeout(() => {
        waveInProgress = false;
        startWaveButton.disabled = false;
        currency += 3;
        nextWave();
    }, enemyCount * 1000);
}

// Move to the next wave
function nextWave() {
    wave++;
    updateHUD();
}

// Reset the game
function endGame() {
    alert(`game over! died on wave ${wave}`);
    if (confirm("play again?")) {
        currency = 10;
        wave = 1;
        lives = 9;
        towers.length = 0;
        enemies.length = 0;
        projectiles.length = 0;
        selectedTowerType = null;
        waveInProgress = false;
        startWaveButton.disabled = false;
        updateHUD();
    }
}

let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}

// Initialize the game
updateHUD();
gameLoop();
