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
    const cacheStatic = caches.open(STATIC_CACHE).then((cache) => {
        console.log("Add all 1");
        cache
            .addAll(APP_SHELL)
            .catch((err) => console.log("static cache", err));
    });

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then((cache) => {
        console.log("Add all 2");
        cache
            .addAll(APP_SHELL_INMUTABLE)
            .catch((err) => console.log("inmutable cache", err));
    });

    event.waitUntil(
        Promise.all([cacheStatic, cacheInmutable])
            .then((data) => {
                try {
                    console.log("data", data);
                } catch (error) {
                    console.log("error trycatch", error);
                }
            })
            .catch((err) => console.log("err", err))
    );
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

// This variable will save the event for later use.
let defferedPrompt;
const addbtn = window.document.querySelector(".btn");

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    defferedPrompt = event;
    addbtn.style.display = "block";
});

addbtn.addEventListener("click", (event) => {
    defferedPrompt.prompt();

    defferedPrompt.userChoice.then((choice) => {
        if (choice.outcome === "accepted") {
            console.log("user accepted the prompt");
        }
        defferedPrompt = null;
    });
});
