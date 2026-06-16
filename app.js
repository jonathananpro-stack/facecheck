let db;
const request = indexedDB.open("FaceCheckDB", 1);
request.onupgradeneeded = e => e.target.result.createObjectStore("faces", {keyPath: "name"});
request.onsuccess = e => { db = e.target.result; };

// 1. Chuyển trang (Đã ngắt camera để không treo menu)
function showView(id) {
    stopCamera(); 
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if (id === 'attendance') setTimeout(startCamera, 300);
}

// 2. Ngắt camera (Dùng cho mọi tình huống)
function stopCamera() {
    const video = document.getElementById('video');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

// 3. TÁCH TẤT CẢ GƯƠNG MẶT (Tính năng chính)
document.getElementById('upload').addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    for (let file of files) {
        const img = await faceapi.bufferToImage(file);
        // Tách tất cả các mặt trong ảnh
        const detections = await faceapi.detectAllFaces(img)
                                         .withFaceLandmarks()
                                         .withFaceDescriptors();

        if (detections.length === 0) {
            alert("Không tìm thấy khuôn mặt nào trong ảnh: " + file.name);
            continue;
        }

        // Vòng lặp hỏi từng khuôn mặt
        for (let i = 0; i < detections.length; i++) {
            const name = prompt(`Phát hiện khuôn mặt ${i+1}/${detections.length} trong ảnh ${file.name}. Đây là ai?`);
            if (name) {
                const tx = db.transaction("faces", "readwrite");
                tx.objectStore("faces").put({ name, desc: Array.from(detections[i].descriptor) });
            }
        }
    }
    alert("Đã huấn luyện xong tất cả khuôn mặt!");
});

// 4. Khởi động Camera (Điểm danh)
async function startCamera() {
    const video = document.getElementById('video');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = stream;
    } catch (e) { alert("Lỗi mở camera"); }
}
