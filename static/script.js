// --- ELEMENTI DELLA PAGINA ---
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const container = document.getElementById('messages-container');
const micBtn = document.getElementById('mic-btn');

// --- 1. FUNZIONE PER AGGIUNGERE MESSAGGI A SCHERMO ---
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    
    // Stile veloce per distinguere i messaggi (se il CSS non bastasse)
    div.style.padding = "10px";
    div.style.margin = "5px";
    div.style.borderRadius = "10px";
    div.style.maxWidth = "80%";
    div.style.alignSelf = sender === 'user' ? "flex-end" : "flex-start";
    div.style.backgroundColor = sender === 'user' ? "#a3862d" : "#8b0000";
    div.style.color = sender === 'user' ? "white" : "#fdfae6";

    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight; // Scroll automatico in basso
}

// --- 2. TEXT TO SPEECH (Il bot parla) ---
function speak(text) {
    if (!window.speechSynthesis) return;
    // Pulizia rapida del testo (toglie emoji per la lettura)
    const cleanText = text.replace(/[\u1000-\uFFFF]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'it-IT';
    window.speechSynthesis.speak(utterance);
}

// --- 3. SPEECH TO TEXT (Il bot ascolta) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('recording');
        micBtn.innerText = "Listening...";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        micBtn.classList.remove('recording');
        micBtn.innerText = "🎤";
        // Invia automaticamente dopo aver parlato
        form.dispatchEvent(new Event('submit'));
    };

    recognition.onerror = () => {
        micBtn.classList.remove('recording');
        micBtn.innerText = "🎤";
    };
}

// --- 4. GESTIONE INVIO MESSAGGIO (Il "Ponte" con Python) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    // Aggiungi bolla utente
    addMessage(message, 'user');
    input.value = '';

    try {
        // CHIAMATA AL SERVER RENDER
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error("Errore server");

        const data = await response.json();
        
        // Aggiungi bolla bot e parla
        addMessage(data.response, 'bot');
        speak(data.response);

    } catch (error) {
        console.error("Errore:", error);
        addMessage("L'oracolo è silente. Controlla la connessione.", 'bot');
    }
});