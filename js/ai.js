export async function detect(v) { return await faceapi.detectSingleFace(v, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor().then(r => r ? r.descriptor : null); }
