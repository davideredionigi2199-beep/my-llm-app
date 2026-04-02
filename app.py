from flask import Flask, request, jsonify, render_template
from google import genai
import os
import sys

app = Flask(__name__)

# Configurazione API Key
api_key = os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

# NEL 2026 IL MODELLO STANDARD È IL 2.0
MODEL_ID = "gemini-2.0-flash" 

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

        # Chiamata a Gemini 2.0 con istruzioni di sistema
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=input_text,
            config={
                'system_instruction': 'Sei un fiero cittadino dell’Antica Roma. Rispondi in italiano con un tono solenne, colto e imperiale. Usa termini come "Ave", "Cittadino", "Per Giove".'
            }
        )
        
        return jsonify({'response': response.text})
        
    except Exception as e:
        # Questo ci aiuterà a vedere nei Log di Render se il modello 2.0 è accettato
        print(f"ERRORE API GEMINI: {str(e)}", file=sys.stderr)
        return jsonify({'response': f"Errore Tecnico: {str(e)[:50]}..."})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)