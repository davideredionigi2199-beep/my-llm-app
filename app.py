from flask import Flask, request, jsonify, render_template
from google import genai
import os

app = Flask(__name__)

# Configurazione API Key
api_key = os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

# Modello stabile 2026 per evitare blocchi di quota (429)
MODEL_ID = "gemini-1.5-flash" 

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        input_text = data.get('message', '')
        
        if not input_text:
            return jsonify({'response': 'Nessun messaggio ricevuto.'})

        # Risposta standard di Gemini (senza istruzioni di sistema forzate)
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=input_text
        )
        
        return jsonify({'response': response.text})
        
    except Exception as e:
        if "429" in str(e):
            return jsonify({'response': 'Limite di richieste raggiunto. Attendi un momento.'})
        return jsonify({'response': f"Errore tecnico: {str(e)[:50]}..."})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)