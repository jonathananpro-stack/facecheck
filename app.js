let db, currentDetections = [];
const video = document.getElementById('video');

const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; initAI(); };

async function initAI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
    await faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    startDetection();
}

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

async function startDetection() {
    setInterval(async () => {
        const dets = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptors();
        if (dets.length > 0 && !document.getElementById('dataModal').classList.contains('active')) {
            currentDetections = dets;
            showDataModal(dets);
        }
    }, 5000);
}

function showDataModal(dets) {
    const container = document.getElementById('facesContainer');
    const modal = document.getElementById('dataModal');
    container.innerHTML = '';
    dets.forEach((det, i) => {
        container.innerHTML += `
            <div class="face-card">
                <span>ID: ${i+1}</span>
                <input type="text" placeholder="Họ tên" id="n${i}">
                <input type="text" placeholder="Đơn vị" id="u${i}">
                <input type="text" placeholder="Chức vụ" id="p${i}">
                <button onclick="startVoiceInput(${i})">🎤</button>
            </div>
        `;
    });
    modal.classList.add('active');
}

function startVoiceInput(i) {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'vi-VN';
    rec.onresult = (e) => { document.getElementById(`n${i}`).value = e.results[0][0].transcript; };
    rec.start();
}

function saveAll() {
    currentDetections.forEach((det, i) => {
        const data = { name: document.getElementById(`n${i}`).value, unit: document.getElementById(`u${i}`).value, pos: document.getElementById(`p${i}`).value, desc: Array.from(det.descriptor) };
        db.transaction("faces", "readwrite").objectStore("faces").put(data);
    });
    document.getElementById('dataModal').classList.remove('active');
    setTimeout(() => document.getElementById('dataModal').style.display = 'none', 300);
}

async function exportToExcel() {
    const faces = await new Promise(r => { const req = db.transaction("faces", "readonly").objectStore("faces").getAll(); req.onsuccess = () => r(req.result); });
    let csv = "data:text/csv;charset=utf-8,Họ Tên,Đơn vị,Chức vụ\n" + faces.map(f => `${f.name},${f.unit},${f.pos}`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "BaoCaoNhanSu.csv";
    link.click();
}
