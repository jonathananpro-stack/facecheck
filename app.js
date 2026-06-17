// app.js - Bộ não điều phối hệ thống Mắt thần
import { CONFIG } from './config.js';
import { DB } from './js/db.js';
import { AI_Engine } from './js/ai.js';
import { UI } from './js/ui.js';

async function initSEC_CORE() {
    console.log("[SEC_CORE] Hệ thống đang khởi động...");
    
    // 1. Khởi tạo Camera
    const video = document.getElementById('camera-stream');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // 2. Vòng lặp xử lý (Loop)
    video.onloadedmetadata = () => {
        setInterval(async () => {
            // Lấy frame hiện tại
            const frame = video;
            
            // AI phân tích không gian 3D
            const results = await AI_Engine.processFrame(frame);
            
            // Nếu tìm thấy đối tượng, vẽ UI và xử lý lưu trữ
            if (results) {
                UI.drawFaceBox(document.getElementById('overlay'), results.box, results.status);
                
                // Nếu người dùng chọn 'Snap', lưu vào DB
                if (results.needsSnap) {
                    await DB.saveIdentity(results.id, results.embedding, results.spatialData);
                    UI.animateSnapToQueue(video, results.box);
                }
            }
        }, 100); // 100ms/lần quét
    };
}

initSEC_CORE();
