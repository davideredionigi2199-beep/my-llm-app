from flask import Flask, request, jsonify, render_template
from google import genai
import os
import sys

app = Flask(__name__)

# --- CONTROLLO CHIAVE AL DEPLOY ---
api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("ERRORE CRITICO: La variabile GOOGLE_API_KEY è VUOTA!")
else:
    # Stampa i primi 4 e ultimi 4 caratteri per verifica
    print(f"CHIAVE TROVATA: {api_key[:4]}...{api_key[-4:]}")

try:
    client = genai.Client(api_key=api_key)
    print("CLIENT GEMINI: Inizializzato correttamente.")
except Exception as e:
    print(f"ERRORE INIZIALIZZAZIONE CLIENT: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        input_text = data.get('message', '')
        
        if not input_text:
            return jsonify({'response': 'Ave! Non ho udito nulla.'})

        # Chiamata a Gemini
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=input_text
        )
        
        # Se arriviamo qui, ha funzionato
        return jsonify({'response': response.text})
        
    except Exception as e:
        # Forza la scrittura nei log di Render
        print(f"ERRORE DURANTE LA CHAT: {str(e)}", file=sys.stderr)
        return jsonify({'response': f"Errore Tecnico: {str(e)[:50]}..."})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)