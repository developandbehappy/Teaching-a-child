const CACHE_NAME = 'media-loader-cache-v1';
const urlsToCache = [
    './index.html',
    './manifest.json',
    './icons/192.png',
    './icons/512.png',
    './images/alpa.webp',
    './audio/finish.mp3',
    './audio/interval.mp3',
    './audio/а.m4a', './audio/б.m4a', './audio/в.m4a', './audio/г.m4a', './audio/д.m4a', './audio/е.m4a', './audio/ё.m4a', './audio/ж.m4a', './audio/з.m4a', './audio/и.m4a', './audio/й.m4a', './audio/к.m4a', './audio/л.m4a', './audio/м.m4a', './audio/н.m4a', './audio/о.m4a', './audio/п.m4a', './audio/р.m4a', './audio/с.m4a', './audio/т.m4a', './audio/у.m4a', './audio/ф.m4a', './audio/х.m4a', './audio/ц.m4a', './audio/ч.m4a', './audio/ш.m4a', './audio/щ.m4a', './audio/ъ.m4a', './audio/ы.m4a', './audio/ь.m4a', './audio/э.m4a', './audio/ю.m4a', './audio/я.m4a'
];

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Кэширование ресурсов');
                return cache.addAll(urlsToCache);
            })
    );
});

// Активация
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Стратегия Cache First, Network Fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        // Проверяем валидность ответа
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Клонируем ответ, так как он может быть использован только один раз
                        let responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});