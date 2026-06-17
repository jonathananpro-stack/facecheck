export const UI = {
    toggleMenu: () => { document.getElementById('sidebar').classList.toggle('active'); },
    updateAttendance: (name, time, isExp) => { if (!document.getElementById('row-'+name)) document.getElementById('attendance-body').innerHTML += `<tr id="row-${name}"><td>${name}</td><td>${isExp?'Có mặt':'Khách'}</td><td>${time}</td></tr>`; },
    showInfoModal: (desc) => { document.getElementById('info-modal').style.display = 'block'; window.currentDescriptor = desc; },
    captureFace: (v) => { const c = document.createElement('canvas'); c.width=200; c.height=200; c.getContext('2d').drawImage(v, 120, 40, 400, 400, 0, 0, 200, 200); return c.toDataURL(); },
    loadModels: async () => { const M = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; await faceapi.loadTinyFaceDetectorModel(M); await faceapi.loadFaceLandmarkModel(M); await faceapi.loadFaceRecognitionModel(M); }
};
