const CACHE = 'fazendinha-v1778971388'

const SHELL = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
]

// Instala e faz cache do shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  )
  self.skipWaiting()
})

// Ativa e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Intercepta requests
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Supabase e APIs externas: sempre busca na rede, nunca do cache
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('openweathermap') ||
      url.hostname.includes('jsdelivr') ||
      url.hostname.includes('cdnjs')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })))
    return
  }

  // App shell: cache first, rede como fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return response
      }).catch(() => caches.match('/index.html'))
    })
  )
})
