const main = document.getElementById('mainView');

async function startSystem() {
    if (typeof faceapi === 'undefined') {
        main.innerHTML = "Lỗi thư viện!";
        return;
    }

    main.innerHTML = `
        <div style="text-align:center;">
            <video id="vid" width="640" height="480" autoplay muted playsinline style="background:#000;"></video>
            <p id="msg">Đang khởi động Camera...</p>
        </div>
    `;

    try {
        const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        
        const video = document.getElementById('vid');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            document.getElementById('msg').innerText = "Đang quét khuôn mặt...";
            setInterval(async () => {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
                if (detection) {
                    document.getElementById('msg').innerText = "Đã thấy khuôn mặt! ✅";
                } else {
                    document.getElementById('msg').innerText = "Đang tìm khuôn mặt...";
                }
            }, 1000);
        };
    } catch (err) {
        main.innerHTML = "Lỗi: " + err.message;
    }
}

startSystem();
