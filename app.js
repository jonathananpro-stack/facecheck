const App = {
    // Khởi tạo trạng thái
    init: function() {
        this.render('home');
        this.loadAI();
    },

    // Quản lý giao diện
    render: function(view) {
        const main = document.getElementById('mainView');
        if (view === 'home') {
            main.innerHTML = `<h1>Chào mừng!</h1><p>Chọn chức năng để bắt đầu.</p>`;
        } else if (view === 'camera') {
            main.innerHTML = `<video id="vid" width="640" height="480" autoplay muted></video><div id="status">Đang tải AI...</div>`;
            this.startCamera();
        } else if (view === 'report') {
            main.innerHTML = `<h1>Báo cáo</h1><button onclick="App.exportReport()">Xuất Excel</button>`;
        }
    },

    // Core AI
    loadAI: async function() {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('./models')
        ]);
        console.log("AI Ready");
    },

    startCamera: async function() {
        const video = document.getElementById('vid');
        const status = document.getElementById('status');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        
        video.addEventListener('play', () => {
            status.innerText = "Đang quét khuôn mặt...";
            setInterval(async () => {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
                if(detection) status.innerText = "Đã thấy mặt!";
            }, 1000);
        });
    },

    exportReport: function() {
        const data = [{ Tên: "Nguyễn Văn A", Trạng thái: "Có mặt" }];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "Report.xlsx");
    }
};

// Khởi chạy hệ thống
document.addEventListener("DOMContentLoaded", () => App.init());
