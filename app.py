from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os

app = Flask(__name__)

# --- CONFIGURAZIONE GEMINI SICURA ---
# Render leggerà la chiave dalla "cassaforte" (Environment Variables)
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("ERRORE: GOOGLE_API_KEY non trovata nelle variabili d'ambiente!")

# Memoria della conversazione (formato Google)
chat_session_history = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    global chat_session_history
    
    data = request.get_json()
    input_text = data.get('message', '')
    
    if not input_text:
        return jsonify({'response': 'Ave, non ho udito nulla.'})

    # Manteniamo gli ultimi 10 scambi per la memoria
    if len(chat_session_history) > 20:
        chat_session_history = chat_session_history[-20:]
    
    try:
        # Chiamata a Gemini: risponde direttamente in italiano, zero traduttori!
        response = model.generate_content(chat_session_history + [{"role": "user", "parts": [input_text]}])
        response_text = response.text.strip()
        
        # Aggiorniamo la cronologia
        chat_session_history.append({"role": "user", "parts": [input_text]})
        chat_session_history.append({"role": "model", "parts": [response_text]})
        
        return jsonify({'response': response_text})
        
    except Exception as e:
        print(f"Errore: {e}")
        return jsonify({'response': 'Perdonami, i presagi sono oscuri. Riprova più tardi.'})

if __name__ == '__main__':
    # In locale usa la porta 5000, su Render userà quella assegnata dal sistema
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)