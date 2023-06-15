var url = window.location.href;
var swLocation = "/twittor-pwa/public/sw.js";

if (navigator.serviceWorker) {
    if (url.includes("localhost")) {
        swLocation = "/sw.js";
    }

    navigator.serviceWorker.register(swLocation);
}

// Referencias de jQuery

var titulo = $("#titulo");
var nuevoBtn = $("#nuevo-btn");
var salirBtn = $("#salir-btn");
var cancelarBtn = $("#cancel-btn");
var postBtn = $("#post-btn");
var avatarSel = $("#seleccion");
var timeline = $("#timeline");

var modal = $("#modal");
var modalAvatar = $("#modal-avatar");
var modalAvatar = $("#modal-install-app");
var avatarBtns = $(".seleccion-avatar");
var txtMensaje = $("#txtMensaje");

var btnActivadas = $(".btn-noti-activadas");
var btnDesactivadas = $(".btn-noti-desactivadas");

// El usuario, contiene el ID del héroe seleccionado
var usuario;

// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {
    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();
}

// Globals
function logIn(ingreso) {
    if (ingreso) {
        nuevoBtn.removeClass("oculto");
        salirBtn.removeClass("oculto");
        timeline.removeClass("oculto");
        avatarSel.addClass("oculto");
        modalAvatar.attr("src", "img/avatars/" + usuario + ".jpg");
    } else {
        nuevoBtn.addClass("oculto");
        salirBtn.addClass("oculto");
        timeline.addClass("oculto");
        avatarSel.removeClass("oculto");

        titulo.text("Seleccione Personaje");
    }
}

// Seleccion de personaje
avatarBtns.on("click", function () {
    usuario = $(this).data("user");

    titulo.text("@" + usuario);

    logIn(true);
});

// Boton de salir
salirBtn.on("click", function () {
    logIn(false);
});

// Boton de nuevo mensaje
nuevoBtn.on("click", function () {
    modal.removeClass("oculto");
    modal.animate(
        {
            marginTop: "-=1000px",
            opacity: 1
        },
        200
    );
});

// Boton de cancelar mensaje
cancelarBtn.on("click", function () {
    if (!modal.hasClass("oculto")) {
        modal.animate(
            {
                marginTop: "+=1000px",
                opacity: 0
            },
            200,
            function () {
                modal.addClass("oculto");
                txtMensaje.val("");
            }
        );
    }
});

// Boton de enviar mensaje
postBtn.on("click", function () {
    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    const data = {
        mensaje: mensaje,
        user: usuario
    };

    fetch("api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then((resp) => resp.json())
        .then((resp) => console.log("app.js", resp))
        .catch((err) => console.log("app.js err", err));

    crearMensajeHTML(mensaje, usuario);
});

// This variable will save the event for later use.
let defferedPrompt;
const addbtn = document.getElementById("install-button");

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    defferedPrompt = event;
    addbtn.style.display = "block";
});

addbtn.addEventListener("click", (event) => {
    defferedPrompt.prompt();

    defferedPrompt.userChoice.then((choice) => {
        if (choice.outcome === "accepted") {
            addbtn.style.display = "none";
        }
        defferedPrompt = null;
    });
});

//Obtener mensajes del servidor
const getMessages = () => {
    fetch("api")
        .then((resp) => resp.json())
        .then((messages) => {
            console.log("Messages", messages);
            messages.forEach((message) => {
                crearMensajeHTML(message.message, message.user);
            });
        });
};

getMessages();

//Detectar cambios de conexión
const isOnline = () => {
    if (navigator.onLine) {
        //Hay conexión
        $.mdtoast("Online", {
            interaction: true,
            interactionTimeout: 1000,
            actionText: "OK!"
        });
    } else {
        //No hay conexión
        $.mdtoast("Offline", {
            interaction: true,
            actionText: "OK!"
        });
    }
};

window.addEventListener("online", isOnline);
window.addEventListener("offline", isOnline);

isOnline();

const verifySubscription = (activated) => {
    if (activated) {
        btnActivadas.removeClass("oculto");
        btnDesactivadas.addClass("oculto");
    } else {
        btnActivadas.addClass("oculto");
        btnDesactivadas.removeClass("oculto");
    }
};

verifySubscription();

const sendNotification = () => {
    const notificationOptions = {
        body: "Notification content",
        icon: "img/icons/icon-72x72.png"
    };
    const noti = new Notification("I'm the notification", notificationOptions);

    noti.onclick = () => {
        console.log("Notification click");
    };
};

//Notifications
const notifyMe = () => {
    if (!window.Notification) {
        console.log("This navigator doesn't support notifications");
        return;
    }

    //Si anteriormente ya se asignó permisos
    if (Notification.permission === "granted") {
        sendNotification();
    } else if (
        Notification.permission !== "denied" ||
        Notification.permission === "default"
    ) {
        Notification.requestPermission((permission) => {
            console.log("Permission", permission);

            if (permission === "granted") {
                sendNotification();
            }
        });
    }
};

notifyMe();
