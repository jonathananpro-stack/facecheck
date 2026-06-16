const App = {
    // 1. Khởi tạo
    init: function() {
        console.log("Hệ thống khởi động...");
        this.render('home');
        this.loadAI();
    },

    // 2. Render giao diện
    render: function(view) {
        const main = document.getElementById('mainView');
        if (!main) return;

        if (view === 'home') {
            main.innerHTML = `<h1>Chào mừng!</h1><p>Hệ thống FaceCheck Pro đã sẵn sàng.</p>`;
        } else if (view === 'camera') {
            main.innerHTML = `
                <div id="status" style="padding:10px; color:red;">Đang khởi động Camera...</div>
                <video id="vid" width="640" height="480" autoplay muted playsinline style="background:#000; border:2px solid #ccc;"></video>
            `;
            this.startCamera();
        } else if (view === 'report') {
            main.innerHTML = `<h1>Báo cáo</h1><button onclick="alert('Tính năng đang hoàn thiện')">Xuất file Excel</button>`;
        }
    },

    // 3. Load AI với cơ chế kiểm tra
    loadAI: async function() {
        try {
            // Đảm bảo đường dẫn này khớp với folder 'models' của đồng chí
            const modelPath = './models'; 
            await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
            await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
            await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
            console.log("AI Models Loaded Successfully");
        } catch (e) {
            console.error("Lỗi Model:", e);
            alert("Lỗi không tìm thấy thư mục models! Hãy kiểm tra lại GitHub.");
        }
    },

    // 4. Camera và quét
    startCamera: async function() {
        const video = document.getElementById('vid');
        const status = document.getElementById('status');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
                status.innerText = "Camera đang chạy! AI đang xử lý...";
                status.style.color = "green";
                this.detectFaces(video);
            };
        } catch (e) {
            status.innerText = "Lỗi Camera: " + e.message;
        }
    },

    // 5. Vòng lặp nhận diện
    detectFaces: async function(video) {
        setInterval(async () => {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
            const status = document.getElementById('status');
            if (detection) {
                status.innerText = "Đã tìm thấy khuôn mặt!";
            } else {
                status.innerText = "Đang tìm khuôn mặt...";
            }
        }, 1000);
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());
