const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const status = document.getElementById('ui-status');
const panel = document.getElementById('input-panel');
let db;

// Khởi tạo Database
const req = indexedDB.open("FaceSecurityDB", 1);
req.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "id", autoIncrement: true});
req.onsuccess = e => { db = e.target.result; startSystem(); };

async function startSystem() {
    status.innerText = "NẠP MODEL AI...";
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        status.innerText = "SCANNING...";
        scanLoop();
    };
}

async function scanLoop() {
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }));
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detection) {
        const { x, y, width, height } = detection.box;
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
        status.innerText = "MỤC TIÊU PHÁT HIỆN";
        panel.style.display = 'block';
    } else {
        status.innerText = "SCANNING...";
    }
    requestAnimationFrame(scanLoop);
}

function saveData() {
    const data = { name: document.getElementById('name').value, unit: document.getElementById('unit').value, time: new Date().toLocaleTimeString() };
    db.transaction("faces", "readwrite").objectStore("faces").add(data);
    panel.style.display = 'none';
    alert("Đã lưu!");
}
