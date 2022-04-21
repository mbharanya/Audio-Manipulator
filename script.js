
let audioArray;

const openFile = function (event) {
    const input = event.target;
    const audioContext = new AudioContext();

    const reader = new FileReader();
    reader.onload = async function () {
        const arrayBuffer = reader.result;
        console.log("arrayBuffer:");
        console.log(arrayBuffer);
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        let typedArray = new Float32Array(decoded.length);

        typedArray = decoded.getChannelData(0);
        audioArray = typedArray;
        console.log("typedArray:");
        console.log(typedArray);
        writeAudioImageToCanvas(typedArray);
    };
    reader.readAsArrayBuffer(input.files[0]);
};

function writeAudioImageToCanvas(floatData, img_width, img_height) {
    let paddedFloatData = new Float32Array(floatData.length + (3 - floatData.length % 3));
    paddedFloatData.set(floatData);

    if (!img_width) {
        img_width = Math.ceil(Math.sqrt(paddedFloatData.length / 3))
        img_height = img_width;
    }

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const rgbaData = new Uint8ClampedArray(img_width * img_height * 4);

    let cursor = 0;
    for (let i = 0; i < rgbaData.length; i++) {
        if ((i + 1) % 4 == 0) {
            rgbaData[i] = 255;
        }
        else {
            rgbaData[i] = Math.floor((paddedFloatData[cursor] + 1) * 128);
            cursor += 1;
        }
    }

    canvas.width = img_width;
    canvas.height = img_height;
    const imageData = ctx.createImageData(img_width, img_height);
    console.log(imageData.data.length);
    imageData.data.set(rgbaData);
    ctx.putImageData(imageData, 0, 0);
}

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('file-upload').addEventListener('change', openFile, false);
});

window.addEventListener('keydown', function (event) {
    // event.preventDefault();
    const key = event.key; // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
    console.log(key);

    if (key == "ArrowRight") {
        writeAudioImageToCanvas(audioArray, document.getElementById("canvas").width + 10, document.getElementById("canvas").height);
    }
    if (key == "ArrowLeft") {
        writeAudioImageToCanvas(audioArray, document.getElementById("canvas").width - 10, document.getElementById("canvas").height);
    }
    if (key == "ArrowDown") {
        writeAudioImageToCanvas(audioArray, document.getElementById("canvas").width, document.getElementById("canvas").height + 10);
    }
    if (key == "ArrowUp") {
        writeAudioImageToCanvas(audioArray, document.getElementById("canvas").width, document.getElementById("canvas").height - 10);
    }
});
