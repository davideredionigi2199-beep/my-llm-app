// --- CONFIGURAZIONE INIZIALE ---
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Funzione per aggiungere un messaggio alla chat
const addMessage = (message, role, imgSrc) => {
    const messageElement = document.createElement('div');
    const textElement = document.createElement('p');
    messageElement.className = `message ${role}`;
    
    const imgElement = document.createElement('img');
    // Usiamo percorsi relativi semplici: funzionano meglio su Render
    imgElement.src = imgSrc; 
    
    messageElement.appendChild(imgElement);
    textElement.innerText = message;
    messageElement.appendChild(textElement);
    messagesContainer.appendChild(messageElement);
    
    // Div di pulizia per il layout float
    const clearDiv = document.createElement("div");
    clearDiv.style.clear = "both";
    messagesContainer.appendChild(clearDiv);
    
    // Auto-scroll verso il basso
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// Funzione principale per inviare il messaggio
const sendMessage = async (message) => {
    // 1. Mostra il messaggio dell'utente
    addMessage(message, 'user', '/static/user.jpeg');
    
    // 2. Crea l'animazione di caricamento
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-animation';
    const loadingText = document.createElement('p');
    loadingText.className = 'loading-text';
    loadingText.innerText = 'L\'Oracolo sta consultando i presagi...';
    
    messagesContainer.appendChild(loadingElement);
    messagesContainer.appendChild(loadingText);

    try {
        // 3. Chiamata al server Flask
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        
        // 4. Rimuovi animazione caricamento
        loadingElement.remove();
        loadingText.remove();

        // 5. Gestione risposta o errore
        if (data.response) {
            addMessage(data.response, 'aibot', '/static/Bot_logo.png');
        } else {
            addMessage("Perdonami, i fili del destino si sono intrecciati male.", 'error', '/static/Bot_logo.png');
        }

    } catch (error) {
        console.error('Error:', error);
        loadingElement.remove();
        loadingText.remove();
        addMessage("Errore di connessione col server imperiale.", 'error', '/static/Bot_logo.png');
    }
};

// Gestore dell'invio modulo
messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (message !== '') {
        messageInput.value = '';
        await sendMessage(message);
    }
});