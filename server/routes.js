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
module.exports = router;
