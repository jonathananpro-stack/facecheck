import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
import { Report } from './js/report.js'; window.Report = Report;
let facing = 'user'; let isProcessing = false; let lastDetected = "";

async function initCamera() {
    const video = document.getElementById('video');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
    await UI.loadModels();
    
    // Vòng lặp mượt mà không chặn giao diện
    const loop = async () => {
        if (!isProcessing && video.readyState === 4) {
            isProcessing = true;
            const desc = await detect(video);
            if (desc) {
                const match = db.findMatch(desc);
                if (match && lastDetected !== match.name) {
                    lastDetected = match.name;
                    UI.updateAttendance(match.name);
                } else if (!match) {
                    window.currentDescriptor = desc;
                    UI.showTrainModal(UI.cropFace(video));
                }
            }
            isProcessing = false;
        }
        requestAnimationFrame(loop); // Thay vì setInterval, dùng cái này để mượt 60fps
    };
    loop();
}

window.saveProfile = () => { 
    db.saveUser({name:document.getElementById('new-name').value, unit:document.getElementById('new-unit').value, descriptor:Array.from(window.currentDescriptor)}); 
    document.getElementById('info-modal').style.display='none'; lastDetected = "";
};
window.processOCR = async (e) => { const {data:{text}} = await Tesseract.recognize(e.target.files[0], 'vie'); db.initSession(text); alert("DS đã nạp!"); };
window.switchCamera = () => { facing = (facing === 'user' ? {exact:'environment'} : 'user'); initCamera(); };
initCamera();
