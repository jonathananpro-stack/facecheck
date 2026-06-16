const AppEngine = {
    // --- 1. DỮ LIỆU & TRẠNG THÁI ---
    state: {
        participants: [], // Danh sách từ Excel
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
            main.innerHTML = `<h1>Check-in AI</h1><video id="vid" width="640" autoplay></video><div id="status">Đang khởi động...</div>`;
            this.startCamera();
        }
    },

    // --- 3. HỘI NGHỊ & DỮ LIỆU ---
    createEvent: function() {
        const name = document.getElementById('evName').value;
        this.state.activeEvent = { name, startTime: Date.now() };
        alert("Đã tạo hội nghị: " + name);
    },

    importExcel: function(event) {
        // Giả lập import từ file
        alert("Đã nhận file danh sách!");
    },

    // --- 4. AI & ĐIỂM DANH ---
    async startCamera() {
        const video = document.getElementById('vid');
        const status = document.getElementById('status');
        
        // Load Models (Đảm bảo folder /models cùng cấp)
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        video.addEventListener('play', () => {
            setInterval(async () => {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceDescriptor();
                if (detection) {
                    status.innerText = "Đã nhận diện: " + detection.descriptor.length;
                    this.checkAttendance(detection.descriptor);
                }
            }, 2000);
        });
    },

    checkAttendance: function(descriptor) {
        console.log("Đang đối chiếu khuôn mặt...");
        // Logic so khớp AI ở đây
    }
};

// Khởi chạy
document.addEventListener("DOMContentLoaded", () => AppEngine.render('home'));
