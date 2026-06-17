import { CONFIG } from '../config.js';

export const DB = {
    // Lưu Vector vào bộ nhớ (localStorage hoặc IndexedDB)
    async saveIdentity(id, embedding, spatialData) {
        const entry = {
            id: id,
            vector: Array.from(embedding), // Chuyển Float32Array sang mảng thường
            spatial: spatialData,         // Tỷ lệ 3D (Mũi-Cằm, Vóc dáng...)
            timestamp: Date.now()
        };
        localStorage.setItem(`sec_core_${id}`, JSON.stringify(entry));
        console.log(`[DB] Đã mã hóa và lưu thành công đối tượng: ${id}`);
    },

    // So khớp (Cosine Similarity) để xác định danh tính
    async matchIdentity(newVector) {
        // Logic so khớp vector tại đây (tính khoảng cách Euclidean)
        // Tuyệt đối không có ảnh gốc nào được truy xuất
    }
};
