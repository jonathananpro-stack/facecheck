const video = document.getElementById('video');
const status = document.getElementById('status');
let isPaused = false;

// 1. Khởi động AI
async function start() {
    status.innerText = "Đang tải Model AI...";
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    status.innerText = "Hệ thống sẵn sàng quét...";

    video.addEventListener('play', () => {
        setInterval(async () => {
            if (isPaused) return;
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
            if (detection) {
                isPaused = true;
                document.getElementById('inputBox').style.display = "block";
                status.innerText = "Đã thấy khuôn mặt! Vui lòng nhập liệu.";
            }
        }, 2000);
    });
}

// 2. Lưu vào DB (IndexedDB đơn giản hóa qua LocalStorage)
function saveData() {
    const data = {
        name: document.getElementById('name').value,
        dept: document.getElementById('dept').value,
        role: document.getElementById('role').value,
        time: new Date().toLocaleString()
    };

    if (!data.name) return alert("Vui lòng nhập tên!");

    let history = JSON.parse(localStorage.getItem('attendance') || "[]");
    history.push(data);
    localStorage.setItem('attendance', JSON.stringify(history));

    alert("Đã lưu thành công!");
    document.getElementById('inputBox').style.display = "none";
    isPaused = false;
    status.innerText = "Hệ thống sẵn sàng quét...";
}

// 3. Xuất danh sách
function viewReport() {
    const history = JSON.parse(localStorage.getItem('attendance') || "[]");
    if (history.length === 0) return alert("Chưa có ai điểm danh.");
    
    let report = "DANH SÁCH ĐIỂM DANH:\n";
    history.forEach(item => {
        report += `\n- ${item.name} (${item.dept} - ${item.role}) lúc ${item.time}`;
    });
    alert(report);
}

start();
