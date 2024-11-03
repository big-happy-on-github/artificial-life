// supertag.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Function to initialize Supabase client with fetched URL and Key
async function initSupabase() {
    const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
    const { supabaseUrl } = await response1.json();
    const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
    const { supabaseKey } = await response2.json();
    return createClient(supabaseUrl, supabaseKey);
}

const supabase = await initSupabase();

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function setCanvasSize() {
    canvas.width = 800;
    canvas.height = 600;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

const playerSize = 20;
const obstacleColor = 'gray';
const obstacleCount = Math.round(5 + Math.random() * 10);
const obstacles = generateRandomObstacles(obstacleCount);

const powers = [
    { name: "speedy boy", speed: 2, desc: "makes your player move faster" },
    { name: "tag bullet", desc: "shoots a bullet that tags the other player if it hits (press e)" },
    { name: "invisibility cloak", duration: 5000, desc: "turns you invisible for 5 seconds (press /)" },
];

const player1 = { x: 100, y: 100, width: playerSize, height: playerSize, color: 'blue', number: 1, powers: { speed: 1 } };
const player2 = { x: 700, y: 500, width: playerSize, height: playerSize, color: 'red', number: 2, powers: { speed: 1 } };
let tagger = player1;
let lastTagTime = 0;
const cooldownDuration = 3000;

const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
let bullets = [];
let invisiblePlayers = {};

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;

    // Powers - check if the player has the ability before activating
    if (e.key === 'e' && tagger.powers.name === "tag bullet") fireTagBullet(tagger);
    if (e.key === '/' && tagger.powers.name === "invisibility cloak") triggerInvisibility(tagger);
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

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function updatePlayer(player, up, left, down, right) {
    const playerSpeed = player.powers.speed * 5;
    let intendedX = player.x;
    let intendedY = player.y;

    if (keys[up]) intendedY -= playerSpeed;
    if (keys[down]) intendedY += playerSpeed;
    if (keys[left]) intendedX -= playerSpeed;
    if (keys[right]) intendedX += playerSpeed;

    intendedX = Math.max(0, Math.min(canvas.width - player.width, intendedX));
    intendedY = Math.max(0, Math.min(canvas.height - player.height, intendedY));

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

function fireTagBullet(player) {
    const bulletSpeed = 5;
    const direction = player === player1 ? 1 : -1;
    const bullet = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        vx: direction * bulletSpeed,
        vy: 0,
        player
    };
    bullets.push(bullet);
}

function triggerInvisibility(player) {
    if (!invisiblePlayers[player.number]) {
        const invisDuration = powers.find(p => p.name === "invisibility cloak").duration;
        invisiblePlayers[player.number] = { player, startTime: Date.now(), duration: invisDuration };
        setTimeout(() => { delete invisiblePlayers[player.number]; }, invisDuration);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = obstacleColor;
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height));

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
            document.getElementById('tagger').innerText = `${tagger === player1 ? 'player 1' : 'player 2'} is it!`;
            bullets.splice(index, 1);
        }
    });

    drawPlayerWithCooldown(player1);
    drawPlayerWithCooldown(player2);

    requestAnimationFrame(gameLoop);
}

function drawPlayerWithCooldown(player) {
    if (!invisiblePlayers[player.number]) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    if (tagger === player && Date.now() - lastTagTime < cooldownDuration) {
        const remainingCooldown = Math.ceil((cooldownDuration - (Date.now() - lastTagTime)) / 1000);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`${remainingCooldown}s`, player.x, player.y - 10);
    }
}

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
    } else {
        const currentVisits = data[0].num_visits || 0;
        const { error: updateError } = await supabase
            .from('visits')
            .update({ num_visits: currentVisits + 1 })
            .eq('project_name', 'supertag');
        if (updateError) throw updateError;
    }
}

updateVisits();
initialize();
gameLoop();
