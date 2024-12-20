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
    alert(attacking ? "congrats my brotha 👏" : "imagine losing to a computer 💀");
    restart();
}

function restart() {
    alert("play again?");
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
            // Update required combo
            requiredCombo = combo.slice();
            comboIndex = 0; // Reset combo index after updating required combo
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
    document.getElementById("img").src = `/img/shadowboxing_${attacking ? "defense" : "offense"}_${translate(enemyMove)}`;
    update(); // Call update to process the enemy move
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            playerMove = "n";
            break;
        case 'ArrowDown':
        case 's':
            playerMove = "s";
            break;
        case 'ArrowLeft':
        case 'a':
            playerMove = "w";
            break;
        case 'ArrowRight':
        case 'd':
            playerMove = "e";
            break;
        default:
            return; 
    }

    if (comboIndex != requiredCombo.length) {
        // Check if player matches the required combo sequence
        if (requiredCombo.length > 0 && requiredCombo[comboIndex] == playerMove) {
            comboIndex++; // Move to the next required move in the combo sequence
            console.log(comboIndex, ":", requiredCombo.length);
            if (comboIndex < requiredCombo.length) {
                playerMove = null; // Not ready for a new move yet
            }
            document.getElementById("result").textContent = `last enemy move: ${translate(playerMove)}`;
            document.getElementById("img").src = `/img/shadowboxing_${attacking ? "defense" : "offense"}_${translate(playerMove)}`;
            return;
        } else if (requiredCombo.length > 0) {
            // Reset comboIndex if player doesn't match the required sequence
            comboIndex = 0;
            playerMove = null;
            alert("you gotta follow the combo before making a new move");
            return;
        }
    }

    playerMoveHistory[playerMove]++;
    update();
});

async function updateVisits() {
    const { data, error: selectError } = await supabase
        .from('visits')
        .select('*')
        .eq('project_name', 'shadowboxing');

    if (selectError) throw selectError;

    if (data.length === 0) {
        const { error: insertError } = await supabase
            .from('visits')
            .insert([{ project_name: 'shadowboxing', num_visits: 1 }]);

        if (insertError) throw insertError;

        console.log('Created new row with project_name "shadowboxing" and num_visits set to 1');
    } else {
        const currentVisits = data[0].num_visits || 0;

        const { error: updateError } = await supabase
            .from('visits')
            .update({ num_visits: currentVisits + 1 })
            .eq('project_name', 'shadowboxing');

        if (updateError) throw updateError;

        console.log(`Updated num_visits to ${currentVisits + 1} for project_name "shadowboxing"`);
    }
}

updateVisits();
update();
document.getElementById("result").textContent = "last enemy move: nothing";
