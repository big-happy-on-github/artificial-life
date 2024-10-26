import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

let turn = 1; // Start with player's turn
let playerMove = null;
let enemyMove = null;
let combo = []; 

function dead() {
    alert(turn ? "You won!" : "You lost :(");
    restart();
}

function restart() {
    turn = 1; // Set to 1 to start with player's turn
    playerMove = null;
    enemyMove = null;
    combo = [];
    console.log("Game restarted. Player's turn.");
}

function update() {
    console.log("Update called - Combo:", combo, "Turn:", turn ? "Player" : "Enemy");

    if (combo.length >= 3) {
        dead();
        return;
    }
    if (!turn) { 
        calculate(); 
        return;
    }
    if (playerMove && enemyMove) {
        if (playerMove === enemyMove) {
            combo.push(playerMove);
            console.log("Move matched, added to combo:", combo);
        } else {
            console.log("Moves did not match.");
        }
        playerMove = null;
        enemyMove = null;
        turn = 1 - turn; // Alternate turns after processing moves
    }
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    enemyMove = options.find(option => !combo.includes(option)) || "n";
    console.log("Enemy calculated move:", enemyMove);
    turn = 0; // Keep it enemy's turn to let update handle this move
    update(); // Call update to process the enemy move
}

document.addEventListener('keydown', (event) => {
    if (turn) { 
        switch (event.key) {
            case 'ArrowUp':
                playerMove = "n";
                break;
            case 'ArrowDown':
                playerMove = "s";
                break;
            case 'ArrowLeft':
                playerMove = "w";
                break;
            case 'ArrowRight':
                playerMove = "e";
                break;
            default:
                return; 
        }
        if (combo.includes(playerMove)) {
            alert("Cannot go the same direction more than once.");
            playerMove = null;
            return;
        }
        console.log("Player Move:", playerMove);
        update(); // Call update after player's move
    } else {
        console.log("Enemy's turn, key ignored.");
    }
});

update();
