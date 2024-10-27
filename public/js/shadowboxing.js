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
let requiredCombo = []; // Sequence of moves required before making a new move
let comboIndex = 0; // Track player's progress in matching the required combo
let playerMoveHistory = { n: 0, e: 0, s: 0, w: 0 };

function dead() {
    alert(attacking ? "You won!" : "You lost :(");
    restart();
}

function restart() {
    turn = 1; // Set to 1 to start with player's turn
    attacking = 1;
    playerMoveHistory = { n: 0, e: 0, s: 0, w: 0 };
    document.getElementById("result").textContent = "last enemy move: nothing";
    playerMove = null;
    enemyMove = null;
    combo = [];
    requiredCombo = [];
    comboIndex = 0;
    update();
}

function translate(direction) {
    if (direction == "n") {
        return "up";
    } else if (direction == "e") {
        return "right";
    } else if (direction == "s") {
        return "down";
    } else if (direction == "w") {
        return "left";
    }
}

function update() {
    if (playerMove || !turn) {
        if (!enemyMove) {
            calculate();
            return;
        }
        if (playerMove == enemyMove) {
            combo.push(playerMove);
            // Update required combo only if a new matching move is added
            requiredCombo = combo.slice();
            comboIndex = 0; // Reset combo index for the new combo sequence
        } else {
            combo = [];
            requiredCombo = [];
            comboIndex = 0;
            turn = 1 - turn;
        }
        attacking = turn;
        playerMove = null;
        enemyMove = null;
    }

    document.getElementById("offense").textContent = attacking ? "you're on offense" : "you're on defense";
    document.getElementById("combo").textContent = "current combo:";
    if (combo.length > 0) {
        combo.forEach(move => {
            document.getElementById("combo").textContent += ` ${translate(move)}`;
        });
    } else {
        document.getElementById("combo").textContent += " nothing";
    }

    if (combo.length >= 3) {
        dead();
    }
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    let possible = options.filter(option => !combo.includes(option));
    enemyMove = possible[Math.floor(Math.random() * possible.length)];
    document.getElementById("result").textContent = `last enemy move: ${translate(enemyMove)}`;
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

    // Check if the player is still in the process of matching the required combo sequence
    if (requiredCombo.length > 0 && comboIndex < requiredCombo.length) {
        if (requiredCombo[comboIndex] === playerMove) {
            comboIndex++; // Move to the next move in the sequence
            if (comboIndex < requiredCombo.length) {
                playerMove = null; // Prevent new moves until the sequence is matched
                return;
            }
        } else {
            // Reset if the sequence doesn't match
            comboIndex = 0;
            playerMove = null;
            alert("You must follow the combo sequence before making a new move.");
            return;
        }
    }

    // Add the move to the combo if the entire sequence was matched
    if (comboIndex === requiredCombo.length) {
        combo.push(playerMove);
        requiredCombo = combo.slice(); // Update the requiredCombo with the new sequence
        comboIndex = 0; // Reset comboIndex for the next sequence
    }

    playerMoveHistory[playerMove]++;
    update();
});

update();
document.getElementById("result").textContent = "last enemy move: nothing";
