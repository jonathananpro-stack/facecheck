export async function detect(video) {
    if (!video.readyState || video.paused) return null;
    const res = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
    return res ? res.descriptor : null;
}
