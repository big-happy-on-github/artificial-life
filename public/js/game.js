// Get references to game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currencyDisplay = document.getElementById('currency');
const waveDisplay = document.getElementById('wave');
const towerSelection = document.getElementById('tower-selection');

// Game State
let currency = 100;
let wave = 1;
let lives = 9;
const towers = [];
const enemies = [];
const projectiles = [];

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
        this.range = type === 'basic' ? 150 : 200;
        this.fireRate = type === 'basic' ? 1000 : 1500;
        this.lastFired = 0;
        this.damage = type === 'basic' ? 20 : 35;
    }

    draw() {
        ctx.fillStyle = this.type === 'basic' ? 'blue' : 'green';
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    shoot(enemy) {
        const angle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
        projectiles.push(new Projectile(this.x, this.y, angle, this.damage));
    }

    upgrade() {
        if (currency >= 50) {
            this.level++;
            this.range += 50;
            this.fireRate -= 200;
            this.damage += 10;
            currency -= 50;
            updateHUD();
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

        // Check if the enemy reached the end
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
                currency += 10; // Reward for defeating the enemy
            } else {
                lives--; // Lose a life if the enemy crosses the canvas
                if (lives <= 0) {
                    alert('Game Over! You lost all your lives.');
                    resetGame();
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
        this.speed = 5;
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

// Tower Placement
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currency >= 50) {
        towers.push(new Tower(x, y, 'basic'));
        currency -= 50;
        updateHUD();
    }
});

// Tower Selection
towerSelection.addEventListener('click', (event) => {
    if (event.target.id === 'basic-tower') {
        // Logic to place a basic tower
    } else if (event.target.id === 'advanced-tower') {
        if (currency >= 100) {
            towers.push(new Tower(100, 100, 'advanced'));
            currency -= 100;
            updateHUD();
        }
    }
});

// Upgrade towers on click
canvas.addEventListener('dblclick', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    towers.forEach(tower => {
        const distance = Math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2);
        if (distance < 30) {
            tower.upgrade();
        }
    });
});

// Game Loop
function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update towers
    towers.forEach(tower => tower.update(deltaTime));

    // Update enemies
    enemies.forEach(enemy => enemy.update());

    // Update projectiles
    projectiles.forEach(projectile => projectile.update());
}

function updateHUD() {
    currencyDisplay.textContent = `$${currency}`;
    waveDisplay.textContent = `lvl ${wave}`;
    document.getElementById('lives').textContent = `Lives: ${lives}`;
}

// Spawn enemies for the wave
function spawnEnemies() {
    const enemyCount = wave * 5;
    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => {
            const enemy = new Enemy(0, Math.random() * canvas.height, 1 + wave * 0.1, 100 + wave * 20);
            enemies.push(enemy);
        }, i * 1000);
    }
}

// Move to the next wave
function nextWave() {
    wave++;
    spawnEnemies();
}

// Start the game loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}

// Reset the game
function resetGame() {
    currency = 100;
    wave = 1;
    lives = 9;
    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    updateHUD();
}

// Initialize the game
gameLoop();
spawnEnemies();
setInterval(nextWave, 30000); // Advance to the next wave every 30 seconds
