const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const currencyDisplay = document.getElementById('currency') || { textcontent: '' };
const waveDisplay = document.getElementById('wave') || { textcontent: '' };
const livesDisplay = document.getElementById('lives') || { textcontent: '' };
const towerSelection = document.getElementById('tower-selection') || null;
const startwaveButton = document.getElementById('start-wave-button') || null;
const autoStartcheckbox = document.getElementById('auto-start') || null;

// Tower stats pop-up
const towerStatspopup = document.getElementById('tower-stats-popup') || null;
const towerTypeDisplay = document.getElementById('tower-type') || { textcontent: '' };
const towerlevelDisplay = document.getElementById('tower-level') || { textcontent: '' };
const towerHealthDisplay = document.getElementById('tower-health') || { textcontent: '' };
const towerRangeDisplay = document.getElementById('tower-range') || { textcontent: '' };
const towerDamageDisplay = document.getElementById('tower-damage') || { textcontent: '' };
const upgrade1Button = document.getElementById('upgrade1-button') || null;
const upgrade2Button = document.getElementById('upgrade2-button') || null;
let showing = null; // currently selected tower
let upgradepressed = false; // Flag for upgrade confirmation

// Define the upgrades for each tower type and level
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
        'lvl2': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 12, money: 6 } },
        'lvl3': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 14, money: 8 } },
        'lvl4': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 18, money: 10 } }
    },
    '5': {
        'lvl2': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 12, money: 6 } },
        'lvl3': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 14, money: 8 } },
        'lvl4': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 18, money: 10 } }
    },
    '6': {
        'lvl2': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 12, money: 6 } },
        'lvl3': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 14, money: 8 } },
        'lvl4': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 18, money: 10 } }
    },
    '7': {},
    '8': {
        'lvl2': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 12, money: 6 } },
        'lvl3': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 14, money: 8 } },
        'lvl4': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 18, money: 10 } }
    },
    '9': {
        'lvl2': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 12, money: 6 } },
        'lvl3': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 14, money: 8 } },
        'lvl4': { '1': { health: 0, range: 0, damage: 0, fireRate: 0, cost: 18, money: 10 } }
    }
};

function showTowerStats(tower) {
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
        towerType = 'mitchell';
    } else if (tower.type == '7') {
        towerType = 'walker';
    } else if (tower.type == '8') {
        towerType = 'larse';
    } else if (tower.type == '9') {
        towerType = 'nick';
    }

    towerTypeDisplay.textcontent = `${towerType} tower`;
    towerlevelDisplay.textcontent = `lvl ${tower.level}`;
    towerHealthDisplay.textcontent = `${tower.health}hp`;
    towerRangeDisplay.textcontent = `${tower.range}px range`;
    towerDamageDisplay.textcontent = `~${(tower.damage * math.round((1 / tower.fireRate) * 100) / 100).toFixed(2)}dps`;

    if (tower.type == '7') {
        towerDamageDisplay.textcontent = `~${tower.damage}/${tower.fireRate}`;
    }
    
    const towerUpgrades = upgrade[tower.type];
    const nextlevelKey = `lvl${tower.level + 1}`;

    if (towerUpgrades && !towerUpgrades[nextlevelKey] && tower.level == 1) {
        upgrade1Button.textcontent = `cannot upgrade this tower`;
        upgrade2Button.textcontent = ``;
    } else if (towerUpgrades && towerUpgrades[nextlevelKey]) {
        let hasSecondUpgrade = true;
        if (towerUpgrades[nextLevelKey]['2']) {
            hasSecondUpgrade = false;
        }

        if (tower.level < 3) {
            upgrade1Button.textcontent = `upgrade ${hasSecondUpgrade ? '(for dmg)' : ""}`;
            upgrade2Button.textcontent = hasSecondUpgrade ? `upgrade (for range)` : "";
        } else if (tower.level === 3) {
            // mega upgrade options for level 3 towers
            upgrade1Button.textcontent = `final upgrade ${hasSecondUpgrade ? '(for dmg)' : ""}`;
            upgrade2Button.textcontent = hasSecondUpgrade ? `final upgrade (for range)` : "";
        }
    } else {
        // If at max level
        upgrade1Button.textcontent = "max upgrade lvl reached!";
        upgrade2Button.textcontent = "";
    
        if (towerUpgrades && towerUpgrades[nextlevelKey]) {
            let hasSecondUpgrade = true;
            if (towerUpgrades[nextLevelKey]['2']) {
                hasSecondUpgrade = false;
            }
        }
    }

    // Show the pop-up
    towerStatspopup.classlist.add('show');
    showing = tower; // Store the currently selected tower
}

// Function to hide the tower stats pop-up
function hideTowerStats() {
    towerStatspopup.classlist.remove('show');
    showing = null;
    upgradepressed = false;
}

// Handle upgrade button click for damage upgrade
upgrade1Button.addeventlistener('click', (event) => {
    if (!showing) return; // no tower selected

    const currentlevel = showing.level;

    const towerUpgrades = upgrade[showing.type];
    const nextlevelKey = `lvl${currentlevel + 1}`;

    if (towerUpgrades[nextlevelKey]) {
        const upgradeInfo = towerUpgrades[nextlevelKey]['1']; // Damage upgrade

        if (!upgradepressed) {
            // Show confirmation details
            towerTypeDisplay.textcontent = "Are you sure?";
            towerlevelDisplay.textcontent = `lvl ${currentlevel} ➔ ${currentlevel + 1}`;
            towerHealthDisplay.textcontent = `${showing.health}hp ➔ ${showing.health + upgradeInfo.health}`;
            towerRangeDisplay.textcontent = `${showing.range}px range ➔ ${showing.range + upgradeInfo.range}`;

            const currentDpS = (showing.damage * math.round((1 / showing.fireRate) * 100) / 100).toFixed(2);
            const newDpS = ((showing.damage + upgradeInfo.damage) * math.round((1 / (showing.fireRate + upgradeInfo.fireRate)) * 100) / 100).toFixed(2);
            towerDamageDisplay.textcontent = `${currentDpS}dps ➔ ${newDpS}`;

            upgrade1Button.textcontent = `pay $${upgradeInfo.cost}`;
            upgrade2Button.textcontent = ""; // Hide other upgrade button
            upgradepressed = true; // Set confirmation flag
        } else {
            if (currency >= upgradeInfo.cost) {
                currency -= upgradeInfo.cost;
                console.log("Upgraded");

                // perform the upgrade
                showing.level++;
                showing.health += upgradeInfo.health;
                showing.range += upgradeInfo.range;
                showing.damage += upgradeInfo.damage;
                showing.fireRate += upgradeInfo.fireRate;

                // Update the tower stats pop-up
                showTowerStats(showing);

                updateHUD();
                upgradepressed = false; // Reset the confirmation flag
            } else {
                console.log("not enough currency.");
            }
        }
    } else {
        towerTypeDisplay.textcontent = "max level reached!";
    }
}); // This parenthesis and brace close the event listener properly


// Handle upgrade button click for range upgrade
upgrade2Button.addeventlistener('click', (event) => {
    if (!showing) return; // no tower selected

    const currentlevel = showing.level;
    const nextlevelKey = `lvl${currentlevel + 1}`; // corrected key
    const towerUpgrades = upgrade[showing.type];

    if (towerUpgrades[nextlevelKey]) {
        const upgradeInfo = towerUpgrades[nextlevelKey]['2']; // Range upgrade

        if (!upgradepressed) {
            // Show confirmation details
            towerTypeDisplay.textcontent = "Are you sure?";
            towerlevelDisplay.textcontent = `lvl ${currentlevel} ➔ ${currentlevel + 1}`;
            towerHealthDisplay.textcontent = `${showing.health}hp ➔ ${showing.health + upgradeInfo.health}`;
            towerRangeDisplay.textcontent = `${showing.range}px range ➔ ${showing.range + upgradeInfo.range}`;

            const currentDpS = (showing.damage * math.round((1 / showing.fireRate) * 100) / 100).toFixed(2);
            const newDpS = ((showing.damage + upgradeInfo.damage) * math.round((1 / (showing.fireRate + upgradeInfo.fireRate)) * 100) / 100).toFixed(2);
            towerDamageDisplay.textcontent = `${currentDpS} dmg/s ➔ ${newDpS} dmg/s`;

            upgrade2Button.textcontent = `pay $${upgradeInfo.cost}`;
            upgrade1Button.textcontent = ""; // Hide other upgrade button
            upgradepressed = true; // Set confirmation flag
        } else {
            if (currency >= upgradeInfo.cost) {
                currency -= upgradeInfo.cost;
                console.log("Upgraded");

                // perform the upgrade
                showing.level++;
                showing.health += upgradeInfo.health;
                showing.range += upgradeInfo.range;
                showing.damage += upgradeInfo.damage;
                showing.fireRate += upgradeInfo.fireRate;

                // Update the tower stats pop-up
                showTowerStats(showing);

                updateHUD();
                upgradepressed = false; // Reset the confirmation flag
            } else {
                console.log("not enough currency.");
            }
        }
    } else {
        towerTypeDisplay.textcontent = "max level reached!";
    }
});

// Handle clicks on the canvas to show/hide tower stats
canvas.addeventlistener('click', (event) => {
    const rect = canvas.getBoundingclientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // loop through towers to find one within range of the click
    let towerFound = false;

    towers.foreach(tower => {
        const distance = math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2);
        if (distance < 30) { // Assuming 30 is the size of the tower
            if (showing === tower) {
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
const enemyprojectiles = []; // Array to hold projectiles fired by enemies
let selectedTowerType = null;
let waveInprogress = false; // Track if a wave is in progress
let occupiedSquares = new Set();

// canvas settings
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

        // Define properties for each new tower type
        if (type == '1') { // existing "jack" tower//
            this.health = 10;
            this.range = 125;
            this.fireRate = 1.5;
            this.damage = 2;
            this.price = 1;
            this.desc = "overall just bad"
        } else if (type == '2') { // existing "liam" tower//
            this.health = 15;
            this.range = 100;
            this.fireRate = 0.5;
            this.damage = 4;
            this.price = 3;
            this.desc = "short range, fast shots";
        } else if (type == '3') { // existing "evan" tower//
            this.health = 10;
            this.range = 500;
            this.fireRate = 1.5;
            this.damage = 5;
            this.price = 3;
            this.desc = "far range, powerful shots";
        } else if (type == '4') { // existing "christian" tower//
            this.health = 5;
            this.range = 0;
            this.fireRate = 0;
            this.damage = 0;
            this.price = 20;
            this.desc = "extra money per wave";
            this.money = 6;
        } else if (type == '5') { // new "philip" tower//
            this.health = 16;
            this.range = 9999;
            this.fireRate = 2;
            this.damage = 8;
            this.price = 5;
            this.desc = "super high range sniper";
        } else if (type == '6') { // new "mitchell" tower//
            this.health = 22;
            this.range = 225;
            this.fireRate = 0.8;
            this.damage = 3;
            this.price = 2;
            this.desc = "generally good at everything";
        } else if (type == '7') { // new "walker" tower
            this.health = 50;
            this.range = 1/0; //inf
            this.fireRate = "5 waves";
            this.damage = 1/0;
            this.price = 80;
            this.desc = "..."
        } else if (type == '8') { // new "larse" tower
            this.health = 18;
            this.range = 220;
            this.fireRate = 0.9;
            this.damage = 7;
            this.price = 5;
        } else if (type == '9') { // new "nick" tower
            this.health = 10;
            this.range = 175;
            this.fireRate = 0.2;
            this.damage = 1;
            this.price = 4;
            this.desc = "rapid fire low damage shots";
        }

        this.lastFired = 0;
    }

    draw() {
        // Set a different color for each tower type
        if (this.type == '1') {
            ctx.fillStyle = 'grey'; // "jack"
        } else if (this.type == '2') {
            ctx.fillStyle = 'green'; // "liam"
        } else if (this.type == '3') {
            ctx.fillStyle = 'purple'; // "evan"
        } else if (this.type == '4') {
            ctx.fillStyle = 'blue'; // "christian"
        } else if (this.type == '5') {
            ctx.fillStyle = 'red'; // "philip"
        } else if (this.type == '6') {
            ctx.fillStyle = 'orange'; // "mitchell"
        } else if (this.type == '7') {
            ctx.fillStyle = 'yellow'; // "walker"
        } else if (this.type == '8') {
            ctx.fillStyle = 'pink'; // "larse"
        } else if (this.type == '9') {
            ctx.fillStyle = 'cyan'; // "nick"
        }
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    }

    shoot() {
        if (!this.target || this.target.health <= 0) return; // no target to shoot at
    
        const angle = math.atan2(this.target.y - this.y, this.target.x - this.x);
        projectiles.push(new projectile(this.x, this.y, angle, this.damage));
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
                this.target = enemiesInRange.reduce((farthestenemy, currentenemy) => {
                    return currentenemy.getpathprogress() > farthestenemy.getpathprogress()
                        ? currentenemy
                        : farthestenemy;
                });
                console.log("new target acquired:", this.target); // Debug log
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
        const distance = math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
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
        }
    }
}

class enemy {
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
        this.currentpathIndex = 1; // Start moving to the second waypoint
        this.lastFired = 0;
        this.nextType = type.nextType;
    }

    // new method to calculate the progress of the enemy along the path
    getpathprogress() {
        let totalDistance = 0;
        let progressDistance = 0;

        // calculate total path length
        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            totalDistance += math.sqrt(dx * dx + dy * dy);
        }

        // calculate the progress distance
        for (let i = 0; i < this.currentpathIndex - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            progressDistance += math.sqrt(dx * dx + dy * dy);
        }

        // Add the partial progress in the current segment
        if (this.currentpathIndex < path.length) {
            const target = path[this.currentpathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            progressDistance += math.sqrt(dx * dx + dy * dy);
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
            const angle = math.atan2(tower.y - this.y, tower.x - this.x);
            enemyprojectiles.push(new projectile(this.x, this.y, angle, this.damage, 'enemy')); // create enemy projectile
            this.lastFired = Date.now();
        }
    }

    update() {
        if (this.currentpathIndex < path.length) {
            const target = path[this.currentpathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = math.sqrt(dx * dx + dy * dy);
    
            // move in the direction of the target
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
    
            // check if the enemy will overshoot the target
            if (distance < this.speed) {
                // move directly to the target waypoint
                this.x = target.x;
                this.y = target.y;
                this.currentpathIndex++; // move to the next waypoint
            } else {
                // normal movement towards the target
                this.x += moveX;
                this.y += moveY;
            }
        }
    
        // check if the enemy reached the end of the path
        if (this.currentpathIndex >= path.length) {
            this.die(true); // enemy crossed the path
        }

        // check for specials
        if (this.type.special) {
            if (this.color == '#33fff9') {
                const nearestenemy = enemies.find(enemy => this.isInRange(enemy));
                if (nearestenemy && Date.now() - this.lastFired > 1000) {
                    nearestenemy.health += 1;
                    this.lastFired = Date.now();
                    console.log(`'#33fff9' healed ${nearestenemy} to ${nearestenemy.health}`);
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
    
        // check for nearby towers and shoot
        const nearestTower = towers.find(tower => this.isInRange(tower));
        if (nearestTower) {
            this.shoot(nearestTower);
        }
    
        this.draw();
    }

    isInRange(tower) {
        const buffer = 5; // Small buffer to account for floating-point inaccuracies
        const distance = math.sqrt((tower.x - this.x) ** 2 + (tower.y - this.y) ** 2);
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
                    const nextenemyType = enemyTypes.find(type => type.color === this.nextType);
                    if (nextenemyType) {
                        const newenemy = new enemy(nextenemyType);
                        newenemy.x = this.x; // Set the new enemy's position to the current enemy's position
                        newenemy.y = this.y;
    
                        // calculate the nearest path index for the new enemy, ensuring it's ahead on the path
                        let closestDistance = Infinity;
                        for (let i = this.currentpathIndex; i < path.length; i++) { // Start from the current path index
                            const distance = math.sqrt((path[i].x - this.x) ** 2 + (path[i].y - this.y) ** 2);
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                newenemy.currentpathIndex = i;
                            }
                        }
                        
                        enemies.push(newenemy);
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
    { speed: 1, health: 20, color: '#33fff9', canShoot: false, range: 10, fireRate: null, damage: null, level: 13, nextType: null, special: 'Heals nearby enemies every second' },
    { speed: 0.3, health: 300, color: 'pink', canShoot: true, range: 100, fireRate: 0.5, damage: 2.5, level: 17, nextType: 'purple' },
    { speed: 0.7, health: 20, color: '#ff7433', canShoot: false, range: null, fireRate: null, damage: null, level: 23, nextType: null, special: 'Regrows health every second' },
];

const bossenemyTypes = [
    { speed: 0.3, health: 300, color: 'pink', canShoot: true, range: 1000, fireRate: 3, damage: 2.5, level: 10, nextType: 'purple' },
    { speed: 8, health: 75, color: '#beff33', canShoot: false, range: null, fireRate: null, damage: null, level: 20, nextType: null },
];

function spawnenemies() {
    const enemycount = 5 + wave;
    for (let i = 0; i < enemycount; i++) {
        setTimeout(() => {
            const updatedenemyTypes = enemyTypes.filter(enemy => enemy.level <= wave);
            const randomType = updatedenemyTypes[math.floor(math.random() * updatedenemyTypes.length)];
            const enemy = new enemy(randomType);
            enemies.push(enemy);
        }, i * 1000);
    }
    
    // Spawn boss if wave matches boss level
    bossenemyTypes.foreach(boss => {
        if (wave === boss.level) {
            const bossenemy = new enemy(boss);
            enemies.push(bossenemy);
        }
    });
    
    setTimeout(() => {
        waveInprogress = false;
        startwaveButton.disabled = false;
        currency += 1 + math.round(wave / 2);
        nextwave();
    }, enemycount * 1000);
}

class projectile {
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
        ctx.beginpath();
        ctx.arc(this.x, this.y, 5, 0, math.pI * 2);
        ctx.fill();
    }

    update() {
        this.x += math.cos(this.angle) * this.speed;
        this.y += math.sin(this.angle) * this.speed;
        this.draw();
    
        const buffer = 5; // Add a buffer for collision detection
    
        if (this.type == 'tower') {
            enemies.foreach(enemy => {
                const distance = math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
                if (distance < 20 + buffer) {
                    enemy.takeDamage(this.damage);
                    this.destroy();
                }
            });
        } else if (this.type == 'enemy') {
            towers.foreach(tower => {
                const distance = math.sqrt((tower.x - this.x) ** 2 + (tower.y - this.y) ** 2);
                if (distance < 20 + buffer) {
                    tower.takeDamage(this.damage);
                    this.destroy();
                }
            });
        }
    }

    destroy() {
        const array = this.type == 'tower' ? projectiles : enemyprojectiles;
        const index = array.indexOf(this);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
}

// Grid settings
const gridSize = 50; // Size of each grid square
const gridwidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Draw the grid and the path
function drawGrid() {
    ctx.strokeStyle = '	#3b3b3b'; // light gray for grid lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

function drawpath() {
    ctx.strokeStyle = 'white';
    ctx.linewidth = 10;

    ctx.beginpath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
}

// check if a square is available for tower placement and outside the path
function isSquareAvailable(x, y) {
    const gridX = math.floor(x / gridSize);
    const gridY = math.floor(y / gridSize);
    return !occupiedSquares.has(`${gridX},${gridY}`);
}

// Handle tower placement
canvas.addeventlistener('click', (event) => {
    const rect = canvas.getBoundingclientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedTowerType && isSquareAvailable(x, y)) {
        // Snap to grid center
        const gridX = math.floor(x / gridSize) * gridSize + gridSize / 2;
        const gridY = math.floor(y / gridSize) * gridSize + gridSize / 2;

        // create a temporary tower to get its price
        const tempTower = new Tower(gridX, gridY, selectedTowerType);
        
        if (currency >= tempTower.price) {
            // place the tower
            const tower = new Tower(gridX, gridY, selectedTowerType);
            occupiedSquares.add(`${math.floor(x / gridSize)},${math.floor(y / gridSize)}`);
            towers.push(tower);
            currency -= tower.price;
            updateHUD();
        } else {
            console.log('not enough currency to place the tower.');
        }
    } else {
        console.log('cannot place tower here.');
    }
});

// Update the game loop to include drawing the grid
function update(deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(); // Draw the grid
    drawpath(); // Draw the path

    towers.foreach((tower, index) => {
        if (tower.health > 0) {
            tower.update(deltaTime);
        } else {
            towers.splice(index, 1);
        }
    });

    enemies.foreach(enemy => enemy.update());
    projectiles.foreach(projectile => projectile.update());
    enemyprojectiles.foreach(projectile => projectile.update()); // Update enemy projectiles

    if (autoStartcheckbox.checked && !waveInprogress) {
        waveInprogress = true;
        spawnenemies();
        startwaveButton.disabled = true;
    }
}

function resetOtherDropdowns() {
    const dropdownIds = ['general-towers', 'close-range-towers', 'far-range-towers', 'special-towers'];
    dropdownIds.foreach(id => {
        document.getElementById(id).selectedIndex = 0;
    });
}

function checkmultipleSelections() {
    const dropdownIds = ['general-towers', 'close-range-towers', 'far-range-towers', 'special-towers'];
    let selectedcount = 0;

    dropdownIds.foreach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown.selectedIndex > 0) { // If an option other than the default is selected
            selectedcount++;
        }
    });

    if (selectedcount > 1) {
        alert('only 1 tower can be selected at a time');
        resetOtherDropdowns(); // Reset all dropdowns
        selectedTowerType = null; // clear the selected tower type
    }
}

document.getElementById('general-towers').addeventlistener('change', (event) => {
    selectedTowerType = event.target.value;
    checkmultipleSelections();
});

document.getElementById('close-range-towers').addeventlistener('change', (event) => {
    selectedTowerType = event.target.value;
    checkmultipleSelections();
});

document.getElementById('far-range-towers').addeventlistener('change', (event) => {
    selectedTowerType = event.target.value;
    checkmultipleSelections();
});

document.getElementById('special-towers').addeventlistener('change', (event) => {
    selectedTowerType = event.target.value;
    checkmultipleSelections();
});

// Handle start wave button click
startwaveButton.addeventlistener('click', () => {
    if (!waveInprogress) {
        waveInprogress = true;
        spawnenemies();
        startwaveButton.disabled = true; // Disable button during wave
    }
});

let hoverTarget = null; // To store the hovered object

// Handle mouse movement for hover detection
canvas.addeventlistener('mousemove', (event) => {
    const rect = canvas.getBoundingclientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Reset hover target
    hoverTarget = null;

    // check for hovering over towers
    towers.foreach(tower => {
        const distance = math.sqrt((tower.x - mouseX) ** 2 + (tower.y - mouseY) ** 2);
        if (distance < 30) { // Assuming 30 is the size of the tower
            hoverTarget = tower;
        }
    });

    // check for hovering over enemies
    enemies.foreach(enemy => {
        const distance = math.sqrt((enemy.x - mouseX) ** 2 + (enemy.y - mouseY) ** 2);
        if (distance < 15) { // Assuming 15 is half the size of the enemy
            hoverTarget = enemy;
        }
    });
});

function updateHUD() {
    currencyDisplay.textcontent = `$${currency}`;
    waveDisplay.textcontent = `wave ${wave} (pr: ${jSOn.parse(localStorage.getItem("topScore"))})`;
    livesDisplay.textcontent = `${lives} lives`;

    if (showing) {
        showTowerStats(showing);
    }
}

function nextwave() {
    wave++;
    
    if (wave > JSON.parse(localStorage.getItem("topScore"))) {
        localStorage.setItem("topScore", JSON.stringify(wave));
    }

    towers.foreach(tower => {
        let hasSecondUpgrade = true;
        if (towerUpgrades[nextLevelKey]['2']) {
            hasSecondUpgrade = false;
        }
        if (tower.type == "4" && tower.money) {
            currency += tower.money;
            console.log("added money");
        }
    });

    // check for boss in the next wave
    bossenemyTypes.foreach(boss => {
        if (wave === boss.level) {
            alert(`new color boss on wave ${wave}!`);
        }
    });

    enemyTypes.foreach(enemy => {
        if (enemy.special && enemy.level == wave) {
            alert(`new color special enemy that ${enemy.special.tolowercase()} on wave ${wave}!`);
        }
    });

    updateHUD();
}

//cheats
function skipTowave(newwave) {
    wave += (newwave - 1);
    nextwave();
    updateHUD();
}

function givemoney(money) {
    currency += money;
    updateHUD();
}

function help() {
    console.log("skipTowave, givemoney");
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
    waveInprogress = false;
    startwaveButton.disabled = false;
    autoStartcheckbox.checked = false;
    updateHUD();
    window.location.reload();
}

let lastTime = 0;
function gameloop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameloop);
}

if (!localStorage.getItem("topScore")) {
    localStorage.setItem("topScore", jSOn.stringify(1));
}

// Initialize the game
updateHUD();
gameloop();
