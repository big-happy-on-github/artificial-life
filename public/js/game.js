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
const enemyProjectiles = []; // Array to hold projectiles fired by enemies
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

class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        this.health = 100; // Add health property for the tower
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

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        const index = towers.indexOf(this);
        if (index > -1) {
            towers.splice(index, 1);
        }
    }

    update(deltaTime) {
        if (this.health <= 0) return; // Skip update if the tower is destroyed
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
    constructor(speed, health, fireRate, damage) {
        this.x = path[0].x; // Start at the first waypoint
        this.y = path[0].y;
        this.speed = speed;
        this.health = health;
        this.currentPathIndex = 1; // Start moving to the second waypoint
        this.range = 100;
        this.fireRate = fireRate; // Time between shots (2 seconds)
        this.lastFired = 0;
        this.damage = damage; // Damage dealt to towers
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    shoot(tower) {
        const angle = Math.atan2(tower.y - this.y, tower.x - this.x);
        enemyProjectiles.push(new Projectile(this.x, this.y, angle, this.damage, 'enemy')); // Create enemy projectile
    }

    update() {
        // Check if there are more waypoints to follow
        if (this.currentPathIndex < path.length) {
            const target = path[this.currentPathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Move in the direction of the target
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;

            this.x += moveX;
            this.y += moveY;

            // Check if the enemy has reached the current target waypoint
            if (distance < this.speed) {
                this.currentPathIndex++;
            }
        }

        // Check if the enemy reached the end of the path
        if (this.currentPathIndex >= path.length) {
            this.die(true); // Enemy crossed the path
        }

        // Check for nearby towers and shoot
        const nearestTower = towers.find(tower => this.isInRange(tower));
        if (nearestTower && Date.now() - this.lastFired > this.fireRate) {
            this.shoot(nearestTower);
            this.lastFired = Date.now();
        }

        this.draw();
    }

    isInRange(tower) {
        const distance = Math.sqrt((tower.x - this.x) ** 2 + (tower.y - this.y) ** 2);
        return distance <= 100; // Adjust range as necessary
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
    constructor(x, y, angle, damage, type = 'tower') {
        this.x = x;
        this.y = y;
        this.speed = 15;
        this.angle = angle;
        this.damage = damage;
        this.type = type; // Type to distinguish between tower and enemy projectiles
    }

    draw() {
        ctx.fillStyle = this.type === 'tower' ? 'yellow' : 'blue'; // Different color for enemy projectiles
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.draw();

        if (this.type === 'tower') {
            // Check collision with enemies
            enemies.forEach(enemy => {
                const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                if (distance < 20) {
                    enemy.takeDamage(this.damage);
                    this.destroy();
                }
            });
        } else if (this.type === 'enemy') {
            // Check collision with towers
            towers.forEach(tower => {
                const distance = Math.sqrt((tower.x - this.x) ** 2 + (tower.y - this.y) ** 2);
                if (distance < 20) {
                    tower.takeDamage(this.damage);
                    this.destroy();
                }
            });
        }
    }

    destroy() {
        const array = this.type === 'tower' ? projectiles : enemyProjectiles;
        const index = array.indexOf(this);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
}

function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPath(); // Draw the path

    towers.forEach((tower, index) => {
        if (tower.health > 0) {
            tower.update(deltaTime);
        } else {
            towers.splice(index, 1);
        }
    });

    enemies.forEach(enemy => enemy.update());
    projectiles.forEach(projectile => projectile.update());
    enemyProjectiles.forEach(projectile => projectile.update()); // Update enemy projectiles

    drawTooltip(); // Draw tooltip if hovering over an object

    if (autoStartCheckbox.checked && !waveInProgress) {
        waveInProgress = true;
        spawnEnemies();
        startWaveButton.disabled = true;
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
            //alert('Cannot place tower on the path!');
            console.log("tower cannot be placed on path");
        }
    }
});

let lastClickTime = 0; // To store the timestamp of the last click

// Handle single and double clicks for upgrading towers
canvas.addEventListener('click', (event) => {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastClickTime;

    // Check if the second click happened within 500 milliseconds
    if (timeDifference < 500) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Loop through towers to find one within range of the click
        let towerUpgraded = false;

        towers.forEach(tower => {
            const distance = Math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2);
            if (distance < 30) { // Assuming 30 is the size of the tower
                tower.upgrade();
                towerUpgraded = true;
            }
        });

        if (!towerUpgraded) {
            console.log('No tower found within range to upgrade.');
        }
    }

    // Update the last click time
    lastClickTime = currentTime;
});

// Handle start wave button click
startWaveButton.addEventListener('click', () => {
    if (!waveInProgress) {
        waveInProgress = true;
        spawnEnemies();
        startWaveButton.disabled = true; // Disable button during wave
    }
});

// Draw the path
function drawPath() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
}

let hoverTarget = null; // To store the hovered object

// Handle mouse movement for hover detection
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Reset hover target
    hoverTarget = null;

    // Check for hovering over towers
    towers.forEach(tower => {
        const distance = Math.sqrt((tower.x - mouseX) ** 2 + (tower.y - mouseY) ** 2);
        if (distance < 30) { // Assuming 30 is the size of the tower
            hoverTarget = tower;
        }
    });

    // Check for hovering over enemies
    enemies.forEach(enemy => {
        const distance = Math.sqrt((enemy.x - mouseX) ** 2 + (enemy.y - mouseY) ** 2);
        if (distance < 15) { // Assuming 15 is half the size of the enemy
            hoverTarget = enemy;
        }
    });
});

// Function to draw the tooltip
function drawTooltip() {
    if (!hoverTarget) return;

    const tooltipX = hoverTarget.x + 20; // Position tooltip near the hovered object
    const tooltipY = hoverTarget.y - 20;

    // Determine if hoverTarget is a tower or an enemy
    let tooltipText;
    if (hoverTarget instanceof Tower) {
        let towerType = hoverTarget.type === '1' ? 'rascal' : 'liam';
        tooltipText = `${towerType} tower\nlvl ${hoverTarget.level}\nHealth: ${hoverTarget.health}\nRange: ${hoverTarget.range}\nDamage: ${hoverTarget.damage}\nFire Rate: ${hoverTarget.fireRate}`;
    } else if (hoverTarget instanceof Enemy) {
        tooltipText = `Enemy\nlvl ${wave}\nHealth: ${hoverTarget.health}\nSpeed: ${hoverTarget.speed}\nRange: ${hoverTarget.range}\nDamage: ${hoverTarget.damage}\nFire Rate: ${hoverTarget.speed}`;
    }

    // Draw tooltip background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
    ctx.fillRect(tooltipX, tooltipY, 120, 60); // Adjust size based on text length

    // Draw tooltip text
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    const lines = tooltipText.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, tooltipX + 5, tooltipY + 15 + index * 15);
    });
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
            const enemy = new Enemy(1 + wave * 0.25, 50 + wave * 10, 1000 + wave * 200, 20 + wave * 4);
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
    alert("play again?");
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
