const video = document.getElementById('video');
const status = document.getElementById('status');
let db;

// 1. Khởi tạo Database (Lưu trữ bền vững)
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("attendance", { autoIncrement: true });
};
request.onsuccess = (e) => { db = e.target.result; };

// 2. Chức năng lưu dữ liệu vào DB thật
function saveData() {
    const data = {
        name: document.getElementById('name').value,
        dept: document.getElementById('dept').value,
        role: document.getElementById('role').value,
        time: new Date().toLocaleString()
    };

    const transaction = db.transaction(["attendance"], "readwrite");
    transaction.objectStore("attendance").add(data);
    
    alert("Đã ghi vào Database: " + data.name);
    document.getElementById('inputBox').style.display = "none";
    document.getElementById('name').value = ""; // Xóa form
    startScanning(); // Tiếp tục quét
}

// 3. Xem danh sách từ DB
function viewReport() {
    const transaction = db.transaction(["attendance"], "readonly");
    const store = transaction.objectStore("attendance");
    const request = store.getAll();
    
    request.onsuccess = () => {
        const history = request.result;
        if (history.length === 0) return alert("Chưa có ai điểm danh.");
        let report = "DANH SÁCH ĐIỂM DANH:\n";
        history.forEach(item => {
            report += `\n- ${item.name} (${item.dept}) lúc ${item.time}`;
        });
        alert(report);
    };
}

// Hàm hỗ trợ quét
let isPaused = false;
function startScanning() { isPaused = false; status.innerText = "Hệ thống đang quét..."; }

// Khởi động AI (giữ nguyên logic camera cũ)
async function start() {
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    
    video.addEventListener('play', () => {
        setInterval(async () => {
            if (isPaused) return;
            if (await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())) {
                isPaused = true;
                document.getElementById('inputBox').style.display = "block";
                status.innerText = "Đã thấy khuôn mặt!";
            }
        }, 2000);
    });
}
start();
