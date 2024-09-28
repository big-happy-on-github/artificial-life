// Get references to game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currencyDisplay = document.getElementById('currency');
const waveDisplay = document.getElementById('wave');
const livesDisplay = document.getElementById('lives');
const towerSelection = document.getElementById('tower-selection');
const startWaveButton = document.getElementById('start-wave-button');

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
        if (this.level >= 3) {
            alert(`No upgrades available past level ${this.level}`);
            return;
        }
    
        const upgradePrice = 1 + this.level;
        let targetType;
        if (this.type == "1") {
            targetType = `rascal`;
        } else if (this.type == "2") {
            targetType = `liam`;
        }
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
    constructor(x, y, speed, health) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    update() {
        this.x += this.speed;

        if (this.x > canvas.width) {
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

// Handle tower selection
towerSelection.addEventListener('click', (event) => {
    if (event.target.classList.contains('tower')) {
        selectedTowerType = event.target.id === '1-tower' ? '1' : '2';
    }
});

// Place towers on canvas click
canvas.addEventListener('click', (event) => {
    if (selectedTowerType) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const tower = new Tower(x, y, selectedTowerType)

        if (currency >= tower.price) {
            towers.push(tower);
            currency -= tower.price;
            selectedTowerType = null;
            updateHUD();
        }
    }
});

let lastClickTime = 0;

// Custom double-click handler for upgrading towers
canvas.addEventListener('click', (event) => {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastClickTime;

    if (timeDifference < 300 && timeDifference > 0) { // Check for a double-click within 300 milliseconds
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        console.log(`Double-click detected at (${x}, ${y})`);

        let towerUpgraded = false;

        towers.forEach(tower => {
            const distance = Math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2);
            console.log(`Distance to tower at (${tower.x}, ${tower.y}): ${distance}`);
            
            if (distance < 50) { // Increased threshold
                tower.upgrade();
                towerUpgraded = true;
                console.log('Tower upgraded!');
            }
        });

        if (!towerUpgraded) {
            console.log('No tower found within range to upgrade.');
        }
    }

    // Update lastClickTime to the current click time
    lastClickTime = currentTime;
});

// Start wave button click event
startWaveButton.addEventListener('click', () => {
    if (!waveInProgress) {
        waveInProgress = true;
        spawnEnemies();
        startWaveButton.disabled = true; // Disable button during wave
    }
});

let hoverTarget;

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
        let hoverTargetType;
        if (hoverTarget.type == "1") {
            hoverTargetType = `$${hoverTarget.price} rascal`;
        } else if (hoverTarget.type == "2") {
            hoverTargetType = `$${hoverTarget.price} liam`;
        }
        tooltipText = `${hoverTargetType}\nlvl ${hoverTarget.level}\nRange: ${hoverTarget.range}\nDamage: ${hoverTarget.damage}\nFire Rate: ${hoverTarget.fireRate}`;
    } else if (hoverTarget instanceof Enemy) {
        tooltipText = `Enemy\nHealth: ${hoverTarget.health}\nSpeed: ${hoverTarget.speed}`;
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

// Game Loop
function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    towers.forEach(tower => tower.update(deltaTime));
    enemies.forEach(enemy => enemy.update());
    projectiles.forEach(projectile => projectile.update());

    drawTooltip(); // Draw tooltip for hover
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
            const enemy = new Enemy(0, Math.random() * canvas.height, 1 + wave * 0.25, 50 + wave * 5);
            enemies.push(enemy);
        }, i * 1000);
    }
    // Allow starting the next wave after a delay
    setTimeout(() => {
        waveInProgress = false;
        startWaveButton.disabled = false;
        currency += 3;
        nextWave(); // Move to the next wave after enemies are done spawning
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
        startWaveButton.disabled = false; // Re-enable the start button
        updateHUD();
    } else {
        currency = 10;
        wave = 1;
        lives = 9;
        towers.length = 0;
        enemies.length = 0;
        projectiles.length = 0;
        selectedTowerType = null;
        waveInProgress = false;
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
