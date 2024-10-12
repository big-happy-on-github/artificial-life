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

    if (selectedGameType == "coin-toss") {
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

    updateMoneyDisplay();
});

function updateDisplay() {
    moneyDisplay.textContent = `$${money}`;
}

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

if (localStorage.getItem("gotTop1") == null) {
    localStorage.setItem("gotTop10", money);
    localStorage.setItem("gotTop3", money);
    localStorage.setItem("gotTop1", money);
}

async function getLeaderboard() {
    document.getElementById("leaderboard").style.display = 'block';
    try {
        const { data, error } = await supabase
            .from('Casino leaderboard')
            .select('*')
            .order('money', { ascending: false }); // Sort by wave descending

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
                if (index === 9 && !gotTop10) {
                    alert("you're in the top 10!");
                    localStorage.setItem("gotTop10", true);
                } else if (index === 2 && !gotTop3) {
                    alert("you're in the top 3!");
                    localStorage.setItem("gotTop3", true);
                } else if (index === 0 && !gotTop1) {
                    alert("you've broken the world record!");
                    localStorage.setItem("gotTop1", true);
                }
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    }
}

window.getLeaderboard = getLeaderboard;
