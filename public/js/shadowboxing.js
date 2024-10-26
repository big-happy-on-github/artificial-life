import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

let turn = 1; // Set turn to 1 initially to allow player to make a move
let playerMove = null; 
let enemyMove = null;
let combo = []; 

function dead() {
    turn ? alert("You won!") : alert("You lost :(");
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
    console.log("Update called");
    if (combo.length >= 3) {
        dead();
        return;
    }
    if (!turn) { 
        calculate(); 
    }
    if (playerMove && enemyMove) { 
        if (playerMove === enemyMove) {
            combo.push(playerMove);
            console.log("Move matched, added to combo:", combo);
        }
        playerMove = null;
        enemyMove = null;
        turn = 1 - turn; // Alternate turns
    }
    console.log("Combo:", combo, "Turn:", turn ? "Player" : "Enemy");
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    enemyMove = options.find(option => !combo.includes(option)) || "n";
    console.log("Enemy Move:", enemyMove);
    turn = 1; // Set turn back to player
}

document.addEventListener('keydown', (event) => {
    console.log("Key pressed:", event.key);
    if (turn) { 
        if (combo.includes(playerMove)) {
            alert("Cannot go the same direction more than once.");
            return;
        }
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
        console.log("Player Move:", playerMove);
        update();
    } else {
        console.log("Enemy's turn, key ignored.");
    }
});
