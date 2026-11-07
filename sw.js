// سوبرلي — Service Worker (بيخلي التطبيق يشتغل من غير نت)
// لما تعدّل index.html غيّر رقم النسخة هنا عشان الموبايل ياخد التحديث
const C = 'superly-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// الرد من الكاش فورًا، وتحديثه من النت في الخلفية
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(r => {
        if (r && (r.ok || r.type === 'opaque')) {
          const cp = r.clone();
          caches.open(C).then(c => c.put(e.request, cp));
        }
        return r;
      }).catch(() => hit);
      if (hit) e.waitUntil(net.catch(() => {}));
      return hit || net;
    })
  );
});
