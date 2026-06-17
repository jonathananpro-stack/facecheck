const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const status = document.getElementById('status');
const panel = document.getElementById('input-panel');
let db, currentDets = [];

// 1. Khởi tạo Database
const req = indexedDB.open("FaceSecurityDB", 1);
req.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "id", autoIncrement: true});
req.onsuccess = e => { db = e.target.result; };

// 2. Khởi động hệ thống
async function startApp() {
    document.getElementById('start-btn').style.display = 'none';
    status.innerText = "NẠP MODEL AI...";
    
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    
    video.onplaying = () => {
        status.innerText = "SCANNING MODE: ACTIVE";
        scanLoop();
    };
}

// 3. Vòng lặp nhận diện mượt mà (Không làm đơ màn hình)
async function scanLoop() {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }));
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (detections.length > 0) {
        currentDets = detections;
        detections.forEach(det => {
            const { x, y, width, height } = det.box;
            ctx.strokeStyle = '#00f7ff';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
        });
        status.innerText = "MỤC TIÊU PHÁT HIỆN";
        panel.style.display = 'block';
    } else {
        status.innerText = "SCANNING...";
    }
    requestAnimationFrame(scanLoop);
}

// 4. Nhập liệu giọng nói
function startVoice(inputID) {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'vi-VN';
    rec.onresult = (e) => { document.getElementById(inputID).value = e.results[0][0].transcript; };
    rec.start();
}

// 5. Lưu dữ liệu
function saveData() {
    const data = {
        name: document.getElementById('n0').value,
        unit: document.getElementById('u0').value,
        timestamp: new Date().toLocaleString()
    };
    db.transaction("faces", "readwrite").objectStore("faces").add(data);
    panel.style.display = 'none';
    alert("Dữ liệu đã mã hóa vào hệ thống!");
}

// 6. Xuất báo cáo Excel
async function exportToExcel() {
    const faces = await new Promise(r => { 
        const req = db.transaction("faces", "readonly").objectStore("faces").getAll(); 
        req.onsuccess = () => r(req.result); 
    });
    let csv = "data:text/csv;charset=utf-8,Họ Tên,Đơn vị,Thời gian\n" + faces.map(f => `${f.name},${f.unit},${f.timestamp}`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "SecurityReport.csv";
    link.click();
}
