import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
window.navigate = async (page) => {
    document.getElementById('home-screen').style.display = page === 'home' ? 'flex' : 'none';
    document.getElementById('app-screen').style.display = page === 'home' ? 'none' : 'flex';
    if(page !== 'home') {
        await UI.loadModels();
        const video = await UI.initCamera();
        const loop = async () => {
            const desc = await detect(video);
            if(desc) {
                const match = db.findMatch(desc);
                if(match) UI.showValidation(match.name);
                else UI.showTrain(desc, UI.crop(video));
            }
            requestAnimationFrame(loop);
        };
        loop();
    }
};
window.saveUser = () => {
    const name = document.getElementById('new-name').value;
    db.saveUser({name, descriptor: window.tempDesc});
    document.getElementById('train-modal').style.display = 'none';
};
