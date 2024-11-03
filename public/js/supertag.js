// supertag.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Function to set canvas to window size
function setCanvasSize() {
    canvas.width = 800;
    canvas.height = 600;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Player and game settings
const playerSize = 20;
const obstacleColor = 'gray';
const obstacleCount = Math.round(5 + Math.random() * 10); // Number of obstacles
const obstacles = generateRandomObstacles(obstacleCount);

const powers = [
    { name: "speedy boy", speed: 2, desc: "makes your player move faster" },
    { name: "tag bullet", tagBullet: true, desc: "shoots a bullet that tags the other player if it hits (press space)" },
    { name: "invisibility cloak", invisible: true, duration: 5000, desc: "turns you invisible for 5 seconds (press space)" },
];

// Player positions and movement
const player1 = { x: 100, y: 100, width: playerSize, height: playerSize, color: 'blue', number: 1, powers: {} };
const player2 = { x: 700, y: 500, width: playerSize, height: playerSize, color: 'red', number: 2, powers: {} };
let tagger = player1;  // Initial tagger is player1
let lastTagTime = 0;   // Track time of last tag
const cooldownDuration = 3000; // 3 seconds cooldown

// Player movement states
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
let bullets = []; // Store bullets for tag power
let invisiblePlayers = {}; // Track invisible players

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    
    if (e.key === ' ' && tagger.powers.tagBullet) fireTagBullet(tagger);
    else if (e.key === ' ' && tagger.powers.invisible) triggerInvisibility(tagger);
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
            height: 0.2 * obstacleHeight
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

function updatePlayer(player, up, left, down, right) {
    const playerSpeed = player.powers.speed * 5; // Base speed modified by power
    let intendedX = player.x;
    let intendedY = player.y;

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
        const playerBoxX = { ...player, x: intendedX };
        const playerBoxY = { ...player, y: intendedY };

        if (checkCollision(playerBoxX, obstacle)) collisionX = true;
        if (checkCollision(playerBoxY, obstacle)) collisionY = true;
    });

    if (!collisionX) player.x = intendedX;
    if (!collisionY) player.y = intendedY;
}

// Function to handle bullets
function fireTagBullet(player) {
    const bulletSpeed = 5;
    const bullet = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        vx: player === player1 ? bulletSpeed : -bulletSpeed,
        vy: player === player1 ? bulletSpeed : -bulletSpeed,
        player
    };
    bullets.push(bullet);
}

// Handle invisibility
function triggerInvisibility(player) {
    invisiblePlayers[player.number] = {
        player,
        startTime: Date.now(),
        duration: powers.find(p => p.invisible).duration
    };
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = obstacleColor;
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    updatePlayer(player1, 'w', 'a', 's', 'd');
    updatePlayer(player2, 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight');

    bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, 5, 5);

        const targetPlayer = bullet.player === player1 ? player2 : player1;
        if (checkCollision(bullet, targetPlayer)) {
            tagger = targetPlayer;
            lastTagTime = Date.now();
            document.getElementById('tagger').innerText = `${tagger == player1 ? 'player 1' : 'player 2'} is it!`;
            bullets.splice(index, 1);
        }
    });

    Object.keys(invisiblePlayers).forEach(playerId => {
        const { player, startTime, duration } = invisiblePlayers[playerId];
        if (Date.now() - startTime >= duration) delete invisiblePlayers[playerId];
        else player.invisible = true;
    });

    drawPlayerWithCooldown(player1);
    drawPlayerWithCooldown(player2);

    requestAnimationFrame(gameLoop);
}

// Adjust draw function for invisibility
function drawPlayerWithCooldown(player) {
    if (!invisiblePlayers[player.number]) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    const currentTime = Date.now();
    if (tagger === player && currentTime - lastTagTime < cooldownDuration) {
        const remainingCooldown = Math.ceil((cooldownDuration - (currentTime - lastTagTime)) / 1000);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`${remainingCooldown}s`, player.x, player.y - 10);
    }
}

// Choose power function
function choosePower(player) {
    let text = `choose power for player ${player.number} (enter `;
    powers.forEach((power, index) => {
        text += index === 0 ? `'${index + 1}' for ${power.name}` : `, '${index + 1}' for ${power.name}`;
    });
    text += ')';

    const chosenPower = parseInt(prompt(text));
    const power = powers[chosenPower - 1];
    if (power) {
        if (power.tagBullet) {
            player.powers.tagBullet = true;
            alert(`${power.desc}`);
        } else if (power.invisible) {
            player.powers.invisible = true;
            triggerInvisibility(player);
        } else {
            player.powers = { speed: power.speed };
            alert(`player ${player.number} chose ${power.name} power, which ${power.desc}`);
        }
    } else {
        player.powers = { speed: 1 };
    }
}

// Initialize game
async function initialize() {
    document.body.style.overflow = 'hidden';
    document.getElementById('tagger').innerText = `player ${tagger.number} is it!`;
    document.getElementById('player1name').innerText = 'player 1 is blue (wasd)';
    document.getElementById('player2name').innerText = 'player 2 is red (arrow keys)';

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
