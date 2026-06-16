let db, currentDetections = [];
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; initModels(); };

async function initModels() {
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(URL);
}

function showView(id) {
    stopCamera();
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'attendance') setTimeout(startCamera, 300);
}

// Logic Huấn luyện
document.getElementById('upload').addEventListener('change', async (e) => {
    const img = await faceapi.bufferToImage(e.target.files[0]);
    const container = document.getElementById('canvasContainer');
    container.innerHTML = '';
    const canvas = faceapi.createCanvasFromMedia(img);
    container.appendChild(canvas);
    
    currentDetections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    faceapi.matchDimensions(canvas, img);
    faceapi.draw.drawDetections(canvas, faceapi.resizeResults(currentDetections, img));
    document.getElementById('btnTrain').style.display = "block";
    document.getElementById('setupStatus').innerText = `Tìm thấy ${currentDetections.length} khuôn mặt.`;
});

async function trainFaces() {
    for (let i = 0; i < currentDetections.length; i++) {
        const name = prompt(`Khuôn mặt ${i+1}: Đây là ai?`);
        if (name) {
            db.transaction("faces", "readwrite").objectStore("faces")
              .put({ name, desc: Array.from(currentDetections[i].descriptor) });
        }
    }
    alert("Đã huấn luyện xong!");
    document.getElementById('btnTrain').style.display = "none";
}

// Logic Điểm danh
async function startCamera() {
    const video = document.getElementById('video');
    try {
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    } catch(e) { document.getElementById('status').innerText = "Lỗi Camera"; }
}

function stopCamera() {
    const v = document.getElementById('video');
    if(v.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
}
