const CACHE_NAME = "stg-fees-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.png"
];


/* INSTALL */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    // Activate the new service worker immediately
    self.skipWaiting();

});


/* ACTIVATE */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            cacheName =>
                                cacheName !== CACHE_NAME
                        )
                        .map(
                            cacheName =>
                                caches.delete(cacheName)
                        )

                );

            })

    );

    // Take control of the page immediately
    self.clients.claim();

});


/* FETCH */

self.addEventListener("fetch", event => {

    /*
       IMPORTANT:
       Always get index.html from the network.

       This prevents an old version of the
       Fee application from appearing after
       Ctrl + R.
    */

    const url =
        new URL(event.request.url);


    if (
        url.pathname.endsWith("/index.html") ||
        url.pathname.endsWith("/")
    ) {

        event.respondWith(

            fetch(event.request)
                .then(response => {

                    /*
                       Save the newest version
                       in the cache.
                    */

                    const responseClone =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                    return response;

                })
                .catch(() => {

                    /*
                       If there is no internet,
                       use the cached version.
                    */

                    return caches.match(
                        event.request
                    );

                })

        );

        return;

    }


    /*
       Other files:
       Network first, then cache.
    */

    event.respondWith(

        fetch(event.request)
            .then(response => {

                const responseClone =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                return response;

            })
            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});
