import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';

window.navigate = (page) => {
    document.getElementById('home-screen').style.display = page === 'home' ? 'flex' : 'none';
    document.getElementById('app-screen').style.display = page === 'home' ? 'none' : 'flex';
    if(page !== 'home') {
        UI.initCamera().then(() => {
            const loop = async () => {
                const video = document.getElementById('video');
                const desc = await detect(video);
                if(desc) {
                    const match = db.findMatch(desc);
                    if(match) {
                        window.currentMatchName = match.name;
                        UI.showValidationOverlay(match.name);
                    } else {
                        UI.showTrainModal(UI.cropFace(video));
                    }
                }
                requestAnimationFrame(loop);
            };
            loop();
        });
    }
};

window.handleValidation = (isCorrect) => {
    if(isCorrect) db.confirmIdentity(window.currentMatchName);
    else UI.showTrainModal(window.lastCapturedFace);
    document.getElementById('validation-overlay').style.display = 'none';
};
