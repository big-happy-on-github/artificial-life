import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`, { mode: 'no-cors' });
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

let turn = 0; //false for enemy true for player
let playerMove; //string "n", "e", "s", "w"
let enemyMove; //string "n", "e", "s", "w"
let combo = []; //max 2, if 3 than call dead()

function dead() {
    turn ? alert("you won!") : alert("you lost :(");
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
    } if (!turn) {
        calculate();
    } if (playerMove || enemyMove) {
        if (playerMove == enemyMove) {
            combo++;
        }
        playerMove = null;
        enemyMove = null;
    console.log(combo);
    console.log(turn);
}

function calculate() {
    const options = ["n", "e", "s", "w"];
    options.forEach(option => {
        combo.forEach(comboMove => {
            if (option != comboMove) {
                enemyMove = option;
                return;
            }
        });
    });
}

// Handle player movement with arrow keys
document.addEventListener('keydown', (event) => {
    if (turn) {
        combo.forEach(move => {
            if (playerMove == move) {
                alert("cannot go the same direction more than once");
            }
            return;
        });
    
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
        }
        update();
    }
});
