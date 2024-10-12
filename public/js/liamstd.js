const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const currencyDisplay = document.getElementById('currency') || { textContent: '' };
const waveDisplay = document.getElementById('wave') || { textContent: '' };
const livesDisplay = document.getElementById('lives') || { textContent: '' };
const towerSelection = document.getElementById('tower-selection') || null;
const startWaveButton = document.getElementById('start-wave-button') || null;
const autoStartCheckbox = document.getElementById('auto-start') || null;
const leaderboard = document.getElementById("leaderboard");
const freeplayMode = document.getElementById('freeplay-mode').checked;

// Tower stats pop-up
const towerStatsPopup = document.getElementById('tower-stats-popup') || null;
const towerTypeDisplay = document.getElementById('tower-type') || { textContent: '' };
const towerLevelDisplay = document.getElementById('tower-level') || { textContent: '' };
const towerHealthDisplay = document.getElementById('tower-health') || { textContent: '' };
const towerRangeDisplay = document.getElementById('tower-range') || { textContent: '' };
const towerDamageDisplay = document.getElementById('tower-damage') || { textContent: '' };
const towerDescDisplay = document.getElementById('tower-desc') || { textContent: '' };
const upgrade1Button = document.getElementById('upgrade1-button') || null;
const upgrade2Button = document.getElementById('upgrade2-button') || null;
let showing = null; // Currently selected tower
let upgradePressed = false; // Flag for upgrade confirmation

const upgrade = {
    '1': {
        'lvl2': { '1': { health: 5, range: 0, damage: 1, fireRate: -0.1, cost: 5 }, '2': { health: 0, range: 30, damage: 0, fireRate: 0, cost: 3 } },
        'lvl3': { '1': { health: 10, range: 0, damage: 2, fireRate: -0.2, cost: 10 }, '2': { health: 0, range: 50, damage: 1, fireRate: 0, cost: 8 } },
        'lvl4': { '1': { health: 20, range: 50, damage: 5, fireRate: -0.5, cost: 25 }, '2': { health: 20, range: 100, damage: 5, fireRate: -0.5, cost: 25 } }
    },
    '2': {
        'lvl2': { '1': { health: 8, range: 0, damage: 1.5, fireRate: -0.15, cost: 6 }, '2': { health: 0, range: 40, damage: 0, fireRate: 0, cost: 4 } },
        'lvl3': { '1': { health: 12, range: 0, damage: 3, fireRate: -0.3, cost: 12 }, '2': { health: 0, range: 60, damage: 1.5, fireRate: 0, cost: 9 } },
        'lvl4': { '1': { health: 25, range: 70, damage: 8, fireRate: -0.6, cost: 30 }, '2': { health: 25, range: 120, damage: 8, fireRate: -0.6, cost: 30 } }
    },
    '3': {
        'lvl2': { '1': { health: 6, range: 0, damage: 2, fireRate: -0.2, cost: 7 }, '2': { health: 0, range: 35, damage: 0, fireRate: 0, cost: 5 } },
        'lvl3': { '1': { health: 15, range: 0, damage: 4, fireRate: -0.4, cost: 14 }, '2': { health: 0, range: 70, damage: 2, fireRate: 0, cost: 11 } },
        'lvl4': { '1': { health: 30, range: 80, damage: 10, fireRate: -0.7, cost: 35 }, '2': { health: 30, range: 150, damage: 10, fireRate: -0.7, cost: 35 } }
    },
    '4': {
        'lvl2': { '1': { health: 0, range: 0, damage: 6, fireRate: 0, cost: 12 } },
        'lvl3': { '1': { health: 0, range: 0, damage: 8, fireRate: 0, cost: 14 } },
        'lvl4': { '1': { health: 0, range: 0, damage: 10, fireRate: 0, cost: 18 } }
    },
    '5': {
        'lvl2': { '1': { health: 3, range: 0, damage: 0.5, fireRate: -0.2, cost: 6 } },
        'lvl3': { '1': { health: 5, range: 0, damage: 0.5, fireRate: -0.2, cost: 12 } },
        'lvl4': { '1': { health: 10, range: 0, damage: 0.5, fireRate: -0.5, cost: 30 } }
    },
    '6': {
        'lvl2': { '1': { health: 6, range: 0, damage: 2, fireRate: -0.2, cost: 7 }, '2': { health: 0, range: 35, damage: 0, fireRate: 0, cost: 5 } },
        'lvl3': { '1': { health: 15, range: 0, damage: 4, fireRate: -0.4, cost: 14 }, '2': { health: 0, range: 70, damage: 2, fireRate: 0, cost: 11 } },
        'lvl4': { '1': { health: 30, range: 80, damage: 10, fireRate: -0.7, cost: 35 }, '2': { health: 30, range: 150, damage: 10, fireRate: -0.7, cost: 35 } }
    },
    '7': {},
    '8': {
        'lvl2': { '1': { health: 8, range: 0, damage: 1.5, fireRate: 0, cost: 6 }, '2': { health: 0, range: 40, damage: 0, fireRate: 0, cost: 4 } },
        'lvl3': { '1': { health: 12, range: 0, damage: 3, fireRate: 0, cost: 12 }, '2': { health: 0, range: 60, damage: 1.5, fireRate: 0, cost: 9 } },
        'lvl4': { '1': { health: 25, range: 70, damage: 8, fireRate: 0, cost: 30 }, '2': { health: 25, range: 120, damage: 8, fireRate: 0, cost: 30 } }
    },
    '9': {
        'lvl2': { '1': { health: 8, range: 0, damage: 1.5, fireRate: -0.15, cost: 6 }, '2': { health: 0, range: 40, damage: 0, fireRate: 0, cost: 4 } },
        'lvl3': { '1': { health: 12, range: 0, damage: 3, fireRate: -0.3, cost: 12 }, '2': { health: 0, range: 60, damage: 1.5, fireRate: 0, cost: 9 } },
        'lvl4': { '1': { health: 25, range: 70, damage: 8, fireRate: -0.6, cost: 30 }, '2': { health: 25, range: 120, damage: 8, fireRate: -0.6, cost: 30 } }
    },
    '10': {},
    '11': {},
    '12': {},
    '13': {
        'lvl2': { '1': { health: 5, range: 0, damage: 0, fireRate: 0, cost: 3 } },
        'lvl3': { '1': { health: 7, range: 0, damage: 0, fireRate: 0, cost: 5 } },
        'lvl4': { '1': { health: 13, range: 0, damage: 0, fireRate: 0, cost: 8 } }
    }, 
    '14': {}
};

// Function to show the tower stats pop-up
function showTowerStats(tower, showButtons=true) {
    let towerType;
    if (tower.type == '1') {
        towerType = 'jack';
    } else if (tower.type == '2') {
        towerType = 'liam';
    } else if (tower.type == '3') {
        towerType = 'evan';
    } else if (tower.type == '4') {
        towerType = 'christian';
    } else if (tower.type == '5') {
        towerType = 'philip';
    } else if (tower.type == '6') {
        towerType = 'lars';
    } else if (tower.type == '7') {
        towerType = 'mitch';
    } else if (tower.type == '8') {
        towerType = 'nick';
    } else if (tower.type == '9') {
        towerType = 'walker';
    } else if (tower.type == '10') {
        towerType = 'declan';
    } else if (tower.type == '11') {
        towerType = 'cole';
    } else if (tower.type == '12') {
        towerType = 'luca';
    } else if (tower.type == '13') {
        towerType = 'ciaran';
    } else if (tower.type == '14') {
        towerType = 'david';
    }

    towerTypeDisplay.textContent = `${towerType} tower`;
    towerLevelDisplay.textContent = `lvl ${tower.level}`;
    towerHealthDisplay.textContent = `${tower.health} hp`;
    towerRangeDisplay.textContent = `${tower.range} px range`;
    towerDamageDisplay.textContent = `~${(tower.damage * Math.round((1 / tower.fireRate) * 100) / 100).toFixed(2)} dps`;
    towerDescDisplay.textContent = tower.desc;
    upgrade1Button.disabled = false;
    upgrade2Button.disabled = false;

    const towerUpgrades = upgrade[tower.type];
    const nextLevelKey = `lvl${tower.level + 1}`;

    if (!upgrade[tower.type]['lvl2']) {
        upgrade1Button.textContent = "cannot upgrade";
        upgrade2Button.textContent = "";
        upgrade1Button.disabled = true;
        upgrade2Button.disabled = true;
    }

    if (tower.type == "9") {
        towerDamageDisplay.textContent = `~${tower.damage} dmg/${tower.fireRate}`;
    } else if (towerUpgrades && towerUpgrades[nextLevelKey]) {
        const nextLevelUpgrades = upgrade[tower.type] && upgrade[tower.type][`lvl${tower.level + 1}`];
        const hasSecondUpgrade = nextLevelUpgrades && nextLevelUpgrades['2'] != null;
        if (tower.canShoot == false) {
            towerDamageDisplay.textContent = `0 dps`;
            if (tower.type == "4") {
                tower.desc = `+$${tower.damage} after each wave`;
            }
        }

        if (tower.level < 3) {
            upgrade1Button.textContent = `upgrade ${hasSecondUpgrade ? '(for dmg)' : ''}`;
            upgrade2Button.textContent = hasSecondUpgrade ? `upgrade (for range)` : '';
        } else if (tower.level == 3) {
            // Mega upgrade options for level 3 towers
            upgrade1Button.textContent = `final upgrade ${hasSecondUpgrade ? '(for dmg)' : ''}`;
            upgrade2Button.textContent = hasSecondUpgrade ? `final upgrade (for range)` : '';
        }
    } else {
        // If at max level
        upgrade1Button.textContent = "max upgrade lvl reached!";
        upgrade2Button.textContent = "";
    
        if (towerUpgrades && towerUpgrades[nextLevelKey]) {
            const nextLevelUpgrades = upgrade[tower.type] && upgrade[tower.type][`lvl${tower.level + 1}`];
            const hasSecondUpgrade = nextLevelUpgrades && nextLevelUpgrades['2'] != null;
            if (tower.canShoot == false) {
                towerDamageDisplay.textContent = `0 dps`;
                if (tower.type == "4") {
                    tower.desc = `+$${tower.damage} after each wave`;
                }
            }
        }
    }

    if (!showButtons) {
        upgrade1Button.textContent = "";
        upgrade2Button.textContent = "";
        upgrade1Button.disabled = true;
        upgrade2Button.disabled = true;
    }

    // Show the pop-up
    towerStatsPopup.classList.add('show');
    showing = tower; // Store the currently selected tower
}

// Function to hide the tower stats pop-up
function hideTowerStats() {
    towerStatsPopup.classList.remove('show');
    showing = null;
    upgradePressed = false;
}

// Handle upgrade button click for damage upgrade
upgrade1Button.addEventListener('click', (event) => {
    if (!showing) return; // No tower selected

    const currentLevel = showing.level;

    const towerUpgrades = upgrade[showing.type];
    const nextLevelKey = `lvl${currentLevel + 1}`;

    if (towerUpgrades[nextLevelKey]) {
        const upgradeInfo = towerUpgrades[nextLevelKey]['1']; // Damage upgrade

        if (!upgradePressed) {
            // Show confirmation details
            towerTypeDisplay.textContent = "Are you sure?";
            towerLevelDisplay.textContent = `lvl ${currentLevel} ➔ ${currentLevel + 1}`;
            towerHealthDisplay.textContent = `${showing.health}hp ➔ ${showing.health + upgradeInfo.health}`;
            towerRangeDisplay.textContent = `${showing.range}px range ➔ ${showing.range + upgradeInfo.range}`;

            if (showing.canShoot == false) {
                towerDamageDisplay.textContent = `0 dps`;
            } else {
                const currentDPS = (showing.damage * Math.round((1 / showing.fireRate) * 100) / 100).toFixed(2);
                const newDPS = ((showing.damage + upgradeInfo.damage) * Math.round((1 / (showing.fireRate + upgradeInfo.fireRate)) * 100) / 100).toFixed(2);
                towerDamageDisplay.textContent = `${currentDPS}dps ➔ ${newDPS}`;
            }

            upgrade1Button.textContent = `Pay $${upgradeInfo.cost}`;
            upgrade2Button.textContent = ""; // Hide other upgrade button
            upgradePressed = true; // Set confirmation flag
        } else {
            if (currency >= upgradeInfo.cost) {
                currency -= upgradeInfo.cost;
                console.log("Upgraded");
            
                // Perform the upgrade
                showing.level++;
                showing.health += upgradeInfo.health;
                showing.range += upgradeInfo.range;
                showing.damage += upgradeInfo.damage;
                showing.fireRate += upgradeInfo.fireRate;
            
                // Reset lastFired to prevent delays
                showing.lastFired = Date.now();
            
                // Update the tower stats pop-up
                showTowerStats(showing);
                updateHUD();
                upgradePressed = false; // Reset the confirmation flag
            } else {
                console.log("Not enough currency.");
            }
        }
    } else {
        towerTypeDisplay.textContent = "Max level reached!";
    }
}); // This parenthesis and brace close the event listener properly


// Handle upgrade button click for range upgrade
upgrade2Button.addEventListener('click', (event) => {
    if (!showing) return; // No tower selected

    const currentLevel = showing.level;
    const nextLevelKey = `lvl${currentLevel + 1}`; // Corrected key
    const towerUpgrades = upgrade[showing.type];

    if (towerUpgrades[nextLevelKey]) {
        const upgradeInfo = towerUpgrades[nextLevelKey]['2']; // Range upgrade

        if (!upgradePressed) {
            // Show confirmation details
            towerTypeDisplay.textContent = "Are you sure?";
            towerLevelDisplay.textContent = `lvl ${currentLevel} ➔ ${currentLevel + 1}`;
            towerHealthDisplay.textContent = `${showing.health}hp ➔ ${showing.health + upgradeInfo.health}`;
            towerRangeDisplay.textContent = `${showing.range}px range ➔ ${showing.range + upgradeInfo.range}`;

            if (showing.canShoot == false) {
                towerDamageDisplay.textContent = `0 dps`;
            } else {
                const currentDPS = (showing.damage * Math.round((1 / showing.fireRate) * 100) / 100).toFixed(2);
                const newDPS = ((showing.damage + upgradeInfo.damage) * Math.round((1 / (showing.fireRate + upgradeInfo.fireRate)) * 100) / 100).toFixed(2);
                towerDamageDisplay.textContent = `${currentDPS}dps ➔ ${newDPS}`;
            }

            upgrade2Button.textContent = `Pay $${upgradeInfo.cost}`;
            upgrade1Button.textContent = ""; // Hide other upgrade button
            upgradePressed = true; // Set confirmation flag
        } else {
            if (currency >= upgradeInfo.cost) {
                currency -= upgradeInfo.cost;
                console.log("Upgraded");

                // Perform the upgrade
                showing.level++;
                showing.health += upgradeInfo.health;
                showing.range += upgradeInfo.range;
                showing.damage += upgradeInfo.damage;
                showing.fireRate += upgradeInfo.fireRate;

                // Update the tower stats pop-up
                showTowerStats(showing);

                updateHUD();
                upgradePressed = false; // Reset the confirmation flag
            } else {
                console.log("Not enough currency.");
            }
        }
    } else {
        towerTypeDisplay.textContent = "Max level reached!";
    }
});

// Handle clicks on the canvas to show/hide tower stats
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Loop through towers to find one within range of the click
    let towerFound = false;

    towers.forEach(tower => {
        const distance = Math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2);
        if (distance < 30) { // Assuming 30 is the size of the tower
            if (showing == tower) {
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
let occupiedSquares = new Set();

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
        this.target = null;
        this.canShoot = true;

        if (type == '1') {//jack
            this.health = 10;
            this.range = 25;
            this.fireRate = 1.5;
            this.damage = 2;
            this.price = 1;
            this.desc = "overall bad";
        } else if (type == '2') {//liam
            this.health = 15;
            this.range = 100;
            this.fireRate = 0.5;
            this.damage = 4;
            this.price = 3;
            this.desc = "short ranged, fast shots";
        } else if (type == '3') {//evan
            this.health = 10;
            this.range = 500;
            this.fireRate = 1.5;
            this.damage = 4.5;
            this.price = 3;
            this.desc = "far range, powerful shots";
        } else if (type == '4') { //christian
            this.health = 5;
            this.range = 0;
            this.fireRate = 0;
            this.damage = 4;
            this.price = 20;
            this.desc = `+$${this.damage} after each wave`;
            this.canShoot = false;
        } else if (type == '5') {//philip
            this.health = 15;
            this.range = 1/0;
            this.fireRate = 3;
            this.damage = 10;
            this.price = 5;
            this.desc = "sniper shots, high reload time";
        } else if (type == '7') {//mitch
            this.health = 20;
            this.range = 225;
            this.fireRate = 0.5;
            this.damage = 3.5;
            this.price = 3;
            this.desc = "generally good at everything";
        } else if (type == '8') {//nick
            this.health = 12;
            this.range = 150;
            this.fireRate = 0.075;
            this.damage = 0.3;
            this.price = 10;
            this.desc = "super fast, minigun-like shots";
        } else if (type == '6') {//lars
            this.health = 12;
            this.range = 200;
            this.fireRate = 1;
            this.damage = 3.5;
            this.price = 6;
            this.desc = "shoots explosive bullets";
        } else if (type == '9') {//walker
            this.health = 50;
            this.range = 1/0;
            this.fireRate = "5 waves";
            this.damage = 1/0;
            this.price = 50;
            this.desc = "every 5 waves, insta-kills everything";
            this.canShoot = false;
        } else if (type == '10') {//declan
            this.health = 15;
            this.range = 100;
            this.fireRate = 1;
            this.damage = 0;
            this.price = 7;
            this.desc = "freezes enemies nearby";
            this.canShoot = false;
        } else if (type == '11') {//cole
            this.health = 1/0;
            this.range = 1/0;
            this.fireRate = 0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000001;
            this.damage = 1/0;
            this.price = 1/0;
            this.desc = "can only be placed by hacking";
        } else if (type == '12') {//luca
            this.health = 20;
            this.range = 150;
            this.fireRate = 0;
            this.damage = 2;
            this.price = 12;
            this.desc = "adds damage to nearby towers";
            this.canShoot = false;
        } else if (type == '13') {//ciaran
            this.health = 35;
            this.range = 0;
            this.fireRate = 0;
            this.damage = 0;
            this.price = 5;
            this.desc = "meat shield, cannot shoot";
            this.canShoot = false;
        }  else if (type == '14') {//david
            this.health = 20;
            this.range = 1/0;
            this.fireRate = 0.01;
            this.damage = 0.3;
            this.price = 4;
            this.desc = "shoots constantly in 4 directions";
            this.canShoot = true;
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
        } else if (this.type == '4') {
            ctx.fillStyle = 'blue';
        } else if (this.type == '5') {
            ctx.fillStyle = 'red';
        } else if (this.type == '6') {
            ctx.fillStyle = 'pink';
        } else if (this.type == '7') {
            ctx.fillStyle = 'orange';
        } else if (this.type == '8') {
            ctx.fillStyle = 'cyan';
        } else if (this.type == '9') {
            ctx.fillStyle = 'brown';
        } else if (this.type == '10') {
            ctx.fillStyle = '#fcba03';
        } else if (this.type == '11') {
            ctx.fillStyle = '#fff';
        } else if (this.type == '12') {
            ctx.fillStyle = '#48f542';
        } else if (this.type == '13') {
            ctx.fillStyle = '#f542d1';
        } else if (this.type == '14') {
            ctx.fillStyle = '#874b26';
        }
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

   shoot() {
        if (!this.target || this.target.health <= 0) return; // Ensure there's a target

        if (this.canShoot && Date.now() - this.lastFired > this.fireRate * 1000) {
            let angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            if (this.type == "6" || this.type == "11" || this.type == "3" || this.type == "5") {
                if (this.type == "6" || this.type == "11" && this.type != "3" && this.type != "5") {
                    projectiles.push(new Projectile(this.x, this.y, angle, this.damage, "tower", "explosive"));
                } else if (this.type != "6" || this.type != "11" && this.type == "3" && this.type == "5") {
                    projectiles.push(new Projectile(this.x, this.y, angle, this.damage, "tower", "fast"));
                } else {
                    projectiles.push(new Projectile(this.x, this.y, angle, this.damage, "tower", "explosive,fast"));
                }
            } else {
                if (this.type == "14") {
                    // North (up), South (down), East (right), West (left)
                    projectiles.push(new Projectile(this.x, this.y, Math.PI / 2, this.damage));   // North
                    projectiles.push(new Projectile(this.x, this.y, -Math.PI / 2, this.damage));  // South
                    projectiles.push(new Projectile(this.x, this.y, 0, this.damage));             // East
                    projectiles.push(new Projectile(this.x, this.y, Math.PI, this.damage));       // West
                } else {
                    projectiles.push(new Projectile(this.x, this.y, angle, this.damage));
                }
            }
        }
    }

    update(deltaTime) {
        if (this.health <= 0) return; // Skip update if the tower is destroyed

        if (this.type == "10") { // declan freezes enemies instead of shooting
            if (this.target && Date.now() - this.lastFired > this.fireRate * 1000) {
                const enemiesInRange = enemies.filter(enemy => this.isInRange(enemy));
                enemiesInRange.forEach(enemy => {
                    if (!enemy.isFrozen) {
                        this.freezeEnemy(enemy);
                    }
                });
                this.lastFired = Date.now();
            }
        } else if (this.type == "12") { // Luca - Buff nearby towers
            if (this.target && Date.now() - this.lastFired > this.fireRate * 1000) {
                const towersInRange = towers.filter(tower => this.isInRange(tower)); // Find towers in range
                towersInRange.forEach(tower => {
                    if (!tower.isMaxBuff || tower.isMaxBuff > (tower.damage + this.damage)) {
                        this.buff(tower); // Apply buff if not maxed
                    }
                });
                this.lastFired = Date.now(); // Set last fired to avoid over-buffing
            }
        } else if (this.type == "9") { // Walker smash
            // Check if the current wave is a multiple of 5 and the tower hasn't smashed this wave
            if (wave % 5 === 0 && this.lastFired !== wave) {
                setTimeout(() => {
                    enemies.forEach(enemy => {
                        enemy.takeDamage(enemy.health); // Instantly kill all enemies
                    });
                    console.log("Walker smash");
                }, 50); // Small delay for effect
                this.lastFired = wave; // Update the last fired wave
            }
        } else {
            if (this.target && Date.now() - this.lastFired > this.fireRate * 1000) {
                this.shoot();
                this.lastFired = Date.now();
            }
        }

        if (!this.target || this.target.health <= 0) {
            const enemiesInRange = enemies.filter(enemy => this.isInRange(enemy));
            if (enemiesInRange.length > 0) {
                this.target = enemiesInRange.reduce((farthestEnemy, currentEnemy) => {
                    return currentEnemy.getPathProgress() > farthestEnemy.getPathProgress()
                        ? currentEnemy
                        : farthestEnemy;
                });
            }
        }

        this.draw();
    }

    freezeEnemy(enemy) {
        enemy.isFrozen = true;
        enemy.freezeEndTime = Date.now() + 1000; // Freeze for 1 second
        enemy.speedBackup = enemy.speed; // Backup the original speed
        enemy.speed = 0; // Stop the enemy
    }

    buff(tower) {
        // Check if the tower's current damage is already at or above its maxBuff level
        if (!tower.isMaxBuff || tower.isMaxBuff < tower.damage + this.damage) {
            tower.damage += this.damage; // Apply the buff
            tower.isMaxBuff = tower.damage; // Track the max buff applied
        }
    }


    isInRange(enemy) {
        const buffer = 5; // Small buffer to account for floating-point inaccuracies
        const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
        return distance <= this.range + buffer;
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
    
            // Free the square previously occupied by this tower
            const gridX = Math.floor(this.x / gridSize);
            const gridY = Math.floor(this.y / gridSize);
            const squareKey = `${gridX},${gridY}`;
            occupiedSquares.delete(squareKey); // Mark the square as available
            console.log(`Square [${squareKey}] is now available.`);
        }
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
        if (this.isFrozen && Date.now() > this.freezeEndTime) {
            this.isFrozen = false;
            this.speed = this.speedBackup; // Restore original speed
        }

        // If the enemy is frozen, draw blue overlay
        if (this.isFrozen) {
            ctx.fillStyle = 'rgba(0, 0, 255, 1)'; // Blue overlay with low opacity
            ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
        } else {
            this.draw();
        }

        // Movement and path logic
        if (!this.isFrozen && this.currentPathIndex < path.length) {
            const target = path[this.currentPathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;

            if (distance < this.speed) {
                this.x = target.x;
                this.y = target.y;
                this.currentPathIndex++;
            } else {
                this.x += moveX;
                this.y += moveY;
            }
        }
        
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
                if (nearestEnemy && Date.now() - this.lastFired > 1000) {
                    nearestEnemy.health += 1;
                    this.lastFired = Date.now();
                    console.log(`'#33fff9' healed ${nearestEnemy} to ${nearestEnemy.health}`);
                }
            } else if (this.color == '#ff7433') {
                const max_health = this.health;
                if (Date.now() - this.lastFired > 1000 && max_health >= this.health + 1) {
                    this.health + 1;
                    this.lastFired = Date.now();
                    console.log(`'#ff7433' healed`);
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
                    const nextEnemyType = enemyTypes.find(type => type.color == this.nextType);
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
    { speed: 3, health: 10.5, color: 'orange', canShoot: false, range: null, fireRate: null, damage: null, level: 2, nextType: null }, // Fast enemy
    { speed: 0.7, health: 28, color: 'yellow', canShoot: false, range: null, fireRate: null, damage: null, level: 3, nextType: 'orange' }, // Tank enemy, no further transformation
    { speed: 1, health: 13, color: 'green', canShoot: true, range: 10, fireRate: 2, damage: 2.5, level: 4, nextType: null }, // Shooting enemy, no further transformation
    { speed: 2, health: 15, color: 'blue', canShoot: true, range: 10, fireRate: 1.5, damage: 2, level: 5, nextType: null }, // Fast shooting enemy, no further transformation
    { speed: 0.3, health: 72, color: 'purple', canShoot: false, range: null, fireRate: null, damage: null, level: 7, nextType: 'yellow' },
    { speed: 1, health: 20, color: '#33fff9', canShoot: false, range: 10, fireRate: null, damage: null, level: 13, nextType: null, special: 'Heals nearby enemies every second' },
    { speed: 0.3, health: 300, color: 'pink', canShoot: true, range: 100, fireRate: 0.5, damage: 2.5, level: 17, nextType: 'purple' },
    { speed: 0.7, health: 35, color: '#ff7433', canShoot: false, range: null, fireRate: null, damage: null, level: 23, nextType: null, special: 'Regrows health every second' },
    { speed: 0.3, health: 500, color: '#32a852', canShoot: false, range: 0, fireRate: 0, damage: 0, level: 25, nextType: 'purple' },
    { speed: 6, health: 100, color: '#4032a8', canShoot: true, range: 1/0, fireRate: 0.1, damage: 0.4, level: 35, nextType: null },
    { speed: 7, health: 75, color: '#beff33', canShoot: false, range: null, fireRate: null, damage: null, level: 37, nextType: null },
];

const bossEnemyTypes = [
    { speed: 0.3, health: 500, color: 'pink', canShoot: true, range: 1000, fireRate: 3, damage: 2.5, level: 10, nextType: 'purple' },
    { speed: 8, health: 275, color: '#beff33', canShoot: false, range: null, fireRate: null, damage: null, level: 20, nextType: null },
    { speed: 6, health: 300, color: '#4032a8', canShoot: true, range: 1/0, fireRate: 0.1, damage: 0.4, level: 30, nextType: null },
];

function spawnEnemies() {
    let enemyCount = 5 + wave;
    if (enemyCount > 35) {
        enemyCount = 35;
    }
    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => {
            const updatedEnemyTypes = enemyTypes.filter(enemy => enemy.level <= wave);
            const randomType = updatedEnemyTypes[Math.floor(Math.random() * updatedEnemyTypes.length)];
            if ((wave-25)/10 >= 0) {
                randomType.health += Math.round(5+2*((wave-25)/10));
                if (randomType.canShoot) {
                    randomType.damage += Math.round(5+((wave-25)/10));
                }
            }
            const enemy = new Enemy(randomType);
            enemies.push(enemy);
        }, i * 1000);
    }
    
    // Spawn boss if wave matches boss level
    bossEnemyTypes.forEach(boss => {
        if (wave == boss.level) {
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
        if (this.specificType && this.specificType.split(',').includes('fast')) {
            this.speed = 840;
        }
        this.angle = angle;
        this.damage = damage;
        this.type = type;
        this.specificType = specificType;
    }

    draw() {
        if (this.specificType && this.specificType.split(',').includes('explosive')) {
            ctx.fillStyle = 'red'; // Red for Lars' explosive bullets
        } else {
            ctx.fillStyle = this.type == 'tower' ? 'yellow' : 'blue'; // Normal projectile colors
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    explode() {
        const explosionRadius = 100; // Define the radius of the explosion
    
        // Draw the explosion area as a red circle with low opacity
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Red color with 30% opacity
        ctx.beginPath();
        ctx.arc(this.x, this.y, explosionRadius, 0, Math.PI * 2);
        ctx.fill();
    
        // Damage enemies within the explosion radius
        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance < explosionRadius) {
                // Apply half the damage to enemies within the explosion radius
                enemy.takeDamage(this.damage / 2);
                console.log("Explosion hit enemy:", enemy);
            }
        });
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
                    if (this.specificType == 'explosive') {
                        this.explode(); // Trigger explosion on impact
                    }
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

// Draw the grid and the path
function drawGrid() {
    ctx.strokeStyle = '	#3b3b3b'; // Light gray for grid lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

function isSquareAvailable(x, y) {
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    const squareKey = `${gridX},${gridY}`;
    const available = !occupiedSquares.has(squareKey);
    console.log(`Square [${squareKey}] available: ${available}`);
    return available;
}

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

// Handle tower placement
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTowerType && isSquareAvailable(x, y)) {
        // Snap to grid center
        const gridX = Math.floor(x / gridSize) * gridSize + gridSize / 2;
        const gridY = Math.floor(y / gridSize) * gridSize + gridSize / 2;

        // Create a temporary tower to get its price
        const tempTower = new Tower(gridX, gridY, selectedTowerType);
        
        if (currency >= tempTower.price) {
            // Place the tower
            const tower = new Tower(gridX, gridY, selectedTowerType);
            const squareKey = `${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`;
            console.log(`Marking square [${squareKey}] as occupied`);
            occupiedSquares.add(squareKey);
            towers.push(tower);
            currency -= tower.price;
            updateHUD();
            
            if (tower.type == "9") {
                tower.lastFired = wave;
            }
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

    if (autoStartCheckbox.checked && !waveInProgress) {
        waveInProgress = true;
        spawnEnemies();
        startWaveButton.disabled = true;
    }
}

function resetOtherDropdowns(excludeId) {
    const dropdownIds = ['general-towers', 'close-range-towers', 'far-range-towers', 'special-towers'];
    dropdownIds.forEach(id => {
        if (id !== excludeId) { // Exclude the currently changed dropdown
            document.getElementById(id).selectedIndex = 0;
        }
    });
}

function checkMultipleSelections(currentDropdown) {
    const dropdownIds = ['general-towers', 'close-range-towers', 'far-range-towers', 'special-towers'];
    let selectedCount = 0;

    dropdownIds.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown.selectedIndex > 0) { // If an option other than the default is selected
            selectedCount++;
        }
    });

    if (selectedCount > 1) {
        resetOtherDropdowns(currentDropdown.id); // Reset all other dropdowns except the current one
    }
}

function showTempTower(selectedTower) {
    const tempTower = new Tower(-(1/0), -(1/0), selectedTower);
    if (selectedTower !== tempTower.type) {
        showTowerStats(selectedTower, false);
    } else {
        showTowerStats(tempTower, false);
    }
}

// Event listener handler to avoid repetition
function handleTowerSelection(event) {
    selectedTowerType = event.target.value;
    if (selectedTowerType != "0") {
        checkMultipleSelections(event.target);
        showTempTower(selectedTowerType);
    } else {
        hideTowerStats();
    }
}

// Add event listeners
document.getElementById('general-towers').addEventListener('change', handleTowerSelection);
document.getElementById('close-range-towers').addEventListener('change', handleTowerSelection);
document.getElementById('far-range-towers').addEventListener('change', handleTowerSelection);
document.getElementById('special-towers').addEventListener('change', handleTowerSelection);

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

async function nextWave() {
    wave++;

    if (wave > JSON.parse(localStorage.getItem("topScore"))) {
        localStorage.setItem("topScore", wave);
    }

    // Other game logic
    towers.forEach(tower => {
        if (tower.type == "4") {
            currency += tower.damage;
            console.log("added money");
        } else if (tower.type == "9") {
            if (((tower.lastFired + wave) - 1) % 5 == 0) {
                alert("last wave was a walker smash!");
            }
        }
    });

    // Check for boss in the next wave
    bossEnemyTypes.forEach(boss => {
        if (wave == boss.level) {
            alert(`new color boss on wave ${wave}!`);
        }
    });

    enemyTypes.forEach(enemy => {
        if (enemy.special && enemy.level == wave) {
            alert(`new color special enemy that ${enemy.special.toLowerCase()} on wave ${wave}!`);
        }
    });
}

// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODE2MTYzMiwiZXhwIjoyMDQzNzM3NjMyfQ.NLNoMifNOv4seeTLCCV_ZiUmR-YGS7MJnm1bUqZ2B8g'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch leaderboard and check for duplicate names
async function getLeaderboardNames() {
    try {
        const { data, error } = await supabase
            .from('LiamsTD leaderboard')
            .select('name')
            .order('wave', { ascending: false });

        if (error) throw error;

        return data.map(entry => entry.name);
    } catch (error) {
        console.error('Error fetching leaderboard names:', error);
        return [];
    }
}

async function submitScore(name, wave) {
    if (freeplayMode) {
        console.log("Freeplay mode is enabled. No leaderboard submission.");
        return;
    }

    // Existing leaderboard submission code
    const response = await fetch('https://ipinfo.io/json?token=ca3a9249251d12');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const ipInfo = await response.json();
    console.log(ipInfo);

    try {
        const { error } = await supabase
            .from('LiamsTD leaderboard')
            .insert([{ name: name, wave: wave, ip: ipInfo }]);

        if (error) throw error;
        console.log('Score successfully submitted!');
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

function endGame() {
    // Pause the game loop by stopping any active intervals or timeouts
    pauseGame();

    alert(`Game over! You died on wave ${wave}.`);

    if (!freeplayMode) {
        let name = '';
        let leaderboardNames = getLeaderboardNames();

        leaderboardNames.then(names => {
            // Ensure leaderboardNames is an array
            if (typeof names === 'string') {
                names = names.split(','); // Split if it's a comma-separated string
            }

            while (true) {
                name = prompt(names.includes(name.trim())
                    ? "Name taken. Gimme a different one:"
                    : "Enter a name for the leaderboard:");

                if (name.length > 10) {
                    alert("Name must be under 10 letters");
                } else {
                    break;
                }
            }

            if (name) {
                // Submit the score to the leaderboard
                submitScore(name, wave);
            }

            alert("Play again?");
            resetGame(); // Reset and resume the game after user interaction
        }).catch(error => {
            console.error("Error fetching leaderboard names:", error);
        });
    } else {
        alert("Play again?");
        resetGame(); // Reset and resume the game for freeplay mode
    }
}

// Function to pause the game loop
function pauseGame() {
    // This is where you should stop any game loop timers, animations, or intervals
    // For example, if you have a game loop set with setInterval, you can clear it here
    clearInterval(gameLoopInterval); // Assuming you have a game loop running with setInterval
}

// Function to reset game state and restart the game
function resetGame() {
    // Reset the game state
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

// Get leaderboard data and update the DOM
async function getLeaderboard() {
    if (freeplayMode) {
        leaderboard.style.display = 'none'; // Hide leaderboard in Freeplay Mode
        return;
    }

    leaderboard.style.display = 'block'; // Show leaderboard if not in Freeplay Mode
    try {
        const { data, error } = await supabase
            .from('LiamsTD leaderboard')
            .select('*')
            .order('wave', { ascending: false }); // Sort by wave descending

        if (error) {
            throw error;
        }

        // Clear the current leaderboard display
        while (leaderboard.firstChild) {
            leaderboard.removeChild(leaderboard.firstChild);
        }

        // Display the top 12 entries
        data.slice(0, 3).forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `#${index + 1}, wave ${entry.wave} by ${entry.name}`;
            leaderboard.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    }

    data.slice(0, 10).forEach((entry, index) => {
        if (wave == entry) {
            if (index == 9) {
                alert("you're contending for top 10! (note: scores are only saved when you die, closing out of the window will permanently delete you're score)");
            } else if (index == 2) {
                alert("you're contending for top 3!");
            } else if (index == 0) {
                alert("you're contending the world record!");
            }
        }
    });
}

window.getLeaderboard = getLeaderboard;

let lastTime = 0;
let wasFreeplay = false;

function updateHUD() {
    currencyDisplay.textContent = `$${currency}`;
    waveDisplay.textContent = `wave ${wave}`;
    livesDisplay.textContent = `${lives} lives`;

    if (freeplayMode) {
        waveDisplay.textContent += " [Freeplay Mode]";
    }

    if (showing) {
        showTowerStats(showing);
    }
    getLeaderboard();
}

// Update the game loop to include freeplay detection
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}


if (typeof localStorage !== 'undefined' && !localStorage.getItem("topScore")) {
    localStorage.setItem("topScore", JSON.stringify(1));
}

// Check if there is a row with project_name 'liamstd'
const { data, error: selectError } = await supabase
    .from('visits')
    .select('*')
    .eq('project_name', 'liamstd');

// Handle any select errors
if (selectError) {
    throw selectError;
}

// If the row doesn't exist, insert it with num_visits initialized to 1
if (data.length === 0) {
    const { error: insertError } = await supabase
        .from('visits')
        .insert([{ project_name: 'liamstd', num_visits: 1 }]);

    if (insertError) {
        throw insertError;
    }

    console.log('Created new row with project_name "liamstd" and num_visits set to 1');
} else {
    // If the row exists, update the num_visits by incrementing its value
    const currentVisits = data[0].num_visits || 0; // Default to 0 if num_visits is not found

    const { error: updateError } = await supabase
        .from('visits')
        .update({ num_visits: currentVisits + 1 })
        .eq('project_name', 'liamstd');

    if (updateError) {
        throw updateError;
    }

    console.log(`Updated num_visits to ${currentVisits + 1} for project_name "liamstd"`);
}

// Object to track the state of pressed keys
const keysPressed = {};

document.addEventListener('keydown', async function(event) {
    keysPressed[event.key] = true;

    // Check for the key combination inside keydown
    if (keysPressed["Control"] && keysPressed["l"] && keysPressed["b"]) {
        alert("ooh, so I see you know the command...");
        if (prompt("...but do you know the password?") === "HURRICANEMILTON") {
            alert("ahh, ok");
            const command = prompt("what would you like to do?");
            
            if (command.toLowerCase() === "givemoney") {
                const amount = parseInt(prompt("how much?"), 10);
                if (!isNaN(amount)) {
                    currency += amount;
                } else {
                    alert("Invalid amount.");
                }
            } else if (command.toLowerCase() === "skiptowave") {
                const waveNumber = parseInt(prompt("which wave?"));
                if (!isNaN(waveNumber)) {
                    wave = waveNumber;
                } else {
                    alert("Invalid wave number.");
                }
            }

            updateHUD();
        } else {
            alert("a fake!");
            const response = await fetch('https://ipinfo.io/json?token=ca3a9249251d12');
            const ipInfo = await response.json();
            alert("your address, ip, and internet provider has been logged");
            alert(`you live around ${ipInfo.city}, your ip is ${ipInfo.ip}, and you have ${ipInfo.org}`);
            alert("womp womp");
        }
    }
});

document.addEventListener('keyup', function(event) {
    delete keysPressed[event.key];
});

// Initialize the game
updateHUD();
gameLoop();
