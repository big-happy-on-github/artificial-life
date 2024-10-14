import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kjfnxynntottdbxjcree.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZm54eW5udG90dGRieGpjcmVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODE2MTYzMiwiZXhwIjoyMDQzNzM3NjMyfQ.NLNoMifNOv4seeTLCCV_ZiUmR-YGS7MJnm1bUqZ2B8g'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDisplay() {
    let currentChatCode = localStorage.getItem('currentChatCode'); // Fetch the current chat from localStorage
    if (!currentChatCode) {
        console.log("No chat selected.");
        localStorage.setItem("currentChatCode", "1i0k0u");
        currentChatCode = localStorage.getItem('currentChatCode'); // Fetch the current chat from localStorage
    }

    // Fetch messages for the current private chat
    const { data: chat, error } = await supabase
        .from('privateChats')
        .select('messages')
        .eq('code', currentChatCode)
        .single();

    if (error || !chat) {
        console.error('Error fetching chat messages:', error);
        return;
    }

    const messageDiv = document.getElementById("messageDiv");

    if (chat.messages) {
        // Clear the current messages first
        messageDiv.innerHTML = "";

        // Limit the messages to the last 5
        const limitedMessages = chat.messages.slice(-8);

        limitedMessages.forEach(message => {
            let p = document.createElement("p");

            // Display the message text (assuming it's stored under the "text" field), with IP and timestamp
            const messageText = message.text;
            
            p.textContent = messageText;
            messageDiv.append(p); // Prepend new messages to the top
        });
    }

    // Fetch messages for the current private chat
    const { data: name, error: error2 } = await supabase
        .from('privateChats')
        .select('name')
        .eq('code', currentChatCode)

    document.getElementById("h3").textContent = `${name[0].name} - ${currentChatCode}`;
}

// Update the chat message submission logic
async function submitMessage(message) {
    if (message.length > 60) {
        alert('message cannot be longer than 60 characters');
        return;
    } else if (message.length < 1 || message == "") {
        return;
    }

    let currentChatCode = localStorage.getItem('currentChatCode'); // Fetch the current chat code
    if (!currentChatCode) {
        localStorage.setItem("currentChatCode", "1i0k0u");
        currentChatCode = localStorage.getItem('currentChatCode'); // Fetch the current chat code
    }

    const response = await fetch('https://ipinfo.io/json?token=ca3a9249251d12');
    if (!response.ok) throw new Error('Network response was not ok');

    const ipInfo = await response.json();
    console.log('IP info:', ipInfo);

    try {
        // Fetch current chat's messages
        const { data: chat, error: fetchError } = await supabase
            .from('privateChats')
            .select('messages')
            .eq('code', currentChatCode)
            .single();

        if (fetchError || !chat) {
            console.error('Error fetching chat for message submission:', fetchError);
            alert("you have an outdated chat code... try again now");
            localStorage.setItem("currentChatCode", "1i0k0u");
            return;
        }

        // Append the new message
        const updatedMessages = [...chat.messages, { text: message, ip: ipInfo, timestamp: new Date().toISOString() }];

        // Update the chat's messages
        const { error: updateError } = await supabase
            .from('privateChats')
            .update({ messages: updatedMessages })
            .eq('code', currentChatCode);

        if (updateError) {
            console.error('Supabase Update Error:', updateError);
        } else {
            console.log('Message submitted successfully.');
        }

    } catch (error) {
        console.error('Error submitting message:', error);
    }

    updateDisplay(); // Refresh the message display
}

document.getElementById("sendButton").addEventListener('click', () => {
    const messageInput = document.getElementById("messageInput");
    submitMessage(messageInput.value);
    messageInput.value = "";  // Clear input after sending
});

// Chat selection (join, create, leave) logic
document.getElementById("privateChatP").addEventListener('click', async () => {
    const currentChatCode = localStorage.getItem('currentChatCode'); // Check if user is already in a chat

    if (currentChatCode && currentChatCode != "1i0k0u") {
        const action = prompt('would you like to (1) leave your current chat or (2) join a new chat?');

        if (action === '1') {
            // Leave current chat
            localStorage.removeItem('currentChatCode');
            alert('You have left the chat.');
            updateDisplay(); // Clear the display
        } else if (action === '2') {
            // Join a different chat
            await joinChat();
        }
    } else {
        const action = prompt('do you want to (1) join an existing chat or (2) create a new chat?');
        
        if (action === '1') {
            await joinChat();
        } else if (action === '2') {
            await createChat();
        }
    }
});

// Function to join an existing chat
async function joinChat() {
    const chatCode = prompt('whats the code?');
    
    const { data: chat, error: joinError } = await supabase
        .from('privateChats')
        .select('*')
        .eq('code', chatCode)
        .single();

    if (joinError || !chat) {
        alert('Chat not found or error occurred.');
        return;
    }

    // Store the chat code in localStorage to track the current chat
    localStorage.setItem('currentChatCode', chat.code);
    alert(`joined ${chat.name}`);
    updateDisplay(); // Refresh the chat display
}

// Function to create a new chat
async function createChat() {
    const chatName = prompt('what should it be called?');
    const chatCode = Math.random().toString(36).substr(2, 6); // Generate a random 6-character code

    // Insert new chat into the privateChats table
    const { data, error: createError } = await supabase
        .from('privateChats')
        .insert({ name: chatName, code: chatCode, messages: [] });

    if (createError) {
        console.error('Error creating chat:', createError);
        return;
    }

    // Store the new chat code in localStorage
    localStorage.setItem('currentChatCode', chatCode);
    alert(`created "${chatName}" with code ${chatCode} (copy this)`);
    updateDisplay(); // Refresh the chat display
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

document.getElementById("sendButton").addEventListener('click', () => {
    const messageInput = document.getElementById("messageInput");
    submitMessage(messageInput.value);
    messageInput.value = "";  // Clear input after sending
});

updateDisplay();
updateVisits();
setInterval(updateDisplay, 1000);
