const video = document.getElementById('video');
let db, currentDets = [];

// Khởi tạo DB an toàn
const req = indexedDB.open("FaceDB", 1);
req.onupgradeneeded = e => e.target.result.createObjectStore("data", {keyPath: "id", autoIncrement: true});
req.onsuccess = e => { db = e.target.result; };

async function startApp() {
    document.getElementById('start-btn').style.display = 'none';
    
    // Load model
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(URL)
    ]);
    
    // Truy cập Camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    
    // Bắt đầu vòng lặp quét sau khi video sẵn sàng
    video.addEventListener('playing', () => {
        setInterval(detect, 5000);
    });
}

async function detect() {
    if (document.getElementById('modal').style.display === 'block') return;
    
    const dets = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptors();
    if (dets.length > 0) {
        currentDets = dets;
        document.getElementById('modal').style.display = 'block';
        document.getElementById('forms').innerHTML = dets.map((_, i) => `
            <div class="input-group">
                <input id="n${i}" placeholder="Họ tên">
                <input id="u${i}" placeholder="Đơn vị">
                <input id="p${i}" placeholder="Chức vụ">
            </div>
        `).join('');
    }
}

function saveData() {
    currentDets.forEach((d, i) => {
        db.transaction("data", "readwrite").objectStore("data").add({
            name: document.getElementById('n'+i).value,
            unit: document.getElementById('u'+i).value,
            pos: document.getElementById('p'+i).value,
            desc: Array.from(d.descriptor)
        });
    });
    document.getElementById('modal').style.display = 'none';
    alert("Dữ liệu đã được đồng bộ hóa!");
}
