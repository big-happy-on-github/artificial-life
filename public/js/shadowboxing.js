import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`, { mode: 'no-cors' });
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

// Use localStorage to get the user ID
const playerId = localStorage.getItem('userID');

// Movement variables
let playerPosition = { x: 0, y: 0 };
const playerElement = document.getElementById('player');
const enemyElement = document.getElementById('enemy');

// Enemy name prompt
const enemyName = prompt('Enter the enemy name:');
document.getElementById('enemyName').textContent = `Enemy Name: ${enemyName}`;

function movePlayer(direction) {
    const stepSize = 10; // Pixels per move
    switch (direction) {
        case 'up':
            playerPosition.y -= stepSize;
            break;
        case 'down':
            playerPosition.y += stepSize;
            break;
        case 'left':
            playerPosition.x -= stepSize;
            break;
        case 'right':
            playerPosition.x += stepSize;
            break;
    }
    updatePlayerPosition();
}

function updatePlayerPosition() {
    playerElement.style.transform = `translate(${playerPosition.x}px, ${playerPosition.y}px)`;
}

// Arrow key event listener
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer('up');
            break;
        case 'ArrowDown':
            movePlayer('down');
            break;
        case 'ArrowLeft':
            movePlayer('left');
            break;
        case 'ArrowRight':
            movePlayer('right');
            break;
    }
});

async function getRanking() {
    const { data, error } = await supabase
        .from('shadowboxing_rankings')
        .select('ranking')
        .eq('player_id', playerId)
        .single();
    
    if (error) throw error;
    return data ? data.ranking : 1000; // Default ranking if not found
}

// Other game-related functions remain the same

// Function to periodically update the display of ongoing shadowboxing_games
updateDisplay();
updateVisits();
setInterval(updateDisplay, 1000); // Update every second to reflect ongoing shadowboxing_games
