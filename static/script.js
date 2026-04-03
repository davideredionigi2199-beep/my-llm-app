// --- ELEMENTI ---
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const container = document.getElementById('messages-container');
const micBtn = document.getElementById('mic-btn');

// --- STATO ---
let isVoiceMode = false;

// --- 1. FUNZIONE MESSAGGI (OTTIMIZZATA PER CSS) ---
function addMessage(text, sender) {
    const div = document.createElement('div');
    // Applica le classi 'message' e 'user' o 'bot'
    div.classList.add('message', sender);
    
    // Inseriamo il testo
    div.innerText = text;
    
    container.appendChild(div);
    
    // Scroll automatico immediato verso l'ultimo messaggio
    container.scrollTop = container.scrollHeight;
}

// --- 2. SINTESI VOCALE (IL BOT PARLA) ---
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    
    // Interrompe eventuali letture in corso prima di iniziare la nuova
    window.speechSynthesis.cancel(); 
    
    const cleanText = text.replace(/[\u1000-\uFFFF]/g, ''); // Toglie emoji
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'it-IT';
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
}

// --- 3. RICONOSCIMENTO VOCALE (IL BOT ASCOLTA) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        isVoiceMode = true; // Attiva la modalità "parlata"
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

    // 1. Mostra il messaggio dell'utente a schermo
    addMessage(message, 'user');
    input.value = '';

    try {
        // 2. Chiamata al server Python
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error('Errore di rete');

        const data = await response.json();
        
        // 3. Mostra la risposta del bot
        addMessage(data.response, 'bot');

        // 4. Se avevi usato il microfono, il bot risponde a voce
        if (isVoiceMode) {
            speak(data.response);
            isVoiceMode = false; // Torna in modalità testo per il prossimo giro
        }

    } catch (error) {
        console.error('Chat Error:', error);
        addMessage("L'oracolo ha perso il contatto con gli dèi (Errore di connessione).", 'bot');
        isVoiceMode = false;
    }
});