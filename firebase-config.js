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

// ── Sessão dos painéis de campo (Equipe, Limpeza·Gestor) ────────────────────
// Reaproveita a sessão que já existe nesta origem — inclusive a do gestor — e
// só entra como anônimo quando não há ninguém. Chamar signInAnonymously()
// direto DERRUBAVA a sessão do gestor: o Firebase Auth guarda UM usuário por
// origem, e abrir o Limpeza·Gestor ou o app da Equipe no mesmo aparelho fazia o
// Apontamento e o Manutenção·Gestor pedirem a senha de novo (15/09/2026).
// O que cada painel pode fazer continua sendo decidido pelas regras do
// Firestore, não por qual sessão ele reaproveitou.
function sessaoOuAnonima() {
  const auth = firebase.auth();
  return new Promise((resolve, reject) => {
    const parar = auth.onAuthStateChanged(user => {
      parar();
      if (user) { resolve(user); return; }
      auth.signInAnonymously().then(c => resolve(c.user)).catch(reject);
    }, reject);
  });
}

// ── Destino do trabalho externo ─────────────────────────────────────────────
// "Obra" e "obra" eram dois destinos no rateio (15/09/2026). A CHAVE de
// agrupamento ignora caixa, acento e espaço a mais; o texto que aparece é a
// grafia conhecida — a primeira com inicial maiúscula, ou a primeira que
// apareceu. Ao digitar um destino que já existe, a grafia conhecida é gravada
// no lugar (é o que faz "obra" virar "Obra" na hora, em vez de nascer outra
// linha). O registro é da página: cada painel enche o seu ao ler os dados.
const rotulosDestino = {};
function chaveDestino(s) {
  return (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}
function registrarDestino(texto) {
  const limpo = (texto || '').trim();
  const k = chaveDestino(limpo);
  if (!k) return k;
  const atual = rotulosDestino[k];
  if (!atual || (/^[a-z]/.test(atual) && /^[^a-z]/.test(limpo))) rotulosDestino[k] = limpo;
  return k;
}
function rotuloDestino(k) { return rotulosDestino[k] || k; }
function destinoCanonico(texto) {
  const limpo = (texto || '').trim();
  return rotulosDestino[chaveDestino(limpo)] || limpo;
}
function destinosConhecidos() {
  return Object.values(rotulosDestino).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
