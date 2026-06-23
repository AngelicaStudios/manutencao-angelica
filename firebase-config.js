const firebaseConfig = {
  apiKey:            "AIzaSyBvqXJTV0WvsS29tZX-sZXx_CcsJ40wnak",
  authDomain:        "manutencao-angelica.firebaseapp.com",
  projectId:         "manutencao-angelica",
  storageBucket:     "manutencao-angelica.firebasestorage.app",
  messagingSenderId: "627299714450",
  appId:             "1:627299714450:web:1e7cf2e6a8efab9a9c2d4b",
  measurementId:     "G-CYEVR0W1SC"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Ativa persistência offline (app funciona sem internet e sincroniza ao reconectar)
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') console.warn('Múltiplas abas abertas — offline desativado nesta aba.');
    else if (err.code === 'unimplemented')  console.warn('Navegador não suporta persistência offline.');
  });
