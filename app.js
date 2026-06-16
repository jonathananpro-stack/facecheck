let db, currentDetections = [];
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Khởi tạo Database và Model
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; };

async function initModels() {
    try {
        document.getElementById('setupStatus').innerText = "Đang tải Model AI...";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        document.getElementById('setupStatus').innerText = "AI đã sẵn sàng! Chọn ảnh ngay.";
    } catch (err) {
        document.getElementById('setupStatus').innerText = "Lỗi tải Model: " + err.message;
        console.error(err);
    }
}
initModels(); // Chạy ngay khi mở web

// Xử lý Upload với sự chờ đợi AI
document.getElementById('upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = await faceapi.bufferToImage(file);
    const canvasContainer = document.getElementById('canvasContainer');
    canvasContainer.innerHTML = ''; 
    const canvas = faceapi.createCanvasFromMedia(img);
    canvasContainer.appendChild(canvas);

    document.getElementById('setupStatus').innerText = "Đang phân tích...";

    // Sử dụng TinyFaceDetectorOptions với cấu hình độ nhạy cao hơn
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    
    currentDetections = await faceapi.detectAllFaces(img, options)
                                     .withFaceLandmarks()
                                     .withFaceDescriptors();

    if (currentDetections.length === 0) {
        document.getElementById('setupStatus').innerText = "Lỗi: Không tìm thấy khuôn mặt!";
    } else {
        document.getElementById('setupStatus').innerText = `Tìm thấy ${currentDetections.length} khuôn mặt!`;
        faceapi.matchDimensions(canvas, img);
        faceapi.draw.drawDetections(canvas, faceapi.resizeResults(currentDetections, img));
        document.getElementById('btnTrain').style.display = "block";
    }
});

// Các hàm khác giữ nguyên
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}
