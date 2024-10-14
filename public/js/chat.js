import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODE2MTYzMiwiZXhwIjoyMDQzNzM3NjMyfQ.NLNoMifNOv4seeTLCCV_ZiUmR-YGS7MJnm1bUqZ2B8g'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDisplay() {
    const messages = await getMessages();
    const messageDiv = document.getElementById("messageDiv");

    if (messages) {
        // Clear the current messages first
        messageDiv.innerHTML = "";

        // Limit the messages to the last 5
        const limitedMessages = messages.slice(0, 5);

        limitedMessages.forEach(message => {
            let p = document.createElement("p");
            p.textContent = message;
            messageDiv.prepend(p); // Prepend new messages to the top
        });
    }
}

async function updateVisits() {
    const { data, error: selectError } = await supabase
        .from('visits')
        .select('*')
        .eq('project_name', 'chat');

    if (selectError) throw selectError;

    if (data.length === 0) {
        const { error: insertError } = await supabase
            .from('visits')
            .insert([{ project_name: 'chat', num_visits: 1 }]);

        if (insertError) throw insertError;

        console.log('Created new row with project_name "chat" and num_visits set to 1');
    } else {
        const currentVisits = data[0].num_visits || 0;

        const { error: updateError } = await supabase
            .from('visits')
            .update({ num_visits: currentVisits + 1 })
            .eq('project_name', 'chat');

        if (updateError) throw updateError;

        console.log(`Updated num_visits to ${currentVisits + 1} for project_name "chat"`);
    }
}

async function getMessages() {
    try {
        const { data, error } = await supabase
            .from('Chat messages') // Adjust if needed
            .select('message')
            .order('id', { ascending: false }); // Newest first

        if (error) throw error;

        return data.map(entry => entry.message);
    } catch (error) {
        console.error('Error fetching messages: ', error);
        return [];
    }
}

async function submitMessage(message) {
    if (message.length > 60) {
        alert('message cannot be longer than 60 characters');
        return;
    }

    const response = await fetch('https://ipinfo.io/json?token=ca3a9249251d12');
    if (!response.ok) throw new Error('Network response was not ok');

    const ipInfo = await response.json();
    console.log('IP info:', ipInfo);

    try {
        const { data, error } = await supabase
            .from('Chat messages')
            .insert({ message: message, ip: ipInfo }); // Adjust fields as necessary

        if (error) {
            console.error('Supabase Insert Error:', error);
        } else {
            console.log('Supabase Insert Success:', data);
        }
    } catch (error) {
        console.error('Error submitting message:', error);
    }
    updateDisplay();
}

document.getElementById("sendButton").addEventListener('click', () => {
    const messageInput = document.getElementById("messageInput");
    submitMessage(messageInput.value);
    messageInput.value = "";  // Clear input after sending
});

document.getElementById("privateChatP").addEventListener('click', async () => {
    // Check if the user is currently in a chat by fetching a chat with the user's ID
    const { data: currentChat, error: chatError } = await supabase
        .from('privateChats') // Assuming this is the table you're using
        .select('name, code') // Select only necessary columns
        .eq('user_id', yourUserId) // Replace with actual user ID
        .single();

    if (chatError && chatError.code !== 'PGRST116') { // Error handling, excluding "No rows found" error
        console.error('Error fetching current chat:', chatError);
        return;
    }

    // If the user is in a chat, ask if they want to leave or join another
    if (currentChat) {
        const action = prompt(`You are currently in the chat "${currentChat.name}". Would you like to (1) Leave or (2) Join another chat?`, '1 or 2');
        
        if (action === '1') {
            // Leave the current chat
            await leaveChat();
        } else if (action === '2') {
            // Join a different chat
            await joinChat();
        }
    } else {
        // If not in a chat, prompt to join or create one
        const action = prompt('Would you like to (1) Join an existing chat or (2) Create a new chat?', '1 or 2');
        
        if (action === '1') {
            await joinChat();
        } else if (action === '2') {
            await createChat();
        }
    }
});

// Function to join an existing chat
async function joinChat() {
    const chatCode = prompt('Please enter the chat code:');
    
    const { data: chat, error: joinError } = await supabase
        .from('privateChats')
        .select('*')
        .eq('code', chatCode)
        .single(); // Fetch the chat by its code

    if (joinError || !chat) {
        alert('Chat not found or error occurred.');
        return;
    }

    // Join the chat by updating the user's current chat reference in Supabase
    const { error: updateError } = await supabase
        .from('privateChats')
        .update({ user_id: yourUserId }) // Update user to join this chat (add user ID in your schema if needed)
        .eq('code', chatCode);

    if (updateError) {
        console.error('Error joining chat:', updateError);
    } else {
        alert(`Successfully joined the chat: ${chat.name}`);
        updateDisplay(); // Refresh the chat display
    }
}

// Function to create a new chat
async function createChat() {
    const chatName = prompt('Please enter a name for your new chat:');
    const chatCode = Math.random().toString(36).substr(2, 6); // Generate a random 6-character code

    // Insert new chat into the privateChats table
    const { data, error: createError } = await supabase
        .from('privateChats')
        .insert({ name: chatName, code: chatCode, messages: [], user_id: yourUserId }) // user_id is optional based on your schema

    if (createError) {
        console.error('Error creating chat:', createError);
        return;
    }

    alert(`Created chat "${chatName}" with code: ${chatCode}`);
    updateDisplay(); // Refresh the chat display
}

// Function to leave the current chat
async function leaveChat() {
    // Clear user reference to the chat (or handle as needed)
    const { error: leaveError } = await supabase
        .from('privateChats')
        .update({ user_id: null }) // Adjust based on how you track users in chats
        .eq('user_id', yourUserId);

    if (leaveError) {
        console.error('Error leaving chat:', leaveError);
    } else {
        alert('You have left the chat.');
        updateDisplay();
    }
}

updateDisplay();
updateVisits();
