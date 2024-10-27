import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

let turn = 1; // 1 for player, 0 for enemy
let playerMove = null;
let enemyMove = null;
let attacking = 1;
let combo = [];
let movesToDo = 0;
let playerMoveHistory = { n: 0, e: 0, s: 0, w: 0 };

function dead() {
    alert(attacking ? "You won!" : "You lost :(");
    restart();
}

function restart() {
    turn = 1;
    attacking = 1;
    playerMoveHistory = { n: 0, e: 0, s: 0, w: 0 };
    document.getElementById("result").textContent = "last enemy move: nothing";
    playerMove = null;
    enemyMove = null;
    combo = [];
    movesToDo = 0;
    update();
}

function translate(direction) {
    return { "n": "up", "e": "right", "s": "down", "w": "left" }[direction];
}

function update() {
    if (turn === 1 && playerMove) {
        // Handle player's turn
        if (!enemyMove) {
            calculate(); // Enemy's response
        } else if (playerMove === enemyMove) {
            combo.push(playerMove);
            movesToDo = combo.length;
            playerMove = null;
            enemyMove = null;
        } else {
            // Reset combo if moves don't match
            combo = [];
            movesToDo = 0;
            turn = 0; // Pass to enemy's turn
            attacking = 0;
            playerMove = null;
            enemyMove = null;
        }
    } else if (turn === 0) {
        // Enemy's turn logic here (just toggle back for simplicity)
        turn = 1; // Back to player
        attacking = 1;
    }

    // Update UI elements
    document.getElementById("offense").textContent = attacking ? "you're on offense" : "you're on defense";
    document.getElementById("combo").textContent = "current combo: " + (combo.length ? combo.map(translate).join(" ") : "nothing");

    // End game if combo length meets or exceeds threshold
    if (combo.length >= 3) {
        dead();
    }
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    let possible = options.filter(option => !combo.includes(option));
    enemyMove = possible[Math.floor(Math.random() * possible.length)];
    document.getElementById("result").textContent = `last enemy move: ${translate(enemyMove)}`;
    update();
}

document.addEventListener('keydown', (event) => {
    if (turn !== 1) return; // Only proceed if it's the player's turn

    switch (event.key) {
        case 'ArrowUp': playerMove = "n"; break;
        case 'ArrowDown': playerMove = "s"; break;
        case 'ArrowLeft': playerMove = "w"; break;
        case 'ArrowRight': playerMove = "e"; break;
        default: return;
    }

    if (combo.length > 0 && playerMove === combo[combo.length - movesToDo]) {
        movesToDo--;
        document.getElementById("result").textContent = `last enemy move: ${translate(combo[combo.length - movesToDo - 1])}`;
        if (movesToDo === 0) {
            playerMoveHistory[playerMove]++;
            update();
        }
    } else if (combo.length > 0 && combo.includes(playerMove)) {
        alert("You already went that direction in the combo. Please continue the correct sequence.");
        playerMove = null;
    } else if (combo.length > 0) {
        alert("Incorrect move! Repeat the combo in the correct order.");
        playerMove = null;
    } else {
        playerMoveHistory[playerMove]++;
        update();
    }
});

update();
document.getElementById("result").textContent = "last enemy move: nothing";
