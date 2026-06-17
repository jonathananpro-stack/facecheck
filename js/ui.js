export const UI = {
    updateAttendance: (n) => {
        if(!document.getElementById(n)){
            document.getElementById('attendance-body').innerHTML += `<tr id="${n}"><td>${n}</td></tr>`;
            document.getElementById('count-present').innerText = document.querySelectorAll('tr').length;
        }
    },
    cropFace: (v) => { const c = document.createElement('canvas'); c.width=100; c.height=100; c.getContext('2d').drawImage(v, 0, 0, 100, 100); return c.toDataURL(); },
    showTrainModal: (img) => { document.getElementById('face-preview').src = img; document.getElementById('info-modal').style.display = 'flex'; },
    loadModels: async () => { const M = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; await faceapi.loadTinyFaceDetectorModel(M); await faceapi.loadFaceLandmarkModel(M); await faceapi.loadFaceRecognitionModel(M); }
};
