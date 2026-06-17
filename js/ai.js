export async function detect(video) {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224 });
    const result = await faceapi.detectSingleFace(video, options)
        .withFaceLandmarks()
        .withFaceDescriptor();
    
    return result ? result.descriptor : null;
}
