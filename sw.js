/*
 * Service worker dos painéis da manutenção.
 *
 * Existe por dois motivos:
 *  1. Sem service worker o Android não instala o site como app de verdade (WebAPK) —
 *     o "adicionar à tela inicial" vira só um atalho que abre dentro do Chrome, com a
 *     barra de endereço aparecendo em cima. Com ele, o app abre limpo, em tela cheia.
 *  2. Dá uma tela de fallback quando o celular está sem internet no meio do prédio.
 *
 * Estratégia: SEMPRE tenta a rede primeiro e só usa o cache se a rede falhar.
 * Isso é de propósito — os painéis são publicados direto no GitHub Pages com frequência,
 * e um cache-first deixaria a equipe presa numa versão velha depois de cada deploy.
 */
const CACHE = 'manutencao-v1';

// Só o esqueleto: o resto entra no cache conforme for sendo usado.
const ESSENCIAIS = [
  './equipe-mobile.html',
  './gestor-mobile.html',
  './apontamento-gestor.html',
  './limpeza-gestor.html',
  './firebase-config.js',
];

self.addEventListener('install', e => {
  // addAll falha inteiro se um arquivo faltar — por isso cada um vai por conta própria.
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ESSENCIAIS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // Firebase, gstatic e qualquer outra origem passam direto, sem interferência.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(resp => {
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./equipe-mobile.html')))
  );
});
