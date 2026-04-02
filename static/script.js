let savedpasttext = []; // Variable to store the message
let savedpastresponse = []; // Variable to store the message

// Section: get the Id of the talking container
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Section: function to create the dialogue window
const addMessage = (message, role, imgSrc) => {
  // create elements in the dialogue window
  const messageElement = document.createElement('div');
  const textElement = document.createElement('p');
  messageElement.className = `message ${role}`;
  const imgElement = document.createElement('img');
  imgElement.src = `${imgSrc}`;
  // append the image and message to the message element
  messageElement.appendChild(imgElement);
  textElement.innerText = message;
  messageElement.appendChild(textElement);
  messagesContainer.appendChild(messageElement);
  // create the ending of the message
  var clearDiv = document.createElement("div");
  clearDiv.style.clear = "both";
  messagesContainer.appendChild(clearDiv);
};

// Section: Calling the model
const sendMessage = async (message) => {
  addMessage(message, 'user','../static/user.jpeg');
  
  // Loading animation
  const loadingElement = document.createElement('div');
  const loadingtextElement = document.createElement('p');
  loadingElement.className = `loading-animation`;
  loadingtextElement.className = `loading-text`;
  loadingtextElement.innerText = 'Loading....Please wait';
  messagesContainer.appendChild(loadingElement);
  messagesContainer.appendChild(loadingtextElement);

  async function makePostRequest(msg) {
    // CORREZIONE 1: Puntiamo alla rotta corretta del nostro server Flask
    const url = '/chat';  
    
    // CORREZIONE 2: Allineiamo il nome della variabile con app.py
    const requestBody = {
      message: msg
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      // CORREZIONE 3: Leggiamo la risposta come JSON
      const data = await response.json();
      console.log("Risposta dal server:", data);
      return data.response; // Restituiamo solo il testo del bot
      
    } catch (error) {
      console.error('Error:', error);
      return "Errore di connessione col server.";
    }
  }
  
  var res = await makePostRequest(message);
  
  data = {"response": res};
  
  // Deleting the loading animation
  const loadanimation = document.querySelector('.loading-animation');
  const loadtxt = document.querySelector('.loading-text');
  loadanimation.remove();
  loadtxt.remove();

  if (data.error || res === "Errore di connessione col server.") {
    addMessage(res, 'error','../static/Error.png');
  } else {
    const responseMessage = data['response'];
    addMessage(responseMessage, 'aibot','../static/Bot_logo.png');
  }
};

// Section: Button to submit to the model and get the response
messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (message !== '') {
    messageInput.value = '';
    await sendMessage(message);
  }
});