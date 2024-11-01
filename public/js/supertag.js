// supertag.js

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player and game settings
const playerSize = 20;
const obstacleColor = 'gray';
const obstacles = [
    { x: 300, y: 200, width: 100, height: 20 },
    { x: 500, y: 400, width: 150, height: 20 },
    { x: 200, y: 100, width: 20, height: 150 }
];
const powers = [ //speed, jump (height), special ability
    { name: "speedy boy", speed: 2 }
];

// Player positions and movement
const player1 = { x: 100, y: 100, width: playerSize, height: playerSize, color: 'blue', number: 1, powers: {} };
const player2 = { x: 700, y: 500, width: playerSize, height: playerSize, color: 'red', number: 2, powers: {} };
let tagger = player1;  // Initial tagger is player1
let lastTagTime = 0;   // Track time of last tag
const cooldownDuration = 3000; // 3 seconds cooldown

// Player movement states
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect2.height > rect2.y
    );
}

// Update player positions
function updatePlayer(player, up, left, down, right) {
    const playerSpeed = player.powers.speed * 5; // Base speed modified by power
    if (keys[up]) player.y -= playerSpeed;
    if (keys[down]) player.y += playerSpeed;
    if (keys[left]) player.x -= playerSpeed;
    if (keys[right]) player.x += playerSpeed;

    // Keep player within bounds
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    // Check obstacle collisions
    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            if (keys[up]) player.y += playerSpeed;
            if (keys[down]) player.y -= playerSpeed;
            if (keys[left]) player.x += playerSpeed;
            if (keys[right]) player.x -= playerSpeed;
        }
    });
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw obstacles
    ctx.fillStyle = obstacleColor;
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Update and draw players
    updatePlayer(player1, 'w', 'a', 's', 'd');
    updatePlayer(player2, 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight');

    // Check for tag if cooldown period has expired
    const currentTime = Date.now();
    if (checkCollision(player1, player2) && (currentTime - lastTagTime >= cooldownDuration)) {
        tagger = tagger == player1 ? player2 : player1;  // Switch tagger
        lastTagTime = currentTime; // Update last tag time
        document.getElementById('tagger').innerText = `${tagger == player1 ? 'player 1' : 'player 2'} is it!`;
    }

    // Draw players and cooldown timer
    drawPlayerWithCooldown(player1);
    drawPlayerWithCooldown(player2);

    requestAnimationFrame(gameLoop);
}

// Function to draw a player and display cooldown above them if tagged
function drawPlayerWithCooldown(player) {
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Display cooldown if this player is the tagger and within cooldown period
    const currentTime = Date.now();
    if (tagger === player && currentTime - lastTagTime < cooldownDuration) {
        const remainingCooldown = Math.ceil((cooldownDuration - (currentTime - lastTagTime)) / 1000); // Remaining seconds
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(`${remainingCooldown}s`, player.x, player.y - 10);
    }
}

// Function to choose power
function choosePower(player) {
    let text = `choose power for player ${player.number} (enter `;
    let number = 1;
    powers.forEach(power => {
        if (number == 1) {
            text += `'${number}' for ${power.name}`;
        } else if (number == powers.length) {
            text += ` or '${number}' for ${power.name})`;
        } else {
            text += `, '${number}' for ${power.name}`;
        }
        number++;
    });
    while (true) {
        const chosenPower = prompt(text);
        if (!chosenPower) {
            alert("by canceling, you proceed without a power");
            player.powers = { speed: 1 };
            break;
        }
        const power = powers[parseInt(chosenPower)+1];
        if (power) {
            player.powers = { speed: power.speed };
            alert(`player ${player.number} chose ${power.name} power!`);
            break;
        } else {
            alert("that's not a choice buddy (note: remember you're putting in a number, not the name of the power)");
        }
    }
}

// Initialize game
async function initialize() {
    document.body.style.overflow = 'hidden';
    document.getElementById('tagger').innerText = `player ${tagger.number} is it!`;
    document.getElementById('player1name').innerText = 'player 1 is blue';
    document.getElementById('player2name').innerText = 'player 2 is red';

    // Ask players for power choice
    await choosePower(player1);
    await choosePower(player2);
}

initialize();
gameLoop();
