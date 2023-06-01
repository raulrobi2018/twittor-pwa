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
