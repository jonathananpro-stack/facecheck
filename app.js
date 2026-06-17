import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; 
import { db } from './js/db.js'; import { Report } from './js/report.js';

window.navigate = async (page) => {
    // 1. Tắt toàn bộ màn hình
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'none';
    document.getElementById('history-screen').style.display = 'none';

    // 2. Ngắt Camera tuyệt đối
    const v = document.getElementById('video');
    if (v.srcObject) { v.srcObject.getTracks().forEach(t => t.stop()); v.srcObject = null; }

    // 3. Xử lý logic theo trang
    if (page === 'home') {
        document.getElementById('home-screen').style.display = 'flex';
    } else if (page === 'history') {
        document.getElementById('history-screen').style.display = 'flex';
        document.getElementById('log-container').innerText = JSON.stringify(localStorage.getItem('logs'));
    } else {
        document.getElementById('app-screen').style.display = 'flex';
        await UI.loadModels();
        const video = await UI.initCamera();
        const loop = async () => {
            if (document.getElementById('app-screen').style.display !== 'flex') return;
            const desc = await detect(video);
            if(desc) {
                const match = db.findMatch(desc);
                if(match) UI.showValidation(match.name);
            }
            requestAnimationFrame(loop);
        };
        loop();
    }
};

window.handleValidation = (n) => { 
    Report.saveRecord(n, "Unit", "Present"); 
    document.getElementById('validation-overlay').style.display = 'none'; 
};
