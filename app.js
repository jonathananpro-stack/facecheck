// Cấu trúc DB
let db;
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => db = e.target.result;

// Điều hướng
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'attendance') startCamera();
}

// Logic AI: Nạp Model
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
async function initAI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}
initAI();

// Tải ảnh huấn luyện
document.getElementById('upload').addEventListener('change', async (e) => {
    for (let file of e.target.files) {
        const img = await faceapi.bufferToImage(file);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
            const name = prompt("Phát hiện khuôn mặt! Nhập tên người này:");
            if (name) {
                db.transaction("faces", "readwrite").objectStore("faces").add({name, desc: Array.from(detection.descriptor)});
                document.getElementById('setupStatus').innerText = "Đã lưu: " + name;
            }
        }
    }
});

// Điểm danh
async function startCamera() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    
    video.addEventListener('play', () => {
        setInterval(async () => {
            const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
            if (detection) {
                // Ở đây sẽ có logic so sánh Face Descriptor với DB
                document.getElementById('status').innerText = "Đang quét...";
            }
        }, 2000);
    });
}
