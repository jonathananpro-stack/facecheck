import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
let currentSession = null;
window.startNewSession = () => {
    const list = document.getElementById('guest-list').value.split(',').map(n => n.trim());
    currentSession = db.initSession("Phiên họp mới", list);
    alert("Đã tạo phiên họp!");
};
window.saveProfile = () => {
    const profile = { name: document.getElementById('name').value, unit: document.getElementById('unit').value, position: document.getElementById('position').value, image: UI.captureFace(document.getElementById('video')), descriptor: Array.from(window.currentDescriptor) };
    db.saveUser(profile);
    document.getElementById('info-modal').style.display = 'none';
};
window.toggleMenu = UI.toggleMenu; window.showSummary = () => alert("Tổng kết sẽ hiển thị tại đây");
async function init() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    document.getElementById('video').srcObject = stream;
    await UI.loadModels();
    setInterval(async () => {
        const desc = await detect(document.getElementById('video'));
        if (desc) {
            const match = db.findMatch(desc);
            if (match) { const isExp = db.markPresence(match.name); UI.updateAttendance(match.name, new Date().toLocaleTimeString(), isExp); }
            else if (confirm("Người lạ! Thêm vào hệ thống?")) UI.showInfoModal(desc);
        }
    }, 3000);
}
init();
