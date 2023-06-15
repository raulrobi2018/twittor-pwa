// Routes.js - Módulo de rutas
var express = require("express");
var router = express.Router();

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
        user: req.body.user
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
    res.json("subscribe");
});

//Obtener el key publico
router.get("/key", (req, res) => {
    res.json("key publico");
});

//Enviar notificación push a usuarios que queramos
//Normalmente NO se maneja con un servicio rest, NO es un servicio que
//esté expuesto, se maneja del lado del servidor
//Aquí es con fines educativos para poder utilizar postman
router.post("/push", (req, res) => {
    res.json("Push notification");
});

module.exports = router;
