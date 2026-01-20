// Firebase configuration
// WICHTIG: Ersetze diese Werte mit deinen eigenen Firebase-Projekt-Daten!
// Anleitung: https://console.firebase.google.com/ → Projekt erstellen → Projekteinstellungen → Web-App hinzufügen

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "DEINE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "DEIN_PROJEKT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "DEIN_PROJEKT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "DEIN_PROJEKT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123"
};

export default firebaseConfig;
