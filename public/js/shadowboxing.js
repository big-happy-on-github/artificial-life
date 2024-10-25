import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`, { mode: 'no-cors' });
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

// Use localStorage to get the user ID
const playerId = localStorage.getItem('userID');

const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const timerDisplay = document.getElementById('timer');
const enemyNameDisplay = document.getElementById('enemyName');

// Game settings
const gameDuration = 30; // 30 seconds game duration
let timeLeft = gameDuration;
let gameInterval;
let enemyMoveInterval;
const playerSpeed = 10;
const enemySpeed = 5;

// Enemy moves randomly within bounds
function moveEnemy() {
    const gameContainer = document.getElementById('game-container');
    const maxLeft = gameContainer.clientWidth - enemy.clientWidth;
    const maxTop = gameContainer.clientHeight - enemy.clientHeight;
    
    const randomX = Math.floor(Math.random() * maxLeft);
    const randomY = Math.floor(Math.random() * maxTop);

    enemy.style.left = `${randomX}px`;
    enemy.style.top = `${randomY}px`;
}

// Start the game timer
function startTimer() {
    timeLeft = gameDuration;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;

    gameInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time Left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(gameInterval);
    clearInterval(enemyMoveInterval);
    timerDisplay.textContent = 'Time Up!';

    // Optionally log end of game data to Supabase
    // supabase.from('game_events').insert([{ event: 'game_end', duration: gameDuration }]);
    alert('Game over!'); // Simple game over message
}

// Handle player movement with arrow keys
document.addEventListener('keydown', (event) => {
    const playerRect = player.getBoundingClientRect();
    const gameRect = document.getElementById('game-container').getBoundingClientRect();

    switch (event.key) {
        case 'ArrowUp':
            if (playerRect.top > gameRect.top) player.style.top = `${player.offsetTop - playerSpeed}px`;
            break;
        case 'ArrowDown':
            if (playerRect.bottom < gameRect.bottom) player.style.top = `${player.offsetTop + playerSpeed}px`;
            break;
        case 'ArrowLeft':
            if (playerRect.left > gameRect.left) player.style.left = `${player.offsetLeft - playerSpeed}px`;
            break;
        case 'ArrowRight':
            if (playerRect.right < gameRect.right) player.style.left = `${player.offsetLeft + playerSpeed}px`;
            break;
    }
});

// Initialize game
function startGame() {
    startTimer();
    enemyMoveInterval = setInterval(moveEnemy, 500); // Move enemy every 500ms
}

// Begin game on load
window.addEventListener('load', startGame);
