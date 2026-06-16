const video = document.getElementById('video');
const status = document.getElementById('status');
const inputBox = document.getElementById('inputBox');
let isPaused = false;

async function start() {
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    video.addEventListener('play', () => {
        setInterval(async () => {
            if (isPaused) return;
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
            
            if (detection) {
                isPaused = true; // Dừng quét để hỏi
                status.innerText = "Đã thấy khuôn mặt! Vui lòng nhập thông tin:";
                inputBox.style.display = "block";
            }
        }, 2000);
    });
}

function saveData() {
    const name = document.getElementById('name').value;
    const dept = document.getElementById('dept').value;
    const role = document.getElementById('role').value;
    const extra = document.getElementById('extra').value;

    if (!name || !dept || !role) {
        alert("Vui lòng nhập đầy đủ Tên, Đơn vị và Chức vụ!");
        return;
    }

    const data = { name, dept, role, extra, timestamp: new Date().toLocaleString() };

    // Lưu vào LocalStorage
    localStorage.setItem('person_' + Date.now(), JSON.stringify(data));
    
    // Phản hồi cho người dùng
    alert("Đã ghi nhận thành công cho: " + name);
    
    // Reset form và tiếp tục quét
    document.getElementById('name').value = "";
    document.getElementById('dept').value = "";
    document.getElementById('role').value = "";
    document.getElementById('extra').value = "";
    
    inputBox.style.display = "none";
    isPaused = false; 
    status.innerText = "Hệ thống đang quét...";
}

    // Lưu vào LocalStorage (cách nhanh nhất để test ngay)
    localStorage.setItem('person_' + Date.now(), JSON.stringify(data));
    
    alert("Đã ghi nhận: " + data.name);
    inputBox.style.display = "none";
    isPaused = false; // Tiếp tục quét
    status.innerText = "Hệ thống đang quét...";
}
//xem danh sách điểm danh
function viewReport() {
    let list = "DANH SÁCH ĐIỂM DANH:\n";
    let count = 0;

    // Duyệt qua tất cả các key trong localStorage
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        
        // Chỉ lấy các key bắt đầu bằng 'person_'
        if (key && key.startsWith('person_')) {
            try {
                let data = JSON.parse(localStorage.getItem(key));
                list += `\n- ${data.name} | Đơn vị: ${data.dept} | ${data.timestamp}`;
                count++;
            } catch (e) {
                console.log("Lỗi đọc dữ liệu:", key);
            }
        }
    }

    if (count === 0) {
        alert("Chưa có dữ liệu điểm danh nào cả!");
    } else {
        alert(list);
    }
}

start();
