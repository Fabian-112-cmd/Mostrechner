'use strict';
const CACHE_NAME='mostrechner-v6-anmeldung-design';
const FILES=['./','./index.html','./daten.json','./manifest.json','./mostrechner-logo.png','./anmeldung.js?v=1'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mostrechner-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 // Nur eigene statische Dateien; keine Auth-Anfragen und keine fremden Apps speichern.
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone)));}return response;}).catch(()=>caches.match(event.request)));
});
