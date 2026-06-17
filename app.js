import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';

let currentFacing = 'user';
window.showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
    if(id === 'main-screen') initCamera();
};

async function initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacing } });
    document.getElementById('video').srcObject = stream;
    await UI.loadModels();
    
    // Vòng lặp nhận diện
    setInterval(async () => {
        const desc = await detect(document.getElementById('video'));
        if (desc) {
            const match = db.findMatch(desc);
            if (match) {
                const isExp = db.markPresence(match.name);
                UI.updateAttendance(match.name, isExp);
                UI.updateStats();
            } else {
                if (confirm("Người lạ! Thêm nhân sự?")) UI.showInfoModal(desc);
            }
        }
    }, 3000);
}

window.switchCamera = async () => {
    currentFacing = (currentFacing === 'user') ? { exact: 'environment' } : 'user';
    initCamera();
};

window.saveProfile = () => {
    const profile = { name: document.getElementById('new-name').value, descriptor: Array.from(window.currentDescriptor) };
    db.saveUser(profile);
    document.getElementById('info-modal').style.display = 'none';
};

window.startAudit = () => {
    const s = JSON.parse(localStorage.getItem('current_session'));
    const missing = s.expected.filter(n => !s.present.includes(n));
    alert("Danh sách vắng: " + (missing.join(', ') || "Không có"));
};

window.processOCR = async (e) => {
    const { data: { text } } = await Tesseract.recognize(e.target.files[0], 'vie');
    db.initSession("Phiên OCR", text.split('\n').filter(n => n.trim()));
    alert("Đã nhập danh sách!");
};
