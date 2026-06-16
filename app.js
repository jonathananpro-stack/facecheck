const AppEngine = {
    // --- 1. DỮ LIỆU ---
    state: {
        participants: [],
        activeEvent: null
    },

    // --- 2. GIAO DIỆN (UI) ---
    render: function(view) {
        const main = document.getElementById('mainView');
        if (view === 'home') {
            main.innerHTML = `<h1>Trang chủ</h1><p>Hệ thống FaceCheck Pro sẵn sàng.</p>`;
        } else if (view === 'event') {
            main.innerHTML = `<h1>Quản lý Hội nghị</h1>
                <input type="text" id="evName" placeholder="Tên hội nghị...">
                <button onclick="AppEngine.createEvent()">Tạo mới</button>
                <div id="evList"></div>`;
        } else if (view === 'participants') {
            main.innerHTML = `<h1>Người tham gia</h1><input type="file" onchange="AppEngine.importExcel(event)">`;
        } else if (view === 'camera') {
            main.innerHTML = `<h1>Check-in AI</h1><video id="vid" width="640" autoplay muted></video><div id="status">Đang khởi động...</div>`;
            this.startCamera();
        }
    },

    // --- 3. HỘI NGHỊ ---
    createEvent: function() {
        const name = document.getElementById('evName').value;
        this.state.activeEvent = { name, startTime: Date.now() };
        alert("Đã tạo hội nghị: " + name);
    },

    importExcel: function(event) {
        alert("Đã nhận file danh sách!");
    },

    // --- 4. AI & CAMERA ---
    async startCamera() {
        const video = document.getElementById('vid');
        const status = document.getElementById('status');
        
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models')
            ]);
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            status.innerText = "Đang quét...";
            
            video.addEventListener('play', () => {
                setInterval(async () => {
                    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptor();
                    if (detection) {
                        status.innerText = "Đã phát hiện khuôn mặt!";
                        this.checkAttendance(detection.descriptor);
                    }
                }, 2000);
            });
        } catch (e) {
            status.innerText = "Lỗi: " + e.message;
        }
    },

    checkAttendance: function(descriptor) {
        console.log("Đối chiếu dữ liệu...");
    }
};
// --- 5. BÁO CÁO & CẢNH BÁO ---
    exportReport: function() {
        if (this.state.participants.length === 0) {
            alert("Chưa có dữ liệu để xuất!");
            return;
        }
        // Sử dụng thư viện SheetJS (xlsx) để xuất file
        const ws = XLSX.utils.json_to_sheet(this.state.participants);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BaoCao");
        XLSX.writeFile(wb, "BaoCaoHoiNghi.xlsx");
    },

    checkAbsentees: function() {
        if (!this.state.activeEvent) return;
        const now = Date.now();
        const duration = (now - this.state.activeEvent.startTime) / 60000; // Đổi sang phút
        
        if (duration >= 15) {
            const vắng = this.state.participants.filter(p => p.status !== 'Có mặt');
            if (vắng.length > 0) {
                console.warn("CẢNH BÁO: Còn người vắng mặt sau 15 phút!", vắng);
                alert("Cảnh báo: Hội nghị đã quá 15 phút, còn " + vắng.length + " người chưa check-in!");
            }
        }
    }

// Khởi chạy
document.addEventListener("DOMContentLoaded", () => AppEngine.render('home'));
