importScripts("./version.js");

const CACHE = "SiagaRT9-" + APP_VERSION;

const FILES = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json"
];

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE)

        .then(cache => cache.addAll(FILES))

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

        .then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE) {

                        return caches.delete(key);

                    }

                })

            )

        )

    );

    self.clients.claim();

});

self.addEventListener("fetch", event => {

    if(event.request.method!=="GET") return;

    event.respondWith(

        caches.match(event.request)

        .then(cache=>{

            return cache ||

            fetch(event.request)

            .then(network=>{

                const clone=network.clone();

                caches.open(CACHE)

                .then(c=>c.put(event.request,clone));

                return network;

            })

            .catch(()=>{

                if(event.request.mode==="navigate"){

                    return caches.match("./offline.html");

                }

            });

        })

    );

});
