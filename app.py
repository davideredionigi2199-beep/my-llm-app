from flask import Flask, request, jsonify, render_template
from google import genai # Nuova libreria 2026
import os

app = Flask(__name__)

# --- CONFIGURAZIONE NUOVO SDK GEMINI ---
api_key = os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)
MODEL_ID = "gemini-1.5-flash"

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

    try:
        # Nuova sintassi 2026 per la generazione contenuto
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=input_text,
            config={'system_instruction': 'Sei un cittadino dell’Antica Roma. Rispondi in modo fiero e colto.'}
        )
        
        response_text = response.text
        return jsonify({'response': response_text})
        
    except Exception as e:
        print(f"Errore tecnico: {e}")
        return jsonify({'response': 'Perdonami, i presagi sono oscuri. Verifica la tua API Key su Render.'})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)000))
    app.run(host='0.0.0.0', port=port)