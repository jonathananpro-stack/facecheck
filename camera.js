/**
 * FaceCheck v2.0 - Camera AI Engine
 * Chức năng: Điều khiển webcam máy tính/iPhone, vẽ khung nhận diện lên Canvas
 * và đối sánh đặc trưng Vector khuôn mặt.
 */

const FaceAI = {
    stream: null,
    animationFrameId: null,

    // Khởi chạy Camera và lồng lớp Canvas vẽ khung mục tiêu
    async startCamera(videoId, canvasId, eventId) {
        const video = document.getElementById(videoId);
        const canvas = document.getElementById(canvasId);
        const alertBox = document.getElementById('checkinAlert');

        if (!video || !canvas) return;

        try {
            // Cấu hình luồng Stream mượt mà cho cả Laptop và iPhone
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "user", // Ưu tiên webcam trước
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });
            
            video.srcObject = this.stream;
            if (alertBox) alertBox.innerHTML = "📸 <span style='color:var(--primary-color)'>AI đang quét không gian...</span>";

            // Kích hoạt luồng vẽ giả lập khung hình AI liên tục
            video.onloadedmetadata = () => {
                this.runFaceDetectionLoop(video, canvas);
            };

        } catch (err) {
            console.error("❌ Không thể truy cập Camera:", err);
            if (alertBox) alertBox.innerHTML = "<span style='color:red;'>⚠️ Lỗi: Không tìm thấy Camera hoặc chưa cấp quyền!</span>";
        }
    },

    // Vòng lặp vẽ khung quét mục tiêu real-time (Giả lập để test nhanh trên máy tính)
    runFaceDetectionLoop(video, canvas) {
        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            if (!this.stream) return;

            // Đồng bộ kích thước canvas theo video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Vẽ một khung vuông xanh giả lập ở giữa màn hình quét để test giao diện
            ctx.strokeStyle = '#10b981'; // Màu xanh chuối chuẩn UI
            ctx.lineWidth = 3;
            ctx.strokeRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);

            this.animationFrameId = requestAnimationFrame(draw);
        };
        
        draw();
    },

    // Hàm quan trọng nhất giúp GIẢI CỨU MENU: Tắt luồng camera khi đổi Tab
    stopCamera() {
        // 1. Tắt luồng vẽ khung hình
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // 2. Dừng hẳn phần cứng Camera (Tắt đèn xanh webcam laptop)
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            console.log("🔒 [FaceAI] Đã ngắt phần cứng Camera an toàn.");
        }
    }
};