import { UI } from './js/ui.js';
import { detect } from './js/ai.js';
import { db } from './js/db.js';
import { Report } from './js/report.js';

const video = document.getElementById('video');

async function init() {
    // 1. Mở Camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    // 2. Load AI
    await UI.loadModels();

    // 3. Vòng lặp chính
    setInterval(async () => {
        const descriptor = await detect(video);
        if (descriptor) {
            const match = db.findMatch(descriptor);
            if (match) {
                UI.updateAttendance(match.name, new Date().toLocaleTimeString());
                db.logEvidence(match.name, video.toDataURL()); // Lưu ảnh minh chứng
            }
        }
    }, 1000);
}

// Global functions cho HTML
window.toggleMenu = UI.toggleMenu;
window.startVoice = UI.startVoice;
window.saveManual = () => {
    const name = document.getElementById('manual-name').value;
    db.addEntry(name);
    UI.updateAttendance(name, "Thủ công");
};
window.exportData = Report.exportCSV;

init();
