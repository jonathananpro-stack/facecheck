const video = document.getElementById('video');
const debug = document.getElementById('debug');

async function initApp() {
    debug.innerText = "Đang nạp AI...";
    const URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(URL), faceapi.nets.faceLandmark68Net.loadFromUri(URL), faceapi.nets.faceRecognitionNet.loadFromUri(URL)]);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    debug.innerText = "Hệ thống đang quét...";
    
    // Quét liên tục nhưng không chặn UI
    requestAnimationFrame(detectLoop);
}

async function detectLoop() {
    const dets = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }));
    
    if (dets.length > 0) {
        debug.innerText = "Phát hiện " + dets.length + " nhân sự.";
        // Chỉ render khi chưa có form, tránh lặp lại làm đơ
        if (!document.getElementById('form-0')) {
            renderForms(dets);
        }
    }
    requestAnimationFrame(detectLoop);
}

function renderForms(dets) {
    document.getElementById('forms').innerHTML = dets.map((_, i) => `
        <div class="card" id="form-${i}">
            <input placeholder="Họ tên">
            <input placeholder="Đơn vị">
            <input placeholder="Chức vụ">
        </div>
    `).join('');
}
