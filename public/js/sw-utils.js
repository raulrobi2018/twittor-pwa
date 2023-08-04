//Saves the dynamic cache
const updateDynamicCache = (dynamicCache, req, res) => {
    if (res.ok) {
        return caches.open(dynamicCache).then((cache) => {
            //Almacena la request en el cache
            cache.put(req, res.clone());
            return res.clone();
        });
    }
    //Si no viene nada
    else {
        return res;
    }
};

// Cache with network update
const updateStaticCache = (staticCache, req, APP_SHELL_INMUTABLE) => {
    if (APP_SHELL_INMUTABLE.includes(req.url)) {
        // No hace falta actualizar el inmutable
        // console.log('existe en inmutable', req.url );
    } else {
        return fetch(req).then((res) => {
            return updateDynamicCache(staticCache, req, res);
        });
    }
};

//Network with cache fallback strategy
const manejoApiMensajes = (cacheName, req) => {
    //No quiero almacenar en cache el key o la subscripción, por eso lo retorno tal cual es solicitado
    if (
        req.url.indexOf("/api/key") >= 0 ||
        req.url.indexOf("/api/subscribe") >= 0
    ) {
        return fetch(req);
    } else if (req.clone().method === "POST") {
        //Post a new message

        if (self.registration.sync) {
            //Capturo el mensaje enviado
            return req
                .clone()
                .text()
                .then((body) => {
                    const bodyObj = JSON.parse(body);
                    return saveMessage(bodyObj);
                });
        } else {
            //En caso contrario, dejo pasar la petición
            return fetch(req);
        }
    } else {
        return fetch(req)
            .then((res) => {
                //Si la respuesta es exitosa
                if (res.ok) {
                    updateDynamicCache(cacheName, req, res.clone());
                    return res.clone();
                } //Si la respuesta no es exitosa
                else {
                    return caches.match(req);
                }
            })
            .catch((err) => {
                return caches.match(req);
            });
    }
};
