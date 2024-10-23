import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const response1 = await fetch(`/.netlify/functions/well-kept?name=supabaseUrl`, { mode: 'no-cors' });
const supabaseUrl = JSON.parse(await response1.text());
const response2 = await fetch(`/.netlify/functions/well-kept?name=supabaseKey`, { mode: 'no-cors' });
const supabaseKey = JSON.parse(await response2.text());
const supabase = createClient(supabaseUrl, supabaseKey);

// Use localStorage to get the user ID
const playerId = localStorage.getItem('userID');

async function getRanking() {
    const { data, error } = await supabase
        .from('shadowboxing_rankings')
        .select('ranking')
        .eq('player_id', playerId)
        .single();
    
    if (error) throw error;
    return data ? data.ranking : 1000; // Default ranking if not found
}

async function updateDisplay() {
    const { data, error } = await supabase
        .from('shadowboxing_games')
        .select('*')
        .eq('status', 'ongoing');
    
    if (error) throw error;

    // Display active shadowboxing_games
    console.log('Active shadowboxing_games:', data);
}

async function findshadowboxing_games() {
    const { data, error } = await supabase
        .from('shadowboxing_games')
        .select('*')
        .eq('status', 'waiting');

    if (error) throw error;

    return data; // List of shadowboxing_games waiting for an opponent
}

async function play(gameId, playerMove) {
    // Submit the player's move for the current game
    const { error } = await supabase
        .from('shadowboxing_shadowboxing_game_moves')
        .insert([{ game_id: gameId, player_id: playerId, player_move: playerMove, timestamp: new Date() }]);

    if (error) throw error;

    console.log('Move submitted');
}

function calculateScore(currentRanking, enemyRanking) {
    const kFactor = 32; // The factor used in ranking adjustments
    const expectedScore = 1 / (1 + Math.pow(10, (enemyRanking - currentRanking) / 400));
    const score = 1; // Assuming you win (adjust accordingly: 0 for loss, 0.5 for draw)
    
    const newRanking = currentRanking + kFactor * (score - expectedScore);
    return Math.round(newRanking);
}

async function submitRanking(newRanking) {
    const { error } = await supabase
        .from('shadowboxing_rankings')
        .upsert({ player_id: playerId, ranking: newRanking }, { onConflict: ['player_id'] });

    if (error) throw error;
    console.log('Ranking updated');
}

async function createGame() {
    const { error } = await supabase
        .from('shadowboxing_games')
        .insert([{ player_1: playerId, status: 'waiting' }]);

    if (error) throw error;
    console.log('Game created and waiting for an opponent');
}

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

// Subscribe to real-time updates for game moves
supabase
  .channel('realtime_moves')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shadowboxing_shadowboxing_game_moves' }, (payload) => {
    console.log('Move received!', payload);
    // Handle real-time move updates (e.g., opponent's move)
  })
  .subscribe();

// Function to periodically update the display of ongoing shadowboxing_games
updateDisplay();
updateVisits();
setInterval(updateDisplay, 1000); // Update every second to reflect ongoing shadowboxing_games
