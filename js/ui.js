export const UI = {
    showValidationOverlay: (name) => {
        const ov = document.getElementById('validation-overlay');
        ov.innerHTML = `<p>Là ${name}?</p><button onclick="handleValidation(true)">ĐÚNG</button><button onclick="handleValidation(false)">SAI</button>`;
        ov.style.display = 'block';
    },
    showTrainModal: (img) => { document.getElementById('face-preview').src = img; document.getElementById('info-modal').style.display = 'flex'; },
    cropFace: (v) => { const c = document.createElement('canvas'); c.width=100; c.height=100; c.getContext('2d').drawImage(v, 0, 0, 100, 100); return c.toDataURL(); },
    loadModels: async () => { const M = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; await faceapi.loadTinyFaceDetectorModel(M); await faceapi.loadFaceLandmarkModel(M); await faceapi.loadFaceRecognitionModel(M); }
};
