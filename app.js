import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
let currentFacing = 'user';

window.showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
    if(id === 'main-screen') initCamera();
};

window.switchCamera = async () => {
    currentFacing = (currentFacing === 'user') ? { exact: 'environment' } : 'user';
    initCamera();
};

async function initCamera() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacing } });
    video.srcObject = stream;
    await UI.loadModels();
    
    setInterval(async () => {
        const desc = await detect(video);
        if (desc) {
            const match = db.findMatch(desc);
            if (match) { 
                if(db.markPresence(match.name)) UI.updateAttendance(match.name);
            } else { 
                window.currentDescriptor = desc; 
                UI.showTrainModal(UI.cropFace(video)); 
            }
        }
    }, 3000);
}

window.saveProfile = () => {
    db.saveUser({ name: document.getElementById('new-name').value, descriptor: Array.from(window.currentDescriptor) });
    document.getElementById('info-modal').style.display = 'none';
    alert("Đã huấn luyện thành công!");
};

window.startAudit = () => {
    const s = JSON.parse(localStorage.getItem('current_session'));
    const missing = s.expected.filter(n => !s.present.includes(n));
    alert("Danh sách đang vắng: " + (missing.join(', ') || "Không có"));
};

window.processOCR = async (e) => {
    const { data: { text } } = await Tesseract.recognize(e.target.files[0], 'vie');
    db.initSession("Phiên họp từ ảnh", text.split('\n').filter(n => n.trim()));
    alert("Đã nhập danh sách!");
};
