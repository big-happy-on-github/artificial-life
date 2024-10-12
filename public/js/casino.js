import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODE2MTYzMiwiZXhwIjoyMDQzNzM3NjMyfQ.NLNoMifNOv4seeTLCCV_ZiUmR-YGS7MJnm1bUqZ2B8g'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

const placeBetBtn = document.getElementById('place-bet-btn');
const resultDiv = document.getElementById('result');
const moneyDisplay = document.getElementById('money');

let money = 100;
let selectedGameType = "coin-toss";

placeBetBtn.addEventListener('click', () => {
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > money) {
        resultDiv.textContent = "you can't bet that!";
        return;
    }

    // Deduct bet from fake money
    money -= betAmount;
    updateDisplay();

    if (selectedGameType === "coin-toss") {
        // Simulate win or loss (50/50 chance)
        const win = Math.random() >= 0.5;
    
        if (win) {
            const winnings = betAmount * 2;
            money += winnings;
            resultDiv.textContent = `+$${winnings}! 🟢`;
        } else {
            resultDiv.textContent = `-$${betAmount}. 🔴`;
        }
    }

    updateDisplay();
});

function updateDisplay() {
    moneyDisplay.textContent = `$${money}`;
    getLeaderboard();
}

async function updateVisits() {
    const { data, error: selectError } = await supabase
        .from('visits')
        .select('*')
        .eq('project_name', 'casino');

    // Handle any select errors
    if (selectError) {
        throw selectError;
    }

    // If the row doesn't exist, insert it with num_visits initialized to 1
    if (data.length === 0) {
        const { error: insertError } = await supabase
            .from('visits')
            .insert([{ project_name: 'casino', num_visits: 1 }]);

        if (insertError) {
            throw insertError;
        }

        console.log('Created new row with project_name "casino" and num_visits set to 1');
    } else {
        // If the row exists, update the num_visits by incrementing its value
        const currentVisits = data[0].num_visits || 0; // Default to 0 if num_visits is not found

        const { error: updateError } = await supabase
            .from('visits')
            .update({ num_visits: currentVisits + 1 })
            .eq('project_name', 'casino');

        if (updateError) {
            throw updateError;
        }

        console.log(`Updated num_visits to ${currentVisits + 1} for project_name "casino"`);
    }
}

async function getLeaderboardNames() {
    try {
        const { data, error } = await supabase
            .from('Casino leaderboard')
            .select('name')
            .order('money', { ascending: false });

        if (error) throw error;

        return data.map(entry => entry.name);
    } catch (error) {
        console.error('Error fetching leaderboard names:', error);
        return [];
    }
}

async function submitScore(name, money) {
    // Fetch IP information
    const response = await fetch('https://ipinfo.io/json?token=ca3a9249251d12');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const ipInfo = await response.json();
    console.log(ipInfo);

    try {
        const { error } = await supabase
            .from('Casino leaderboard')
            .insert([{ name: name, money: money, ip: ipInfo }]);

        if (error) throw error;
        console.log('Score successfully submitted!');
    } catch (error) {
        console.error('Error submitting score:', error);
    }
    updateDisplay();
}

async function getName() {
    let leaderboardNames = await getLeaderboardNames();
    console.log(leaderboardNames);

    let nameEmpty = false;
    while (true) {
        if (leaderboardNames) {
            let name = prompt("enter a name for the leaderboard");
            if (!name || name.length < 1) {
                alert("name cannot be empty");
                nameEmpty = true;
            }
            if (name && name.length > 10) {
                alert("name must be under 10 letters");
            } else if (name && leaderboardNames.includes(name.trim())) {
                alert("name already taken");
            } else if (!nameEmpty && name) {
                break;
            }
        }
    }
    
    if (leaderboardNames && name && !nameEmpty) {
        await submitScore(name, money);
        localStorage.setItem("nameSet", JSON.stringify(true));
        console.log("nameSet stored:", localStorage.getItem("nameSet"));  // Add this line
    }
}

if (JSON.parse(localStorage.getItem("nameSet")) != true) {
    getName();
}

if (!localStorage.getItem("gotTop1")) {
    localStorage.setItem("gotTop10", JSON.stringify(money));
    localStorage.setItem("gotTop3", JSON.stringify(money));
    localStorage.setItem("gotTop1", JSON.stringify(money));
}

async function getLeaderboard() {
    document.getElementById("leaderboard").style.display = 'block';
    try {
        const { data, error } = await supabase
            .from('Casino leaderboard')
            .select('*')
            .order('money', { ascending: false });

        if (error) {
            throw error;
        }

        // Clear the current leaderboard display
        while (leaderboard.firstChild) {
            leaderboard.removeChild(leaderboard.firstChild);
        }

        // Display the top 12 entries
        data.slice(0, 3).forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `#${index + 1}, $${entry.money} by ${entry.name}`;
            leaderboard.appendChild(li);
        });

        // Check if the player is contending for top spots
        data.slice(0, 10).forEach((entry, index) => {
            if (money >= entry.money) {
                if (index === 9 && !localStorage.getItem("gotTop10")) {
                    alert("you're in the top 10!");
                    localStorage.setItem("gotTop10", JSON.stringify(true));
                } else if (index === 2 && !localStorage.getItem("gotTop3")) {
                    alert("you're in the top 3!");
                    localStorage.setItem("gotTop3", JSON.stringify(true));
                } else if (index === 0 && !localStorage.getItem("gotTop1")) {
                    alert("you've broken the world record!");
                    localStorage.setItem("gotTop1", JSON.stringify(true));
                }
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    }
}

window.getLeaderboard = getLeaderboard;
