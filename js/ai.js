export async function detect(v) { 
    // Thêm các tham số tối ưu để chạy nhanh hơn
    return await faceapi.detectSingleFace(v, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }))
        .withFaceLandmarks()
        .withFaceDescriptor(); 
}
