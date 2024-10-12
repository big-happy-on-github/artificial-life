let money = 100;
let selectedGameType = "coin-toss";

document.getElementById('place-bet-btn').addEventListener('click', () => {
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    const resultDiv = document.getElementById('result');
    
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
    document.getElementById('money').textContent = money;
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
