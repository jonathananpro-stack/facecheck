export const UI = {
    initCamera: async () => {
        const video = document.getElementById('video');
        video.srcObject = await navigator.mediaDevices.getUserMedia({video: true});
        const M = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await faceapi.loadTinyFaceDetectorModel(M);
    },
    showValidationOverlay: (name) => {
        const ov = document.getElementById('validation-overlay');
        ov.innerHTML = `<p>Xác nhận ${name}?</p><button onclick="handleValidation(true)">ĐÚNG</button>`;
        ov.style.display = 'block';
    }
};
