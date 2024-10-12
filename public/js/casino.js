let fakeMoney = 1000;

document.getElementById('place-bet-btn').addEventListener('click', () => {
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > fakeMoney) {
        alert("Invalid bet amount!");
        return;
    }

    // Deduct bet from fake money
    fakeMoney -= betAmount;
    updateMoneyDisplay();

    // Simulate win or loss (50/50 chance)
    const win = Math.random() >= 0.5;
    const resultDiv = document.getElementById('result');

    if (win) {
        const winnings = betAmount * 2;
        fakeMoney += winnings;
        resultDiv.textContent = `You won $${winnings}!`;
    } else {
        resultDiv.textContent = `You lost $${betAmount}.`;
    }

    updateMoneyDisplay();
    document.getElementById('play-again-btn').style.display = 'block';
});

function updateMoneyDisplay() {
    document.getElementById('fake-money').textContent = fakeMoney;
}

document.getElementById("play-button").addEventListener('click', () => {
    startNewRound();
});

function startNewRound() {
    document.getElementById('bet-amount').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('play-again-btn').style.display = 'none';
}
