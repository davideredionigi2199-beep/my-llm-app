// --- ELEMENTI ---
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const container = document.getElementById('messages-container');
const micBtn = document.getElementById('mic-btn');

// --- STATO ---
let isVoiceMode = false;

// --- 1. FUNZIONE MESSAGGI (CON ICONE E STRUTTURA DINAMICA) ---
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);

    // Creazione dell'Avatar
    const img = document.createElement('img');
    img.classList.add('message-icon');
    // Carica l'immagine corretta dalla cartella static
    img.src = sender === 'user' ? "/static/user.jpeg" : "/static/Bot_logo.png";
    img.alt = sender;

    // Contenitore del testo (per gestire il contrasto e il layout)
    const textSpan = document.createElement('span');
    textSpan.innerText = text;

    // Assembliamo la bolla: Avatar + Testo
    div.appendChild(img);
    div.appendChild(textSpan);

    container.appendChild(div);

    // Scroll automatico verso l'ultimo messaggio
    container.scrollTop = container.scrollHeight;
}

// --- 2. SINTESI VOCALE (IL BOT PARLA) ---
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    
    // Interrompe letture precedenti per evitare sovrapposizioni
    window.speechSynthesis.cancel(); 
    
    // Pulizia testo (toglie caratteri speciali/markdown per una lettura fluida)
    const cleanText = text.replace(/[*#_]/g, '').replace(/[\u1000-\uFFFF]/g, ''); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'it-IT';
    utterance.pitch = 1.0;
    utterance.rate = 1.1; // Leggermente più veloce per naturalezza
    
    window.speechSynthesis.speak(utterance);
}

// --- 3. RICONOSCIMENTO VOCALE (IL BOT ASCOLTA) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        isVoiceMode = true; // Attiva risposta vocale
        recognition.start();
        micBtn.classList.add('recording');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        micBtn.classList.remove('recording');
        
        // Invia automaticamente il messaggio una volta trascritto
        form.dispatchEvent(new Event('submit'));
    };

    recognition.onerror = () => {
        micBtn.classList.remove('recording');
        isVoiceMode = false;
    };
    
    recognition.onend = () => {
        micBtn.classList.remove('recording');
    };
}

// --- 4. GESTIONE INVIO (PONTE CON IL SERVER) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = input.value.trim();
    if (!message) return;

    // 1. Mostra il messaggio dell'utente con la sua icona
    addMessage(message, 'user');
    input.value = '';

    try {
        // 2. Chiamata al server Python su Render
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error('Errore di rete');

        const data = await response.json();
        
        // 3. Mostra la risposta del bot con la sua icona
        addMessage(data.response, 'bot');

        // 4. Se è stata usata la voce, l'oracolo risponde