import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
import { Report } from './js/report.js'; window.Report = Report;
let facing = 'user';
async function initCamera() {
    const video = document.getElementById('video');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
    await UI.loadModels();
    setInterval(async () => {
        if(video.readyState===4) {
            const desc = await detect(video);
            if(desc) {
                const match = db.findMatch(desc);
                if(match) { document.getElementById('status-display').innerText = "Đang giám sát: " + match.name; UI.updateAttendance(match.name); }
                else { window.currentDescriptor = desc; UI.showTrainModal(UI.cropFace(video)); }
            }
        }
    }, 3000);
}
window.saveProfile = () => { db.saveUser({name:document.getElementById('new-name').value, unit:document.getElementById('new-unit').value, descriptor:Array.from(window.currentDescriptor)}); document.getElementById('info-modal').style.display='none'; };
window.processOCR = async (e) => { const {data:{text}} = await Tesseract.recognize(e.target.files[0], 'vie'); db.initSession(text); alert("Đã nạp danh sách!"); };
window.switchCamera = () => { facing = (facing === 'user' ? {exact:'environment'} : 'user'); initCamera(); };
initCamera();
