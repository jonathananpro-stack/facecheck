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
// Xử lý tải ảnh và tách khuôn mặt tuần tự
document.getElementById('upload').addEventListener('change', async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    for (let file of files) {
        const img = await faceapi.bufferToImage(file);
        // Tách tất cả khuôn mặt trong ảnh
        const detections = await faceapi.detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (detections.length === 0) {
            alert("Không tìm thấy khuôn mặt trong ảnh: " + file.name);
            continue;
        }

        // Duyệt qua từng khuôn mặt đã tách được
        for (let i = 0; i < detections.length; i++) {
            const det = detections[i];
            
            // Vẽ mặt lên canvas để đồng chí biết đang nhập cho ai (tùy chọn)
            // Tạm thời dùng prompt để hỏi
            const name = prompt(`Đã phát hiện khuôn mặt thứ ${i + 1} trong ảnh ${file.name}. Đây là ai?`);
            
            if (name) {
                const data = {
                    name: name,
                    desc: Array.from(det.descriptor),
                    time: new Date().toLocaleString()
                };
                
                // Lưu vào IndexedDB
                const tx = db.transaction("faces", "readwrite");
                tx.objectStore("faces").put(data); // .put để ghi đè nếu trùng tên
                document.getElementById('setupStatus').innerText = "Đã lưu: " + name;
            }
        }
    }
    alert("Đã hoàn tất huấn luyện từ ảnh!");
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
