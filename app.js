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
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacing } });
    document.getElementById('video').srcObject = stream;
    await UI.loadModels();
    setInterval(async () => {
        const desc = await detect(document.getElementById('video'));
        if (desc) {
            const match = db.findMatch(desc);
            if (match) { const isExp = db.markPresence(match.name); UI.updateAttendance(match.name, isExp); }
        }
    }, 3000);
}
window.processOCR = async (e) => {
    const { data: { text } } = await Tesseract.recognize(e.target.files[0], 'vie');
    db.initSession("Phiên họp từ ảnh", text.split('\n').filter(n => n.trim()));
    alert("Đã tạo danh sách họp!");
};
