import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

let turn = 1; // Start with player's turn
let playerMove = null;
let enemyMove = null;
let attacking = 1;
let combo = []; 
let playerMoveHistory = { n: 0, e: 0, s: 0, w: 0 };

function dead() {
    alert(attacking ? "You won!" : "You lost :(");
    restart();
}

function restart() {
    turn = 1; // Set to 1 to start with player's turn
    attacking = 1;
    playerMove = null;
    enemyMove = null;
    combo = [];
    console.log("Game restarted. Player's turn.");
}

function update() {
    console.log("Update called - Combo:", combo, "Turn:", turn ? "Player" : "Enemy", "Attacking:", attacking ? "Player" : "Enemy");
    if (playerMove || !turn) {
        if (!enemyMove) {
            console.log("calculating");
            calculate(); 
            return;
        }
        if (playerMove == enemyMove) {
            combo.push(playerMove);
            console.log("Move matched, added to combo:", combo);
        } else {
            console.log("Moves did not match.");
            combo = [];
            turn = 1 - turn;
        }
        attacking = turn;
        playerMove = null;
        enemyMove = null;
    }

    if (combo.length >= 3) {
        dead();
        return;
    }
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    let possible = options.filter(option => !combo.includes(option));
    if (!attacking) { // Enemy is attacking, use the player's past defending moves
        const mostLikelyDefendMove = Object.keys(playerMoveHistory).reduce((a, b) => playerMoveHistory[a] > playerMoveHistory[b] ? a : b);
        possible = options.filter(option => option !== mostLikelyDefendMove);
    } else { // Enemy is defending, avoid player's common attack moves
        const mostLikelyAttackMove = Object.keys(playerMoveHistory).reduce((a, b) => playerMoveHistory[a] > playerMoveHistory[b] ? a : b);
        possible = options.filter(option => option !== mostLikelyAttackMove);
    }
    enemyMove = possible[Math.floor(Math.random() * possible.length)];
    console.log("Enemy calculated move:", enemyMove);
    document.getElementById("result").textContent = `enemy move: ${enemyMove}`;
    update(); // Call update to process the enemy move
}

document.addEventListener('keydown', (event) => {
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
    playerMoveHistory[playerMove]++;
    update();
});

update();
