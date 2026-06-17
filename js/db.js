export const db = {
    // Tìm kiếm trong LocalStorage
    findMatch: (descriptor) => {
        const library = JSON.parse(localStorage.getItem('library') || '[]');
        if (library.length === 0) return null;

        const labeledDescriptors = library.map(p => 
            new faceapi.LabeledFaceDescriptors(p.name, [new Float32Array(Object.values(p.descriptor))])
        );
        const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.4);
        const match = matcher.findBestMatch(descriptor);
        
        return match.label !== 'unknown' ? { name: match.label } : null;
    },

    // Lưu ảnh minh chứng (Base64)
    logEvidence: (name, image) => {
        const logs = JSON.parse(localStorage.getItem('attendance_logs') || '[]');
        logs.push({ name, time: new Date().toLocaleString(), image });
        localStorage.setItem('attendance_logs', JSON.stringify(logs));
    },

    addEntry: (name) => {
        // Hàm này dùng khi muốn thêm tên thủ công vào bảng
        console.log("Đã lưu thủ công: " + name);
    }
};
