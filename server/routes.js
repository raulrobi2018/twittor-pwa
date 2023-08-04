// Routes.js - Módulo de rutas
const express = require("express");
const router = express.Router();
const push = require("./push");
const webpush = require("web-push");

const messages = [
    {
        _id: "1",
        user: "Spiderman",
        message: "Hello!"
    }
];

// Get mensajes
router.get("/", function (req, res) {
    res.json(messages);
});

// Post message
router.post("/", function (req, res) {
    const message = {
        message: req.body.mensaje,
        user: req.body.user,
        lat: req.body.lat,
        lng: req.body.lng,
        photo: req.body.foto
    };

    messages.push(message);

    console.log("Messages", messages);

    res.json({
        ok: true,
        message
    });
});

//Almacenar subscripcion
router.post("/subscribe", (req, res) => {
    const subscription = req.body;

    push.addSubscription(subscription);

    res.json("subscribe");
});

//Obtener el key publico
router.get("/key", (req, res) => {
    const key = push.getKey();

    //Enviamos directamente lo que tenemos en key
    res.send(key);
});

//Enviar notificación push a usuarios que queramos
//Normalmente NO se maneja con un servicio rest, NO es un servicio que
//esté expuesto, se maneja del lado del servidor
//Aquí es con fines educativos para poder utilizar postman
router.post("/push", (req, res) => {
    const post = {
        title: req.body.title,
        body: req.body.body,
        user: req.body.user
    };

    push.sendPush(post);

    res.json(post);
});

module.exports = router;
