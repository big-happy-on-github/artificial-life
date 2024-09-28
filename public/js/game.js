// Get references to game elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currencyDisplay = document.getElementById('currency');
const waveDisplay = document.getElementById('wave');
const livesDisplay = document.getElementById('lives');
const towerSelection = document.getElementById('tower-selection');
const startWaveButton = document.getElementById('start-wave-button');

// Game State
let currency = 100;
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

// Game objects (unchanged)

// Handle tower selection
towerSelection.addEventListener('click', (event) => {
    if (event.target.classList.contains('tower')) {
        selectedTowerType = event.target.id === 'basic-tower' ? 'basic' : 'advanced';
    }
});

// Place towers on canvas click
canvas.addEventListener('click', (event) => {
    if (selectedTowerType) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const towerCost = selectedTowerType === 'basic' ? 50 : 100;

        if (currency >= towerCost) {
            towers.push(new Tower(x, y, selectedTowerType));
            currency -= towerCost;
            updateHUD();
        }
    }
});

// Upgrade towers on double-click
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

// Start wave button click event
startWaveButton.addEventListener('click', () => {
    if (!waveInProgress) {
        waveInProgress = true;
        spawnEnemies();
        startWaveButton.disabled = true; // Disable button during wave
    }
});

// Game Loop (unchanged)

// Update the HUD (unchanged)

// Spawn enemies for the wave
function spawnEnemies() {
    const enemyCount = wave * 5;
    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => {
            const enemy = new Enemy(0, Math.random() * canvas.height, 1 + wave * 0.1, 100 + wave * 20);
            enemies.push(enemy);
        }, i * 1000);
    }
    // Allow starting the next wave after a delay
    setTimeout(() => {
        waveInProgress = false;
        startWaveButton.disabled = false;
    }, enemyCount * 1000); // Re-enable the button after the enemies are done spawning
}

// Move to the next wave
function nextWave() {
    wave++;
    updateHUD();
}

// Reset the game (unchanged)

// Initialize the game
gameLoop();
