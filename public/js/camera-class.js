class Camera {
    constructor(videoNode) {
        this.videoNode = videoNode;
    }

    turnOn() {
        console.log("videoNode", this.videoNode);
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    width: 300,
                    height: 300
                }
            })
            .then((stream) => {
                this.videoNode.srcObject = stream;
                this.stream = stream;
            });
    }

    turnOff() {
        this.videoNode.pause();
        if (this.stream) {
            this.stream.getTracks()[0].stop();
        }
    }

    takePicture() {
        //Renderizará la foto en este elemento
        let canvas = document.createElement("canvas");

        //Canvas dimentions
        canvas.setAttribute("width", 300);
        canvas.setAttribute("height", 300);

        //Get canvas context
        //2d: single image
        let context = canvas.getContext("2d");

        //Draw the image in the canvas
        context.drawImage(this.videoNode, 0, 0, canvas.width, canvas.height);

        this.foto = canvas.toDataURL("image/jpg");

        //Cleaning
        canvas = null;
        context = null;

        return this.foto;
    }
}
