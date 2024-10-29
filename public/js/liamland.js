// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

const gameList = [{ name: "liamstd", cost: 0 }, { name: "chat", cost: 0 }, { name: "wheel", cost: 0 }, { name: "shadowboxing", cost: 5 }, { name: "admin", cost: Infinity }];

// Function to add data to Supabase
async function addLimbucks(amount, userID, games) {
    try {
        const { data, error } = await supabase
            .from('limbucks')
            .upsert(
                { userID, amount: amount, games: games }, 
                { onConflict: ['userID'], returning: '*' } // This will return the updated row(s)
            );
        
        if (error) {
            throw error;
        }
        
        console.log('Data inserted or updated:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getLimbucks() {
    const userID = localStorage.getItem("userID") || generateRandomString(50);
    localStorage.setItem("userID", userID);

    try {
        const { data, error } = await supabase
            .from('limbucks')
            .select('amount, games')
            .eq('userID', userID)
            .single();

        try {
            if (error && error.code === 'PGRST116') {
                await addLimbucks(10, userID, {});
                document.getElementById("limbucks").textContent = '10 Limbucks';
            } else if (data) {
                document.getElementById("limbucks").textContent = `${data.amount} Limbucks`;
            }
        } catch {}
    } catch (error) {
        console.error('Error fetching Limbucks:', error);
    }
}

async function showGames() {
    if (window.location.pathname != "/welcome") {
        return;
    }
    const userID = localStorage.getItem("userID") || generateRandomString(50);
    localStorage.setItem("userID", userID);

    try {
        const { data, error } = await supabase
            .from('limbucks')
            .select('games')
            .eq('userID', userID)
            .single();

        const games = data?.games || {};

        gameList.forEach(game => {
            const button = document.getElementById(`${game.name}Button`);
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            if (games[game.name] || game.cost === 0) {
                newButton.textContent = "Play";
                newButton.addEventListener('click', () => window.location.href = `/projects/${game.name}`);
            } else {
                newButton.textContent = `Buy (${game.cost})`;
                newButton.addEventListener('click', () => buy(game.name));
            }
        });
    } catch (error) {
        console.error('Error showing games:', error.message);
    }
}

async function buy(gameName) {
    const userID = localStorage.getItem("userID") || generateRandomString(50);
    localStorage.setItem("userID", userID);

    try {
        const { data, error } = await supabase
            .from('limbucks')
            .select('amount, games')
            .eq('userID', userID)
            .single();

        const userLimbucks = data.amount;
        const userGames = data.games || {};
        const gameToBuy = gameList.find(item => item.name === gameName);

        if (!gameToBuy) {
            alert(`Game ${gameName} not found.`);
            return;
        }
        
        if (userGames[gameName]) {
            alert(`You already own ${gameName}.`);
            return;
        }

        if (userLimbucks >= gameToBuy.cost) {
            if (!confirm("are you sure?")) {
                return;
            }
            const newAmount = userLimbucks - gameToBuy.cost;
            const updatedGames = { ...userGames, [gameToBuy.name]: true };

            const { error: updateError } = await supabase
                .from('limbucks')
                .upsert({ userID, amount: newAmount, games: updatedGames }, { onConflict: ['userID'] });

            if (updateError) {
                throw new Error('Error updating user Limbucks data.');
            }

            alert(`you bought${gameToBuy.name}!`);
            await updateDisplay();
        } else {
            alert(`your ${gameToBuy.cost - userLimbucks} limbucks short!`);
        }

    } catch (error) {
        console.error('Error during the buying process:', error.message);
    }
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function updateDisplay() {
    await showGames();
    await getLimbucks();
}

getLimbucks();
updateDisplay();
