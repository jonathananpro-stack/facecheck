let db, cameraStream, currentDetections = [];
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// --- 1. KHỞI TẠO ---
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; initModels(); };

async function initModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log("AI Ready");
}

// --- 2. ĐIỀU HƯỚNG ---
function showView(id) {
    stopCamera();
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'attendance') setTimeout(startCamera, 300);
}

function stopCamera() {
    if(cameraStream) cameraStream.getTracks().forEach(t => t.stop());
}

// --- 3. HUẤN LUYỆN (Setup) ---
document.getElementById('upload').addEventListener('change', async (e) => {
    const img = await faceapi.bufferToImage(e.target.files[0]);
    const canvas = faceapi.createCanvasFromMedia(img);
    document.getElementById('canvasContainer').innerHTML = '';
    document.getElementById('canvasContainer').appendChild(canvas);
    
    currentDetections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(currentDetections, img));
    document.getElementById('btnTrain').style.display = "block";
});

async function trainFaces() {
    for (let det of currentDetections) {
        const name = prompt("Đây là ai?");
        if (name) db.transaction("faces", "readwrite").objectStore("faces").put({ name, desc: Array.from(det.descriptor) });
    }
    alert("Đã huấn luyện xong!");
}

// --- 4. ĐIỂM DANH (Camera sinh trắc học) ---
async function startCamera() {
    const video = document.getElementById('video');
    const status = document.getElementById('status');
    const canvas = document.createElement('canvas'); // Canvas vẽ khung
    canvas.style.position = 'absolute';
    document.getElementById('attendance').appendChild(canvas);
    
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = cameraStream;

    video.addEventListener('play', () => {
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        
        setInterval(async () => {
            const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (det) {
                // Vẽ khung Elip Glow
                ctx.beginPath();
                ctx.ellipse(canvas.width/2, canvas.height/2, 80, 100, 0, 0, 2 * Math.PI);
                ctx.strokeStyle = '#00f7ff'; ctx.lineWidth = 5;
                ctx.shadowBlur = 15; ctx.shadowColor = '#00f7ff';
                ctx.stroke();

                // So sánh DB
                const faces = await new Promise(r => {
                    const req = db.transaction("faces", "readonly").objectStore("faces").getAll();
                    req.onsuccess = () => r(req.result);
                });

                let found = faces.find(f => faceapi.euclideanDistance(det.descriptor, f.desc) < 0.6);
                
                if (found) {
                    status.innerHTML = `<b style="color:green;">Chào ${found.name}</b>`;
                    ctx.strokeStyle = '#28a745'; ctx.shadowColor = '#28a745'; ctx.stroke();
                } else {
                    status.innerHTML = `<b style="color:red;">Người lạ!</b>`;
                    ctx.strokeStyle = '#dc3545'; ctx.shadowColor = '#dc3545'; ctx.stroke();
                }
            }
        }, 1000);
    });
}
