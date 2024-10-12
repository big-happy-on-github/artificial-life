let money = 100;

document.getElementById('place-bet-btn').addEventListener('click', () => {
    const betAmount = parseInt(document.getElementById('bet-amount').value);
    const resultDiv = document.getElementById('result');
    
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > fakeMoney) {
        resultDiv.textContent = "you can't bet that!";
        return;
    }

    // Deduct bet from fake money
    fakeMoney -= betAmount;
    updateDisplay();

    // Simulate win or loss (50/50 chance)
    const win = Math.random() >= 0.5;

    if (win) {
        const winnings = betAmount * 2;
        fakeMoney += winnings;
        resultDiv.textContent = `+$${winnings}! 🟢`;
    } else {
        resultDiv.textContent = `-$${betAmount}. 🔴`;
    }

    updateMoneyDisplay();
});

function updateDisplay() {
    document.getElementById('fake-money').textContent = fakeMoney;
}
