import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';

window.currentMode = ''; // Lưu chế độ hiện tại

window.navigate = async (page) => {
    window.currentMode = page; // Lưu trạng thái: 'training', 'live', hoặc 'history'
    
    document.getElementById('home-screen').style.display = page === 'home' ? 'flex' : 'none';
    document.getElementById('app-screen').style.display = page === 'home' ? 'none' : 'flex';

    if (page !== 'home') {
        await UI.loadModels();
        const video = await UI.initCamera();
        
        const loop = async () => {
            // Kiểm tra xem có đang ở chế độ cần AI không
            if (window.currentMode === 'live' || window.currentMode === 'training') {
                const desc = await detect(video);
                if (desc) {
                    if (window.currentMode === 'live') {
                        // Chế độ họp: Chỉ nhận diện và xác nhận
                        const match = db.findMatch(desc);
                        if (match) UI.showValidation(match.name);
                    } else if (window.currentMode === 'training') {
                        // Chế độ huấn luyện: Luôn hiện modal để cập nhật mới
                        UI.showTrain(desc, UI.crop(video));
                    }
                }
            }
            requestAnimationFrame(loop);
        };
        loop();
    }
};

window.handleValidation = (isCorrect) => {
    // ... logic cũ ...
    document.getElementById('validation-overlay').style.display = 'none';
};
