let db, cameraStream, isCapturing = false, countdownInterval, timeLeft = 5, tempDescriptor;
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; initAI(); };

async function initAI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
    document.getElementById('status').innerText = "AI sẵn sàng! Đang mở camera...";
    startCamera();
}

async function startCamera() {
    const video = document.getElementById('video');
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = cameraStream;
    
    video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.width; canvas.height = video.height;
        document.getElementById('video-container').appendChild(canvas);
        const ctx = canvas.getContext('2d');

        setInterval(async () => {
            if (isCapturing) return;
            const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptor();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (!det) return;

            const faces = await new Promise(r => {
                const req = db.transaction("faces", "readonly").objectStore("faces").getAll();
                req.onsuccess = () => r(req.result);
            });

            let match = faces.find(f => faceapi.euclideanDistance(det.descriptor, f.desc) < 0.6);
            if (match) {
                document.getElementById('status').innerText = "Chào: " + match.name;
            } else {
                isCapturing = true;
                tempDescriptor = det.descriptor;
                showModal(det, video);
            }
        }, 1000);
    };
}

function showModal(det, video) {
    document.getElementById('beepSound').play();
    timeLeft = 5;
    document.getElementById('faceModal').style.display = 'block';
    countdownInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('countdown').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('faceModal').style.display = 'none';
            isCapturing = false;
        }
    }, 1000);
}

function saveNewFace() {
    const name = document.getElementById('newName').value;
    if (name) {
        db.transaction("faces", "readwrite").objectStore("faces").put({ name, desc: Array.from(tempDescriptor) });
        clearInterval(countdownInterval);
        document.getElementById('faceModal').style.display = 'none';
        isCapturing = false;
        alert("Đã lưu!");
    }
}
