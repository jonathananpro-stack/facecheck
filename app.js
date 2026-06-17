import { db } from './js/db.js';
import { detect } from './js/ai.js';
import { UI } from './js/ui.js';

const video = document.getElementById('video');

async function initSystem() {
    // 1. Load models cho FaceAPI
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark6Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

    // 2. Mở Camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    // 3. Vòng lặp chính
    setInterval(async () => {
        const descriptor = await detect(video);
        if (!descriptor) return;

        const library = db.getAll();
        const matcher = new faceapi.FaceMatcher(library.map(p => p.descriptor));
        const match = matcher.findBestMatch(descriptor);

        if (match.distance < 0.4) {
            const person = library.find(p => p.name === match.label);
            if (person) {
                UI.updateTable(person.name, new Date().toLocaleTimeString());
                if (person.isVIP) UI.alertVIP(person.name);
            }
        }
    }, 1000);
}

initSystem();
