import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
window.navigate = (mode) => {
    document.getElementById('home-screen').style.display = mode === 'home' ? 'flex' : 'none';
    document.getElementById('app-screen').style.display = mode === 'home' ? 'none' : 'flex';
    if(mode !== 'home') initApp();
};
window.handleValidation = (isCorrect) => {
    if(isCorrect) db.confirmIdentity(window.currentMatchName);
    else UI.showTrainModal(window.lastCapturedFace);
    document.getElementById('validation-overlay').style.display = 'none';
};
async function initApp() {
    const video = document.getElementById('video');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
    await UI.loadModels();
    const loop = async () => {
        const desc = await detect(video);
        if(desc) {
            const match = db.findMatch(desc);
            if(match) { window.currentMatchName = match.name; UI.showValidationOverlay(match.name); }
            else { UI.showTrainModal(UI.cropFace(video)); }
        }
        requestAnimationFrame(loop);
    };
    loop();
}
