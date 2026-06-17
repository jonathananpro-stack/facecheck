let db, cameraStream, facingMode = "user";
const video = document.getElementById('video');
const status = document.getElementById('ai-status');

// Khởi tạo
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; initAI(); };

async function initAI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
    status.innerText = "Sẵn sàng!";
    startCamera();
}

// Xử lý camera linh hoạt (Trước/Sau)
async function startCamera() {
    if(cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { exact: facingMode } } 
    }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
    video.srcObject = cameraStream;
}

function toggleCamera() {
    facingMode = facingMode === "user" ? "environment" : "user";
    startCamera();
}

// Vòng lặp AI thông minh (Chỉ chạy khi có người)
video.addEventListener('play', () => {
    setInterval(async () => {
        const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptor();
        if (!det) {
            status.innerText = "Đang tìm gương mặt...";
            return;
        }
        
        // So sánh thời gian thực
        const faces = await getFaces();
        let match = faces.find(f => faceapi.euclideanDistance(det.descriptor, f.desc) < 0.5);
        
        status.innerText = match ? `Chào ${match.name}!` : "Người lạ - Hãy chạm để thêm";
    }, 1000);
});

async function getFaces() {
    return new Promise(r => {
        const req = db.transaction("faces", "readonly").objectStore("faces").getAll();
        req.onsuccess = () => r(req.result);
    });
}
