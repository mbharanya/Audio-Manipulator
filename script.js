
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

let playingAudio;

function playCanvas() {
    const canvas = document.getElementById("modified-image");
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(imageData.data);
    // remove every fourth byte
    let audioData = new Float32Array(imageData.data.length - (imageData.data.length / 4));
    let cursor = 0;
    for (let i = 0; i < imageData.data.length; i++) {
        if ((i + 1) % 4 == 0) {
            continue;
        }
        audioData[cursor] = imageData.data[i] / 128 - 1;
        cursor += 1;
    }
    // play audioData
    const audioContext = new AudioContext();
    const audioBuffer = audioContext.createBuffer(1, audioData.length, audioContext.sampleRate);
    audioBuffer.getChannelData(0).set(audioData);
    const source = audioContext.createBufferSource();
    playingAudio = source;
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
}

document.getElementById("apply-filter").addEventListener("click", function () {
    const originalCanvas = document.getElementById("canvas");
    const modifiedCanvas = document.getElementById("modified-image");

    //get all checked checkboxes in div #filters
    const filters = document.getElementById("filters").querySelectorAll("input:checked");
    for (let i = 0; i < filters.length; i++) {
        // Apply the filter
        LenaJS.filterImage(modifiedCanvas, LenaJS[filters[i].name], originalCanvas);
    }
});

document.getElementById("play-modified").addEventListener("click", function () {
    playCanvas();
});

document.getElementById("stop-modified").addEventListener("click", function () {
    if(playingAudio) {
        playingAudio.stop();
    }
});
    

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
