export const UI = {
    initCamera: async () => {
        const v = document.getElementById('video');
        v.srcObject = await navigator.mediaDevices.getUserMedia({video: true});
        return v;
    },
    loadModels: async () => { const M = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; await faceapi.loadTinyFaceDetectorModel(M); await faceapi.loadFaceLandmarkModel(M); await faceapi.loadFaceRecognitionModel(M); },
    showTrain: (desc, img) => { window.tempDesc = desc; document.getElementById('face-preview').src = img; document.getElementById('train-modal').style.display = 'flex'; },
    showValidation: (name) => { document.getElementById('validation-overlay').innerHTML = `Là ${name}? <button onclick="handleValidation(true)">OK</button>`; document.getElementById('validation-overlay').style.display = 'block'; },
    crop: (v) => { const c = document.createElement('canvas'); c.width=100; c.height=100; c.getContext('2d').drawImage(v,0,0,100,100); return c.toDataURL(); }
};
