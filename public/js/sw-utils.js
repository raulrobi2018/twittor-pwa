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
    if (req.clone().method === "POST") {
        //Post a new message

        if (self.registration.sync) {
            //Capturo el mensaje enviado
            return req
                .clone()
                .text()
                .then((body) => {
                    console.log("body", body);
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
