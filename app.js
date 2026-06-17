const video = document.getElementById('video');
let db, currentDets = [];

const req = indexedDB.open("FaceCheckDB", 1);
req.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "id", autoIncrement: true});
req.onsuccess = e => { db = e.target.result; };

async function startApp() {
    document.getElementById('start-btn').style.display = 'none';
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(URL), faceapi.nets.faceLandmark68Net.loadFromUri(URL), faceapi.nets.faceRecognitionNet.loadFromUri(URL)]);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    video.addEventListener('playing', () => setInterval(detect, 5000));
}

async function detect() {
    const modal = document.getElementById('dataModal');
    if (modal.classList.contains('active')) return;
    const dets = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptors();
    if (dets.length > 0) {
        currentDets = dets;
        document.getElementById('facesContainer').innerHTML = dets.map((_, i) => `
            <div class="face-card">
                <input id="n${i}" placeholder="Họ tên">
                <input id="u${i}" placeholder="Đơn vị">
                <input id="p${i}" placeholder="Chức vụ">
                <button onclick="startVoice(${i})">🎤</button>
            </div>
        `).join('');
        modal.classList.add('active');
    }
}

function startVoice(i) {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'vi-VN';
    rec.onresult = (e) => { document.getElementById(`n${i}`).value = e.results[0][0].transcript; };
    rec.start();
}

function saveAll() {
    currentDets.forEach((d, i) => {
        db.transaction("faces", "readwrite").objectStore("faces").add({
            name: document.getElementById('n'+i).value, unit: document.getElementById('u'+i).value, 
            pos: document.getElementById('p'+i).value, desc: Array.from(d.descriptor)
        });
    });
    document.getElementById('dataModal').classList.remove('active');
}

async function exportToExcel() {
    const faces = await new Promise(r => { const req = db.transaction("faces", "readonly").objectStore("faces").getAll(); req.onsuccess = () => r(req.result); });
    let csv = "data:text/csv;charset=utf-8,Họ Tên,Đơn vị,Chức vụ\n" + faces.map(f => `${f.name},${f.unit},${f.pos}`).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = "BaoCao.csv"; link.click();
}
