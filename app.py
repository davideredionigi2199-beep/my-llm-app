from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from deep_translator import GoogleTranslator
from langdetect import detect # Nuova libreria per il rilevamento lingua

app = Flask(__name__)

# Configurazione del Chatbot
model_name = "facebook/blenderbot-400M-distill"
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

conversation_history = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    global conversation_history
    
    data = request.get_json()
    input_text = data.get('message', '')
    
    # 1. RILEVAMENTO LINGUA
    # Capisce se stai scrivendo in 'it' (italiano), 'en' (inglese), ecc.
    try:
        user_lang = detect(input_text)
    except:
        user_lang = 'it' # Se inserisci solo numeri o punteggiatura, assume italiano
        
    # 2. TRADUZIONE IN INGRESSO (Solo se non è inglese)
    if user_lang != 'en':
        input_text_en = GoogleTranslator(source='auto', target='en').translate(input_text)
    else:
        input_text_en = input_text # Se è già inglese, non fa nulla
        
    # 3. GESTIONE DELLA MEMORIA (Il fix per la coerenza!)
    # Teniamo solo gli ultimi 4 elementi (ovvero le tue ultime 2 domande e le 2 risposte del bot)
    if len(conversation_history) > 4:
        conversation_history = conversation_history[-4:]
        
    # 4. Preparazione del contesto (Blenderbot preferisce i doppi spazi)
    history_string = "  ".join(conversation_history)
    
    # 5. Generazione risposta con parametri ottimizzati
    inputs = tokenizer(history_string + "  " + input_text_en, return_tensors="pt")
    
    # max_new_tokens: impedisce al bot di dilungarsi troppo
    # temperature=0.7: lo rende un po' più creativo ma senza farlo impazzire
    outputs = model.generate(
        **inputs, 
        max_new_tokens=60, 
        do_sample=True, 
        temperature=0.7,
        pad_token_id=tokenizer.eos_token_id
    )
    response_en = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
    
    # 6. Aggiornamento cronologia (Salviamo sempre il "pensiero" in inglese)
    conversation_history.append(input_text_en)
    conversation_history.append(response_en)
    
    # 7. TRADUZIONE IN USCITA (Torna alla tua lingua)
    if user_lang != 'en':
        final_response = GoogleTranslator(source='en', target=user_lang).translate(response_en)
    else:
        final_response = response_en
        
    return jsonify({'response': final_response})

if __name__ == '__main__':
    app.run(debug=True)