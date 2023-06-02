importScripts("js/sw-utils.js");

const STATIC_CACHE = "static-v2";
const DYNAMIC_CACHE = "dynamic-v1";
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
    "js/sw-utils.js"
];

//Aquí va todo lo que no se va a modificar jamás
const APP_SHELL_INMUTABLE = [
    "https://fonts.googleapis.com/css?family=Quicksand:300,400",
    "https://fonts.googleapis.com/css?family=Lato:400,300",
    "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "css/animate.css",
    "js/libs/jquery.js"
];

//Agregar caches
self.addEventListener("install", (event) => {
    const cacheStatic = caches
        .open(STATIC_CACHE)
        .then((cache) => cache.addAll(APP_SHELL));

    const cacheInmutable = caches
        .open(INMUTABLE_CACHE)
        .then((cache) => cache.addAll(APP_SHELL_INMUTABLE));

    event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

//Borrar caches obsoletos
self.addEventListener("activate", (event) => {
    const resp = caches.keys().then((keys) => {
        keys.forEach((key) => {
            if (key !== STATIC_CACHE && key.includes("static")) {
                return caches.delete(key);
            }
        });
    });

    event.waitUntil(resp);
});

//Cache only
self.addEventListener("fetch", (event) => {
    const resp = caches.match(event.request).then((resp) => {
        if (resp) {
            return resp;
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

    event.respondWith(resp);
});