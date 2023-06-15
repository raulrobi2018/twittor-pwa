importScripts("https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js");

importScripts("js/sw-db.js");
importScripts("js/sw-utils.js");

const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v2";
const INMUTABLE_CACHE = "inmutable-v1";

//Aquí se declara todo lo que es de mi aplicación
const APP_SHELL = [
    //"/",
    "index.html",
    "css/style.css",
    "img/favicon.ico",
    "img/avatars/spiderman.jpg",
    "img/avatars/hulk.jpg",
    "img/avatars/ironman.jpg",
    "img/avatars/thor.jpg",
    "img/avatars/wolverine.jpg",
    "js/app.js",
    "js/sw-utils.js",
    "js/libs/plugins/mdtoast.min.js",
    "js/libs/plugins/mdtoast.min.css"
];

//Aquí va todo lo que no se va a modificar jamás
const APP_SHELL_INMUTABLE = [
    "https://fonts.googleapis.com/css?family=Quicksand:300,400",
    "https://fonts.googleapis.com/css?family=Lato:400,300",
    "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js",
    "https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js"
];

//Agregar caches
self.addEventListener("install", (event) => {
    const cacheStatic = caches.open(STATIC_CACHE).then((cache) => {
        cache.addAll(APP_SHELL);
    });

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then((cache) => {
        cache.addAll(APP_SHELL_INMUTABLE);
    });

    event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

//Borrar caches obsoletos
self.addEventListener("activate", (event) => {
    const resp = caches.keys().then((keys) => {
        keys.forEach((key) => {
            if (key !== STATIC_CACHE && key.includes("static")) {
                return caches.delete(key);
            }

            if (key !== DYNAMIC_CACHE && key.includes("dynamic")) {
                return caches.delete(key);
            }
        });
    });

    event.waitUntil(resp);
});

self.addEventListener("fetch", (event) => {
    let resp;

    //Network with cache fallback
    if (event.request.url.includes("/api")) {
        resp = manejoApiMensajes(DYNAMIC_CACHE, event.request);
    } else {
        //Cache with network update
        resp = caches.match(event.request).then((res) => {
            if (res) {
                updateStaticCache(
                    STATIC_CACHE,
                    event.request,
                    APP_SHELL_INMUTABLE
                );
                return res;
            } else {
                //Aquí se cargarán las peticiones de terceros que se llaman internamente
                //desde las librerías y no la tenemos disponibles
                return fetch(event.request).then((newResp) => {
                    return updateDynamicCache(
                        DYNAMIC_CACHE,
                        event.request,
                        newResp
                    );
                });
            }
        });
    }

    event.respondWith(resp);
});

//Registrar tareas asincronas
self.addEventListener("sync", (event) => {
    console.log("SW: Sync");

    if (event.tag === "new-post") {
        //Grabar en DB cuando hay conexión
        const resp = postMessages();

        event.waitUntil();
    }
});
