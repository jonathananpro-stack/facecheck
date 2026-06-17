import { AI_Engine } from './js/ai.js';
import { db } from './js/db.js';

async function run() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('overlay');
    
    function loop() {
        AI_Engine.processFrame().then(data => {
            db.save(data);
            // Cập nhật lên Canvas tại đây...
            requestAnimationFrame(loop);
        });
    }
    loop();
}
run();
