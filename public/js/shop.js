// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`);
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

const list = [{
    name: "mitch_LiamsTD",
    cost: 10
}, {
    name: "declan_LiamsTD",
    cost: 10
}];

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
            .select('*')
            .eq('userID', userID)
            .single();

        try {
            if (error && error.code === 'PGRST116') {
                await addLimbucks(10, userID, {});
            } else if (data) {
                return data;
            }
        } catch {}
    } catch (error) {
        console.error('Error fetching Limbucks:', error);
    }
}

list.forEach(item => {
    document.getElementById(item.name).addEventListener('click', () => {
        purchase(item);
    });
});

async function purchase(item) {
    const user = await getLimbucks();
    if (user.amount >= item.cost) {
        if (confirm(`are you sure?`)) {
            await addLimbucks(user.amount-item.cost, user.userID, user.games);
            alert("successfully bought the item")
            return;
        }
    } else {
        alert("you don't have enough money");
        return;
    }
}
