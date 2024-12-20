// supertag.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Player and game settings
const playerSize = 20;
const obstacleColor = 'gray';
const obstacleCount = Math.round(5+Math.random()*10); // Number of obstacles
const obstacles = generateRandomObstacles(obstacleCount);

const powers = [
    { name: "speedy boy", speed: 2, desc: "makes your player move faster" },
    { name: "invisible cloak", speed: 1, desc: "turns you invisible with a 7s cooldown (press i)" }
];

let active = { "invisible cloak": null };

// Player positions and movement
const player1 = { x: 100, y: 100, width: playerSize, height: playerSize, color: 'blue', number: 1, power: {}, last: Date.now() };
const player2 = { x: 700, y: 500, width: playerSize, height: playerSize, color: 'red', number: 2, power: {}, last: Date.now() };
let tagger = player1;  // Initial tagger is player1
let lastTagTime = 0;   // Track time of last tag
const cooldownDuration = 3000; // 3 seconds cooldown

// Player movement states
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
const spec = { i: false }

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (spec.hasOwnProperty(e.key)) spec[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function generateRandomObstacles(count) {
    const obstacles = [];
    for (let i = 0; i < count; i++) {
        const obstacleWidth = 50 + Math.random() * 100;
        const obstacleHeight = 50 + Math.random() * 100;
        obstacles.push({
            x: Math.random() * (canvas.width - obstacleWidth),
            y: Math.random() * (canvas.height - obstacleHeight),
            width: obstacleWidth,
            height: 0.2*obstacleHeight
        });
    }
    return obstacles;
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function checkSpec(player) {
    const currentTime = Date.now();

    // Check if the player is currently invisible and if the invisibility duration has expired
    if (active["invisible cloak"] === player && currentTime - player.last >= 5000) {
        active["invisible cloak"] = null; // Deactivate invisibility
        player.last = currentTime; // Start cooldown after invisibility ends
    }

    // Check if the invisibility cloak can be activated, and reset spec["i"] after use
    if (spec["i"] && player.power.name === "invisible cloak" && active["invisible cloak"] !== player) {
        // Ensure enough time has passed since the last invisibility (cooldown)
        if (currentTime - player.last >= 7000) {
            player.last = currentTime; // Update last activation time
            active["invisible cloak"] = player; // Activate invisibility
        }
        spec["i"] = false; // Reset the "i" key after activation to avoid re-triggering
    }
}

function updatePlayer(player, up, left, down, right) {
    const playerSpeed = player.power.speed * 5; // Base speed modified by power
    let intendedX = player.x;
    let intendedY = player.y;

    checkSpec(player);
    
    // Calculate intended new position based on keys
    if (keys[up]) intendedY -= playerSpeed;
    if (keys[down]) intendedY += playerSpeed;
    if (keys[left]) intendedX -= playerSpeed;
    if (keys[right]) intendedX += playerSpeed;

    // Keep player within bounds
    intendedX = Math.max(0, Math.min(canvas.width - player.width, intendedX));
    intendedY = Math.max(0, Math.min(canvas.height - player.height, intendedY));

    // Collision flags
    let collisionX = false;
    let collisionY = false;

    obstacles.forEach(obstacle => {
        // Create adjusted player bounding boxes for X and Y collision checking
        const playerBoxX = { ...player, x: intendedX };
        const playerBoxY = { ...player, y: intendedY };

        // Check collision along the X-axis
        if (checkCollision(playerBoxX, obstacle)) {
            collisionX = true;
        }
        // Check collision along the Y-axis
        if (checkCollision(playerBoxY, obstacle)) {
            collisionY = true;
        }
    });

    // Update position based on collision results
    if (!collisionX) {
        player.x = intendedX;
    }
    if (!collisionY) {
        player.y = intendedY;
    }
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
    if (active["invisible cloak"] == player) return;
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Display cooldown if this player is the tagger and within cooldown period
    const currentTime = Date.now();
    if (tagger === player && currentTime - lastTagTime < cooldownDuration) {
        const remainingCooldown = Math.ceil((cooldownDuration - (currentTime - lastTagTime)) / 1000); // Remaining seconds
        ctx.fillStyle = '#fff';
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
        }else {
            text += `, '${number}' for ${power.name}`;
        }
        number++;
    });
    text += ")";
    while (true) {
        const chosenPower = prompt(text);
        if (!chosenPower) {
            alert("by canceling, you proceed without a power");
            player.power = { name: "normal", speed: 1, desc: "does nothing special" };
            break;
        }
        const power = powers[parseInt(chosenPower)-1];
        if (power) {
            player.power = power;
            alert(`player ${player.number} chose ${power.name} power, which ${power.desc}`);
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
    document.getElementById('player1name').innerText = 'player 1 is blue (wasd)';
    document.getElementById('player2name').innerText = 'player 2 is red (arrow keys)';

    new Promise(resolve => setTimeout(resolve, 500));
    // Ask players for power choice
    await choosePower(player1);
    await choosePower(player2);
}

async function updateVisits() {
    const { data, error: selectError } = await supabase
        .from('visits')
        .select('*')
        .eq('project_name', 'supertag');

    if (selectError) throw selectError;

    if (data.length === 0) {
        const { error: insertError } = await supabase
            .from('visits')
            .insert([{ project_name: 'supertag', num_visits: 1 }]);

        if (insertError) throw insertError;

        console.log('Created new row with project_name "supertag" and num_visits set to 1');
    } else {
        const currentVisits = data[0].num_visits || 0;

        const { error: updateError } = await supabase
            .from('visits')
            .update({ num_visits: currentVisits + 1 })
            .eq('project_name', 'supertag');

        if (updateError) throw updateError;

        console.log(`Updated num_visits to ${currentVisits + 1} for project_name "supertag"`);
    }
}

updateVisits();
initialize();
gameLoop();
