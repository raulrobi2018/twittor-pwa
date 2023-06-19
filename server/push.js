const fs = require("fs");

const vapid = require("./vapid.json");
const webpush = require("web-push");
const urlsafeBase64 = require("urlsafe-base64");

let subscriptions = require("./subs-db.json");

webpush.setVapidDetails(
    "mailto:raulrobi@gmail.com",
    vapid.publicKey,
    vapid.privateKey
);

module.exports.getKey = () => {
    return urlsafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (subscription) => {
    subscriptions.push(subscription);

    fs.writeFileSync(
        `${__dirname}/subs-db.json`,
        JSON.stringify(subscriptions)
    );
};

module.exports.sendPush = (post) => {
    const notificationsSent = [];

    subscriptions.forEach((subscription, i) => {
        //Necesito que todas las notificaciones culminen, por eso las almaceno en la promise
        const pushPromise = webpush
            .sendNotification(subscription, JSON.stringify(post), [])
            .then(console.log)
            .catch((err) => {
                //Si es 410 quiere decir que ya no existe (GONE)
                //Aquí voy a borrar las susbscripciones que no existen
                if (err.statusCode === 410) {
                    //Le agrego una propiedad nueva (delete) para marcarla que se debe borrar
                    subscriptions[i].delete = true;
                }
            });

        notificationsSent.push(pushPromise);
    });

    Promise.all(notificationsSent).then(() => {
        subscriptions = subscriptions.filter((sub) => !sub.delete);
        fs.writeFileSync(
            `${__dirname}/subs-db.json`,
            JSON.stringify(subscriptions)
        );
    });
};
