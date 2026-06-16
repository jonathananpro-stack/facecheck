// Test nhanh để kiểm tra liên kết
console.log("File app.js đã được tải!");
document.body.style.backgroundColor = "lightgreen";

// Hiển thị nội dung lên web
document.getElementById('mainView').innerHTML = "<h2>App.js đã kết nối thành công!</h2>";

// Thử khởi tạo Face-api (nếu thư viện nạp đúng)
try {
    if (typeof faceapi !== 'undefined') {
        console.log("FaceAPI đã sẵn sàng!");
        document.getElementById('mainView').innerHTML += "<p>FaceAPI đã nạp thành công.</p>";
    } else {
        console.log("FaceAPI chưa được nạp.");
        document.getElementById('mainView').innerHTML += "<p>FaceAPI chưa được nạp, hãy kiểm tra lại script trong HTML.</p>";
    }
} catch (err) {
    console.error("Lỗi:", err);
}
