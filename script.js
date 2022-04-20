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
        console.log("typedArray:");
        console.log(typedArray);
        writeAudioImageToCanvas(typedArray);
    };
    reader.readAsArrayBuffer(input.files[0]);
};

function writeAudioImageToCanvas(floatData) {
    let paddedFloatData = new Float32Array(floatData.length + (3 - floatData.length % 3));
    paddedFloatData.set(floatData);

    const img_width = Math.ceil(Math.sqrt(paddedFloatData.length / 3))

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const rgbaData = new Uint8ClampedArray(Math.pow(img_width, 2) * 4);

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
    canvas.height = img_width;
    const imageData = ctx.createImageData(img_width, img_width);
    console.log(imageData.data.length);
    imageData.data.set(rgbaData);
    ctx.putImageData(imageData, 0, 0);
}

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('file-upload').addEventListener('change', openFile, false);
});
