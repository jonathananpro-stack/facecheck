const AppEngine = {
    // --- 1. GIAO DIỆN ---
    render: function(view) {
        const main = document.getElementById('mainView');
        if (view === 'home') {
            main.innerHTML = `<h1>Chào mừng!</h1><p>Hệ thống FaceCheck Pro.</p>`;
        } else if (view === 'camera') {
            main.innerHTML = `<video id="vid" width="640" height="480" autoplay muted playsinline style="background:#000;"></video><div id="status">Đang tải AI...</div>`;
            this.startCamera();
        } else if (view === 'report') {
            main.innerHTML = `<h1>Báo cáo</h1><button onclick="AppEngine.exportReport()">Xuất Excel</button>`;
        }
    },

    // --- 2. AI ---
    startCamera: async function() {
        const video = document.getElementById('vid');
        const status = document.getElementById('status');
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('./models')
            ]);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            status.innerText = "Camera đang chạy - AI sẵn sàng!";
        } catch (e) {
            status.innerText = "Lỗi: " + e.message;
        }
    },

    // --- 3. BÁO CÁO ---
    exportReport: function() {
        const data = [{ Tên: "Người dùng", Trạng thái: "Có mặt" }];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "BaoCao.xlsx");
    }
};

document.addEventListener("DOMContentLoaded", () => AppEngine.render('home'));
