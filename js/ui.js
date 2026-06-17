export const UI = {
    updateAttendance: (name, isExp) => { document.getElementById('attendance-body').innerHTML += `<tr><td>${name}</td><td>${isExp?'Có mặt':'Khách'}</td></tr>`; },
    loadModels: async () => { const M = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; await faceapi.loadTinyFaceDetectorModel(M); await faceapi.loadFaceLandmarkModel(M); await faceapi.loadFaceRecognitionModel(M); }
};
