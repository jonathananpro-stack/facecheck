import { UI } from './js/ui.js';
import { detect } from './js/ai.js';
import { db } from './js/db.js';
import { Report } from './js/report.js';

const video = document.getElementById('video');
async function init() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    await UI.loadModels();
    
    setInterval(async () => {
        const desc = await detect(video);
        if (desc) {
            const match = db.findMatch(desc);
            if (match) UI.updateAttendance(match.name, new Date().toLocaleTimeString());
        }
    }, 1000);
}

// Map các hàm vào window để HTML gọi được
window.toggleMenu = UI.toggleMenu;
window.saveManual = () => { /* Logic lưu tay */ };
window.startVoice = UI.startVoice;
window.exportData = Report.exportCSV;
init();
