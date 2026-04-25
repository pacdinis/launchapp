const CACHE = 'vm-launch-v4-proforma-whatsapp';

self.addEventListener('install', e=>{
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // Always network-first — never serve stale HTML
  const url = e.request.url;
  if(url.includes('script.google.com')||url.includes('unpkg.com')||url.includes('fonts.googleapis.com')||url.includes('tile.openstreetmap')) {
    e.respondWith(fetch(e.request).catch(()=>new Response('',{status:503})));
    return;
  }
  // Network first for everything — fall back to cache only if offline
  e.respondWith(
    fetch(e.request).then(resp=>{
      if(resp.ok) {
        const cl=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cl));
      }
      return resp;
    }).catch(()=>caches.match(e.request).then(c=>c||caches.match('/index.html')))
  );
});
