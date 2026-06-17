const video = document.getElementById('video');
const debug = document.getElementById('debug');
let db, currentDets = [];

// Khởi tạo DB
const req = indexedDB.open("FaceCheckDB", 1);
req.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "id", autoIncrement: true});
req.onsuccess = e => { db = e.target.result; };

async function initApp() {
    document.getElementById('start-btn').style.display = 'none';
    debug.innerText = "Đang tải AI, vui lòng chờ...";
    
    try {
        const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(URL), faceapi.nets.faceLandmark68Net.loadFromUri(URL), faceapi.nets.faceRecognitionNet.loadFromUri(URL)]);
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = stream;
        debug.innerText = "Camera sẵn sàng!";
        
        // Quét mỗi 3 giây sau khi camera hoạt động
        setInterval(detect, 3000);
    } catch (e) {
        debug.innerText = "Lỗi: " + e.message;
    }
}

async function detect() {
    if (document.getElementById('modal').style.display === 'block') return;
    
    const dets = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.2 })).withFaceDescriptors();
    
    if (dets.length > 0) {
        currentDets = dets;
        document.getElementById('forms').innerHTML = dets.map((_, i) => `
            <div class="card">
                <input id="n${i}" placeholder="Họ tên">
                <input id="u${i}" placeholder="Đơn vị">
                <input id="p${i}" placeholder="Chức vụ">
            </div>
        `).join('');
        document.getElementById('modal').style.display = 'block';
        debug.innerText = "Tìm thấy người!";
    } else {
        debug.innerText = "Đang tìm gương mặt...";
    }
}

function saveAll() {
    currentDets.forEach((d, i) => {
        db.transaction("faces", "readwrite").objectStore("faces").add({
            name: document.getElementById('n'+i).value, unit: document.getElementById('u'+i).value,
            pos: document.getElementById('p'+i).value, desc: Array.from(d.descriptor)
        });
    });
    document.getElementById('modal').style.display = 'none';
    alert("Đã lưu!");
}
