const video = document.getElementById('video');
const status = document.getElementById('status');
const inputBox = document.getElementById('inputBox');
let isPaused = false;

async function start() {
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    video.addEventListener('play', () => {
        setInterval(async () => {
            if (isPaused) return;
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
            
            if (detection) {
                isPaused = true; // Dừng quét để hỏi
                status.innerText = "Đã thấy khuôn mặt! Vui lòng nhập thông tin:";
                inputBox.style.display = "block";
            }
        }, 2000);
    });
}

function saveData() {
    const data = {
        name: document.getElementById('name').value,
        dept: document.getElementById('dept').value,
        role: document.getElementById('role').value,
        extra: document.getElementById('extra').value,
        timestamp: new Date().toISOString()
    };

    // Lưu vào LocalStorage (cách nhanh nhất để test ngay)
    localStorage.setItem('person_' + Date.now(), JSON.stringify(data));
    
    alert("Đã ghi nhận: " + data.name);
    inputBox.style.display = "none";
    isPaused = false; // Tiếp tục quét
    status.innerText = "Hệ thống đang quét...";
}

start();
