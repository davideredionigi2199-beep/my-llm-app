// --- CONFIGURAZIONE VOCALE ---
const micBtn = document.getElementById('mic-btn');
const inputField = document.getElementById('message-input');

// 1. SPEECH TO TEXT (Il bot ci ascolta)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('recording');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        inputField.value = transcript;
        micBtn.classList.remove('recording');
        // Opzionale: invia automaticamente il messaggio appena finito di parlare
        // document.getElementById('message-form').dispatchEvent(new Event('submit'));
    };

    recognition.onspeechend = () => {
        recognition.stop();
        micBtn.classList.remove('recording');
    };
} else {
    micBtn.style.display = 'none'; // Nascondi se il browser non lo supporta
}

// 2. TEXT TO SPEECH (Il bot ci parla)
function speak(text) {
    // Rimuoviamo eventuali emoji o caratteri strani per una lettura pulita
    const cleanText = text.replace(/[\u1000-\uFFFF]/g, ''); 
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'it-IT';
    utterance.rate = 1.0; // Velocità solenne
    utterance.pitch = 0.9; // Tono leggermente più profondo (più autoritario)
    
    window.speechSynthesis.speak(utterance);
}

// 3. INTEGRAZIONE NELLA CHAT
// Nel tuo codice dove ricevi la risposta dal server (dentro fetch.then):
// Esempio:
/*
   fetch('/chat', ...)
   .then(response => response.json())
   .then(data => {
       addMessage(data.response, 'bot');
       speak(data.response); // <--- AGGIUNGI QUESTA RIGA QUI
   });
*/  