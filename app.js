const video = document.getElementById('video');
let db, currentDets = [];

// Khởi tạo DB
const req = indexedDB.open("FaceDB", 1);
req.onupgradeneeded = e => e.target.result.createObjectStore("data", {keyPath: "id", autoIncrement: true});
req.onsuccess = e => { db = e.target.result; init(); };

async function init() {
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(URL)
    ]);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    
    video.onloadedmetadata = () => {
        setInterval(detect, 3000);
    };
}

async function detect() {
    const dets = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptors();
    if (dets.length > 0 && document.getElementById('modal').style.display !== 'block') {
        currentDets = dets;
        document.getElementById('modal').style.display = 'block';
        document.getElementById('forms').innerHTML = dets.map((_, i) => `
            <div class="input-group">
                <input id="n${i}" placeholder="Tên...">
                <input id="u${i}" placeholder="Đơn vị...">
            </div>
        `).join('');
    }
}

function saveData() {
    currentDets.forEach((d, i) => {
        db.transaction("data", "readwrite").objectStore("data").add({
            name: document.getElementById('n'+i).value,
            unit: document.getElementById('u'+i).value,
            desc: Array.from(d.descriptor)
        });
    });
    document.getElementById('modal').style.display = 'none';
    alert("Đã lưu!");
}
