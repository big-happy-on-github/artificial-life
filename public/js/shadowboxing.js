import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

let turn = 1; // Start with player's turn
let playerMove = null;
let enemyMove = null;
let winning = 1;
let combo = []; 

function dead() {
    alert(winning ? "You won!" : "You lost :(");
    restart();
}

function restart() {
    turn = 1; // Set to 1 to start with player's turn
    winning = 1;
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
    if (playerMove) {
        if (!enemyMove) {
            console.log("calculating");
            calculate(); 
            return;
        }
        if (playerMove == enemyMove) {
            combo.push(playerMove);
            console.log("Move matched, added to combo:", combo);
            winning = turn;
        } else {
            console.log("Moves did not match.");
            combo = [];
            turn = 1 - turn;
        }
        playerMove = null;
        enemyMove = null;
        update();
    }
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    const possible = options.filter(option => !combo.includes(option));
    enemyMove = possible[Math.floor(Math.random() * possible.length)];
    console.log("Enemy calculated move:", enemyMove);
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
    } else {
        console.log("Enemy's turn, key ignored.");
    }
    update();
});

update();
