const video = document.getElementById('video');
const status = document.getElementById('status');
const panel = document.getElementById('input-panel');

async function start() {
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    
    video.onloadedmetadata = () => {
        status.innerText = "ONLINE - SCANNING";
        scan();
    };
}

async function scan() {
    const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }));
    if (det) {
        status.innerText = "DETECTED TARGET";
        panel.style.display = 'block';
    } else {
        status.innerText = "SCANNING...";
    }
    requestAnimationFrame(scan);
}

function saveData() {
    alert("Dữ liệu đã truyền về trung tâm!");
    panel.style.display = 'none';
}

start();
