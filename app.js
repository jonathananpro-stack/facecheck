let db;
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; };

// 1. Điều hướng không gây treo
function showView(id) {
    // Tắt mọi thứ liên quan đến Camera trước khi đổi view
    stopCamera(); 
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    // Nếu vào trang điểm danh mới khởi động lại
    if (id === 'attendance') {
        setTimeout(startCamera, 500); // Đợi 0.5s để UI ổn định mới bật cam
    }
}

// 2. Ngắt Camera triệt để
function stopCamera() {
    const video = document.getElementById('video');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

// 3. Khởi động Camera (Bản rút gọn)
async function startCamera() {
    const video = document.getElementById('video');
    const status = document.getElementById('status');
    status.innerText = "Đang mở cam...";
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = stream;
        status.innerText = "Camera sẵn sàng!";
    } catch (e) {
        status.innerText = "Lỗi Camera: " + e.message;
    }
}

// 4. Xử lý Upload (Giữ nguyên)
document.getElementById('upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const img = await faceapi.bufferToImage(file);
    const det = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (det) {
        const name = prompt("Đây là ai?");
        if (name) {
            const tx = db.transaction("faces", "readwrite");
            tx.objectStore("faces").put({ name, desc: Array.from(det.descriptor) });
            alert("Đã lưu: " + name);
        }
    }
});
