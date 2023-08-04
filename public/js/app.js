var url = window.location.href;
var swLocation = "/twittor-pwa/sw.js";

var swRegistry;

if (navigator.serviceWorker) {
    if (url.includes("localhost")) {
        swLocation = "/sw.js";
    }

    //Se va a registrar el service worker cuando la página esté totalmente cargada
    window.addEventListener("load", () => {
        navigator.serviceWorker.register(swLocation).then((reg) => {
            //Asigno el registro del service worker
            swRegistry = reg;
            //Inmediatamente confirmo si ya esta subscripto
            swRegistry.pushManager.getSubscription().then(verifySubscription);
        });
    });
}

// Referencias de jQuery
var googleMapKey = "AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8";

// Google Maps llaves alternativas - desarrollo
// AIzaSyDyJPPlnIMOLp20Ef1LlTong8rYdTnaTXM
// AIzaSyDzbQ_553v-n8QNs2aafN9QaZbByTyM7gQ
// AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8
// AIzaSyCroCERuudf2z02rCrVa6DTkeeneQuq8TA
// AIzaSyBkDYSVRVtQ6P2mf2Xrq0VBjps8GEcWsLU
// AIzaSyAu2rb0mobiznVJnJd6bVb5Bn2WsuXP2QI
// AIzaSyAZ7zantyAHnuNFtheMlJY1VvkRBEjvw9Y
// AIzaSyDSPDpkFznGgzzBSsYvTq_sj0T0QCHRgwM
// AIzaSyD4YFaT5DvwhhhqMpDP2pBInoG8BTzA9JY
// AIzaSyAbPC1F9pWeD70Ny8PHcjguPffSLhT-YF8

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

var btnLocation = $("#location-btn");

var modalMapa = $(".modal-mapa");

var btnTomarFoto = $("#tomar-foto-btn");
var btnPhoto = $("#photo-btn");
var contenedorCamara = $(".camara-contenedor");

var lat = null;
var lng = null;
var foto = null;

// El usuario, contiene el ID del héroe seleccionado
var usuario;

//Camera init
const camera = new Camera($("#player")[0]);

// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje, lat, lng, foto) {
    console.log(mensaje, personaje, lat, lng);

    let tipo = foto ? "foto" : "mensaje";

    var content = `
    <li class="animated fadeIn fast"
    data-user="${personaje}"
    data-mensaje="${mensaje}"    
    data-tipo="${tipo}"
    data-lat="${lat}"
    data-lng="${lng}">


        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
                `;

    if (foto) {
        content += `
                <br>
                <img class="foto-mensaje" src="${foto}">
        `;
    }

    content += `</div>        
                <div class="arrow"></div>
            </div>
        </li>
    `;

    // si existe la latitud y longitud,
    // llamamos la funcion para crear el mapa
    if (lat) {
        crearMensajeMapa(lat, lng, personaje);
    }

    // Borramos la latitud y longitud por si las usó
    lat = null;
    lng = null;

    $(".modal-mapa").remove();

    timeline.prepend(content);
    cancelarBtn.click();
}

function crearMensajeMapa(lat, lng, personaje) {
    let content = `
    <li class="animated fadeIn fast"
        data-tipo="mapa"
        data-user="${personaje}"
        data-lat="${lat}"
        data-lng="${lng}">
                <div class="avatar">
                    <img src="img/avatars/${personaje}.jpg">
                </div>
                <div class="bubble-container">
                    <div class="bubble">
                        <iframe
                            width="100%"
                            height="250"
                            frameborder="0" style="border:0"
                            src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                            </iframe>
                    </div>
                    
                    <div class="arrow"></div>
                </div>
            </li> 
    `;

    timeline.prepend(content);
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
        user: usuario,
        lat,
        lng,
        foto
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

    crearMensajeHTML(mensaje, usuario, lat, lng, foto);
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
    console.log(activated);
    if (activated) {
        btnActivadas.removeClass("oculto");
        btnDesactivadas.addClass("oculto");
    } else {
        btnActivadas.addClass("oculto");
        btnDesactivadas.removeClass("oculto");
    }
};

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

//notifyMe();

const getPublicKey = () => {
    return fetch("api/key")
        .then((res) => res.arrayBuffer())
        .then((key) => new Uint8Array(key));
};

//Evento click del botón de desactivar notificaciones
btnDesactivadas.on("click", () => {
    if (!swRegistry) {
        return console.log("No hay registro del SW");
    }

    getPublicKey().then((key) => {
        swRegistry.pushManager
            .subscribe({
                userVisibleOnly: true,
                applicationServerKey: key
            })
            .then((res) => res.toJSON())
            .then((subscription) => {
                fetch("api/subscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(subscription)
                })
                    .then(verifySubscription)
                    .catch(cancelSubscription);
            });
    });
});

const cancelSubscription = () => {
    swRegistry.pushManager.getSubscription().then((subscription) => {
        subscription.unsubscribe().then(() => verifySubscription(false));
    });
};

btnActivadas.on("click", () => {
    cancelSubscription();
});

// Crear mapa en el modal
function mostrarMapaModal(lat, lng) {
    $(".modal-mapa").remove();

    var content = `
            <div class="modal-mapa">
                <iframe
                    width="100%"
                    height="250"
                    frameborder="0"
                    src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${lat},${lng}&zoom=17" allowfullscreen>
                    </iframe>
            </div>
    `;

    modal.append(content);
}

// Sección 11 - Recursos Nativos

// Obtener la geolocalización
btnLocation.on("click", () => {
    $.mdtoast("Loading map...", {
        interaction: true,
        interactionTimeout: 2000,
        actionText: "Ok!"
    });
    navigator.geolocation.getCurrentPosition((pos) => {
        mostrarMapaModal(pos.coords.latitude, pos.coords.longitude);
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
    });
});

const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
};

// Boton de la camara
// usamos la funcion de fleca para prevenir
// que jQuery me cambie el valor del this
btnPhoto.on("click", () => {
    contenedorCamara.removeClass("oculto");
    camera.turnOn();
});

// Boton para tomar la foto
btnTomarFoto.on("click", () => {
    foto = camera.takePicture();
    camera.turnOff();
});

//Comparte mapa
document.addEventListener("click", async (event) => {
    if (event.target.nodeName === "LI") {
        let tipo = event.target.getAttribute("data-tipo");
        let lat = event.target.getAttribute("data-lat");
        let lng = event.target.getAttribute("data-lng");
        let mensaje = event.target.getAttribute("data-mensaje");
        let user = event.target.getAttribute("data-user");
        console.log(tipo, lat, lng, mensaje, user);

        let data = {
            title: user,
            text: mensaje
        };

        if (tipo === "mapa") {
            data.text = "Ubicación";
            data.url = `https://www.google.com/maps/@${lat},${lng},15z`;
        } else {
            console.log("dataurl", dataURLtoFile(foto, "foto"));
            const image = dataURLtoFile(foto, "foto.jpg");
            data.files = [image];
        }

        if (navigator.canShare(data)) {
            try {
                await navigator.share(data);
            } catch (error) {
                console.log("Error sharing", error);
            }
        }
    }
});
