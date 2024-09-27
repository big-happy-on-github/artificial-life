const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let towers = [];
let enemies = [];
let wave = 1;
let selectedTowerType = 'basic';
let gridSize = 50; // Size of each grid cell for tower placement

// Enemy path coordinates (preset path)
const enemyPath = [
    { x: 0, y: 250 },
    { x: 300, y: 250 },
    { x: 300, y: 450 },
    { x: 700, y: 450 },
    { x: 700, y: 100 }
];

// Tower templates for selection
const towerTypes = {
    basic: {
        range: 100,
        fireRate: 1000,
        damage: 20,
        color: 'blue'
    },
    fast: {
        range: 80,
        fireRate: 500,
        damage: 10,
        color: 'green'
    }
};

// Enemy template
const enemyTemplate = {
    x: 0,
    y: 250,
    speed: 1,
    health: 100,
    pathIndex: 0,
    draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    },
    update() {
        if (this.pathIndex < enemyPath.length) {
            let target = enemyPath[this.pathIndex];
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) {
                this.pathIndex++;
            } else {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        }
    }
};

// Game loop
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawTowers();
    drawEnemies();
    updateEnemies();
    towersShoot();

    requestAnimationFrame(gameLoop);
}

// Draw functions
function drawGrid() {
    ctx.strokeStyle = '#555';
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

function drawTowers() {
    towers.forEach(tower => {
        ctx.fillStyle = tower.color;
        ctx.fillRect(tower.x - 10, tower.y - 10, 20, 20);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => enemy.draw());
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.update();
        if (enemy.pathIndex >= enemyPath.length) {
            enemy.health = 0; // Remove enemy if it reaches the end of the path
        }
    });

    // Remove dead enemies
    enemies = enemies.filter(enemy => enemy.health > 0);

    // Spawn new wave if all enemies are defeated
    if (enemies.length === 0) {
        spawnWave();
    }
}

function spawnWave() {
    wave++;
    document.getElementById('wave').innerText = `Wave: ${wave}`;
    for (let i = 0; i < wave * 5; i++) {
        let newEnemy = { ...enemyTemplate };
        enemies.push(newEnemy);
    }
}

function towersShoot() {
    towers.forEach(tower => {
        let target = findNearestEnemy(tower);
        if (target) {
            if (Date.now() - tower.lastShotTime >= tower.fireRate) {
                target.health -= tower.damage;
                tower.lastShotTime = Date.now();

                // Draw projectile line
                ctx.strokeStyle = 'yellow';
                ctx.beginPath();
                ctx.moveTo(tower.x, tower.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            }
        }
    });
}

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

function selectTower(type) {
    selectedTowerType = type;
}

canvas.addEventListener('click', (event) => {
    const x = Math.floor(event.offsetX / gridSize) * gridSize + gridSize / 2;
    const y = Math.floor(event.offsetY / gridSize) * gridSize + gridSize / 2;

    let newTower = {
        ...towerTypes[selectedTowerType],
        x: x,
        y: y,
        lastShotTime: 0
    };

    towers.push(newTower);
});

// Start the first wave and game loop
spawnWave();
requestAnimationFrame(gameLoop);
