from flask import Flask, request, jsonify, render_template
from google import genai
import os
import sys

app = Flask(__name__)

# Configurazione API Key dalle variabili d'ambiente di Render
api_key = os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

# Modello stabile 2026 (LTS)
MODEL_ID = "gemini-2.5-flash"

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

        # Log di controllo per Render (visibile nella dashboard)
        print(f"Richiesta inviata a {MODEL_ID}: '{input_text[:20]}...'", file=sys.stderr)

        # Chiamata con Istruzioni di Sistema per correggere la data
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=input_text,
            config={
                'system_instruction': (
                    "Oggi è il 3 aprile 2026. Sei un assistente AI avanzato, utile e preciso. "
                    "Rispondi in modo cordiale e professionale in lingua italiana."
                )
            }
        )
        
        return jsonify({'response': response.text})
        
    except Exception as e:
        error_msg = str(e)
        print(f"ERRORE API: {error_msg}", file=sys.stderr)
        
        # Gestione specifica dell'errore di quota (429)
        if "429" in error_msg:
            return jsonify({'response': "Spiacente, l'oracolo ha esaurito la sua energia per oggi. Riprova più tardi."})
        
        return jsonify({'response': f"Errore tecnico: {error_msg[:50]}..."})

if __name__ == '__main__':
    # Render assegna una porta dinamica, la leggiamo da qui
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)