const video = document.getElementById('video');
const status = document.getElementById('status');
const inputBox = document.getElementById('inputBox');
let isPaused = false;

async function start() {
    status.innerText = "Đang tải Model AI (vui lòng chờ)...";
    
    try {
        // Thay đổi URL model sang link gốc GitHub của thư viện (ổn định hơn)
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        
        status.innerText = "Model đã tải xong! Đang mở Camera...";
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = stream;
        status.innerText = "Hệ thống đang quét...";

        video.addEventListener('play', () => {
            setInterval(async () => {
                if (isPaused) return;
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
                
                if (detection) {
                    isPaused = true;
                    status.innerText = "Đã thấy khuôn mặt! Hãy nhập thông tin:";
                    inputBox.style.display = "block";
                }
            }, 1000);
        });
    } catch (err) {
        status.innerHTML = `<b style="color:red;">Lỗi hệ thống: ${err.message}</b>`;
        console.error("Lỗi chi tiết:", err);
    }
}

// Bắt đầu
start();
