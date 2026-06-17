import { UI } from './js/ui.js'; import { detect } from './js/ai.js'; import { db } from './js/db.js';
window.navigate = (page) => {
    document.getElementById('home-screen').style.display = page === 'home' ? 'flex' : 'none';
    document.getElementById('app-screen').style.display = page === 'home' ? 'none' : 'flex';
    if(page !== 'home') UI.initCamera();
};
window.handleValidation = (isCorrect) => {
    if(isCorrect) alert("Đã xác nhận!");
    document.getElementById('validation-overlay').style.display = 'none';
};
