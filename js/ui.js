export const UI = {
    toggleMenu: () => {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('main-content').classList.toggle('active');
    },

    updateAttendance: (name, time) => {
        const body = document.getElementById('attendance-body');
        if (!document.getElementById('row-' + name)) {
            body.innerHTML += `
                <tr id="row-${name}">
                    <td>${name}</td>
                    <td>ĐÃ CÓ MẶT</td>
                    <td>${time}</td>
                </tr>`;
        }
    },

    startVoice: () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'vi-VN';
        recognition.onresult = (e) => {
            document.getElementById('manual-name').value = e.results[0][0].transcript;
        };
        recognition.start();
    },

    loadModels: async () => {
        const M = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.nets.tinyFaceDetector.load(M);
        await faceapi.nets.faceLandmark6Net.load(M);
        await faceapi.nets.faceRecognitionNet.load(M);
    }
};
