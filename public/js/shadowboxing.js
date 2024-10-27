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
    playerMoveHistory = { n: 0, e: 0, s: 0, w: 0 };
    document.getElementById("result").textContent = "last enemy move: nothing";
    playerMove = null;
    enemyMove = null;
    combo = [];
    update();
}

function translate(direction) {
    if (direction == "n") return "up";
    if (direction == "e") return "right";
    if (direction == "s") return "down";
    if (direction == "w") return "left";
}

function update() {
    if (turn == 1 && playerMove) {
        if (!enemyMove) {
            console.log("calculating");
            calculate();
            return;
        }
        if (playerMove == enemyMove) {
            combo.push(playerMove);
            movesToDo = combo.length;
        } else {
            combo = [];
            turn = 1 - turn;
        }
        attacking = turn;
        playerMove = null;
        enemyMove = null;
    }

    document.getElementById("offense").textContent = attacking ? "you're on offense" : "you're on defense";
    document.getElementById("combo").textContent = "current combo: " + (combo.length ? combo.map(translate).join(" ") : "nothing");

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
    switch (event.key) {
        case 'ArrowUp': playerMove = "n"; break;
        case 'ArrowDown': playerMove = "s"; break;
        case 'ArrowLeft': playerMove = "w"; break;
        case 'ArrowRight': playerMove = "e"; break;
        default: return;
    }

    if (combo.length > 0 && playerMove == combo[combo.length - movesToDo]) {
        movesToDo--;
        document.getElementById("result").textContent = `last enemy move: ${translate(combo[combo.length - movesToDo - 1])}`;
        if (movesToDo == 0) {
            playerMoveHistory[playerMove]++;
            update();
        }
    } else if (combo.includes(playerMove)) {
        alert("You already went that direction in the combo. Please continue the correct sequence.");
        playerMove = null;
        return;
    } else {
        alert("Incorrect move! Repeat the combo in the correct order.");
        playerMove = null;
        return;
    }
});

update();
document.getElementById("result").textContent = "last enemy move: nothing";
