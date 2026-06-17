let db, cameraStream;
const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Khởi tạo DB
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; initAI(); };

async function initAI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}

// Chức năng Huấn luyện (Cắt mặt thành Slide)
document.getElementById('upload').addEventListener('change', async (e) => {
    const img = await faceapi.bufferToImage(e.target.files[0]);
    const slider = document.getElementById('faceSlider');
    slider.innerHTML = '';
    
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 512 }))
                                     .withFaceLandmarks()
                                     .withFaceDescriptors();

    if (detections.length === 0) return alert("Không tìm thấy mặt!");

    for (let det of detections) {
        const box = det.detection.box;
        const canvas = document.createElement('canvas');
        canvas.width = box.width; canvas.height = box.height;
        canvas.getContext('2d').drawImage(img, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
        
        const slide = document.createElement('div');
        slide.className = 'face-slide';
        slide.appendChild(canvas);
        
        const btn = document.createElement('button');
        btn.innerText = "Điền tên";
        btn.onclick = () => {
            const name = prompt("Đây là ai?");
            if (name) {
                db.transaction("faces", "readwrite").objectStore("faces").put({ name, desc: Array.from(det.descriptor) });
                slide.style.opacity = "0.3";
            }
        };
        slide.appendChild(btn);
        slider.appendChild(slide);
    }
});

// Chức năng Điểm danh (Sinh trắc học)
async function startCamera() {
    const video = document.getElementById('video');
    const container = document.getElementById('video-container');
    const status = document.getElementById('status');
    
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = cameraStream;

    video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        setInterval(async () => {
            const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (!det) return;

            // Vẽ khung Elip
            ctx.beginPath();
            ctx.ellipse(canvas.width/2, canvas.height/2, canvas.width/3, canvas.height/3, 0, 0, 2 * Math.PI);
            ctx.lineWidth = 10;
            
            const faces = await new Promise(r => {
                const req = db.transaction("faces", "readonly").objectStore("faces").getAll();
                req.onsuccess = () => r(req.result);
            });

            let match = faces.find(f => faceapi.euclideanDistance(det.descriptor, f.desc) < 0.6);
            ctx.strokeStyle = match ? '#28a745' : '#dc3545';
            ctx.stroke();
            status.innerHTML = match ? `<b style="color:green;">Chào ${match.name}</b>` : `<b style="color:red;">Người lạ</b>`;
        }, 500);
    };
}

function showView(id) {
    if(cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'attendance') setTimeout(startCamera, 500);
}
