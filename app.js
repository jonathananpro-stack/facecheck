console.log("File app.js đang chạy...");

async function startSystem() {
    const main = document.getElementById('mainView');
    
    // Kiểm tra xem FaceAPI đã nạp chưa
    if (typeof faceapi !== 'undefined') {
        main.innerHTML = "<h2>FaceAPI đã nạp thành công!</h2><p>Đang tải model...</p>";
        
        try {
            // Nạp model (Đảm bảo folder 'models' nằm cùng cấp với app.js)
            await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
            main.innerHTML += "<p style='color:green;'>Model đã sẵn sàng! Hệ thống đã hoàn thiện.</p>";
            console.log("Hệ thống hoàn tất.");
        } catch (err) {
            main.innerHTML += "<p style='color:red;'>Lỗi load model: " + err.message + "</p>";
        }
    } else {
        main.innerHTML = "<p style='color:red;'>Lỗi: Không tìm thấy thư viện FaceAPI!</p>";
    }
}

startSystem();
