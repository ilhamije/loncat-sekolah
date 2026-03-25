const CACHE_NAME = 'school-jump-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/manifest.json',
  '/assets/school.png',
  '/assets/crawling1.png',
  '/assets/crawling2.png',
  '/assets/happy.png',
  '/assets/jumping1.png',
  '/assets/jumping2.png',
  '/assets/running1.png',
  '/assets/running2.png',
  '/assets/sad.png',
  '/assets/walking1.png',
  '/assets/walking2.png',
  '/assets/chair.png',
  '/assets/stacked-chair.png',
  '/assets/table.png',
  '/assets/stacked-table.png',
  '/assets/whiteboard.png',
  '/assets/chalk.png',
  '/assets/whosh.mov',
  '/assets/tick.mov',
  '/assets/buzz.mov'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
