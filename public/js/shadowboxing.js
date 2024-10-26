import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`);
const supabaseUrl = await response1.json();
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = await response2.json();
const supabase = createClient(supabaseUrl, supabaseKey);

let turn = 0; // false for enemy, true for player
let playerMove = null; // "n", "e", "s", "w"
let enemyMove = null; // "n", "e", "s", "w"
let combo = []; // stores matching moves, max 2, calls dead() if 3

function dead() {
    turn ? alert("You won!") : alert("You lost :(");
    restart();
}

function restart() {
    turn = 0;
    playerMove = null;
    enemyMove = null;
    combo = [];
}

function update() {
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
        }
        playerMove = null;
        enemyMove = null;
        turn = 1 - turn; // Alternate turns
    }
    console.log(combo);
    console.log(turn);
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    enemyMove = options.find(option => !combo.includes(option)) || "n"; // Pick a different move
}

document.addEventListener('keydown', (event) => {
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
                return; // Ignore other keys
        }
        update();
    }
});

update();
