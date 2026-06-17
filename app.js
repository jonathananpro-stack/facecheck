import { AI_Engine } from './js/ai.js';
import { db } from './js/db.js';

async function mainLoop() {
    // 1. Giả lập lấy dữ liệu từ Camera/Input (Sẽ thay bằng Mediapipe/TensorFlow)
    const frame = { motion: [] }; 
    const landmarks = { nose: {x:0,y:0}, chin: {x:0,y:10}, totalHeight: 100 };
    const features = [{type: 'MOLE', nearestJointId: 0, x: 5, y: 5, score: 0.9}];

    // 2. Chạy full Engine
    const fullData = await AI_Engine.processFrame(frame, [landmarks], features);

    // 3. Lưu trữ mã hóa
    db.save(fullData);

    // 4. Update UI (sẽ thực hiện qua ui.js)
    requestAnimationFrame(mainLoop);
}
mainLoop();
