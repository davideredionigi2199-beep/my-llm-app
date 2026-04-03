// --- ELEMENTI ---
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');
const container = document.getElementById('messages-container');
const micBtn = document.getElementById('mic-btn');

// --- VARIABILE DI STATO (La "memoria" del modo di input) ---
let isVoiceMode = false;

// --- 1. AGGIUNGI MESSAGGI ---
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// --- 2. TEXT TO SPEECH (Solo se richiesto) ---
function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Interrompe eventuali letture precedenti
    const cleanText = text.replace(/[\u1000-\uFFFF]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'it-IT';
    window.speechSynthesis.speak(utterance);
}

// --- 3. SPEECH TO TEXT (Microfono) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';

    micBtn.addEventListener('click', () => {
        isVoiceMode = true; // <--- ATTIVIAMO LA MODALITÀ VOCALE
        recognition.start();
        micBtn.classList.add('recording');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        micBtn.classList.remove('recording');
        
        // Invia il form automaticamente dopo aver parlato
        form.dispatchEvent(new Event('submit'));
    };

    recognition.onerror = () => {
        micBtn.classList.remove('recording');
        isVoiceMode = false; // Reset in caso di errore
    };
}

// --- 4. GESTIONE INVIO (Ponte con Python) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        addMessage(data.response, 'bot');

        // --- IL CONTROLLO SMART ---
        if (isVoiceMode) {
            speak(data.response);
            isVoiceMode = false; // Resetta per il prossimo messaggio (di default sarà testo)
        }

    } catch (error) {
        addMessage("L'oracolo è silente.", 'bot');
        isVoiceMode = false;
    }
});