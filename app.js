const video = document.getElementById('video');
const list = document.getElementById('face-list');
const status = document.getElementById('sys-status');
let knownFaces = [];

async function startSystem() {
    status.innerText = "LOADING_AI...";
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    
    video.onloadedmetadata = () => {
        status.innerText = "SCANNING_ACTIVE";
        setInterval(detect, 2000);
    };
}

async function detect() {
    const dets = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }));
    dets.forEach(det => {
        if (!knownFaces.some(f => Math.abs(det.box.x - f.x) < 50)) {
            renderCard(det);
            knownFaces.push({ x: det.box.x });
        }
    });
}

function renderCard(det) {
    const id = Date.now();
    const card = document.createElement('div');
    card.className = 'face-card';
    card.innerHTML = `
        <div class="hud-mini">NEW_TARGET_DETECTED</div>
        <canvas id="c${id}"></canvas>
        <input id="n${id}" placeholder="HỌ TÊN">
        <button class="btn-act" onclick="confirmTarget(this, ${id})">XÁC NHẬN LƯU</button>
    `;
    list.prepend(card);
    const canvas = document.getElementById('c'+id);
    canvas.width = det.box.width; canvas.height = det.box.height;
    canvas.getContext('2d').drawImage(video, det.box.x, det.box.y, det.box.width, det.box.height, 0, 0, det.box.width, det.box.height);
}

function confirmTarget(btn, id) {
    const card = btn.parentElement;
    card.style.borderLeft = "5px solid #00ff00";
    card.querySelector('.hud-mini').innerText = "VERIFIED_RECORDED";
    card.querySelector('.hud-mini').style.color = "#00ff00";
    btn.innerText = "LOCKED";
    btn.style.background = "#555";
}

startSystem();
