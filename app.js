let db, cameraStream;
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Khởi tạo DB và Model
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; loadModels(); };

async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    document.getElementById('status').innerText = "AI sẵn sàng!";
}

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    // Quản lý Camera
    if (id === 'attendance') startCamera();
    else stopCamera();
}

function stopCamera() {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
}

async function startCamera() {
    const video = document.getElementById('video');
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = cameraStream;
}

// Xử lý Upload và Học khuôn mặt
document.getElementById('upload').addEventListener('change', async (e) => {
    const files = e.target.files;
    for (let file of files) {
        const img = await faceapi.bufferToImage(file);
        const det = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (det) {
            const name = prompt("Phát hiện khuôn mặt! Đây là ai?");
            if (name) {
                const tx = db.transaction("faces", "readwrite");
                tx.objectStore("faces").put({ name, desc: Array.from(det.descriptor) });
                document.getElementById('setupStatus').innerText = "Đã lưu: " + name;
            }
        }
    }
});
