import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { collection, addDoc, serverTimestamp, onSnapshot, query} from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDf4WPo6xV9ML3y_XoQc_j6REAvhCExKHM",
    authDomain: "messagerie-1be0d.firebaseapp.com",
    projectId: "messagerie-1be0d",
    storageBucket: "messagerie-1be0d.appspot.com",
    messagingSenderId: "970569765584",
    appId: "1:970569765584:web:a8908082215d2b73fec4d5"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getFirestore(firebaseApp);
const chatBox = document.getElementById('chat-box');
let unsubscribe;
const messagesCollection = collection(database, 'messages');
const messagesArray = [];

function appendMessage(message) {
    // Ajouter le message à la liste des messages
    messagesArray.push({
        text: message.text,
        timestamp: message.timestamp,
    });

    // Trier les messages par timestamp (si il est nul on le met tout en bas de la liste)(sinon ca met le dernier message tout en haut car il ne récupère pas comme il faut le timestamp)
    messagesArray.sort((a, b) => {
        if (a.timestamp === null && b.timestamp !== null) {
            return 1;
        } else if (a.timestamp !== null && b.timestamp === null) {
            return -1;
        } else {
            return a.timestamp - b.timestamp;
        }
    });

    // Vider la chatbox
    chatBox.innerHTML = '';

    // Ajouter les messages à la chatbox
    messagesArray.forEach((message) => {
        const messageElement = document.createElement('div');
        messageElement.innerText = `${message.text}`;
        messageElement.setAttribute('data-timestamp', message.timestamp);
        chatBox.appendChild(messageElement);
        chatBox.appendChild(document.createElement('br'));
    });

    // Faire défiler la chatbox pour afficher le dernier message
    chatBox.scrollTop = chatBox.scrollHeight;
}

export function listenToMessages() {
    const query1 = query(messagesCollection);

    // Arrêter d'écouter les messages précédents
    if (unsubscribe) {
        unsubscribe();
    }

    // Ecouter les nouveaux messages
    unsubscribe = onSnapshot(query1, (snapshot) => {
        // Ajouter les nouveaux messages à la chatbox
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') { // Si le message est ajouté
                const message = { id: change.doc.id, ...change.doc.data() }; // Récupérer le message
                appendMessage(message); // Ajouter le message à la chatbox
            }
        });
    });
}

// Fonction pour envoyer un message
export async function sendMessage() {
    const messageInput = document.getElementById('message-input'); // Récupérer l'input du message
    const username = localStorage.getItem('username') + ': '; // Récupérer le nom d'utilisateur
    const messageText = username + messageInput.value; // Créer le message avec username et texte

    if (messageText.trim() !== '') { // Si le message n'est pas vide
        await addDoc(messagesCollection, { // Ajouter le message à la base de données
            text: messageText,
            timestamp: serverTimestamp(),
        });
        location.reload(); // Rafraîchir la page pour afficher les nouveaux messages
    }
}