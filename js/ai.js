export async function detect(v) {
    const res = await faceapi.detectSingleFace(v, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    return res ? res.descriptor : null;
}
