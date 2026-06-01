const CACHE = 'fazendinha-v1778972189'

const SHELL = [
  '/logo.png',
  '/manifest.json'
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Tudo que não for asset estático: vai direto para rede
  if (e.request.method !== 'GET') return
  if (url.hostname !== location.hostname) return

  // Só faz cache de imagens e manifest — nunca JS/HTML
  const isStaticAsset = url.pathname.endsWith('.png') ||
                        url.pathname.endsWith('.jpg') ||
                        (url.pathname.endsWith('.json') &&
                         url.pathname.includes('manifest'))

  if (!isStaticAsset) return

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})
