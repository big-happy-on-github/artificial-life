// Get references to game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currencyDisplay = document.getElementById('currency');
const waveDisplay = document.getElementById('wave');
const livesDisplay = document.getElementById('lives');
const towerSelection = document.getElementById('tower-selection');
const startWaveButton = document.getElementById('start-wave-button');
const autoStartCheckbox = document.getElementById('auto-start');

// Get reference to the tower stats pop-up
const towerStatsPopup = document.getElementById('tower-stats-popup');
const towerTypeDisplay = document.getElementById('tower-type');
const towerLevelDisplay = document.getElementById('tower-level');
const towerHealthDisplay = document.getElementById('tower-health');
const towerRangeDisplay = document.getElementById('tower-range');
const towerDamageDisplay = document.getElementById('tower-damage');
const towerFireRateDisplay = document.getElementById('tower-fire-rate');
let showing = false;

// Function to show the tower stats pop-up
function showTowerStats(tower) {
    let towerType;
    if (tower.type == '1') {
        towerType = 'jack';
    } else if (tower.type == '2') {
        towerType = 'liam';
    } else if (tower.type == '3') {
        towerType = 'evan';
    }

    towerTypeDisplay.textContent = `${towerType} tower`;
    towerLevelDisplay.textContent = `Level: ${tower.level}`;
    towerHealthDisplay.textContent = `Health: ${tower.health}`;
    towerRangeDisplay.textContent = `Range: ${tower.range}`;
    towerDamageDisplay.textContent = `Damage: ${tower.damage}`;
    towerFireRateDisplay.textContent = `Fire Rate: ${tower.fireRate}s`;

    // Show the pop-up
    towerStatsPopup.style.display = 'block';
    showing = true;
}

// Function to hide the tower stats pop-up
function hideTowerStats() {
    towerStatsPopup.style.display = 'none';
    showing = false;
}

// Handle single and double clicks for upgrading towers
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Loop through towers to find one within range of the click
    let towerFound = false;

    towers.forEach(tower => {
        const distance = Math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2);
        if (distance < 30) { // Assuming 30 is the size of the tower
            if (showing) {
                hideTowerStats(); // Hide the stats if already showing
            } else {
                showTowerStats(tower); // Show stats on click
            }
            towerFound = true;
        }
    });

    // Hide the pop-up if no tower is clicked
    if (!towerFound) {
        hideTowerStats();
    }
});

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
        this.health = 10;
        this.target = null;

        if (type == '1') {
            this.range = 15;
            this.fireRate = 1;
            this.damage = 2;
            this.price = 2;
        } else if (type == '2') {
            this.range = 10;
            this.fireRate = 1.5;
            this.damage = 3.5;
            this.price = 3;
        } else if (type == '3') {
            this.range = 100;
            this.fireRate = 0.8;
            this.damage = 4.5;
            this.price = 3;
        }

        this.lastFired = 0;
    }

    draw() {
        if (this.type == '1') {
            ctx.fillStyle = 'grey';
        } else if (this.type == '2') {
            ctx.fillStyle = 'green';
        } else if (this.type == '3') {
            ctx.fillStyle = 'purple';
        }
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    shoot() {
        if (!this.target || this.target.health <= 0) return; // No target to shoot at
    
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        projectiles.push(new Projectile(this.x, this.y, angle, this.damage));
        console.log("Fired at target:", this.target); // Debug log
    }

    update(deltaTime) {
        if (this.health <= 0) return; // Skip update if the tower is destroyed

        if (this.target && Date.now() - this.lastFired > this.fireRate * 1000) {
            this.shoot();
            this.lastFired = Date.now();
        }

        if (!this.target || this.target.health <= 0) {
            const enemiesInRange = enemies.filter(enemy => this.isInRange(enemy));
            if (enemiesInRange.length > 0) {
                this.target = enemiesInRange.reduce((farthestEnemy, currentEnemy) => {
                    return currentEnemy.getPathProgress() > farthestEnemy.getPathProgress()
                        ? currentEnemy
                        : farthestEnemy;
                });
                console.log("New target acquired:", this.target); // Debug log
            }
        }


        // Attack the target if it's time to fire
        if (this.target && Date.now() - this.lastFired > this.fireRate * 1000) {
            this.shoot();
            this.lastFired = Date.now();
        }

        this.draw();
    }

    isInRange(enemy) {
        const buffer = 5; // Small buffer to account for floating-point inaccuracies
        const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
        return distance <= this.range * 10 + buffer;
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

    upgrade() {
        /*if (this.level >= 10) {
            alert(`no upgrades available past lvl ${this.level}`);
            return;
        }
    
        const upgradePrice = this.price * this.level;
        let targetType;
            if (this.type == '1') {
                targetType = 'jack';
            } else if (this.type == '2') {
                targetType = 'liam';
            } else if (this.type == '3') {
                targetType = 'evan';
            }
        if (confirm(`you sure you want to upgrade this level ${this.level} ${targetType} tower for $${upgradePrice}?`)) {
            if (currency >= upgradePrice) {
                this.level++;
                this.range += 50;
                this.damage += 10;
                currency -= upgradePrice;
                updateHUD();
            } else {
                alert("not enough money to upgrade...");
            }
        }*/
    }
}

class Enemy {
    constructor(type) {
        this.x = path[0].x; // Start at the first waypoint
        this.y = path[0].y;
        this.type = type;
        this.speed = type.speed;
        this.health = type.health;
        this.color = type.color;
        this.canShoot = type.canShoot;
        this.fireRate = type.fireRate;
        this.damage = type.damage;
        this.range = type.range;
        this.level = type.level;
        this.currentPathIndex = 1; // Start moving to the second waypoint
        this.lastFired = 0;
        this.nextType = type.nextType;
    }

    // New method to calculate the progress of the enemy along the path
    getPathProgress() {
        let totalDistance = 0;
        let progressDistance = 0;

        // Calculate total path length
        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }

        // Calculate the progress distance
        for (let i = 0; i < this.currentPathIndex - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            progressDistance += Math.sqrt(dx * dx + dy * dy);
        }

        // Add the partial progress in the current segment
        if (this.currentPathIndex < path.length) {
            const target = path[this.currentPathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            progressDistance += Math.sqrt(dx * dx + dy * dy);
        }

        // Return progress as a percentage of the total path length
        return progressDistance / totalDistance;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die(false);
        }
    }


    shoot(tower) {
        if (this.canShoot && Date.now() - this.lastFired > this.fireRate * 1000) {
            const angle = Math.atan2(tower.y - this.y, tower.x - this.x);
            enemyProjectiles.push(new Projectile(this.x, this.y, angle, this.damage, 'enemy')); // Create enemy projectile
            this.lastFired = Date.now();
        }
    }

    update() {
        if (this.currentPathIndex < path.length) {
            const target = path[this.currentPathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            // Move in the direction of the target
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
    
            // Check if the enemy will overshoot the target
            if (distance < this.speed) {
                // Move directly to the target waypoint
                this.x = target.x;
                this.y = target.y;
                this.currentPathIndex++; // Move to the next waypoint
            } else {
                // Normal movement towards the target
                this.x += moveX;
                this.y += moveY;
            }
        }
    
        // Check if the enemy reached the end of the path
        if (this.currentPathIndex >= path.length) {
            this.die(true); // Enemy crossed the path
        }

        // Check for specials
        if (this.type.special) {
            if (this.color == '#33fff9') {
                const nearestEnemy = enemies.find(enemy => this.isInRange(enemy));
                if (nearestEnemy && Date.now() - this.lastFired > this.fireRate * 1000) {
                    nearestEnemy.health += 1;
                    this.lastFired = Date.now();
                    console.log(`'#33fff9' healed ${nearestEnemy} to ${nearestEnemy.health}`);
                }
            }
        }
    
        // Check for nearby towers and shoot
        const nearestTower = towers.find(tower => this.isInRange(tower));
        if (nearestTower) {
            this.shoot(nearestTower);
        }
    
        this.draw();
    }

    isInRange(tower) {
        const buffer = 5; // Small buffer to account for floating-point inaccuracies
        const distance = Math.sqrt((tower.x - this.x) ** 2 + (tower.y - this.y) ** 2);
        return distance <= this.range * 10 + buffer;
    }

    die(crossed) {
        const index = enemies.indexOf(this);
        this.health = 0;
        if (index > -1) {
            enemies.splice(index, 1);
            if (crossed) {
                lives--;
                if (lives <= 0) {
                    endGame();
                }
            } else {
                // Transform into the next enemy type if available
                if (this.nextType) {
                    const nextEnemyType = enemyTypes.find(type => type.color === this.nextType);
                    if (nextEnemyType) {
                        const newEnemy = new Enemy(nextEnemyType);
                        newEnemy.x = this.x; // Set the new enemy's position to the current enemy's position
                        newEnemy.y = this.y;
    
                        // Calculate the nearest path index for the new enemy, ensuring it's ahead on the path
                        let closestDistance = Infinity;
                        for (let i = this.currentPathIndex; i < path.length; i++) { // Start from the current path index
                            const distance = Math.sqrt((path[i].x - this.x) ** 2 + (path[i].y - this.y) ** 2);
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                newEnemy.currentPathIndex = i;
                            }
                        }
                        
                        enemies.push(newEnemy);
                    }
                }
            }
            updateHUD();
        }
    }
}

// Define different enemy types with a transformation sequence
const enemyTypes = [
    { speed: 1, health: 12.5, color: 'red', canShoot: false, range: null, fireRate: null, damage: null, level: 1, nextType: null }, // Basic enemy
    { speed: 4, health: 10.5, color: 'orange', canShoot: false, range: null, fireRate: null, damage: null, level: 2, nextType: null }, // Fast enemy
    { speed: 0.7, health: 28, color: 'yellow', canShoot: false, range: null, fireRate: null, damage: null, level: 3, nextType: 'orange' }, // Tank enemy, no further transformation
    { speed: 1, health: 13, color: 'green', canShoot: true, range: 10, fireRate: 2, damage: 2.5, level: 4, nextType: null }, // Shooting enemy, no further transformation
    { speed: 2, health: 15, color: 'blue', canShoot: true, range: 10, fireRate: 1.5, damage: 2, level: 5, nextType: null }, // Fast shooting enemy, no further transformation
    { speed: 0.3, health: 72, color: 'purple', canShoot: false, range: null, fireRate: null, damage: null, level: 7, nextType: 'yellow' },
    { speed: 1, health: 15, color: '#33fff9', canShoot: false, range: 10, fireRate: 1, damage: null, level: 13, nextType: null, special: 'Heals nearby enemies' },
    { speed: 0.3, health: 300, color: 'pink', canShoot: true, range: 100, fireRate: 0.5, damage: 2.5, level: 17, nextType: 'purple' },
];

const bossEnemyTypes = [
    { speed: 0.3, health: 300, color: 'pink', canShoot: true, range: 1000, fireRate: 3, damage: 2.5, level: 10, nextType: 'purple' },
];

function spawnEnemies() {
    const enemyCount = 5 + wave;
    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => {
            const updatedEnemyTypes = enemyTypes.filter(enemy => enemy.level <= wave);
            const randomType = updatedEnemyTypes[Math.floor(Math.random() * updatedEnemyTypes.length)];
            const enemy = new Enemy(randomType);
            enemies.push(enemy);
        }, i * 1000);
    }
    
    // Spawn boss if wave matches boss level
    bossEnemyTypes.forEach(boss => {
        if (wave === boss.level) {
            const bossEnemy = new Enemy(boss);
            enemies.push(bossEnemy);
        }
    });
    
    setTimeout(() => {
        waveInProgress = false;
        startWaveButton.disabled = false;
        currency += 1 + Math.round(wave / 2);
        nextWave();
    }, enemyCount * 1000);
}

class Projectile {
    constructor(x, y, angle, damage, type = 'tower', specificType = null) {
        this.x = x;
        this.y = y;
        this.speed = 15;
        this.angle = angle;
        this.damage = damage;
        this.type = type; // Type to distinguish between tower and enemy projectiles
        this.specificType = specificType;
    }

    draw() {
        ctx.fillStyle = this.type == 'tower' ? 'yellow' : 'blue'; // Different color for enemy projectiles
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.draw();
    
        const buffer = 5; // Add a buffer for collision detection
    
        if (this.type == 'tower') {
            enemies.forEach(enemy => {
                const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                if (distance < 20 + buffer) {
                    enemy.takeDamage(this.damage);
                    this.destroy();
                }
            });
        } else if (this.type == 'enemy') {
            towers.forEach(tower => {
                const distance = Math.sqrt((tower.x - this.x) ** 2 + (tower.y - this.y) ** 2);
                if (distance < 20 + buffer) {
                    tower.takeDamage(this.damage);
                    this.destroy();
                }
            });
        }
    }

    destroy() {
        const array = this.type == 'tower' ? projectiles : enemyProjectiles;
        const index = array.indexOf(this);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
}

// Grid settings
const gridSize = 50; // Size of each grid square
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Tracks which squares are occupied by the path
const occupiedSquares = new Set();

// Draw the grid and the path
function drawGrid() {
    ctx.strokeStyle = '	#3b3b3b'; // Light gray for grid lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

function drawPath() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
        // Mark squares occupied by the path as unavailable for tower placement
        markPathSquares(path[i - 1], path[i]);
    }

    ctx.stroke();
}

// Mark grid squares occupied by the path using Bresenham's line algorithm
function markPathSquares(start, end) {
    /*let x0 = Math.floor(start.x / gridSize);
    let y0 = Math.floor(start.y / gridSize);
    const x1 = Math.floor(end.x / gridSize);
    const y1 = Math.floor(end.y / gridSize);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        occupiedSquares.add(`${x0},${y0}`);

        // If we've reached the end point, break out of the loop
        if (x0 === x1 && y0 === y1) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }*/
}

// Check if a square is available for tower placement
function isSquareAvailable(x, y) {
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    return !occupiedSquares.has(`${gridX},${gridY}`);
}

// Handle tower placement
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Align placement to the center of the grid square
    const gridX = Math.floor(x / gridSize) * gridSize + gridSize / 2;
    const gridY = Math.floor(y / gridSize) * gridSize + gridSize / 2;

    if (selectedTowerType && isSquareAvailable(gridX, gridY)) {
        const tower = new Tower(gridX, gridY, selectedTowerType);
        if (currency >= tower.price) {
            towers.push(tower);
            currency -= tower.price;
            selectedTowerType = null;
            updateHUD();
        } else {
            console.log('Not enough currency to place the tower.');
        }
    } else {
        console.log('Cannot place tower here.');
    }
});

// Update the game loop to include drawing the grid
function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(); // Draw the grid
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
    const buffer = 10; // Small buffer to check for proximity to the path

    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];

        const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const t = ((x - start.x) * (end.x - start.x) + (y - start.y) * (end.y - start.y)) / (length * length);
        
        // Clamp 't' to the segment bounds to find the closest point on the segment
        const clampedT = Math.max(0, Math.min(1, t));
        const closestX = start.x + clampedT * (end.x - start.x);
        const closestY = start.y + clampedT * (end.y - start.y);

        const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

        // Return false if the point is too close to the path
        if (distance < buffer) {
            return false;
        }
    }
    return true; // The point is far enough from all path segments
}

// Handle tower selection
towerSelection.addEventListener('click', (event) => {
    if (event.target.classList.contains('tower')) {
        if (event.target.id == '1-tower') {
            selectedTowerType = '1';
        } else if (event.target.id == '2-tower') {
            selectedTowerType = '2';
        } else if (event.target.id == '3-tower') {
            selectedTowerType = '3';
        }
    }
});

let lastClickTime = 0; // To store the timestamp of the last click

// Handle single and double clicks for upgrading towers
canvas.addEventListener('click', (event) => {
    /*const currentTime = new Date().getTime();
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
    lastClickTime = currentTime;*/
});

// Handle start wave button click
startWaveButton.addEventListener('click', () => {
    if (!waveInProgress) {
        waveInProgress = true;
        spawnEnemies();
        startWaveButton.disabled = true; // Disable button during wave
    }
});

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
    /*if (!hoverTarget) return;

    const tooltipX = hoverTarget.x + 20; // Position tooltip near the hovered object
    const tooltipY = hoverTarget.y - 20;

    // Determine if hoverTarget is a tower or an enemy
    let tooltipText;
    if (hoverTarget instanceof Tower) {
        let towerType;
        if (hoverTarget.type == '1') {
            towerType = 'jack';
        } else if (hoverTarget.type == '2') {
            towerType = 'liam';
        } else if (hoverTarget.type == '3') {
            towerType = 'evan';
        }
        tooltipText = `${towerType} tower\nlvl ${hoverTarget.level}\nHealth: ${hoverTarget.health}\nRange: ${hoverTarget.range}\nDamage: ${hoverTarget.damage}\nFire Rate: ${hoverTarget.fireRate}s`;
    } else if (hoverTarget instanceof Enemy) {
        if (hoverTarget.special) {
            tooltipText = `${hoverTarget.color} enemy\nlvl ${hoverTarget.level}\nSPECIAL: ${hoverTarget.special}\nCan shoot: ${hoverTarget.canShoot}\nHealth: ${hoverTarget.health}\nSpeed: ${hoverTarget.speed}\nRange: ${hoverTarget.range}\nDamage: ${hoverTarget.damage}\nFire Rate: ${hoverTarget.fireRate}s`;
        } else {
            tooltipText = `${hoverTarget.color} enemy\nlvl ${hoverTarget.level}\nCan shoot: ${hoverTarget.canShoot}\nHealth: ${hoverTarget.health}\nSpeed: ${hoverTarget.speed}\nRange: ${hoverTarget.range}\nDamage: ${hoverTarget.damage}\nFire Rate: ${hoverTarget.fireRate}s`;
        }
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
    });*/
}



function updateHUD() {
    currencyDisplay.textContent = `$${currency}`;
    waveDisplay.textContent = `wave ${wave} (pr: ${JSON.parse(localStorage.getItem("topScore"))})`;
    livesDisplay.textContent = `${lives} lives`;
}

function nextWave() {
    wave++;
    
    if (wave > JSON.parse(localStorage.getItem("topScore"))) {
        localStorage.setItem("topScore", JSON.stringify(wave));
    }

    // Check for boss in the next wave
    bossEnemyTypes.forEach(boss => {
        if (wave === boss.level) {
            alert(`new color boss on wave ${wave}!`);
        }
    });

    enemyTypes.forEach(enemy => {
        if (enemy.special && enemy.level == wave) {
            alert(`new color special enemy on wave ${wave}!`);
        }
    });

    updateHUD();
}

//cheats
function skipToWave(newWave) {
    wave += (newWave - 1);
    nextWave();
    updateHUD();
}

function giveMoney(money) {
    currency += money;
    updateHUD();
}

function help() {
    console.log("skipToWave, giveMoney");
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
    autoStartCheckbox.checked = false;
    updateHUD();
    window.location.reload();
}

let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}

if (!localStorage.getItem("topScore")) {
    localStorage.setItem("topScore", JSON.stringify(1));
}

// Initialize the game
updateHUD();
gameLoop();
