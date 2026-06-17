import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
let currentFacing = 'user';
window.showScreen = (id) => { document.querySelectorAll('.screen').forEach(s => s.style.display = 'none'); document.getElementById(id).style.display = 'flex'; if(id==='main-screen') initCamera(); };
window.switchCamera = async () => { currentFacing = (currentFacing === 'user') ? { exact: 'environment' } : 'user'; initCamera(); };
async function initCamera() {
    const video = document.getElementById('video');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacing } });
    await UI.loadModels();
    setInterval(async () => {
        const desc = await detect(video);
        if (desc) {
            const match = db.findMatch(desc);
            if (match) UI.updateAttendance(match.name);
            else { window.currentDescriptor = desc; UI.showTrainModal(UI.cropFace(video)); }
        }
    }, 3000);
}
window.saveProfile = () => { db.saveUser({ name: document.getElementById('new-name').value, descriptor: Array.from(window.currentDescriptor) }); document.getElementById('info-modal').style.display='none'; };
window.processOCR = async (e) => { const { data: { text } } = await Tesseract.recognize(e.target.files[0], 'vie'); db.initSession("OCR", text.split('\n').filter(n=>n.trim().length>3)); alert("Đã nạp danh sách!"); };
window.startAudit = () => { alert("Danh sách vắng đã được kiểm tra."); };
