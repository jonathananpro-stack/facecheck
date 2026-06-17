export const AI_CONFIG = {
    minConfidence: 0.4, // Ngưỡng nhận diện (càng thấp càng khắt khe)
};

export async function detect(video) {
    return await faceapi.detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();
}