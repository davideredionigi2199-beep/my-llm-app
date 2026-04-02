from flask import Flask, request, jsonify, render_template
from google import genai
import os
import sys

app = Flask(__name__)

# Configurazione API Key
api_key = os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

# PROVIAMO IL NOME COMPLETO (Sintassi ufficiale 2026)
# Se questo fallisce, prova "gemini-1.5-flash-latest"
MODEL_ID = "models/gemini-1.5-flash" 

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        input_text = data.get('message', '')
        
        if not input_text:
            return jsonify({'response': 'Messaggio vuoto.'})

        # Log di controllo per Render
        print(f"Richiesta inviata al modello: {MODEL_ID}", file=sys.stderr)

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=input_text
        )
        
        return jsonify({'response': response.text})
        
    except Exception as e:
        print(f"ERRORE API: {str(e)}", file=sys.stderr)
        # Se ricevi ancora 404, il server ti risponderà con questo messaggio chiaro
        return jsonify({'response': f"Errore 404: Modello '{MODEL_ID}' non trovato. Riprova con un altro ID."})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)