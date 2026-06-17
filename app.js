const video = document.getElementById('video');
const list = document.getElementById('face-list');

async function initSystem() {
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    
    // Quét mỗi 2 giây để giữ ổn định CPU trên iPhone
    video.onloadedmetadata = () => setInterval(detectFaces, 2000);
}

async function detectFaces() {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }));
    list.innerHTML = ''; // Làm sạch danh sách cũ
    
    detections.forEach((det, i) => {
        const card = document.createElement('div');
        card.className = 'face-card';
        
        // Tạo canvas tạm để crop mặt
        const canvas = document.createElement('canvas');
        canvas.className = 'thumb';
        canvas.width = det.box.width;
        canvas.height = det.box.height;
        canvas.getContext('2d').drawImage(video, det.box.x, det.box.y, det.box.width, det.box.height, 0, 0, det.box.width, det.box.height);
        
        card.innerHTML = `
            <canvas class="thumb" width="${det.box.width}" height="${det.box.height}"></canvas>
            <input id="n${i}" placeholder="Họ tên">
            <button onclick="startVoice('n${i}')">🎤 NHẬP GIỌNG NÓI</button>
        `;
        list.appendChild(card);
        card.querySelector('.thumb').getContext('2d').drawImage(canvas, 0, 0);
    });
}

function startVoice(id) {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'vi-VN';
    rec.onresult = (e) => { document.getElementById(id).value = e.results[0][0].transcript; };
    rec.start();
}

// Khởi chạy khi trang load
initSystem();
