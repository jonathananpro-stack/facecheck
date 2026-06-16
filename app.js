// --- 1. KHỞI TẠO CƠ SỞ DỮ LIỆU ---
let db;
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("faces")) {
        db.createObjectStore("faces", { keyPath: "name" });
    }
};
request.onsuccess = (e) => { db = e.target.result; };

// --- 2. TẢI MODEL & KHỞI TẠO AI ---
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log("Model đã sẵn sàng!");
}
loadModels();

// --- 3. XỬ LÝ ẢNH TẢI LÊN (HUẤN LUYỆN) ---
document.getElementById('upload').addEventListener('change', async (e) => {
    const files = e.target.files;
    for (let file of files) {
        const img = await faceapi.bufferToImage(file);
        const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
        
        for (let det of detections) {
            const name = prompt("Phát hiện khuôn mặt! Đây là ai?");
            if (name) {
                const tx = db.transaction("faces", "readwrite");
                tx.objectStore("faces").put({ name, desc: Array.from(det.descriptor) });
                alert("Đã lưu: " + name);
            }
        }
    }
});

// --- 4. ĐIỂM DANH (CAMERA THỜI GIAN THỰC) ---
async function startCamera() {
    const video = document.getElementById('video');
    const status = document.getElementById('status');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;

    video.addEventListener('play', () => {
        setInterval(async () => {
            const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
            if (detection) {
                const faces = await getAllFaces();
                let match = null;
                
                // So sánh khoảng cách (Euclidean Distance)
                for (let face of faces) {
                    const dist = faceapi.euclideanDistance(detection.descriptor, new Float32Array(face.desc));
                    if (dist < 0.6) { match = face.name; break; }
                }

                status.innerText = match ? "Chào " + match : "Người lạ! Bạn là ai?";
                if (!match) {
                    const newName = prompt("Không nhận ra bạn. Nhập tên bạn:");
                    if(newName) db.transaction("faces", "readwrite").objectStore("faces").put({ name: newName, desc: Array.from(detection.descriptor) });
                }
            }
        }, 3000);
    });
}

// Hàm hỗ trợ lấy dữ liệu từ DB
function getAllFaces() {
    return new Promise(resolve => {
        const tx = db.transaction("faces", "readonly");
        const req = tx.objectStore("faces").getAll();
        req.onsuccess = () => resolve(req.result);
    });
}
